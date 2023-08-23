import express from "express";
import userController from "../Controller/userController.js";

const userRouter = express.Router();

userRouter.post("/register", userController.addUser);
userRouter.get("/leaderboard", userController.getUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/verify/:token", userController.verify);
userRouter.get("/profile/:username", userController.getProfile);
userRouter.get("/randomQuiz", userController.randomQuiz);

export default userRouter;
