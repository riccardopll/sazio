import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useState } from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { cn, nutritionStyles, textStyles } from "@/lib/styles";
import { mobileTheme, nutritionTheme } from "@/lib/theme";
import { Card } from "./Card";

interface NutritionData {
  consumed: number;
  goal: number;
}

interface NutritionProgressCardProps {
  calories: NutritionData;
  carbs: NutritionData;
  fat: NutritionData;
  protein: NutritionData;
  isLoading?: boolean;
}

type MacroVariant = "calories" | "carbs" | "fat" | "protein";
type MacroIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const METRIC_CONFIG: Record<
  MacroVariant,
  {
    icon: MacroIconName;
    unit: string;
  }
> = {
  calories: {
    icon: "fire",
    unit: "",
  },
  carbs: {
    icon: "grain",
    unit: "g",
  },
  fat: {
    icon: "egg",
    unit: "g",
  },
  protein: {
    icon: "food-drumstick",
    unit: "g",
  },
};

function formatValue(value: number) {
  return Math.max(0, Math.round(value)).toLocaleString();
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const [r, g, b] =
    normalized.length === 3
      ? normalized
          .split("")
          .map((channel) => Number.parseInt(channel + channel, 16))
      : [
          Number.parseInt(normalized.slice(0, 2), 16),
          Number.parseInt(normalized.slice(2, 4), 16),
          Number.parseInt(normalized.slice(4, 6), 16),
        ];

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getMetricSummary({ consumed, goal }: NutritionData) {
  if (goal <= 0) {
    return {
      delta: 0,
      progress: 0,
      status: "goal not set",
      detail: "Set a goal in Settings",
    };
  }

  const remaining = goal - consumed;
  const isOver = remaining < 0;

  return {
    delta: Math.abs(remaining),
    progress: Math.min(consumed / goal, 1),
    status: isOver ? "over" : "left",
    detail: `${formatValue(consumed)} / ${formatValue(goal)}`,
  };
}

function ProgressRing({
  color,
  icon,
  progress,
  size,
  strokeWidth,
  iconSize,
  centerClassName,
  className,
}: {
  color: string;
  icon?: MacroIconName;
  progress: number;
  size: number;
  strokeWidth: number;
  iconSize: number;
  centerClassName: string;
  className: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const isComplete = clampedProgress >= 1;
  const dashOffset = circumference * (1 - clampedProgress);

  return (
    <View className={cn("items-center justify-center", className)}>
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={hexToRgba(color, 0.16)}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={
            isComplete ? undefined : `${circumference} ${circumference}`
          }
          strokeDashoffset={isComplete ? undefined : dashOffset}
          strokeLinecap={isComplete ? "butt" : "round"}
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {icon ? (
        <View className={cn(nutritionStyles.ringCenter, centerClassName)}>
          <MaterialCommunityIcons color={color} name={icon} size={iconSize} />
        </View>
      ) : null}
    </View>
  );
}

function MacroCard({
  label,
  metric,
  variant,
}: {
  label: string;
  metric: NutritionData;
  variant: Exclude<MacroVariant, "calories">;
}) {
  const metricConfig = METRIC_CONFIG[variant];
  const metricTheme = nutritionTheme[variant];
  const metricStyles = nutritionStyles[variant];
  const summary = getMetricSummary(metric);
  const detail =
    summary.status === "goal not set"
      ? summary.detail
      : `${formatValue(metric.consumed)}${metricConfig.unit} / ${formatValue(metric.goal)}${metricConfig.unit}`;
  const remaining = Math.max(metric.goal - metric.consumed, 0);

  return (
    <Card
      className="flex-1"
      contentClassName="min-h-[160px] items-center justify-between px-2.5 pb-2.5 pt-2.5"
    >
      <View className="items-center">
        <View className="flex-row items-center justify-center gap-1.5">
          <View className={cn(nutritionStyles.dot, metricStyles.dot)} />
          <Text
            className={cn(textStyles.cardSubtitle, "text-center")}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
        <Text
          className="mt-2 text-center text-[25px] font-bold leading-7 tracking-tight text-text-primary"
          numberOfLines={1}
        >
          {`${formatValue(remaining)}${metricConfig.unit}`}
        </Text>
      </View>

      <View className="items-center justify-center py-2">
        <ProgressRing
          color={metricTheme.color}
          centerClassName="h-8 w-8"
          className="h-[66px] w-[66px]"
          iconSize={20}
          progress={summary.progress}
          size={66}
          strokeWidth={8}
        />
      </View>

      <Text className={cn(textStyles.cardFooter, "self-center text-center")}>
        {detail}
      </Text>
    </Card>
  );
}

export function NutritionProgressCard({
  calories,
  carbs,
  fat,
  protein,
  isLoading,
}: NutritionProgressCardProps) {
  const [activePage, setActivePage] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  if (isLoading) {
    return (
      <Card>
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color={mobileTheme.state.loading} />
        </View>
      </Card>
    );
  }

  const calorieSummary = getMetricSummary(calories);
  const calorieConfig = METRIC_CONFIG.calories;
  const calorieTheme = nutritionTheme.calories;
  const calorieDetail =
    calorieSummary.status === "goal not set"
      ? calorieSummary.detail
      : `${calorieSummary.detail} kcal`;

  const pageStyle = pageWidth > 0 ? { width: pageWidth } : undefined;

  function handleLayout(event: LayoutChangeEvent) {
    setPageWidth(event.nativeEvent.layout.width);
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    if (pageWidth === 0) {
      return;
    }

    const nextPage = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActivePage(Math.max(0, Math.min(nextPage, 1)));
  }

  return (
    <View className="gap-3" onLayout={handleLayout}>
      <ScrollView
        horizontal
        onMomentumScrollEnd={handleMomentumScrollEnd}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        <View className="gap-2" style={pageStyle}>
          <Card contentClassName="px-4 py-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-h-[124px] flex-1 justify-between">
                <View>
                  <Text className={textStyles.cardSubtitle}>
                    Daily nutrition
                  </Text>
                  <Text className="mt-3 text-[54px] font-bold leading-[54px] tracking-tight text-text-primary">
                    {formatValue(calorieSummary.delta)}
                  </Text>
                  <Text className={cn("mt-1", textStyles.cardSubtitle)}>
                    {calorieSummary.status === "goal not set"
                      ? "Calorie goal not set"
                      : `Calories ${calorieSummary.status}`}
                  </Text>
                </View>
                <Text className={cn(textStyles.cardFooter, "text-[13px]")}>
                  {calorieDetail}
                </Text>
              </View>

              <ProgressRing
                color={calorieTheme.color}
                centerClassName="h-[84px] w-[84px]"
                className="h-[124px] w-[124px]"
                icon={calorieConfig.icon}
                iconSize={34}
                progress={calorieSummary.progress}
                size={124}
                strokeWidth={11}
              />
            </View>
          </Card>

          <View className="flex-row gap-3">
            <MacroCard label="Protein" metric={protein} variant="protein" />
            <MacroCard label="Carbs" metric={carbs} variant="carbs" />
            <MacroCard label="Fat" metric={fat} variant="fat" />
          </View>
        </View>

        <View style={pageStyle} />
      </ScrollView>

      <View className="flex-row items-center justify-center gap-2">
        {[0, 1].map((page) => (
          <View
            className={cn(
              "h-2 w-2 rounded-full",
              activePage === page ? "bg-text-secondary" : "bg-[#3A3A40]",
            )}
            key={page}
          />
        ))}
      </View>
    </View>
  );
}
