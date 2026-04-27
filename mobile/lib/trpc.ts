import type { AppRouter } from "@sazio/shared";
import { createTRPCContext } from "@trpc/tanstack-react-query";

export const {
  TRPCProvider: TRPCContextProvider,
  useTRPC,
  useTRPCClient,
} = createTRPCContext<AppRouter>();
