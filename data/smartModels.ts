// The language models "Smart Dax" can use. They run inside the browser on
// the device's graphics chip (WebGPU) and are downloaded once, when the
// learner asks for it. After that Smart Dax works without internet.
//
// Every model comes in two builds: "f16" is smaller and faster, but needs a
// graphics chip with 16-bit support. "f32" works everywhere and needs more
// memory. The app picks the build that fits the device (lib/llm.web.ts).

export type SmartModelKey = "standard" | "light";

export interface SmartModel {
  key: SmartModelKey;
  name: string;
  description: string;
  downloadMB: number; // about, for the f16 build
  ids: { f16: string; f32: string }; // ids in the web-llm model list
}

export const SMART_MODELS: SmartModel[] = [
  {
    key: "standard",
    name: "Standard",
    description: "Llama 3.2 · 1 billion parameters. Better Spanish.",
    downloadMB: 700,
    ids: {
      f16: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
      f32: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    },
  },
  {
    key: "light",
    name: "Light",
    description: "Qwen 2.5 · 0.5 billion parameters. For devices with little memory.",
    downloadMB: 400,
    ids: {
      f16: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
      f32: "Qwen2.5-0.5B-Instruct-q4f32_1-MLC",
    },
  },
];

export function getSmartModel(key: SmartModelKey): SmartModel {
  return SMART_MODELS.find((model) => model.key === key) ?? SMART_MODELS[0];
}
