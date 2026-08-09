import {
  findUserRole,
  upsertUserRole,
} from "./roleRepository.js";

const VALID_ROLES = [
  "STUDENT",
  "LECTURER",
  "ADMIN",
];

function normalizeRole(role) {
  if (typeof role !== "string") {
    return null;
  }

  const normalizedRole =
    role.trim().toUpperCase();

  return VALID_ROLES.includes(normalizedRole)
    ? normalizedRole
    : null;
}

async function getUserRole(userId) {
  const storedRole =
    await findUserRole(userId);

  if (storedRole?.role) {
    return storedRole.role;
  }

  const createdRole =
    await upsertUserRole(
      userId,
      "STUDENT",
    );

  return createdRole.role;
}

async function setUserRole(
  userId,
  role,
) {
  const normalizedRole =
    normalizeRole(role);

  if (!normalizedRole) {
    const error = new Error(
      "Invalid user role.",
    );

    error.code =
      "INVALID_USER_ROLE";

    throw error;
  }

  return upsertUserRole(
    userId,
    normalizedRole,
  );
}

function hasAnyRole(
  userRole,
  allowedRoles,
) {
  return allowedRoles.includes(
    userRole,
  );
}

export {
  VALID_ROLES,
  getUserRole,
  hasAnyRole,
  normalizeRole,
  setUserRole,
};