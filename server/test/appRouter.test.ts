import { applyD1Migrations, env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter, createDb, type BaseContext } from "@sazio/shared";
import { foodLogs, foods } from "@sazio/shared/schema";

type TestDB = BaseContext["db"];

beforeAll(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
});

function createTestDatabase() {
  return createDb(env.DB);
}

function createCaller(db: TestDB, userId = "user_1") {
  return appRouter.createCaller({
    db,
    userId,
  });
}

describe("appRouter food logging", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("createFood stores a user-scoped food", async () => {
    const db = createTestDatabase();
    const caller = createCaller(db);

    const createdFood = await caller.createFood({
      name: "Greek Yogurt",
      servingSize: 170,
      servingUnit: "g",
      protein: 17,
      carbs: 6,
      fat: 0,
    });

    const storedFood = await db
      .select()
      .from(foods)
      .where(eq(foods.id, createdFood.id))
      .then((rows) => rows[0]);

    expect(createdFood.name).toBe("Greek Yogurt");
    expect(createdFood.servingUnits).toEqual([]);
    expect(storedFood?.userId).toBe("user_1");
  });

  it("listFoods returns global plus user foods and filters by search text", async () => {
    const db = createTestDatabase();
    const caller = createCaller(db);

    await db.insert(foods).values([
      {
        userId: null,
        name: "Chicken Breast",
        servingSize: 100,
        servingUnit: "g",
        protein: 31,
        carbs: 0,
        fat: 3.6,
      },
      {
        userId: "user_1",
        name: "Chia Pudding",
        servingSize: 150,
        servingUnit: "g",
        protein: 8,
        carbs: 18,
        fat: 9,
      },
      {
        userId: "user_2",
        name: "Chorizo",
        servingSize: 100,
        servingUnit: "g",
        protein: 24,
        carbs: 2,
        fat: 38,
      },
    ]);

    const result = await caller.listFoods({ query: "ch", limit: 10 });

    expect(result.map((food) => food.name)).toEqual([
      "Chia Pudding",
      "Chicken Breast",
    ]);
  });

  it("createFoodLog rejects invalid quantity and stores a valid log", async () => {
    const db = createTestDatabase();
    const caller = createCaller(db);

    const [food] = await db
      .insert(foods)
      .values({
        userId: "user_1",
        name: "Oats",
        servingSize: 40,
        servingUnit: "g",
        protein: 5,
        carbs: 27,
        fat: 3,
      })
      .returning();

    await expect(
      caller.createFoodLog({
        foodId: food.id,
        quantity: 0,
      }),
    ).rejects.toBeDefined();

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T10:30:00.000Z"));

    const createdLog = await caller.createFoodLog({
      foodId: food.id,
      quantity: 2,
    });

    const storedLog = await db
      .select()
      .from(foodLogs)
      .where(eq(foodLogs.id, createdLog.id))
      .then((rows) => rows[0]);

    expect(storedLog?.userId).toBe("user_1");
    expect(storedLog?.quantity).toBe(2);
    expect(storedLog?.createdAt).toBe(
      new Date("2026-03-10T10:30:00.000Z").getTime(),
    );
  });

  it("getDailyFoodLogs returns derived macros and calories", async () => {
    const db = createTestDatabase();
    const caller = createCaller(db);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T08:00:00.000Z"));

    const [food] = await db
      .insert(foods)
      .values({
        userId: "user_1",
        name: "Protein Pasta",
        servingSize: 100,
        servingUnit: "g",
        protein: 30,
        carbs: 10,
        fat: 5,
      })
      .returning();

    await caller.createFoodLog({
      foodId: food.id,
      quantity: 1.5,
    });

    const logs = await caller.getDailyFoodLogs({
      date: new Date("2026-03-10T12:00:00.000Z"),
      timezone: "UTC",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      foodName: "Protein Pasta",
      quantity: 1.5,
      servingLabel: "100g",
      protein: 45,
      carbs: 15,
      fat: 7.5,
      calories: 307.5,
    });
  });

  it("deleteFoodLog removes only the current user's log", async () => {
    const db = createTestDatabase();
    const caller = createCaller(db);
    const otherCaller = createCaller(db, "user_2");

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T08:00:00.000Z"));

    const [food] = await db
      .insert(foods)
      .values({
        userId: "user_1",
        name: "Cottage Cheese",
        servingSize: 100,
        servingUnit: "g",
        protein: 11,
        carbs: 3,
        fat: 4,
      })
      .returning();

    const createdLog = await caller.createFoodLog({
      foodId: food.id,
      quantity: 1,
    });

    await expect(
      otherCaller.deleteFoodLog({ id: createdLog.id }),
    ).rejects.toBeDefined();

    const deletedLog = await caller.deleteFoodLog({ id: createdLog.id });
    const storedLog = await db
      .select()
      .from(foodLogs)
      .where(eq(foodLogs.id, createdLog.id))
      .then((rows) => rows[0]);

    expect(deletedLog.id).toBe(createdLog.id);
    expect(storedLog).toBeUndefined();
  });

  it("daily and weekly summaries reflect newly created logs", async () => {
    const db = createTestDatabase();
    const caller = createCaller(db);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T07:15:00.000Z"));

    const [food] = await db
      .insert(foods)
      .values({
        userId: "user_1",
        name: "Turkey Rice Bowl",
        servingSize: 100,
        servingUnit: "g",
        protein: 20,
        carbs: 25,
        fat: 4,
      })
      .returning();

    await caller.createFoodLog({
      foodId: food.id,
      quantity: 2,
    });

    const daily = await caller.getDailySummary({
      date: new Date("2026-03-10T12:00:00.000Z"),
      timezone: "UTC",
    });
    const weekly = await caller.getWeeklySummary({
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
      timezone: "UTC",
    });

    expect(daily).toEqual({
      protein: 40,
      carbs: 50,
      fat: 8,
      calories: 432,
    });
    expect(weekly.find((day) => day.date === "2026-03-10")).toEqual({
      date: "2026-03-10",
      protein: 40,
      carbs: 50,
      fat: 8,
      calories: 432,
    });
  });
});
