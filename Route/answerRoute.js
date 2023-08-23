import express from "express";
import answerController from "../Controller/answerController.js";

const answerRouter = express.Router();

answerRouter.post("/answer", answerController.answerQuiz);

export default answerRouter;
