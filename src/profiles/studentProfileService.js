import {
  createStudentProfile,
  findStudentProfileByUserId,
  updateStudentProfile,
} from "./studentProfileRepository.js";

async function getStudentProfile(userId) {
  return findStudentProfileByUserId(userId);
}

async function getOrCreateStudentProfile(
  userId,
  initialData = {}
) {
  const existingProfile =
    await findStudentProfileByUserId(userId);

  if (existingProfile) {
    return existingProfile;
  }

  return createStudentProfile(userId, initialData);
}

async function saveStudentProfile(userId, profileData) {
  const existingProfile =
    await findStudentProfileByUserId(userId);

  if (!existingProfile) {
    return createStudentProfile(userId, profileData);
  }

  return updateStudentProfile(userId, profileData);
}

async function updateAcademicData(
  userId,
  updates,
) {
  return updateStudentProfile(
    userId,
    {
      ...updates,

      academicDataUpdatedAt:
        new Date().toISOString(),
    },
  );
}

export {
  getStudentProfile,
  getOrCreateStudentProfile,
  saveStudentProfile,
  updateAcademicData
};