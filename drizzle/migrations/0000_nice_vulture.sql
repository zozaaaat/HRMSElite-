CREATE TABLE `companies` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`name` text NOT NULL,
	`commercial_file_number` text,
	`commercial_file_name` text,
	`commercial_file_status` integer DEFAULT true NOT NULL,
	`establishment_date` text,
	`commercial_registration_number` text,
	`classification` text,
	`department` text,
	`file_type` text,
	`legal_entity` text,
	`ownership_category` text,
	`logo_url` text,
	`address` text,
	`phone` text,
	`email` text,
	`website` text,
	`total_employees` integer DEFAULT 0 NOT NULL,
	`total_licenses` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`industry_type` text,
	`business_activity` text,
	`location` text,
	`tax_number` text,
	`chambers` text,
	`partnerships` text DEFAULT '[]' NOT NULL,
	`import_export_license` text,
	`special_permits` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_companies_name` ON `companies` (`name`);--> statement-breakpoint
CREATE INDEX `IDX_companies_commercial_file_number` ON `companies` (`commercial_file_number`);--> statement-breakpoint
CREATE INDEX `IDX_companies_is_active` ON `companies` (`is_active`);--> statement-breakpoint
CREATE INDEX `IDX_companies_industry_type` ON `companies` (`industry_type`);--> statement-breakpoint
CREATE INDEX `IDX_companies_location` ON `companies` (`location`);--> statement-breakpoint
CREATE INDEX `IDX_companies_created_at` ON `companies` (`created_at`);--> statement-breakpoint
CREATE TABLE `company_users` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`company_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'worker' NOT NULL,
	`permissions` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `IDX_company_users_company_id` ON `company_users` (`company_id`);--> statement-breakpoint
