// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const secretKey = process.env.JWT_SECRET || "your_secret_key";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request - No token provided");
    }

    const decodedToken = jwt.verify(token, secretKey);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid token - User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }
    throw new ApiError(401, error?.message || "Invalid token");
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decodedToken = jwt.verify(token, secretKey);
      const user = await User.findById(decodedToken?._id);

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
});

export const authorizeRoles = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  });
};

export const checkResourceOwnership = (resourceUserIdField = "userId") => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const resourceUserId =
      req.params[resourceUserIdField] ||
      req.body[resourceUserIdField] ||
      req.query[resourceUserIdField];

    if (
      req.user.role === "admin" ||
      req.user._id.toString() === resourceUserId
    ) {
      next();
    } else {
      throw new ApiError(
        403,
        "Access denied. You can only access your own resources."
      );
    }
  });
};

export const requireInstructor = authorizeRoles("instructor");

export const requireStudent = authorizeRoles("student");

// export const requireAdmin = authorizeRoles("admin");

export const logUserActivity = asyncHandler(async (req, res, next) => {
  if (req.user) {
    console.log(`User ${req.user.username} accessed ${req.method} ${req.path}`);
  }
  next();
});

export const requirePasswordConfirmation = asyncHandler(
  async (req, res, next) => {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      throw new ApiError(
        400,
        "Current password is required for this operation"
      );
    }

    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    // Verify current password
    const result = await new Promise((resolve, reject) => {
      req.user.authenticate(currentPassword, (err, user, info) => {
        if (err) {
          reject(err);
        } else {
          resolve({ user, info });
        }
      });
    });

    if (!result.user) {
      throw new ApiError(401, "Current password is incorrect");
    }

    next();
  }
);

// Export all middleware
export default {
  verifyJWT,
  optionalAuth,
  authorizeRoles,
  checkResourceOwnership,
  requireInstructor,
  requireStudent,
  // requireAdmin,
  logUserActivity,
  requirePasswordConfirmation,
};
