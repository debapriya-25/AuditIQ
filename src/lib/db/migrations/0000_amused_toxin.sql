CREATE TABLE IF NOT EXISTS "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_data" jsonb NOT NULL,
	"use_case" text NOT NULL,
	"total_savings_monthly" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"public_slug" text NOT NULL,
	CONSTRAINT "audits_public_slug_unique" UNIQUE("public_slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"company_name" text,
	"role" text,
	"team_size" integer,
	"audit_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"savings_per_month" numeric NOT NULL,
	"high_value" boolean DEFAULT false NOT NULL,
	"notify_only" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompt_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"response" text,
	"model_used" text NOT NULL,
	"duration_ms" integer,
	"was_error" boolean DEFAULT false NOT NULL,
	"error_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prompt_logs" ADD CONSTRAINT "prompt_logs_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "public_slug_idx" ON "audits" ("public_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audits_created_at_idx" ON "audits" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_audit_id_idx" ON "leads" ("audit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "leads" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "audit_email_unique_idx" ON "leads" ("audit_id","email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prompt_logs_audit_id_idx" ON "prompt_logs" ("audit_id");