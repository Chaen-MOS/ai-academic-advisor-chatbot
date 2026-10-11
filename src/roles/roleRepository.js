import {supabaseAdmin} from "../config/supabaseAdmin.js";

async function findUserRole(userId) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const {data, error} = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load user role: ${error.message}`,
    );
  }

  return data;
}

async function upsertUserRole(
  userId,
  role = "STUDENT",
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const {data, error} = await supabaseAdmin
    .from("user_roles")
    .upsert(
      {
        user_id: userId,
        role,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )
    .select("user_id, role")
    .single();

  if (error) {
    throw new Error(
      `Failed to save user role: ${error.message}`,
    );
  }

  return data;
}

export {
  findUserRole,
  upsertUserRole,
};