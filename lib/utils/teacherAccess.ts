import { supabase } from "@/lib/supabase";

export async function getTeacherAssignedClassIds(teacherId?: string | null): Promise<string[]> {
    if (!teacherId) return [];

    const { data, error } = await supabase
        .from("teachers_data")
        .select("class_ids")
        .eq("id", teacherId)
        .maybeSingle();

    if (error) throw error;

    const classIds = data?.class_ids ?? [];
    return Array.isArray(classIds) ? classIds.filter(Boolean) : [];
}

export async function canTeacherAccessStudent(teacherId: string | undefined, classId: string | null | undefined): Promise<boolean> {
    if (!teacherId || !classId) return false;
    const classIds = await getTeacherAssignedClassIds(teacherId);
    return classIds.includes(classId);
}
