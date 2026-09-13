CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(50) NOT NULL,
	"details" json,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "link_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"clicked_at" timestamp DEFAULT now() NOT NULL,
	"referrer" text,
	"country" varchar(100),
	"city" varchar(100),
	"device_type" varchar(50),
	"browser" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "short_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"original_url" text NOT NULL,
	"original_url_hash" varchar(64) NOT NULL,
	"short_code" varchar(10) NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "short_links_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"links_per_month" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_monthly_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" varchar(7) NOT NULL,
	"links_created" integer DEFAULT 0 NOT NULL,
	"api_requests" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"subscription_plan" varchar(50) DEFAULT 'FREE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_activity" timestamp DEFAULT now(),
	"is_admin" boolean DEFAULT false,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "audit_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_timestamp_idx" ON "audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "link_id_idx" ON "link_analytics" USING btree ("link_id");--> statement-breakpoint
CREATE INDEX "clicked_at_idx" ON "link_analytics" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "short_links" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "short_code_idx" ON "short_links" USING btree ("short_code");--> statement-breakpoint
CREATE UNIQUE INDEX "user_url_hash_idx" ON "short_links" USING btree ("user_id","original_url_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "user_month_idx" ON "user_monthly_usage" USING btree ("user_id","month");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");