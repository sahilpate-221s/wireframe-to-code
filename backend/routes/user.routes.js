import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

//import routers for user from auth controller  such as login, register, etc.

import {
  signup,
  login,
  showProfile,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/auth.controller.js";

// Route for user login
router.post("/login", auth, login);

// Route for user signup
router.post("/signup", signup);

// Route to get user profile
router.get("/profile", auth, showProfile);

// Route to logout user
router.post("/logout", auth, logout);

// Route to update user profile
router.put("/profile", auth, updateProfile);

// Route to change user password
router.put("/change-password", auth, changePassword);

// Route to delete user account
router.delete("/delete-account", auth, deleteAccount);
