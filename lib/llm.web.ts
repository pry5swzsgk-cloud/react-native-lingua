import type { MLCEngine } from "@mlc-ai/web-llm";

import { LlmApi, LlmMessage } from "@/types/llm";

// Runs a small language model in the browser with web-llm (open source,
// no server, no API key). The model runs on the graphics chip through
// WebGPU. The files are downloaded once and kept in the browser's storage.
//
// The library is large, so it is only loaded when Smart Dax is really used.

// A short memory is enough for a chat and keeps the memory use small
const CONTEXT_SIZE = 1024; // tokens the model can remember
const MAX_ANSWER_TOKENS = 120; // Dax's answers are short

type WebLlm = typeof import("@mlc-ai/web-llm");

// The part of navigator.gpu we need (no extra type package for it)
interface GpuNavigator {
  gpu?: { requestAdapter: () => Promise<{ features: { has: (name: string) => boolean } } | null> };
}

let library: Promise<WebLlm> | null = null;
function loadLibrary(): Promise<WebLlm> {
  library ??= import("@mlc-ai/web-llm");
  return library;
}

let engine: MLCEngine | null = null;
let loadedId: string | null = null;

const browserLlm: LlmApi = {
  isSupported: () =>
    typeof navigator !== "undefined" && !!(navigator as GpuNavigator).gpu,

  supportsF16: async () => {
    try {
      const adapter = await (navigator as GpuNavigator).gpu?.requestAdapter();
      return !!adapter?.features.has("shader-f16");
    } catch {
      return false;
    }
  },

  isDownloaded: async (modelId) => {
    try {
      return await (await loadLibrary()).hasModelInCache(modelId);
    } catch {
      return false;
    }
  },

  isLoaded: (modelId) => engine !== null && loadedId === modelId,

  load: async (modelId, onProgress) => {
    if (engine && loadedId === modelId) return;
    const lib = await loadLibrary();

    // Ask the browser not to throw the downloaded model away when it is
    // short on space. Safari may ignore this; nothing breaks then.
    try {
      await navigator.storage?.persist?.();
    } catch {
      // not important
    }

    // Only one model at a time: it takes a lot of memory
    await engine?.unload();
    engine = null;
    loadedId = null;

    engine = await lib.CreateMLCEngine(
      modelId,
      {
        initProgressCallback: (report) =>
          onProgress({ progress: report.progress, text: report.text }),
      },
      { context_window_size: CONTEXT_SIZE },
    );
    loadedId = modelId;
  },

  reply: async (messages: LlmMessage[], onText) => {
    if (!engine) throw new Error("The model is not loaded.");
    const stream = await engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: MAX_ANSWER_TOKENS,
    });

    let text = "";
    for await (const chunk of stream) {
      text += chunk.choices[0]?.delta?.content ?? "";
      onText(text);
    }
    return text;
  },

  stop: () => engine?.interruptGenerate(),

  remove: async (modelId) => {
    if (loadedId === modelId) {
      await engine?.unload();
      engine = null;
      loadedId = null;
    }
    await (await loadLibrary()).deleteModelAllInfoInCache(modelId);
  },
};

// Automatic tests run without a graphics chip and without the real model.
// They put a fake model on this global variable before the app starts.
const testLlm = (globalThis as { __LINGO_TEST_LLM__?: LlmApi }).__LINGO_TEST_LLM__;

export const llm: LlmApi = testLlm ?? browserLlm;
