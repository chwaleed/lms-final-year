import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const secretKey = "your_secret_key";

// Generate JWT token
const generateToken = (userId) => {
  const token = jwt.sign({ _id: userId }, secretKey, {
    expiresIn: "7d", // 7 days
  });
  return token;
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, role } = req.body;

  if (!fullName || !email || !username || !password || !role) {
    throw new ApiError(400, "All fields are required");
  }

  if (!["student", "instructor"].includes(role)) {
    throw new ApiError(400, "Role must be either 'student' or 'instructor'");
  }

  console.log(fullName, email, username, password, role);

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  try {
    const newUser = new User({
      fullname: fullName,
      email,
      username,
      role,
    });

    const registeredUser = await User.register(newUser, password);

    const userResponse = {
      _id: registeredUser._id,
      fullName: registeredUser.fullname,
      email: registeredUser.email,
      username: registeredUser.username,
      role: registeredUser.role,
      createdAt: registeredUser.createdAt,
      updatedAt: registeredUser.updatedAt,
    };

    return res
      .status(201)
      .json(new ApiResponse(201, userResponse, "User registered successfully"));
  } catch (error) {
    if (error.name === "UserExistsError") {
      throw new ApiError(409, "User already exists");
    }
    throw new ApiError(
      500,
      error.message || "Something went wrong while registering user"
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const result = await new Promise((resolve, reject) => {
      user.authenticate(password, (err, user, info) => {
        if (err) {
          reject(err);
        } else {
          resolve({ user, info });
        }
      });
    });

    if (!result.user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user._id);
    console.log(username, password);

    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
      .status(200)
      .cookie("token", token, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            user: userResponse,
            token,
          },
          "User logged in successfully"
        )
      );
  } catch (error) {
    if (error.statusCode) {
      throw new ApiError(error.statusCode, error.message);
    }
    throw new ApiError(
      500,
      error.message || "Something went wrong while logging in"
    );
  }
});

// Logout controller
const logoutUser = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("token", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const verifyToken = asyncHandler(async (req, res) => {
  const { username } = req.user;
  if (!username) {
    throw new ApiError(401, "Unauthorized request - No username provided");
  }
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const userResponse = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, "Token verified successfully"));
});

export { registerUser, loginUser, logoutUser, verifyToken };
