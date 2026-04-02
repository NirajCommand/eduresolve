-- =============================================
-- EduResolve Forms System - SQL Migration
-- =============================================

-- 1. Forms table
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Form questions table
CREATE TABLE IF NOT EXISTS form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'single', 'multi', 'short', 'long', 'dropdown'
  options JSONB DEFAULT '[]'::jsonb,
  required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

-- 3. Form responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Form answers table
CREATE TABLE IF NOT EXISTS form_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
  question_id UUID REFERENCES form_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL
);

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_answers ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Anyone can view published forms"
  ON forms FOR SELECT
  USING (status = 'published');

CREATE POLICY "Creator can view own drafts"
  ON forms FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Any authenticated user can create forms"
  ON forms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update own forms"
  ON forms FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Creator can delete own forms"
  ON forms FOR DELETE
  USING (created_by = auth.uid());

-- Form questions policies
CREATE POLICY "Anyone can view questions of published forms"
  ON form_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_questions.form_id
      AND forms.status = 'published'
    )
  );

CREATE POLICY "Creator can view questions of own forms"
  ON form_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_questions.form_id
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "Creator can insert questions"
  ON form_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_questions.form_id
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "Creator can update questions"
  ON form_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_questions.form_id
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "Creator can delete questions"
  ON form_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_questions.form_id
      AND forms.created_by = auth.uid()
    )
  );

-- Form responses policies
CREATE POLICY "Anyone can submit responses to published forms"
  ON form_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_responses.form_id
      AND forms.status = 'published'
    )
    AND submitted_by = auth.uid()
  );

CREATE POLICY "Creator can view responses to own forms"
  ON form_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_responses.form_id
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "User can view own responses"
  ON form_responses FOR SELECT
  USING (submitted_by = auth.uid());

CREATE POLICY "Creator can delete responses"
  ON form_responses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_responses.form_id
      AND forms.created_by = auth.uid()
    )
  );

-- Form answers policies
CREATE POLICY "Anyone can submit answers"
  ON form_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM form_responses
      WHERE form_responses.id = form_answers.response_id
      AND form_responses.submitted_by = auth.uid()
    )
  );

CREATE POLICY "Creator can view answers"
  ON form_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM form_responses
      JOIN forms ON forms.id = form_responses.form_id
      WHERE form_responses.id = form_answers.response_id
      AND forms.created_by = auth.uid()
    )
  );

CREATE POLICY "User can view own answers"
  ON form_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM form_responses
      WHERE form_responses.id = form_answers.response_id
      AND form_responses.submitted_by = auth.uid()
    )
  );

-- =============================================
-- Storage Bucket for Form Images (future use)
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('form-images', 'form-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload form images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'form-images');

CREATE POLICY "Anyone can view form images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'form-images');
