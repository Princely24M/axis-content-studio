/*
# Image Generation Metadata

Adds columns to the existing `generations` table to store the enhanced
prompt pipeline data: optimized prompt, structured spec, model used,
generation status, and error messages.

1. Modified Tables
- `generations` — add columns:
  - `optimized_prompt` (text) — the enhanced prompt sent to the image model
  - `generation_spec` (jsonb) — the structured image specification extracted from the user's prompt
  - `model_used` (text) — the image generation model/provider name
  - `generation_status` (text) — 'success' | 'failed' | 'partial'
  - `error_message` (text) — any error message if generation failed

2. Security
- No new tables; existing RLS policies on `generations` cover the new columns
- All new columns are nullable so existing rows are unaffected

3. Notes
- The new columns are optional (nullable) so text and code generations are unaffected
- Only image-type generations will populate these columns
- `generation_status` defaults to NULL; the app sets it per-generation
*/

ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS optimized_prompt text,
  ADD COLUMN IF NOT EXISTS generation_spec jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS model_used text,
  ADD COLUMN IF NOT EXISTS generation_status text CHECK (generation_status IN ('success', 'failed', 'partial')),
  ADD COLUMN IF NOT EXISTS error_message text;
