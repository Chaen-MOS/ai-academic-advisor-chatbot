import { getStudentProfile } from "../profiles/studentProfileService.js";

function handleGetProfile(req, res) {
  const { studentId } = req.params;

  const profile = getStudentProfile(studentId);

  if (!profile) {
    return res.status(404).json({
      error: "Student profile not found",
    });
  }

  res.json(profile);
}

export { handleGetProfile };