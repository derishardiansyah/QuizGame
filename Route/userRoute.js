import express from "express";
import userController from "../Controller/userController.js";

const userRouter = express.Router();

userRouter.post("/register", userController.addUser);
userRouter.get("/leaderboard", userController.getUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/profile/:username", userController.getProfile);

export default userRouter;
