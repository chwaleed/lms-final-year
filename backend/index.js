import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { logUserActivity } from "./midlewares/auth.middlware.js";
import router from "./routes/routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(logUserActivity);

// Routes
app.use("/api", router);

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/lms";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
