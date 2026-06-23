-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "solidra";

-- CreateEnum
CREATE TYPE "solidra"."locales" AS ENUM ('ID', 'EN');

-- CreateEnum
CREATE TYPE "solidra"."user_roles" AS ENUM ('SUPER_ADMIN', 'EDITOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "solidra"."content_statuses" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "solidra"."vacancy_statuses" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "solidra"."contact_statuses" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM');

-- CreateEnum
CREATE TYPE "solidra"."application_statuses" AS ENUM ('NEW', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED');

-- CreateEnum
CREATE TYPE "solidra"."employment_types" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "solidra"."section_types" AS ENUM ('HERO', 'RICH_TEXT', 'METRICS', 'SERVICES', 'PROJECTS', 'TIMELINE', 'VALUES', 'LEADERSHIP', 'CERTIFICATIONS', 'FINANCIALS', 'DOCUMENTS', 'GOVERNANCE', 'OFFICES', 'CONTACT_FORM', 'BENEFITS', 'PROCESS', 'VACANCIES', 'CTA');

-- CreateEnum
CREATE TYPE "solidra"."media_visibilities" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "solidra"."navigation_locations" AS ENUM ('HEADER', 'FOOTER');

-- CreateTable
CREATE TABLE "solidra"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "solidra"."user_roles" NOT NULL DEFAULT 'EDITOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."pages" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "solidra"."content_statuses" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "publisher_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_revision_id" TEXT,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."page_revisions" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "immutable" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT NOT NULL,
    "publisher_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."page_revision_translations" (
    "id" TEXT NOT NULL,
    "revision_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,

    CONSTRAINT "page_revision_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."page_section_revisions" (
    "id" TEXT NOT NULL,
    "revision_id" TEXT NOT NULL,
    "type" "solidra"."section_types" NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "media_id" TEXT,

    CONSTRAINT "page_section_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."page_section_revision_translations" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "heading" TEXT,
    "body" TEXT,
    "cta_label" TEXT,
    "cta_url" TEXT,

    CONSTRAINT "page_section_revision_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."page_translations" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,

    CONSTRAINT "page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."page_sections" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "type" "solidra"."section_types" NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "media_id" TEXT,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."page_section_translations" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "heading" TEXT,
    "body" TEXT,
    "cta_label" TEXT,
    "cta_url" TEXT,

    CONSTRAINT "page_section_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."media_assets" (
    "id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt_id" TEXT,
    "alt_en" TEXT,
    "visibility" "solidra"."media_visibilities" NOT NULL DEFAULT 'PUBLIC',
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."navigation_items" (
    "id" TEXT NOT NULL,
    "location" "solidra"."navigation_locations" NOT NULL,
    "order" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "external" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" TEXT,

    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."navigation_item_translations" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "navigation_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."footer_groups" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "footer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."footer_group_translations" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "footer_group_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."footer_links" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "external" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "footer_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."footer_link_translations" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "footer_link_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "media_id" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."project_translations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "project_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."offices" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "hours" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."office_translations" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "name" TEXT NOT NULL,
    "address_label" TEXT,

    CONSTRAINT "office_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."investor_documents" (
    "id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT 'application/pdf',
    "size" INTEGER NOT NULL,
    "published_at" TIMESTAMP(3),
    "status" "solidra"."content_statuses" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "investor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."investor_document_translations" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "investor_document_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."vacancies" (
    "id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employment_type" "solidra"."employment_types" NOT NULL,
    "closing_date" TIMESTAMP(3) NOT NULL,
    "status" "solidra"."vacancy_statuses" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."vacancy_translations" (
    "id" TEXT NOT NULL,
    "vacancy_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "responsibilities" JSONB NOT NULL,
    "requirements" JSONB NOT NULL,

    CONSTRAINT "vacancy_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "status" "solidra"."contact_statuses" NOT NULL DEFAULT 'NEW',
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."career_applications" (
    "id" TEXT NOT NULL,
    "vacancy_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cover_letter" TEXT NOT NULL,
    "cv_storage_path" TEXT NOT NULL,
    "status" "solidra"."application_statuses" NOT NULL DEFAULT 'NEW',
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."submission_notes" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "contact_message_id" TEXT,
    "career_application_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solidra"."audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "solidra"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "solidra"."sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "solidra"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "solidra"."accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_id_account_id_key" ON "solidra"."accounts"("provider_id", "account_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "solidra"."verifications"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "pages_key_key" ON "solidra"."pages"("key");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "solidra"."pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_published_revision_id_key" ON "solidra"."pages"("published_revision_id");

-- CreateIndex
CREATE INDEX "page_revisions_page_id_immutable_idx" ON "solidra"."page_revisions"("page_id", "immutable");

-- CreateIndex
CREATE UNIQUE INDEX "page_revisions_page_id_version_key" ON "solidra"."page_revisions"("page_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "page_revision_translations_revision_id_locale_key" ON "solidra"."page_revision_translations"("revision_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "page_section_revisions_revision_id_order_key" ON "solidra"."page_section_revisions"("revision_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "page_section_revision_translations_section_id_locale_key" ON "solidra"."page_section_revision_translations"("section_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "page_translations_page_id_locale_key" ON "solidra"."page_translations"("page_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "page_sections_page_id_order_key" ON "solidra"."page_sections"("page_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "page_section_translations_section_id_locale_key" ON "solidra"."page_section_translations"("section_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storage_path_key" ON "solidra"."media_assets"("storage_path");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_items_location_order_parent_id_key" ON "solidra"."navigation_items"("location", "order", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "navigation_item_translations_item_id_locale_key" ON "solidra"."navigation_item_translations"("item_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "solidra"."site_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "footer_groups_order_key" ON "solidra"."footer_groups"("order");

-- CreateIndex
CREATE UNIQUE INDEX "footer_group_translations_group_id_locale_key" ON "solidra"."footer_group_translations"("group_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "footer_links_group_id_order_key" ON "solidra"."footer_links"("group_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "footer_link_translations_link_id_locale_key" ON "solidra"."footer_link_translations"("link_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "solidra"."projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_translations_project_id_locale_key" ON "solidra"."project_translations"("project_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "offices_key_key" ON "solidra"."offices"("key");

-- CreateIndex
CREATE UNIQUE INDEX "office_translations_office_id_locale_key" ON "solidra"."office_translations"("office_id", "locale");

-- CreateIndex
CREATE INDEX "investor_documents_status_year_idx" ON "solidra"."investor_documents"("status", "year");

-- CreateIndex
CREATE UNIQUE INDEX "investor_document_translations_document_id_locale_key" ON "solidra"."investor_document_translations"("document_id", "locale");

-- CreateIndex
CREATE INDEX "vacancies_status_closing_date_idx" ON "solidra"."vacancies"("status", "closing_date");

-- CreateIndex
CREATE UNIQUE INDEX "vacancy_translations_vacancy_id_locale_key" ON "solidra"."vacancy_translations"("vacancy_id", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "vacancy_translations_locale_slug_key" ON "solidra"."vacancy_translations"("locale", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_idempotency_key_key" ON "solidra"."contact_messages"("idempotency_key");

-- CreateIndex
CREATE INDEX "contact_messages_status_created_at_idx" ON "solidra"."contact_messages"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "career_applications_cv_storage_path_key" ON "solidra"."career_applications"("cv_storage_path");

-- CreateIndex
CREATE UNIQUE INDEX "career_applications_idempotency_key_key" ON "solidra"."career_applications"("idempotency_key");

-- CreateIndex
CREATE INDEX "career_applications_vacancy_id_status_idx" ON "solidra"."career_applications"("vacancy_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "solidra"."audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "solidra"."audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "solidra"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "solidra"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "solidra"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."pages" ADD CONSTRAINT "pages_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "solidra"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."pages" ADD CONSTRAINT "pages_published_revision_id_fkey" FOREIGN KEY ("published_revision_id") REFERENCES "solidra"."page_revisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_revisions" ADD CONSTRAINT "page_revisions_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "solidra"."pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_revisions" ADD CONSTRAINT "page_revisions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "solidra"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_revisions" ADD CONSTRAINT "page_revisions_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "solidra"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_revision_translations" ADD CONSTRAINT "page_revision_translations_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "solidra"."page_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_section_revisions" ADD CONSTRAINT "page_section_revisions_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "solidra"."page_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_section_revisions" ADD CONSTRAINT "page_section_revisions_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "solidra"."media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_section_revision_translations" ADD CONSTRAINT "page_section_revision_translations_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "solidra"."page_section_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_translations" ADD CONSTRAINT "page_translations_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "solidra"."pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_sections" ADD CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "solidra"."pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_sections" ADD CONSTRAINT "page_sections_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "solidra"."media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."page_section_translations" ADD CONSTRAINT "page_section_translations_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "solidra"."page_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."media_assets" ADD CONSTRAINT "media_assets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "solidra"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "solidra"."navigation_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."navigation_item_translations" ADD CONSTRAINT "navigation_item_translations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "solidra"."navigation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."footer_group_translations" ADD CONSTRAINT "footer_group_translations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "solidra"."footer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."footer_links" ADD CONSTRAINT "footer_links_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "solidra"."footer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."footer_link_translations" ADD CONSTRAINT "footer_link_translations_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "solidra"."footer_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."projects" ADD CONSTRAINT "projects_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "solidra"."media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."project_translations" ADD CONSTRAINT "project_translations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "solidra"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."office_translations" ADD CONSTRAINT "office_translations_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "solidra"."offices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."investor_document_translations" ADD CONSTRAINT "investor_document_translations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "solidra"."investor_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."vacancy_translations" ADD CONSTRAINT "vacancy_translations_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "solidra"."vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."career_applications" ADD CONSTRAINT "career_applications_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "solidra"."vacancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."submission_notes" ADD CONSTRAINT "submission_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "solidra"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."submission_notes" ADD CONSTRAINT "submission_notes_contact_message_id_fkey" FOREIGN KEY ("contact_message_id") REFERENCES "solidra"."contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."submission_notes" ADD CONSTRAINT "submission_notes_career_application_id_fkey" FOREIGN KEY ("career_application_id") REFERENCES "solidra"."career_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solidra"."audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "solidra"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


