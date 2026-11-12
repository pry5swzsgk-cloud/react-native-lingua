import { useCallback, useEffect, useRef, useState } from "react";

import { getSmartModel, SmartModel, SmartModelKey } from "@/data/smartModels";
import { llm } from "@/lib/llm";

// Where the language model is right now
export type SmartModelStatus =
  | { phase: "checking" }
  | { phase: "unsupported" } // this device or browser cannot run a model
  | { phase: "not-downloaded" }
  | { phase: "loading"; progress: number; text: string; isDownload: boolean }
  | { phase: "ready" }
  | { phase: "error"; message: string };

// Looks after the language model of Smart Dax: is it there, download it,
// load it into memory, delete it again.
// autoLoad: a model that was downloaded earlier is loaded right away.
export function useSmartModel(modelKey: SmartModelKey, autoLoad: boolean) {
  const model: SmartModel = getSmartModel(modelKey);
  const [status, setStatus] = useState<SmartModelStatus>({ phase: "checking" });
  // The build that fits this device (see data/smartModels.ts)
  const [modelId, setModelId] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Downloads the model if needed and loads it into memory
  const load = useCallback(
    async (id: string, isDownload: boolean) => {
      setStatus({ phase: "loading", progress: 0, text: "", isDownload });
      try {
        await llm.load(id, ({ progress, text }) => {
          if (isMounted.current) {
            setStatus({ phase: "loading", progress, text, isDownload });
          }
        });
        if (isMounted.current) setStatus({ phase: "ready" });
      } catch (error) {
        if (isMounted.current) {
          setStatus({
            phase: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    },
    [],
  );

  // Find out what is already there whenever the model choice changes
  useEffect(() => {
    let isCurrent = true;

    async function check() {
      setStatus({ phase: "checking" });
      if (!llm.isSupported()) {
        setStatus({ phase: "unsupported" });
        return;
      }
      const id = (await llm.supportsF16()) ? model.ids.f16 : model.ids.f32;
      if (!isCurrent) return;
      setModelId(id);

      if (llm.isLoaded(id)) {
        setStatus({ phase: "ready" });
      } else if (await llm.isDownloaded(id)) {
        if (!isCurrent) return;
        if (autoLoad) load(id, false);
        else setStatus({ phase: "not-downloaded" });
      } else if (isCurrent) {
        setStatus({ phase: "not-downloaded" });
      }
    }

    check();
    return () => {
      isCurrent = false;
    };
  }, [model, autoLoad, load]);

  // The button "Download": needs internet this one time
  const download = useCallback(() => {
    if (modelId) load(modelId, true);
  }, [modelId, load]);

  // Frees the storage the model uses
  const remove = useCallback(async () => {
    if (!modelId) return;
    await llm.remove(modelId);
    if (isMounted.current) setStatus({ phase: "not-downloaded" });
  }, [modelId]);

  return { model, status, download, remove };
}
