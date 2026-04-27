import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FoodListItem } from "@sazio/shared";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { cn, controlStyles, formStyles } from "@/lib/styles";

export type FoodCreateSheetParams = {
  initialName?: string;
};

interface FoodCreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (food: FoodListItem) => void;
  params?: FoodCreateSheetParams;
}

function sanitizeWholeNumberInput(value: string) {
  return value.replace(/\D+/g, "");
}

function sanitizeDecimalInput(value: string) {
  const normalized = value.replace(",", ".");
  const [integerPart = "", decimalPart = ""] = normalized.split(".");
  const safeInteger = integerPart.replace(/\D+/g, "");
  const safeDecimal = decimalPart.replace(/\D+/g, "");
  return safeDecimal ? `${safeInteger}.${safeDecimal}` : safeInteger;
}

export function FoodCreateSheet({
  visible,
  onClose,
  onCreated,
  params,
}: FoodCreateSheetProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servingUnit, setServingUnit] = useState<"g" | "ml">("g");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    setName(params?.initialName?.trim() ?? "");
    setServingSize("");
    setServingUnit("g");
    setProtein("");
    setCarbs("");
    setFat("");
  }, [params?.initialName, visible]);

  const createFood = useMutation(
    trpc.createFood.mutationOptions({
      onSuccess: async (food) => {
        await queryClient.invalidateQueries(trpc.listFoods.pathFilter());
        onCreated(food);
      },
      onError: (error) => {
        Alert.alert("Unable to create food", error.message);
      },
    }),
  );

  const handleSave = () => {
    const trimmedName = name.trim();
    const parsedServingSize = parseInt(servingSize, 10);
    const parsedProtein = protein === "" ? 0 : parseFloat(protein);
    const parsedCarbs = carbs === "" ? 0 : parseFloat(carbs);
    const parsedFat = fat === "" ? 0 : parseFloat(fat);

    if (!trimmedName) {
      Alert.alert("Missing name", "Enter a food name before saving.");
      return;
    }

    if (
      Number.isNaN(parsedServingSize) ||
      parsedServingSize <= 0 ||
      Number.isNaN(parsedProtein) ||
      parsedProtein < 0 ||
      Number.isNaN(parsedCarbs) ||
      parsedCarbs < 0 ||
      Number.isNaN(parsedFat) ||
      parsedFat < 0
    ) {
      Alert.alert(
        "Invalid values",
        "Enter a positive serving size and non-negative macros.",
      );
      return;
    }

    createFood.mutate({
      name: trimmedName,
      servingSize: parsedServingSize,
      servingUnit,
      protein: parsedProtein,
      carbs: parsedCarbs,
      fat: parsedFat,
    });
  };

  return (
    <BottomSheetModal
      actionDisabled={createFood.isPending}
      actionLabel={createFood.isPending ? "Saving..." : "Save"}
      closeDisabled={createFood.isPending}
      onAction={handleSave}
      onClose={onClose}
      size="foodCreate"
      title="New Food"
      visible={visible}
    >
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className={formStyles.section}>
          <Text className={formStyles.label}>Food Name</Text>
          <TextInput
            className={formStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Chicken breast"
            placeholderTextColor={mobileTheme.text.muted}
          />
        </View>

        <View className={formStyles.section}>
          <Text className={formStyles.label}>Base Serving</Text>
          <View className={formStyles.panel}>
            <View className={formStyles.rowWithDivider}>
              <Text className="text-base text-text-primary">Size</Text>
              <TextInput
                value={servingSize}
                onChangeText={(value) =>
                  setServingSize(sanitizeWholeNumberInput(value))
                }
                placeholder="100"
                placeholderTextColor={mobileTheme.text.muted}
                inputMode="numeric"
                keyboardType="number-pad"
                className={formStyles.inlineInput}
              />
            </View>
            <View className="px-4 py-3">
              <Text className="mb-3 text-base text-text-primary">Unit</Text>
              <View className="flex-row gap-3">
                {(["g", "ml"] as const).map((unit) => {
                  const isSelected = servingUnit === unit;

                  return (
                    <Pressable
                      key={unit}
                      onPress={() => setServingUnit(unit)}
                      className={cn(
                        controlStyles.textAction,
                        isSelected
                          ? formStyles.selectedChip
                          : formStyles.unselectedChip,
                      )}
                    >
                      <Text
                        className={
                          isSelected
                            ? formStyles.selectedChipText
                            : formStyles.unselectedChipText
                        }
                      >
                        {unit}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <View className={formStyles.section}>
          <Text className={formStyles.label}>Macros Per Serving</Text>
          <Text className="mb-3 text-sm leading-5 text-text-secondary">
            These values are stored for the base serving above.
          </Text>
          <View className={formStyles.panel}>
            <View className={formStyles.rowWithDivider}>
              <Text className="text-base text-text-primary">Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={(value) =>
                  setProtein(sanitizeDecimalInput(value))
                }
                placeholder="0"
                placeholderTextColor={mobileTheme.text.muted}
                inputMode="decimal"
                keyboardType="decimal-pad"
                className={formStyles.inlineInput}
              />
            </View>
            <View className={formStyles.rowWithDivider}>
              <Text className="text-base text-text-primary">Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={(value) => setCarbs(sanitizeDecimalInput(value))}
                placeholder="0"
                placeholderTextColor={mobileTheme.text.muted}
                inputMode="decimal"
                keyboardType="decimal-pad"
                className={formStyles.inlineInput}
              />
            </View>
            <View className={formStyles.row}>
              <Text className="text-base text-text-primary">Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={(value) => setFat(sanitizeDecimalInput(value))}
                placeholder="0"
                placeholderTextColor={mobileTheme.text.muted}
                inputMode="decimal"
                keyboardType="decimal-pad"
                className={formStyles.inlineInput}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}
