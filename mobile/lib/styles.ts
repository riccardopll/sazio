import type { ViewStyle } from "react-native";
import { mobileTheme } from "@/lib/theme";

type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export const screenStyles = {
  appRoot: "flex-1 bg-surface-app",
  centeredAppRoot: "flex-1 items-center justify-center bg-surface-app",
  content: "px-4",
  header: "px-4 pb-2 pt-2",
  embeddedHeader: "pb-2 pt-4",
  scrollContent: "px-4",
  cardGap: "gap-3",
} as const;

export const textStyles = {
  eyebrow: "text-xs uppercase tracking-[1.6px] text-text-muted",
  screenTitle: "text-4xl font-bold text-text-primary",
  screenTitleWithEyebrow: "mt-2 text-4xl font-bold text-text-primary",
  sectionTitle:
    "text-sm font-medium uppercase tracking-[1.1px] text-text-muted",
  cardTitle: "text-lg font-semibold text-text-primary",
  cardSubtitle: "text-base font-medium leading-5 text-text-secondary",
  cardFooter: "text-xs text-text-muted",
  body: "text-base text-text-secondary",
  caption: "text-sm text-text-muted",
} as const;

export const radiusStyles = {
  card: "rounded-2xl",
} as const;

export const cardStyles = {
  base: cn(
    "overflow-hidden border border-border-subtle bg-surface-card shadow-lg shadow-black/40",
    radiusStyles.card,
  ),
  content: "p-5",
  row: "flex-row items-center gap-4 px-4 py-4",
} as const;

export const controlStyles = {
  hitTarget: "min-h-11 min-w-11 items-center justify-center",
  primaryAction: "mt-6 rounded-[24px] px-5 py-4",
  primaryActionText: "text-center text-base font-semibold",
  raisedIconSmall:
    "h-10 w-10 items-center justify-center rounded-full bg-surface-raised",
  raisedIconLarge:
    "h-14 w-14 items-center justify-center rounded-full bg-surface-raised",
  textAction: "min-h-11 justify-center",
} as const;

export const formStyles = {
  section: "mt-6",
  label: "mb-2 text-sm font-medium uppercase text-text-muted",
  input:
    "h-12 rounded-xl border border-border-subtle bg-surface-input px-4 py-0 text-[16px] text-text-primary",
  inlineInput: "min-w-[96px] py-0 text-right text-[16px] text-text-primary",
  panel:
    "overflow-hidden rounded-[20px] border border-border-subtle bg-surface-input",
  panelWithTopMargin:
    "mt-6 overflow-hidden rounded-[20px] border border-border-subtle bg-surface-input",
  row: "flex-row items-center justify-between px-4 py-3",
  rowWithDivider:
    "flex-row items-center justify-between border-b border-border-subtle px-4 py-3",
  selectedChip:
    "min-w-[72px] rounded-full border border-text-primary bg-text-primary px-4 py-2",
  unselectedChip:
    "min-w-[72px] rounded-full border border-border-strong bg-surface-raised px-4 py-2",
  selectedChipText:
    "text-center text-sm font-semibold uppercase text-text-inverse",
  unselectedChipText:
    "text-center text-sm font-semibold uppercase text-text-primary",
} as const;

export const sheetStyles = {
  container:
    "min-h-80 max-h-[92%] w-full overflow-hidden rounded-t-[28px] bg-surface-sheet",
  iconButton: "h-10 w-10",
} as const;

export const tabBarStyles = {
  safeArea: "absolute bottom-0 left-0 right-0 items-center px-4 pb-2.5",
  tabContent: "h-14 flex-row items-center justify-center",
  tabButton: "h-14 w-[88px] items-center justify-center",
  actionButton: "h-14 w-14 items-center justify-center",
} as const;

export const sheetNativeStyles = {
  glassButton: {
    alignItems: "center",
    borderColor: mobileTheme.border.strong,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    overflow: "hidden",
    width: 40,
  } satisfies ViewStyle,
} as const;

export const tabBarNativeStyles = {
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 105,
  } satisfies ViewStyle,
  glassAction: {
    alignItems: "center",
    borderColor: mobileTheme.border.strong,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    overflow: "hidden",
    width: 56,
  } satisfies ViewStyle,
  glassBar: {
    alignItems: "center",
    borderColor: mobileTheme.border.subtle,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    overflow: "hidden",
    width: 176,
  } satisfies ViewStyle,
} as const;

export const nutritionStyles = {
  calories: {
    dot: "bg-nutrition-calories",
    text: "text-nutrition-calories",
  },
  carbs: {
    dot: "bg-nutrition-carbs",
    text: "text-nutrition-carbs",
  },
  fat: {
    dot: "bg-nutrition-fat",
    text: "text-nutrition-fat",
  },
  protein: {
    dot: "bg-nutrition-protein",
    text: "text-nutrition-protein",
  },
  dot: "h-2 w-2 rounded-full",
  smallDot: "h-2.5 w-2.5 rounded-full",
  previewTile: "min-w-[92px] rounded-2xl bg-surface-raised px-3 py-3",
  previewValue: "mt-1 text-lg font-semibold",
  ringCenter:
    "absolute items-center justify-center rounded-full bg-surface-card",
} as const;
