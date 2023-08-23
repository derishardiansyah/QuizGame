import { Redis } from "ioredis";
import { user } from "../Database/db.js";
import { quiz } from "../Database/quiz.js";
import { bucketQuiz } from "../Database/bucketQuiz.js";
import responseHelper from "../Helper/responHelper.js";

const redis = new Redis();
let currentQuestionIndex = 0;
const quizController = {
  randomQuiz: async (req, res) => {
    try {
      const verifyUser = await user.findOne({
        raw: true,
        where: {
          username: req.body.username,
        },
      });

      if (!verifyUser) {
        return responseHelper(res, 401, "", "Username not found");
      }
      const phoneNumberLastDigit = parseInt(verifyUser.phoneNumber.slice(-1));
      const roundNumber = phoneNumberLastDigit + 1;

      if (roundNumber >= 1 && roundNumber <= 10) {
        const quizz = bucketQuiz.round[`round-${roundNumber}`];

        const desiredIndex = currentQuestionIndex;

        if (desiredIndex >= quizz.length) {
          currentQuestionIndex = 0;
          return res
            .status(404)
            .json({ message: "No more questions available." });
        }

        const desiredQuestion = quiz.soal[quizz[desiredIndex] - 1];
        currentQuestionIndex++;

        const soal = {
          id: desiredQuestion.id,
          type: desiredQuestion.type,
          soal: desiredQuestion.soal,
          answer: desiredQuestion.answer,
        };

        return res.json(soal);
      } else {
        return responseHelper(res, 401, "", "Round not found");
      }
    } catch (error) {
      responseHelper(res, 500, "", error, "error");
    }
  },
};

export default quizController;
