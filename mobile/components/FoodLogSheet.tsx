import { useDeferredValue, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FoodListItem } from "@sazio/shared";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import {
  cn,
  controlStyles,
  formStyles,
  nutritionStyles,
  textStyles,
} from "@/lib/styles";

export type FoodLogSheetParams = {
  initialSearch?: string;
  selectedFood?: FoodListItem;
};

interface FoodLogSheetProps {
  visible: boolean;
  onClose: () => void;
  onRequestCreateFood: (initialName?: string) => void;
  params?: FoodLogSheetParams;
}

function sanitizeDecimalInput(value: string) {
  const normalized = value.replace(",", ".");
  const [integerPart = "", decimalPart = ""] = normalized.split(".");
  const safeInteger = integerPart.replace(/[^\d]/g, "");
  const safeDecimal = decimalPart.replace(/[^\d]/g, "");
  return safeDecimal ? `${safeInteger}.${safeDecimal}` : safeInteger;
}

function calculateCalories({
  protein,
  carbs,
  fat,
}: {
  protein: number;
  carbs: number;
  fat: number;
}) {
  return protein * 4 + carbs * 4 + fat * 9;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function FoodLogSheet({
  visible,
  onClose,
  onRequestCreateFood,
  params,
}: FoodLogSheetProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodListItem | null>(null);
  const [quantity, setQuantity] = useState("1");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setSearch(params?.initialSearch ?? "");
    setSelectedFood(params?.selectedFood ?? null);
    setQuantity("1");
  }, [params?.initialSearch, params?.selectedFood, visible]);

  const foodsQuery = useQuery(
    trpc.listFoods.queryOptions({
      query: deferredSearch.trim() || undefined,
      limit: 20,
    }),
  );

  const createFoodLog = useMutation(
    trpc.createFoodLog.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.getDailyFoodLogs.pathFilter()),
          queryClient.invalidateQueries(trpc.getDailySummary.pathFilter()),
          queryClient.invalidateQueries(trpc.getWeeklySummary.pathFilter()),
        ]);
        onClose();
      },
      onError: (error) => {
        Alert.alert("Unable to log food", error.message);
      },
    }),
  );

  const parsedQuantity = parseFloat(quantity);
  const previewMultiplier =
    !Number.isNaN(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0;
  const previewMacros = selectedFood
    ? {
        protein: selectedFood.protein * previewMultiplier,
        carbs: selectedFood.carbs * previewMultiplier,
        fat: selectedFood.fat * previewMultiplier,
      }
    : null;
  const previewCalories = previewMacros ? calculateCalories(previewMacros) : 0;
  const foods = foodsQuery.data ?? [];

  const handleSave = () => {
    if (!selectedFood) {
      Alert.alert("Select a food", "Pick a food before logging it.");
      return;
    }

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Invalid quantity", "Enter a quantity greater than zero.");
      return;
    }

    createFoodLog.mutate({
      foodId: selectedFood.id,
      quantity: parsedQuantity,
    });
  };

  const handleCreateFood = () => {
    onRequestCreateFood(search.trim() || undefined);
  };

  return (
    <BottomSheetModal
      actionDisabled={createFoodLog.isPending || !selectedFood}
      actionLabel={createFoodLog.isPending ? "Saving..." : "Save"}
      closeDisabled={createFoodLog.isPending}
      onAction={handleSave}
      onClose={onClose}
      size="foodLog"
      title="Log Food"
      visible={visible}
    >
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className={formStyles.section}>
          <Text className={formStyles.label}>Search</Text>
          <TextInput
            className={formStyles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your foods"
            placeholderTextColor={mobileTheme.text.muted}
          />
          <Pressable
            onPress={handleCreateFood}
            className={cn(
              "mt-3 rounded-full border border-border-strong bg-surface-raised px-4 py-3",
              controlStyles.textAction,
            )}
          >
            <Text className="text-center text-sm font-semibold text-text-primary">
              {search.trim()
                ? `Create "${search.trim()}"`
                : "Create a new food"}
            </Text>
          </Pressable>
        </View>

        {selectedFood && previewMacros ? (
          <View className={formStyles.panelWithTopMargin}>
            <View className="border-b border-border-subtle px-4 py-4">
              <Text className="text-lg font-semibold text-text-primary">
                {selectedFood.name}
              </Text>
              <Text className="mt-1 text-sm text-text-secondary">
                {`Per ${selectedFood.servingSize}${selectedFood.servingUnit}`}
              </Text>
            </View>
            <View className={formStyles.rowWithDivider}>
              <Text className="text-base text-text-primary">Quantity</Text>
              <TextInput
                value={quantity}
                onChangeText={(value) =>
                  setQuantity(sanitizeDecimalInput(value))
                }
                placeholder="1"
                placeholderTextColor={mobileTheme.text.muted}
                inputMode="decimal"
                keyboardType="decimal-pad"
                className={formStyles.inlineInput}
              />
            </View>
            <View className="px-4 py-4">
              <Text className={textStyles.sectionTitle}>Preview</Text>
              <View className="mt-3 flex-row flex-wrap gap-3">
                <View className={nutritionStyles.previewTile}>
                  <Text className="text-xs uppercase text-text-muted">
                    Calories
                  </Text>
                  <Text
                    className={cn(
                      nutritionStyles.previewValue,
                      nutritionStyles.calories.text,
                    )}
                  >
                    {formatNumber(previewCalories)}
                  </Text>
                </View>
                <View className={nutritionStyles.previewTile}>
                  <Text className="text-xs uppercase text-text-muted">
                    Protein
                  </Text>
                  <Text
                    className={cn(
                      nutritionStyles.previewValue,
                      nutritionStyles.protein.text,
                    )}
                  >
                    {formatNumber(previewMacros.protein)}g
                  </Text>
                </View>
                <View className={nutritionStyles.previewTile}>
                  <Text className="text-xs uppercase text-text-muted">
                    Carbs
                  </Text>
                  <Text
                    className={cn(
                      nutritionStyles.previewValue,
                      nutritionStyles.carbs.text,
                    )}
                  >
                    {formatNumber(previewMacros.carbs)}g
                  </Text>
                </View>
                <View className={nutritionStyles.previewTile}>
                  <Text className="text-xs uppercase text-text-muted">Fat</Text>
                  <Text
                    className={cn(
                      nutritionStyles.previewValue,
                      nutritionStyles.fat.text,
                    )}
                  >
                    {formatNumber(previewMacros.fat)}g
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View className={formStyles.section}>
          <Text className={formStyles.label}>Foods</Text>
          <View className={formStyles.panel}>
            {foodsQuery.isLoading ? (
              <View className="items-center justify-center px-4 py-8">
                <ActivityIndicator
                  size="small"
                  color={mobileTheme.state.loading}
                />
              </View>
            ) : foods.length === 0 ? (
              <View className="px-4 py-5">
                <Text className="text-base text-text-primary">
                  No foods found.
                </Text>
                <Text className="mt-1 text-sm leading-5 text-text-secondary">
                  Create your first food and it will be ready to log right away.
                </Text>
              </View>
            ) : (
              foods.map((food, index) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <Pressable
                    key={food.id}
                    onPress={() => setSelectedFood(food)}
                    className={cn(
                      "px-4 py-4",
                      index !== foods.length - 1 &&
                        "border-b border-border-subtle",
                      isSelected && "bg-surface-raised",
                    )}
                  >
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1">
                        <Text className="text-base font-medium text-text-primary">
                          {food.name}
                        </Text>
                        <Text className="mt-1 text-sm text-text-secondary">
                          {`Per ${food.servingSize}${food.servingUnit}`}
                        </Text>
                        <Text className="mt-2 text-xs uppercase tracking-[1.2px] text-text-muted">
                          {`${formatNumber(food.protein)}P  ${formatNumber(food.carbs)}C  ${formatNumber(food.fat)}F`}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Text className="text-sm font-semibold text-text-primary">
                          Selected
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}
