import { LlmApi } from "@/types/llm";

// Stand-in for the native iOS/Android app: running a language model there
// needs a different library (and a development build), so Smart Dax is
// only offered in the web version for now. The real implementation for the
// browser is in lib/llm.web.ts, which replaces this file on the web.

function unsupported(): Promise<never> {
  return Promise.reject(new Error("Smart Dax is not available on this device."));
}

export const llm: LlmApi = {
  isSupported: () => false,
  supportsF16: () => Promise.resolve(false),
  isDownloaded: () => Promise.resolve(false),
  isLoaded: () => false,
  load: unsupported,
  reply: unsupported,
  stop: () => {},
  remove: () => Promise.resolve(),
};
