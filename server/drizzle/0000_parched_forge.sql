CREATE TABLE `food_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`user_id` text NOT NULL,
	`food_id` integer NOT NULL,
	`serving_unit_id` integer,
	`quantity` real NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`serving_unit_id`) REFERENCES `serving_units`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "quantity_positive" CHECK("food_logs"."quantity" > 0)
);
--> statement-breakpoint
CREATE INDEX `food_logs_user_date_idx` ON `food_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `foods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`user_id` text,
	`name` text(50) NOT NULL,
	`serving_size` integer NOT NULL,
	`serving_unit` text NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`barcode` text,
	CONSTRAINT "serving_size_positive" CHECK("foods"."serving_size" > 0),
	CONSTRAINT "protein_non_negative" CHECK("foods"."protein" >= 0),
	CONSTRAINT "carbs_non_negative" CHECK("foods"."carbs" >= 0),
	CONSTRAINT "fat_non_negative" CHECK("foods"."fat" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `foods_barcode_unique` ON `foods` (`barcode`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`user_id` text NOT NULL,
	`name` text(100) NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer,
	`protein_goal` integer NOT NULL,
	`carbs_goal` integer NOT NULL,
	`fat_goal` integer NOT NULL,
	CONSTRAINT "protein_goal_non_negative" CHECK("goals"."protein_goal" >= 0),
	CONSTRAINT "carbs_goal_non_negative" CHECK("goals"."carbs_goal" >= 0),
	CONSTRAINT "fat_goal_non_negative" CHECK("goals"."fat_goal" >= 0),
	CONSTRAINT "start_before_end" CHECK("goals"."end_at" IS NULL OR "goals"."start_at" < "goals"."end_at")
);
--> statement-breakpoint
CREATE INDEX `goals_user_id_idx` ON `goals` (`user_id`);--> statement-breakpoint
CREATE INDEX `goals_user_date_idx` ON `goals` (`user_id`,`start_at`,`end_at`);--> statement-breakpoint
CREATE TABLE `serving_units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`food_id` integer NOT NULL,
	`name` text(50) NOT NULL,
	`grams_equivalent` integer NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "grams_equivalent_positive" CHECK("serving_units"."grams_equivalent" > 0)
);
