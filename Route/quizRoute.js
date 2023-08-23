import express from "express";
import quizController from "../Controller/quizController.js";

const quizRouter = express.Router();

quizRouter.get("/randomQuiz", quizController.randomQuiz);

export default quizRouter;
