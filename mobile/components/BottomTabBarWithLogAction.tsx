import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { GlassContainer, GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogFoodSheets } from "@/components/LogFoodSheets";
import { tabBarNativeStyles, tabBarStyles } from "@/lib/styles";
import { glassTints, mobileTheme } from "@/lib/theme";

const TAB_BAR_HEIGHT = 56;
const TAB_ACTION_GAP = 105;
const MIN_BOTTOM_INSET = 6;
const CONTENT_GAP = 12;

export function getBottomTabBarContentPadding(bottomInset: number) {
  return TAB_BAR_HEIGHT + bottomInset + MIN_BOTTOM_INSET + CONTENT_GAP;
}

export function BottomTabBarWithLogAction({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [isLogFoodVisible, setIsLogFoodVisible] = useState(false);
  const tabBarContent = (
    <View className={tabBarStyles.tabContent}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused
          ? mobileTheme.text.primary
          : mobileTheme.text.muted;
        const label = options.title !== undefined ? options.title : route.name;
        const icon = options.tabBarIcon?.({
          color,
          focused: isFocused,
          size: 22,
        });

        return (
          <Pressable
            key={route.key}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            className={tabBarStyles.tabButton}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                void Haptics.selectionAsync();
                navigation.navigate(route.name, route.params);
              }
            }}
          >
            {icon}
            <Text
              className={
                isFocused
                  ? "mt-0.5 text-[10px] font-bold text-text-primary"
                  : "mt-0.5 text-[10px] font-semibold text-text-muted"
              }
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
  const actionButtonContent = (
    <Pressable
      accessibilityLabel="Log food"
      accessibilityRole="button"
      className={tabBarStyles.actionButton}
      onPress={() => {
        void Haptics.selectionAsync();
        setIsLogFoodVisible(true);
      }}
    >
      <Ionicons color={mobileTheme.text.primary} name="add" size={26} />
    </Pressable>
  );
  const tabBar = (
    <GlassView
      colorScheme="dark"
      glassEffectStyle="regular"
      style={tabBarNativeStyles.glassBar}
      tintColor={glassTints.tabBar}
    >
      {tabBarContent}
    </GlassView>
  );
  const actionButton = (
    <GlassView
      colorScheme="dark"
      glassEffectStyle="regular"
      isInteractive
      style={tabBarNativeStyles.glassAction}
      tintColor={glassTints.tabBar}
    >
      {actionButtonContent}
    </GlassView>
  );

  return (
    <>
      <SafeAreaView
        pointerEvents="box-none"
        className={tabBarStyles.safeArea}
        edges={["bottom"]}
      >
        <GlassContainer
          spacing={TAB_ACTION_GAP}
          style={tabBarNativeStyles.container}
        >
          {tabBar}
          {actionButton}
        </GlassContainer>
      </SafeAreaView>
      <LogFoodSheets
        visible={isLogFoodVisible}
        onClose={() => setIsLogFoodVisible(false)}
      />
    </>
  );
}
