CREATE TABLE "solidra"."section_cards" (
    "id" TEXT NOT NULL,
    "section_type" "solidra"."section_types" NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT,
    "url" TEXT,
    "image_id" TEXT,
    "status" "solidra"."content_statuses" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_cards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "solidra"."section_card_translations" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "locale" "solidra"."locales" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "alt" TEXT,

    CONSTRAINT "section_card_translations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "section_cards_section_type_status_order_idx" ON "solidra"."section_cards"("section_type", "status", "order");

CREATE UNIQUE INDEX "section_card_translations_card_id_locale_key" ON "solidra"."section_card_translations"("card_id", "locale");

ALTER TABLE "solidra"."section_cards" ADD CONSTRAINT "section_cards_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "solidra"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "solidra"."section_card_translations" ADD CONSTRAINT "section_card_translations_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "solidra"."section_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
