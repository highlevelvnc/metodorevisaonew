-- ============================================================
-- Migration 004: Correction Workflow Upgrade
-- ============================================================
-- Adds structured support for:
--   1. Essay upload pipeline (upload_type, OCR, processing)
--   2. Annotation objects (already supported as JSONB)
--   3. Zero essay audit trail (is_zeroed, zero_reason, zero_note)
-- ============================================================

-- ── 1. Essay upload pipeline columns ──────────────────────
-- upload_type: how the essay was submitted (text | image | pdf)
-- original_file_url: Storage URL for image/PDF uploads
-- ocr_text: text extracted from image/PDF via OCR (null if not attempted)
-- ocr_confidence: OCR provider confidence score 0.0–1.0 (null if not available)
-- processing_status: lifecycle of content processing

ALTER TABLE essays
  ADD COLUMN IF NOT EXISTS upload_type        TEXT    DEFAULT 'text'
                                              CHECK  (upload_type IN ('text','image','pdf')),
  ADD COLUMN IF NOT EXISTS original_file_url  TEXT,
  ADD COLUMN IF NOT EXISTS ocr_text           TEXT,
  ADD COLUMN IF NOT EXISTS ocr_confidence     REAL    CHECK (ocr_confidence IS NULL OR (ocr_confidence >= 0 AND ocr_confidence <= 1)),
  ADD COLUMN IF NOT EXISTS processing_status  TEXT    DEFAULT 'done'
                                              CHECK  (processing_status IN ('pending','processing','done','failed'));

-- ── 2. Zero essay audit trail ──────────────────────────────
-- When a professor zeros a redação, the reason and note are stored
-- in the correction row for full auditability.
-- is_zeroed: true only if deliberately zeroed (not just scored 0)
-- zero_reason: one of the structured reason codes (see app code)
-- zero_note: optional free-text note from the professor

ALTER TABLE corrections
  ADD COLUMN IF NOT EXISTS is_zeroed    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS zero_reason  TEXT,
  ADD COLUMN IF NOT EXISTS zero_note    TEXT;

-- The annotations column (JSONB) already exists in the base schema.
-- No change needed — annotation objects are stored there.

-- ── 3. Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_essays_upload_type
  ON essays (upload_type)
  WHERE upload_type IN ('image','pdf');

CREATE INDEX IF NOT EXISTS idx_essays_processing_status
  ON essays (processing_status)
  WHERE processing_status IN ('pending','processing','failed');

CREATE INDEX IF NOT EXISTS idx_corrections_is_zeroed
  ON corrections (is_zeroed)
  WHERE is_zeroed = TRUE;

-- ── 4. Back-fill upload_type from existing content ────────
-- Essays uploaded before this migration have content_text starting with '[IMAGEM] '
-- for image uploads. Detect and back-fill upload_type to 'image'.
UPDATE essays
SET upload_type = 'image'
WHERE content_text LIKE '[IMAGEM] %'
  AND upload_type = 'text';

-- ── 5. Documentation comment ──────────────────────────────
COMMENT ON COLUMN essays.upload_type IS
  'How the essay content was submitted: text (typed), image (JPG/PNG/WebP), or pdf.';
COMMENT ON COLUMN essays.original_file_url IS
  'Supabase Storage URL of the original uploaded file (image or PDF).';
COMMENT ON COLUMN essays.ocr_text IS
  'Text extracted by OCR from an image or PDF essay. NULL if OCR was not run.';
COMMENT ON COLUMN essays.ocr_confidence IS
  'OCR provider confidence score (0.0–1.0). NULL if not provided.';
COMMENT ON COLUMN essays.processing_status IS
  'Lifecycle state of OCR/text-extraction processing: pending → processing → done | failed.';
COMMENT ON COLUMN corrections.is_zeroed IS
  'TRUE when the correction was deliberately zeroed by a professor. Distinct from naturally scoring all 0s.';
COMMENT ON COLUMN corrections.zero_reason IS
  'Structured reason code for zeroing. One of: fuga_total_tema, texto_insuficiente, copia_motivadores, improperio, redacao_em_branco, parte_desconectada.';
COMMENT ON COLUMN corrections.zero_note IS
  'Optional free-text note from the professor explaining the zeroing decision.';
