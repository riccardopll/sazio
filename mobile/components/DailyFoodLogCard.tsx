import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { cn, nutritionStyles, textStyles } from "@/lib/styles";
import { mobileTheme } from "@/lib/theme";
import { useTRPC } from "@/lib/trpc";
import { Card } from "./Card";

interface DailyFoodLogEntry {
  id: number;
  createdAt: number;
  foodName: string;
  quantity: number;
  servingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyFoodLogCardProps {
  entries?: DailyFoodLogEntry[];
  isLoading?: boolean;
  selectedDate: DateTime;
  timezone: string;
}

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface WeeklySummaryItem extends MacroTotals {
  date: string;
}

type MacroType = "carbs" | "fat" | "protein";
type MacroIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const MACRO_ICON_CONFIG: Record<
  MacroType,
  {
    icon: MacroIconName;
  }
> = {
  protein: {
    icon: "food-drumstick",
  },
  carbs: {
    icon: "barley",
  },
  fat: {
    icon: "peanut",
  },
};

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

const FOOD_LOG_TITLE = "Recent items";

function includesId(ids: number[], id: number) {
  return ids.includes(id);
}

function withoutId(ids: number[], id: number) {
  return ids.filter((currentId) => currentId !== id);
}

function withId(ids: number[], id: number) {
  if (ids.includes(id)) {
    return ids;
  }

  return [...ids, id];
}

function getDominantMacro(entry: DailyFoodLogEntry) {
  const macros: MacroType[] = ["protein", "carbs", "fat"];

  return macros.reduce((dominantMacro, macro) =>
    entry[macro] > entry[dominantMacro] ? macro : dominantMacro,
  );
}

function subtractEntryTotals(
  totals: MacroTotals | undefined,
  entry: DailyFoodLogEntry,
) {
  if (!totals) {
    return totals;
  }

  return {
    ...totals,
    calories: Math.max(totals.calories - entry.calories, 0),
    protein: Math.max(totals.protein - entry.protein, 0),
    carbs: Math.max(totals.carbs - entry.carbs, 0),
    fat: Math.max(totals.fat - entry.fat, 0),
  };
}

function subtractEntryFromWeek(
  weekData: WeeklySummaryItem[] | undefined,
  entry: DailyFoodLogEntry,
  date: string | null,
) {
  if (!weekData || !date) {
    return weekData;
  }

  return weekData.map((day) =>
    day.date === date ? { ...day, ...subtractEntryTotals(day, entry) } : day,
  );
}

function FoodLogRow({
  entry,
  isLast,
  onDelete,
  timezone,
}: {
  entry: DailyFoodLogEntry;
  isLast: boolean;
  onDelete: (entry: DailyFoodLogEntry) => void;
  timezone: string;
}) {
  const dominantMacro = getDominantMacro(entry);
  const macroIcon = MACRO_ICON_CONFIG[dominantMacro];
  const macroStyles = nutritionStyles[dominantMacro];

  const renderDeleteAction = () => (
    <View className="w-[72px] items-center justify-center bg-state-destructive">
      <Ionicons color="#FFFFFF" name="trash-outline" size={22} />
    </View>
  );

  return (
    <Swipeable
      leftThreshold={42}
      overshootLeft={false}
      renderLeftActions={renderDeleteAction}
      onSwipeableOpen={() => onDelete(entry)}
    >
      <View
        className={cn(
          "flex-row items-center bg-surface-card py-2 pl-1",
          !isLast && "border-b border-border-subtle",
        )}
      >
        <View className="w-12 items-center justify-center">
          <View
            className={cn(
              "h-9 w-9 items-center justify-center rounded-full",
              macroStyles.dot,
            )}
          >
            <MaterialCommunityIcons
              color="#FFFFFF"
              name={macroIcon.icon}
              size={22}
            />
          </View>
        </View>
        <View className="min-w-0 flex-1 flex-row items-center gap-2 pl-2">
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-3">
              <Text
                className="min-w-0 flex-1 text-[15px] font-semibold leading-5 text-text-primary"
                numberOfLines={1}
              >
                {entry.foodName}
              </Text>
              <Text
                className="shrink-0 text-right text-[15px] font-semibold leading-5 text-text-primary"
                numberOfLines={1}
              >
                {formatNumber(entry.calories)} kcal
              </Text>
            </View>
            <View className="mt-1 flex-row items-center gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-3">
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={cn(
                      nutritionStyles.smallDot,
                      nutritionStyles.protein.dot,
                    )}
                  />
                  <Text className="text-sm leading-5 text-text-muted">
                    {formatNumber(entry.protein)}P
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={cn(
                      nutritionStyles.smallDot,
                      nutritionStyles.carbs.dot,
                    )}
                  />
                  <Text className="text-sm leading-5 text-text-muted">
                    {formatNumber(entry.carbs)}C
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={cn(
                      nutritionStyles.smallDot,
                      nutritionStyles.fat.dot,
                    )}
                  />
                  <Text className="text-sm leading-5 text-text-muted">
                    {formatNumber(entry.fat)}F
                  </Text>
                </View>
              </View>
              <Text
                className="shrink-0 text-right text-sm leading-5 text-text-muted"
                numberOfLines={1}
              >
                {DateTime.fromMillis(entry.createdAt)
                  .setZone(timezone)
                  .toFormat("HH:mm")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

function FoodLogRows({
  entries,
  onDelete,
  timezone,
}: {
  entries: DailyFoodLogEntry[];
  onDelete: (entry: DailyFoodLogEntry) => void;
  timezone: string;
}) {
  return entries.map((entry, index) => (
    <FoodLogRow
      key={entry.id}
      entry={entry}
      isLast={index === entries.length - 1}
      onDelete={onDelete}
      timezone={timezone}
    />
  ));
}

function EmptyFoodLogState() {
  return (
    <View className="items-center px-4 pb-1 pt-1">
      <Ionicons
        color={mobileTheme.text.muted}
        name="file-tray-outline"
        size={46}
      />
      <Text className="mt-3 text-center text-2xl font-bold leading-8 text-text-primary">
        Nothing logged yet
      </Text>
      <Text className="mt-1 text-center text-base leading-6 text-text-muted">
        Meals and scans will land here.
      </Text>
    </View>
  );
}

export function DailyFoodLogCard({
  entries,
  isLoading,
  selectedDate,
  timezone,
}: DailyFoodLogCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isLogSheetVisible, setIsLogSheetVisible] = useState(false);
  const [deletingLogIds, setDeletingLogIds] = useState<number[]>([]);
  const deleteFoodLog = useMutation(trpc.deleteFoodLog.mutationOptions());
  const logs = entries ?? [];
  const displayLogs = isLoading ? [] : logs;
  const visibleLogs = displayLogs.slice(0, 3);
  const hasVisibleLogs = visibleLogs.length > 0;
  const title = FOOD_LOG_TITLE;

  const handleDelete = async (entry: DailyFoodLogEntry) => {
    if (includesId(deletingLogIds, entry.id)) {
      return;
    }

    const date = selectedDate.toJSDate();
    const weekStartDate = selectedDate.startOf("week").toJSDate();
    const selectedIsoDate = selectedDate.toISODate();
    const dailyLogsKey = trpc.getDailyFoodLogs.queryKey({ date, timezone });
    const dailySummaryKey = trpc.getDailySummary.queryKey({ date, timezone });
    const weeklySummaryKey = trpc.getWeeklySummary.queryKey({
      weekStartDate,
      timezone,
    });
    const previousDailyLogs =
      queryClient.getQueryData<DailyFoodLogEntry[]>(dailyLogsKey);
    const previousDailySummary =
      queryClient.getQueryData<MacroTotals>(dailySummaryKey);
    const previousWeeklySummary =
      queryClient.getQueryData<WeeklySummaryItem[]>(weeklySummaryKey);

    setDeletingLogIds((currentIds) => withId(currentIds, entry.id));
    await Promise.all([
      queryClient.cancelQueries({ queryKey: dailyLogsKey }),
      queryClient.cancelQueries({ queryKey: dailySummaryKey }),
      queryClient.cancelQueries({ queryKey: weeklySummaryKey }),
    ]);
    queryClient.setQueryData<DailyFoodLogEntry[]>(dailyLogsKey, (currentLogs) =>
      currentLogs?.filter((currentEntry) => currentEntry.id !== entry.id),
    );
    queryClient.setQueryData<MacroTotals>(dailySummaryKey, (currentSummary) =>
      subtractEntryTotals(currentSummary, entry),
    );
    queryClient.setQueryData<WeeklySummaryItem[]>(
      weeklySummaryKey,
      (currentWeek) =>
        subtractEntryFromWeek(currentWeek, entry, selectedIsoDate),
    );
    deleteFoodLog.mutate(
      { id: entry.id },
      {
        onError: (error) => {
          queryClient.setQueryData(dailyLogsKey, previousDailyLogs);
          queryClient.setQueryData(dailySummaryKey, previousDailySummary);
          queryClient.setQueryData(weeklySummaryKey, previousWeeklySummary);
          setDeletingLogIds((currentIds) => withoutId(currentIds, entry.id));
          Alert.alert("Unable to delete food", error.message);
        },
        onSettled: () => {
          setDeletingLogIds((currentIds) => withoutId(currentIds, entry.id));
        },
      },
    );
  };

  return (
    <>
      <Card
        contentClassName={cn("px-4 pt-4", hasVisibleLogs ? "pb-2" : "pb-4")}
      >
        <View className="flex-row items-center justify-between gap-4">
          <Text className={cn(textStyles.cardSubtitle, "min-w-0 flex-1")}>
            {title}
          </Text>
          {displayLogs.length > 0 ? (
            <Pressable
              accessibilityLabel="See all logged food"
              accessibilityRole="button"
              className="flex-row items-center gap-1 pl-3"
              hitSlop={12}
              onPress={() => setIsLogSheetVisible(true)}
            >
              <Text className="text-sm font-medium text-text-secondary">
                See all
              </Text>
              <Ionicons
                color={mobileTheme.text.secondary}
                name="chevron-forward"
                size={16}
              />
            </Pressable>
          ) : null}
        </View>
        {!isLoading && displayLogs.length === 0 ? <EmptyFoodLogState /> : null}

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="small" color={mobileTheme.state.loading} />
          </View>
        ) : !hasVisibleLogs ? null : (
          <View className="-mx-2 mt-2 overflow-hidden border-t border-border-subtle">
            <FoodLogRows
              entries={visibleLogs}
              onDelete={handleDelete}
              timezone={timezone}
            />
          </View>
        )}
      </Card>

      <BottomSheetModal
        onClose={() => setIsLogSheetVisible(false)}
        size="foodLog"
        title={FOOD_LOG_TITLE}
        visible={isLogSheetVisible}
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerClassName="pb-6 pt-3"
        >
          <FoodLogRows
            entries={displayLogs}
            onDelete={handleDelete}
            timezone={timezone}
          />
        </ScrollView>
      </BottomSheetModal>
    </>
  );
}
