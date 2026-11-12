// What the app needs from a language model that runs on the device.
// lib/llm.web.ts implements it with web-llm, lib/llm.ts is the stand-in
// for platforms where no model can run (the native iOS/Android app).

export type LlmRole = "system" | "user" | "assistant";

export interface LlmMessage {
  role: LlmRole;
  content: string;
}

export interface LlmProgress {
  progress: number; // 0 … 1
  text: string; // what the library is doing, for example "Fetching param cache"
}

export interface LlmApi {
  // True when this device can run a model at all (WebGPU in the browser)
  isSupported: () => boolean;
  // True when the graphics chip can do 16-bit math (smaller, faster build)
  supportsF16: () => Promise<boolean>;
  // True when the model was downloaded before and is stored on the device
  isDownloaded: (modelId: string) => Promise<boolean>;
  // True when the model is loaded into memory and ready to answer
  isLoaded: (modelId: string) => boolean;
  // Downloads the model if needed, then loads it into memory
  load: (modelId: string, onProgress: (progress: LlmProgress) => void) => Promise<void>;
  // Lets the model answer. onText gets the whole answer so far, again and
  // again while it is written. Resolves with the finished answer.
  reply: (messages: LlmMessage[], onText: (text: string) => void) => Promise<string>;
  // Cuts the current answer short
  stop: () => void;
  // Deletes the downloaded model to free storage
  remove: (modelId: string) => Promise<void>;
}
