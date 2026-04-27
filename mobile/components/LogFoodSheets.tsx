import type { FoodListItem } from "@sazio/shared";
import { useEffect, useState } from "react";
import {
  FoodCreateSheet,
  type FoodCreateSheetParams,
} from "@/components/FoodCreateSheet";
import {
  FoodLogSheet,
  type FoodLogSheetParams,
} from "@/components/FoodLogSheet";

interface LogFoodSheetsProps {
  visible: boolean;
  onClose: () => void;
}

export function LogFoodSheets({ visible, onClose }: LogFoodSheetsProps) {
  const [activeModal, setActiveModal] = useState<"log" | "create">("log");
  const [foodLogParams, setFoodLogParams] = useState<FoodLogSheetParams>({});
  const [foodCreateParams, setFoodCreateParams] =
    useState<FoodCreateSheetParams>({});

  useEffect(() => {
    setActiveModal("log");
    setFoodLogParams({});
    setFoodCreateParams({});
  }, [visible]);

  const handleFoodCreated = (food: FoodListItem) => {
    setFoodLogParams({
      initialSearch: food.name,
      selectedFood: food,
    });
    setActiveModal("log");
  };

  const handleOpenCreateFood = (initialName?: string) => {
    setFoodCreateParams({ initialName });
    setActiveModal("create");
  };

  return (
    <>
      <FoodLogSheet
        visible={visible && activeModal === "log"}
        params={foodLogParams}
        onClose={onClose}
        onRequestCreateFood={handleOpenCreateFood}
      />
      <FoodCreateSheet
        visible={visible && activeModal === "create"}
        params={foodCreateParams}
        onClose={onClose}
        onCreated={handleFoodCreated}
      />
    </>
  );
}
