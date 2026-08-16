import { supabaseAdmin } from "../config/supabaseAdmin.js";
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
}

async function findStudentProfileByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load student profile: ${error.message}`
    );
  }

  return data;
}

async function createStudentProfile(userId, profileData = {}) {
  const payload = {
    user_id: userId,
    full_name: profileData.fullName ?? "",
    preferred_name: profileData.preferredName ?? "",
    student_id: profileData.studentId ?? "",
    programme: profileData.programme ?? "",
    faculty: profileData.faculty ?? "",
    current_year: profileData.currentYear ?? null,
    current_trimester: profileData.currentTrimester ?? null,
    academic_standing:
      profileData.academicStanding ?? "NORMAL",
    cgpa: profileData.cgpa ?? null,
    credits_earned: profileData.creditsEarned ?? null,
    total_credits_required:
      profileData.totalCreditsRequired ?? null,
    mobile_number: profileData.mobileNumber ?? null,
    avatar_url: profileData.avatarUrl ?? null,
    profile_source: "SELF_DECLARED",
    is_verified: false,
    chat_memory_enabled: profileData.chatMemoryEnabled ?? true,
    enable_class_reminders: profileData.enableClassReminders ?? true,
    enable_event_reminders: profileData.enableEventReminders ?? true,
  };

  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create student profile: ${error.message}`
    );
  }

  return data;
}

async function updateStudentProfile(userId, profileData) {
  const payload = {
    user_id: userId,
    full_name: profileData.fullName,
    preferred_name: profileData.preferredName,
    student_id: profileData.studentId,
    programme: profileData.programme,
    faculty: profileData.faculty,
    current_year: profileData.currentYear,
    current_trimester: profileData.currentTrimester,
    academic_standing: profileData.academicStanding,
    cgpa: profileData.cgpa,
    credits_earned: profileData.creditsEarned,
    total_credits_required:
      profileData.totalCreditsRequired,
    mobile_number: profileData.mobileNumber,
    avatar_url: profileData.avatarUrl,
    profile_source: "SELF_DECLARED",
    is_verified: false,
    chat_memory_enabled: profileData.chatMemoryEnabled,
    enable_class_reminders: profileData.enableClassReminders,
    enable_event_reminders: profileData.enableEventReminders,
    academic_data_updated_at: profileData.academicDataUpdatedAt,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to save student profile: ${error.message}`
    );
  }

  return data;
}

export {
  findStudentProfileByUserId,
  createStudentProfile,
  updateStudentProfile,
};