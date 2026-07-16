-- Teacher class-based access control migration
-- Adds helper functions and RLS policies so teachers can only access students/report cards
-- for classes assigned to them through teachers_data.class_ids.

CREATE OR REPLACE FUNCTION public.get_teacher_assigned_class_ids(p_teacher_id UUID)
RETURNS UUID[] AS $$
    SELECT class_ids
    FROM public.teachers_data
    WHERE id = p_teacher_id
      AND is_deleted = FALSE;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.teacher_can_access_student(p_teacher_id UUID, p_student_class_id UUID)
RETURNS BOOLEAN AS $$
    SELECT COALESCE(
        p_student_class_id = ANY(public.get_teacher_assigned_class_ids(p_teacher_id)),
        FALSE
    );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.teacher_can_access_report_card(p_teacher_id UUID, p_report_card_class_id UUID)
RETURNS BOOLEAN AS $$
    SELECT COALESCE(
        p_report_card_class_id = ANY(public.get_teacher_assigned_class_ids(p_teacher_id)),
        FALSE
    );
$$ LANGUAGE sql STABLE;

ALTER TABLE students_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_card_subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teacher manage school students_data" ON students_data;
CREATE POLICY "Teacher manage assigned class students_data" ON students_data FOR ALL TO authenticated
USING (
    school_id = public.get_my_school_id()
    AND public.get_my_role() = 'Teacher'
    AND public.teacher_can_access_student(auth.uid(), class_id)
);

DROP POLICY IF EXISTS "Teacher manage school report_cards" ON report_cards;
CREATE POLICY "Teacher manage assigned class report_cards" ON report_cards FOR ALL TO authenticated
USING (
    school_id = public.get_my_school_id()
    AND public.get_my_role() = 'Teacher'
    AND public.teacher_can_access_report_card(auth.uid(), class_id)
);

DROP POLICY IF EXISTS "Users manage report_card_subjects" ON report_card_subjects;
CREATE POLICY "Teacher manage assigned class report_card_subjects" ON report_card_subjects FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM report_cards rc
        WHERE rc.id = report_card_subjects.report_card_id
          AND rc.school_id = public.get_my_school_id()
          AND public.get_my_role() = 'Teacher'
          AND public.teacher_can_access_report_card(auth.uid(), rc.class_id)
    )
);
