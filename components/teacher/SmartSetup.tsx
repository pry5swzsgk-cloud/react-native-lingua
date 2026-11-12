import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { SMART_MODELS, SmartModel, SmartModelKey } from "@/data/smartModels";
import { SmartModelStatus } from "@/hooks/useSmartModel";

interface SmartSetupProps {
  status: SmartModelStatus;
  model: SmartModel;
  onSelectModel: (key: SmartModelKey) => void;
  onDownload: () => void;
  onBack: () => void; // back to Dax with rules
}

// Everything before the first chat with Smart Dax: what it is, which model
// to use, the download with its progress, and what to do when it fails.
export function SmartSetup({
  status,
  model,
  onSelectModel,
  onDownload,
  onBack,
}: SmartSetupProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Image source={images.mascotDino} style={styles.mascot} resizeMode="contain" />
      <View className="flex-row items-center gap-2 mt-4">
        <Text className="h2">Smart Dax</Text>
        <View className="bg-[#EDE9FE] rounded-full px-2.5 py-0.5">
          <Text className="font-poppins-semibold text-[11px] text-lingua-purple">
            Beta
          </Text>
        </View>
      </View>
      <Text className="body-md text-text-secondary text-center mt-1">
        Chat about anything you like. Smart Dax is a small AI model that runs
        on this device: free, no account, and it works offline once it is
        downloaded.
      </Text>

      <View className="w-full mt-6">
        {status.phase === "checking" && (
          <Text className="body-md text-text-secondary text-center" testID="smart-checking">
            Checking this device…
          </Text>
        )}

        {status.phase === "unsupported" && (
          <View className="bg-white rounded-2xl border border-border p-4" testID="smart-unsupported">
            <Text className="font-poppins-semibold text-base text-text-primary">
              Not available on this device
            </Text>
            <Text className="body-sm text-text-secondary mt-1">
              Smart Dax needs WebGPU. On an iPad or iPhone that means iPadOS
              or iOS 26 or newer, opened in Safari. Dax with rules works
              everywhere.
            </Text>
          </View>
        )}

        {status.phase === "not-downloaded" && (
          <>
            <Text className="font-poppins-semibold text-[15px] text-text-primary mb-2">
              Choose a model
            </Text>
            <View className="gap-2">
              {SMART_MODELS.map((option) => {
                const isSelected = option.key === model.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    className={`rounded-2xl border-2 px-4 py-3 ${isSelected ? "bg-[#F1EDFF] border-lingua-purple" : "bg-white border-border"}`}
                    activeOpacity={0.8}
                    onPress={() => onSelectModel(option.key)}
                    accessibilityLabel={`${option.name} model, ${isSelected ? "selected" : "tap to choose"}`}
                    testID={`smart-model-${option.key}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="font-poppins-semibold text-base text-text-primary">
                        {option.name}
                      </Text>
                      <Text className="caption">about {option.downloadMB} MB</Text>
                    </View>
                    <Text className="body-sm text-text-secondary">
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="bg-white rounded-2xl border border-border px-4 py-3 mt-4 gap-2">
              <Fact icon="wifi" text="Needs internet once, for the download. Use Wi-Fi." />
              <Fact icon="hardware-chip" text="Needs a lot of memory. If Safari reloads the page while Dax wakes up, choose the Light model." />
              <Fact icon="alert-circle" text="Smart Dax can make mistakes. It is a practice partner, not a teacher." />
            </View>

            <TouchableOpacity
              className="bg-lingua-purple rounded-2xl items-center py-4 mt-5"
              activeOpacity={0.85}
              onPress={onDownload}
              testID="smart-download-button"
            >
              <Text className="font-poppins-semibold text-base text-white">
                Download Smart Dax · {model.downloadMB} MB
              </Text>
            </TouchableOpacity>
          </>
        )}

        {status.phase === "loading" && (
          <View className="bg-white rounded-2xl border border-border p-4" testID="smart-loading">
            <Text className="font-poppins-semibold text-base text-text-primary">
              {status.isDownload ? "Downloading Smart Dax…" : "Waking up Smart Dax…"}
            </Text>
            <View className="h-3 bg-border rounded-full overflow-hidden mt-3">
              <View
                className="h-3 bg-lingua-purple rounded-full"
                style={{ width: `${Math.round(status.progress * 100)}%` }}
                testID="smart-progress-bar"
              />
            </View>
            <Text className="font-poppins-semibold text-sm text-text-primary mt-2" testID="smart-progress">
              {Math.round(status.progress * 100)}%
            </Text>
            {status.text !== "" && (
              <Text className="caption mt-1" numberOfLines={3}>
                {status.text}
              </Text>
            )}
            <Text className="body-sm text-text-secondary mt-2">
              {status.isDownload
                ? "Keep this screen open until it is ready. This happens only once."
                : "This takes a few seconds."}
            </Text>
          </View>
        )}

        {status.phase === "error" && (
          <View className="bg-white rounded-2xl border border-error px-4 py-3" testID="smart-error">
            <Text className="font-poppins-semibold text-base text-text-primary">
              Smart Dax could not start
            </Text>
            <Text className="body-sm text-text-secondary mt-1" numberOfLines={6}>
              {status.message}
            </Text>
            <Text className="body-sm text-text-secondary mt-2">
              This often means the device ran out of memory or the download
              was interrupted. Try again
              {model.key === "standard" ? ", or use the Light model." : "."}
            </Text>
            <TouchableOpacity
              className="bg-lingua-purple rounded-2xl items-center py-3 mt-3"
              activeOpacity={0.85}
              onPress={onDownload}
              testID="smart-retry-button"
            >
              <Text className="font-poppins-semibold text-sm text-white">Try again</Text>
            </TouchableOpacity>
            {model.key === "standard" && (
              <TouchableOpacity
                className="rounded-2xl items-center py-3 mt-2 border border-lingua-purple"
                activeOpacity={0.85}
                onPress={() => onSelectModel("light")}
                testID="smart-use-light-button"
              >
                <Text className="font-poppins-semibold text-sm text-lingua-purple">
                  Use the Light model
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        className="rounded-2xl items-center py-3 px-6 mt-4"
        activeOpacity={0.7}
        onPress={onBack}
        testID="smart-back-button"
      >
        <Text className="font-poppins-semibold text-sm text-text-secondary">
          Back to Dax with rules
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Fact({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row gap-3">
      <Ionicons name={icon} size={18} color={colors.primary.purple} />
      <Text className="flex-1 body-sm">{text}</Text>
    </View>
  );
}

// ScrollView.contentContainerStyle and image sizes stay in StyleSheet
const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  mascot: { width: 120, height: 120 },
});