CREATE INDEX `IDX_company_users_user_id` ON `company_users` (`user_id`);--> statement-breakpoint
CREATE INDEX `IDX_company_users_role` ON `company_users` (`role`);--> statement-breakpoint
CREATE INDEX `IDX_company_users_company_user` ON `company_users` (`company_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`entity_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`file_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer,
	`mime_type` text,
	`description` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`uploaded_by` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `IDX_documents_entity_id` ON `documents` (`entity_id`);--> statement-breakpoint
CREATE INDEX `IDX_documents_entity_type` ON `documents` (`entity_type`);--> statement-breakpoint
CREATE INDEX `IDX_documents_type` ON `documents` (`type`);--> statement-breakpoint
CREATE INDEX `IDX_documents_uploaded_by` ON `documents` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `IDX_documents_is_active` ON `documents` (`is_active`);--> statement-breakpoint
CREATE INDEX `IDX_documents_created_at` ON `documents` (`created_at`);--> statement-breakpoint
CREATE INDEX `IDX_documents_entity_entity_type` ON `documents` (`entity_id`,`entity_type`);--> statement-breakpoint
CREATE INDEX `IDX_documents_file_size` ON `documents` (`file_size`);--> statement-breakpoint
CREATE TABLE `employee_deductions` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`employee_id` text NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`reason` text NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`processed_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_employee_id` ON `employee_deductions` (`employee_id`);--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_type` ON `employee_deductions` (`type`);--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_status` ON `employee_deductions` (`status`);--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_date` ON `employee_deductions` (`date`);--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_processed_by` ON `employee_deductions` (`processed_by`);--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_created_at` ON `employee_deductions` (`created_at`);--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_employee_type` ON `employee_deductions` (`employee_id`,`type`);--> statement-breakpoint
CREATE INDEX `IDX_employee_deductions_amount` ON `employee_deductions` (`amount`);--> statement-breakpoint
CREATE TABLE `employee_leaves` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`employee_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`days` integer NOT NULL,
	`reason` text,
	`approved_by` text,
	`approved_at` integer,
	`rejection_reason` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_employee_id` ON `employee_leaves` (`employee_id`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_type` ON `employee_leaves` (`type`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_status` ON `employee_leaves` (`status`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_start_date` ON `employee_leaves` (`start_date`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_end_date` ON `employee_leaves` (`end_date`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_approved_by` ON `employee_leaves` (`approved_by`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_created_at` ON `employee_leaves` (`created_at`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_employee_status` ON `employee_leaves` (`employee_id`,`status`);--> statement-breakpoint
CREATE INDEX `IDX_employee_leaves_date_range` ON `employee_leaves` (`start_date`,`end_date`);--> statement-breakpoint
CREATE TABLE `employee_violations` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`employee_id` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`date` text NOT NULL,
	`reported_by` text NOT NULL,
	`severity` text DEFAULT 'medium' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `IDX_employee_violations_employee_id` ON `employee_violations` (`employee_id`);--> statement-breakpoint
CREATE INDEX `IDX_employee_violations_type` ON `employee_violations` (`type`);--> statement-breakpoint
CREATE INDEX `IDX_employee_violations_severity` ON `employee_violations` (`severity`);--> statement-breakpoint
CREATE INDEX `IDX_employee_violations_date` ON `employee_violations` (`date`);--> statement-breakpoint
CREATE INDEX `IDX_employee_violations_reported_by` ON `employee_violations` (`reported_by`);--> statement-breakpoint
CREATE INDEX `IDX_employee_violations_created_at` ON `employee_violations` (`created_at`);--> statement-breakpoint
CREATE INDEX `IDX_employee_violations_employee_type` ON `employee_violations` (`employee_id`,`type`);--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`company_id` text NOT NULL,
	`license_id` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`arabic_name` text,
	`english_name` text,
	`passport_number` text,
	`civil_id` text,
	`nationality` text,
	`date_of_birth` text,
	`gender` text,
	`marital_status` text,
	`employee_type` text DEFAULT 'citizen' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`position` text,
	`department` text,
	`hire_date` text,
	`salary` real,
	`phone` text,
	`email` text,
	`address` text,
	`emergency_contact` text,
	`emergency_phone` text,
	`photo_url` text,
	`documents` text DEFAULT '[]' NOT NULL,
	`skills` text DEFAULT '[]' NOT NULL,
	`notes` text,
	`full_name` text,
	`job_title` text,
	`residence_number` text,
	`residence_expiry` text,
	`medical_insurance` text,
	`bank_account` text,
	`work_permit_start` text,
	`work_permit_end` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`archive_reason` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`license_id`) REFERENCES `licenses`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `IDX_employees_company_id` ON `employees` (`company_id`);--> statement-breakpoint
CREATE INDEX `IDX_employees_license_id` ON `employees` (`license_id`);--> statement-breakpoint
CREATE INDEX `IDX_employees_status` ON `employees` (`status`);--> statement-breakpoint
CREATE INDEX `IDX_employees_employee_type` ON `employees` (`employee_type`);--> statement-breakpoint
CREATE INDEX `IDX_employees_department` ON `employees` (`department`);--> statement-breakpoint
CREATE INDEX `IDX_employees_position` ON `employees` (`position`);--> statement-breakpoint
CREATE INDEX `IDX_employees_civil_id` ON `employees` (`civil_id`);--> statement-breakpoint
CREATE INDEX `IDX_employees_passport_number` ON `employees` (`passport_number`);--> statement-breakpoint
CREATE INDEX `IDX_employees_is_archived` ON `employees` (`is_archived`);--> statement-breakpoint
CREATE INDEX `IDX_employees_hire_date` ON `employees` (`hire_date`);--> statement-breakpoint
CREATE INDEX `IDX_employees_created_at` ON `employees` (`created_at`);--> statement-breakpoint
CREATE INDEX `IDX_employees_company_status` ON `employees` (`company_id`,`status`);--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`company_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`number` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`issue_date` text,
	`expiry_date` text,
	`issuing_authority` text,
	`location` text,
	`description` text,
	`documents` text DEFAULT '[]' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `IDX_licenses_company_id` ON `licenses` (`company_id`);--> statement-breakpoint
CREATE INDEX `IDX_licenses_type` ON `licenses` (`type`);--> statement-breakpoint
CREATE INDEX `IDX_licenses_status` ON `licenses` (`status`);--> statement-breakpoint
CREATE INDEX `IDX_licenses_number` ON `licenses` (`number`);--> statement-breakpoint
CREATE INDEX `IDX_licenses_expiry_date` ON `licenses` (`expiry_date`);--> statement-breakpoint
CREATE INDEX `IDX_licenses_is_active` ON `licenses` (`is_active`);--> statement-breakpoint
CREATE INDEX `IDX_licenses_company_status` ON `licenses` (`company_id`,`status`);--> statement-breakpoint
CREATE INDEX `IDX_licenses_expiry_active` ON `licenses` (`expiry_date`,`is_active`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`user_id` text NOT NULL,
	`company_id` text,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `IDX_notifications_user_id` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `IDX_notifications_company_id` ON `notifications` (`company_id`);--> statement-breakpoint
CREATE INDEX `IDX_notifications_type` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `IDX_notifications_is_read` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `IDX_notifications_created_at` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `IDX_notifications_user_read` ON `notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `IDX_notifications_company_type` ON `notifications` (`company_id`,`type`);--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`family_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	`replaced_by` text,
	`user_agent` text,
	`ip` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `IDX_refresh_tokens_user_id` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `IDX_refresh_tokens_family_id` ON `refresh_tokens` (`family_id`);--> statement-breakpoint
CREATE INDEX `IDX_refresh_tokens_token_hash` ON `refresh_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`sess` text NOT NULL,
	`expire` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);--> statement-breakpoint
CREATE INDEX `IDX_session_sid_expire` ON `sessions` (`sid`,`expire`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (hex(randomblob(16))) NOT NULL,
	`email` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`password` text NOT NULL,
	`profile_image_url` text,
	`role` text DEFAULT 'worker' NOT NULL,
	`company_id` text,
	`permissions` text DEFAULT '[]' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`email_verification_token` text,
	`email_verification_expires` integer,
	`password_reset_token` text,
	`password_reset_expires` integer,
	`last_password_change` integer,
	`last_login_at` integer,
	`sub` text,
	`claims` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `IDX_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `IDX_users_company_id` ON `users` (`company_id`);--> statement-breakpoint
CREATE INDEX `IDX_users_role` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `IDX_users_is_active` ON `users` (`is_active`);--> statement-breakpoint
CREATE INDEX `IDX_users_created_at` ON `users` (`created_at`);