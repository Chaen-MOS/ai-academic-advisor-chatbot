import {
  getOrCreateStudentProfile,
  saveStudentProfile,
} from "../profiles/studentProfileService.js";

async function handleGetProfile(req, res) {
  try {
    const userId = req.user.id;

    const profile = await getOrCreateStudentProfile(
      userId,
      {
        fullName:
          req.user.userMetadata?.username ??
          req.user.email?.split("@")[0] ??
          "",
        preferredName:
          req.user.userMetadata?.username ?? "",
        mobileNumber:
          req.user.userMetadata?.mobile_number ?? null,
      }
    );

    return res.json({
      profile,
      notice:
        "This profile is self-declared, unverified, and not connected to the UTAR system.",
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      error: "Failed to load student profile.",
      code: "PROFILE_LOAD_FAILED",
    });
  }
}

async function handleUpdateProfile(req, res) {
  try {
    const userId = req.user.id;

    const profile = await saveStudentProfile(
      userId,
      req.body
    );

    return res.json({
      profile,
      notice:
        "This profile is self-declared, unverified, and not connected to the UTAR system.",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      error: "Failed to update student profile.",
      message: error.message,
      code: "PROFILE_UPDATE_FAILED",
    });
  }
}

export {
  handleGetProfile,
  handleUpdateProfile,
};