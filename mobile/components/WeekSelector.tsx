import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { DateTime } from "luxon";
import { cn, screenStyles } from "@/lib/styles";

interface WeekSelectorProps {
  selectedDate: DateTime;
  onSelectDate: (date: DateTime) => void;
}

interface WeekPage {
  weekStart: DateTime;
  days: DateTime[];
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CENTER_PAGE_INDEX = 1;

function getWeekPages(weekStart: DateTime): WeekPage[] {
  return [-1, 0, 1].map((weekOffset) => {
    const pageWeekStart = weekStart.plus({ weeks: weekOffset });

    return {
      weekStart: pageWeekStart,
      days: Array.from({ length: 7 }, (_, dayOffset) =>
        pageWeekStart.plus({ days: dayOffset }),
      ),
    };
  });
}

function getWeekOffset(selectedDate: DateTime, currentWeekStart: DateTime) {
  return Math.max(
    -1,
    Math.min(
      1,
      Math.round(
        selectedDate.startOf("week").diff(currentWeekStart, "weeks").weeks,
      ),
    ),
  );
}

export function WeekSelector({
  selectedDate,
  onSelectDate,
}: WeekSelectorProps) {
  const { width } = useWindowDimensions();
  const today = DateTime.now().startOf("day");
  const currentWeekStart = today.startOf("week");
  const weekPages = getWeekPages(currentWeekStart);
  const weekOffset = getWeekOffset(selectedDate, currentWeekStart);
  const selectedPageIndex = weekOffset + CENTER_PAGE_INDEX;

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextPageIndex = Math.round(event.nativeEvent.contentOffset.x / width);

    if (nextPageIndex === CENTER_PAGE_INDEX) {
      return;
    }

    const nextWeek = weekPages[nextPageIndex];

    if (!nextWeek) {
      return;
    }

    onSelectDate(nextWeek.weekStart.plus({ days: selectedDate.weekday - 1 }));
  };

  return (
    <View className="mb-1">
      <FlatList
        key={weekOffset.toString()}
        data={weekPages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={selectedPageIndex}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        keyExtractor={(item) =>
          item.weekStart.toISODate() ?? item.weekStart.toMillis().toString()
        }
        renderItem={({ item }) => (
          <View
            className={cn("flex-row", screenStyles.content)}
            style={{ width }}
          >
            {item.days.map((day, index) => (
              <Pressable
                key={day.toISODate()}
                accessibilityLabel={day.toFormat("EEEE, MMMM d")}
                accessibilityRole="button"
                accessibilityState={{
                  selected: day.hasSame(selectedDate, "day"),
                }}
                className="flex-1 items-center pb-2 pt-0.5"
                onPress={() => onSelectDate(day)}
              >
                <Text
                  className={cn(
                    "mb-1 text-xs",
                    day.month !== selectedDate.month
                      ? "text-text-muted"
                      : "text-text-secondary",
                  )}
                >
                  {DAY_NAMES[index]}
                </Text>
                <View
                  className={cn(
                    "h-11 w-11 items-center justify-center rounded-full",
                    day.hasSame(selectedDate, "day")
                      ? "border border-white bg-white"
                      : day.hasSame(today, "day")
                        ? "border border-border-strong bg-surface-raised"
                        : day.month !== selectedDate.month
                          ? "border border-transparent bg-surface-app"
                          : "border border-transparent bg-surface-card",
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-semibold",
                      day.hasSame(selectedDate, "day")
                        ? "text-text-inverse"
                        : day.month !== selectedDate.month
                          ? "text-text-muted"
                          : "text-text-primary",
                    )}
                  >
                    {day.day}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      />
    </View>
  );
}
