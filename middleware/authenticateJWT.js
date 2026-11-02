
import jwt from "jsonwebtoken";
import { findById } from "../models/userModel.js";

// Verify JWT for protected API endpoints.
export function authenticateJWT(req, res, next) {
  const authorization = req.get("Authorization") || "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);

  if (!match) {
    return res.status(401).json({
      error: "A valid Bearer token is required."
    });
  }

  try {
    const payload = jwt.verify(
      match[1],
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (
      typeof payload !== "object" ||
      !Number.isSafeInteger(payload.userId)
    ) {
      return res.status(401).json({
        error: "Invalid authentication token."
      });
    }

    const user = findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        error: "Invalid authentication token."
      });
    }

    req.apiUser = user;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired authentication token."
    });
  }
}
