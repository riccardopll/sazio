import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { appRouter, createDb, type BaseContext } from "@sazio/shared";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { verifyToken } from "@clerk/backend";
import { log } from "./log";

const app = new Hono<{
  Bindings: {
    DB: D1Database;
    CLERK_SECRET_KEY: string;
  };
  Variables: {
    requestId: string;
  };
}>();

app.use(requestId());

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const data = {
    method: ctx.req.method,
    path: ctx.req.path,
    status: ctx.res.status,
    duration: Date.now() - start,
    requestId: ctx.var.requestId,
  };
  if (ctx.res.status >= 500) log.error("Request", data);
  else if (ctx.res.status >= 400) log.warn("Request", data);
  else log.info("Request", data);
});

app.use("/*", cors());

app.all("/trpc/*", async (ctx) => {
  const authHeader = ctx.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  let userId: string | undefined;
  if (token) {
    try {
      const payload = await verifyToken(token, {
        secretKey: ctx.env.CLERK_SECRET_KEY,
      });
      userId = payload.sub;
    } catch (error) {
      log.error("JWT verification failed", { error: String(error) });
    }
  }
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: ctx.req.raw,
    router: appRouter,
    createContext: () =>
      ({
        db: createDb(ctx.env.DB),
        userId,
      }) satisfies BaseContext,
  });
});

export default app;
