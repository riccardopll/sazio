import { useAuth } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRouter } from "@sazio/shared";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { useRef, useState } from "react";
import { env } from "./env";
import { TRPCContextProvider } from "./trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({ enabled: () => __DEV__ }),
        httpBatchLink({
          url: `${env.apiUrl}/trpc`,
          async headers() {
            const token = await getTokenRef.current();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );
  return (
    <TRPCContextProvider queryClient={queryClient} trpcClient={trpcClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCContextProvider>
  );
}
