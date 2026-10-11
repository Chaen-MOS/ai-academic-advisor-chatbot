import { supabase } from "../config/supabaseClient.js";

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    if (!accessToken) {
      return res.status(401).json({
        error: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    const {
      data,
      error,
    } = await supabase.auth.getClaims(accessToken);

    if (error || !data?.claims?.sub) {
      return res.status(401).json({
        error: "Invalid or expired access token.",
        code: "INVALID_TOKEN",
      });
    }

    req.user = {
      id: data.claims.sub,
      email:
        typeof data.claims.email === "string"
          ? data.claims.email
          : null,
      userMetadata:
        typeof data.claims.user_metadata === "object"
          ? data.claims.user_metadata
          : {},
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      error: "Unable to verify authentication.",
      code: "AUTH_VERIFICATION_FAILED",
    });
  }
}

export { requireAuth };