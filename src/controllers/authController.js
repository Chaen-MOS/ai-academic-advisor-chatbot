import {
  getUserRole,
} from "../roles/roleService.js";

async function handleGetCurrentUser(
  req,
  res,
) {
  try {
    const role = await getUserRole(
      req.user.id,
    );

    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email ?? null,
        role,
      },
    });
  } catch (error) {
    console.error(
      "Get Current User Error:",
      error,
    );

    return res.status(500).json({
      error:
        "Unable to load current user.",
      code:
        "CURRENT_USER_LOAD_FAILED",
    });
  }
}

export {
  handleGetCurrentUser,
};