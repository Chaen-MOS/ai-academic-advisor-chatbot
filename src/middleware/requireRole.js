import {
  getUserRole,
  hasAnyRole,
} from "../roles/roleService.js";

function requireRole(...allowedRoles) {
  return async function roleMiddleware(
    req,
    res,
    next,
  ) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          error:
            "Authentication required.",
          code: "AUTH_REQUIRED",
        });
      }

      const userRole =
        await getUserRole(
          req.user.id,
        );

      req.user.role = userRole;

      if (
        !hasAnyRole(
          userRole,
          allowedRoles,
        )
      ) {
        return res.status(403).json({
          error:
            "You do not have permission to access this resource.",
          code: "FORBIDDEN",
        });
      }

      next();
    } catch (error) {
      console.error(
        "Role authorization error:",
        error,
      );

      return res.status(500).json({
        error:
          "Unable to verify user role.",
        code:
          "ROLE_VERIFICATION_FAILED",
      });
    }
  };
}

export {requireRole};