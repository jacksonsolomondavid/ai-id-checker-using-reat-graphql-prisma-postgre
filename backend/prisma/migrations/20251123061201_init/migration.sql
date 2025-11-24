-- CreateTable
CREATE TABLE "Verification" (
    "id" SERIAL NOT NULL,
    "verdict" TEXT NOT NULL,
    "parsed_id_data" JSONB,
    "raw_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);
