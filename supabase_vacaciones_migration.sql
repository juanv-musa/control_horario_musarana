-- ============================================================
-- MIGRACIÓN: Vacaciones y Ausencias — MUSARAÑA
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1. Tabla de ausencias
CREATE TABLE IF NOT EXISTS absences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('vacation', 'sick_leave', 'personal', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    working_days INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    requested_by_employee BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de cuotas de vacaciones por empleado
CREATE TABLE IF NOT EXISTS vacation_allowances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    total_days INTEGER NOT NULL DEFAULT 22,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS (Row Level Security)
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_allowances ENABLE ROW LEVEL SECURITY;

-- Employer: acceso total a absences
CREATE POLICY "Employer full access absences"
ON absences FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'auditor'))
);

-- Employee: solo ve/crea sus propias ausencias
CREATE POLICY "Employee read own absences"
ON absences FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Employee insert own absences"
ON absences FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Employer: acceso total a vacation_allowances
CREATE POLICY "Employer full access allowances"
ON vacation_allowances FOR ALL
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'auditor'))
);

-- Employee: puede leer su propia cuota
CREATE POLICY "Employee read own allowance"
ON vacation_allowances FOR SELECT
USING (user_id = auth.uid());

-- 4. Trigger para updated_at en vacation_allowances
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vacation_allowances_updated_at
BEFORE UPDATE ON vacation_allowances
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
