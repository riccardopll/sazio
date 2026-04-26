import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  cn,
  controlStyles,
  sheetNativeStyles,
  sheetStyles,
} from "@/lib/styles";
import { glassTints, mobileTheme } from "@/lib/theme";

interface BottomSheetModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actionLabel?: string;
  actionDisabled?: boolean;
  closeDisabled?: boolean;
  onAction?: () => void;
  size?: "default" | "goal" | "foodCreate" | "foodLog";
}

const SHEET_SIZE_CLASS_NAMES = {
  default: "h-[82%]",
  goal: "h-[78%]",
  foodCreate: "h-[84%]",
  foodLog: "h-[88%]",
} as const;

export function BottomSheetModal({
  visible,
  title,
  onClose,
  children,
  actionLabel = "Save",
  actionDisabled = false,
  closeDisabled = false,
  onAction,
  size = "default",
}: BottomSheetModalProps) {
  const sheetClassName = SHEET_SIZE_CLASS_NAMES[size];

  return (
    <Modal
      animationType="slide"
      onRequestClose={closeDisabled ? () => {} : onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close modal"
          accessibilityRole="button"
          className="absolute inset-0 bg-black/55"
          onPress={closeDisabled ? undefined : onClose}
        />
        <KeyboardAvoidingView behavior="padding" className="w-full justify-end">
          <View className={cn(sheetStyles.container, sheetClassName)}>
            <View className="px-4 pb-2 pt-2">
              <View className="items-center">
                <View className="h-1 w-12 rounded-full bg-border-strong" />
              </View>
              <View className="mt-4 flex-row items-center justify-between">
                <Pressable
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  className={cn(
                    sheetStyles.iconButton,
                    closeDisabled && "opacity-40",
                  )}
                  disabled={closeDisabled}
                  onPress={onClose}
                >
                  <GlassView
                    colorScheme="dark"
                    glassEffectStyle="regular"
                    isInteractive
                    style={sheetNativeStyles.glassButton}
                    tintColor={glassTints.sheet}
                  >
                    <Ionicons
                      color={mobileTheme.text.primary}
                      name="close"
                      size={27}
                    />
                  </GlassView>
                </Pressable>

                <Text className="text-center text-[20px] font-bold leading-6 text-text-primary">
                  {title}
                </Text>

                {onAction ? (
                  <Pressable
                    className={cn(
                      controlStyles.textAction,
                      "w-10 items-end",
                      actionDisabled && "opacity-40",
                    )}
                    disabled={actionDisabled}
                    onPress={onAction}
                  >
                    <Text
                      className={cn(
                        "text-[15px] font-semibold",
                        actionDisabled
                          ? "text-text-muted"
                          : "text-text-primary",
                      )}
                    >
                      {actionLabel}
                    </Text>
                  </Pressable>
                ) : (
                  <View className="w-10" />
                )}
              </View>
            </View>
            <SafeAreaView
              className="flex-1 bg-surface-sheet"
              edges={["bottom"]}
            >
              {children}
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
