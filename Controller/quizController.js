import Redis from "ioredis";
import { user } from "../Database/db.js";
import { quiz } from "../Database/quiz.js";
import { bucketQuiz } from "../Database/bucketQuiz.js";
import responseHelper from "../Helper/responHelper.js";

const redis = new Redis();
let currentQuestionIndex = 0;
let newUsername = null;

const quizController = {
  randomQuiz: async (req, res) => {
    try {
      const storedVerifyUserData = JSON.parse(await redis.get("verifyUser"));
      if (storedVerifyUserData.username !== newUsername) {
        currentQuestionIndex = 0;
        newUsername = storedVerifyUserData.username;
      }
      if (storedVerifyUserData) {
        const verifyUserFromDB = await user.findOne({
          raw: true,
          where: {
            username: req.body.username,
          },
        });
        if (!verifyUserFromDB) {
          return responseHelper(res, 400, "", "Username not found");
        }

        const phoneNumberLastDigit = parseInt(
          verifyUserFromDB.phoneNumber.slice(-1)
        );

        const roundNumber =
          JSON.parse(await redis.get("RoundNumber")) ||
          phoneNumberLastDigit + 1;
        console.log(roundNumber);
        if (roundNumber >= 1 && roundNumber <= 10) {
          const quizRound = bucketQuiz.round[`round-${roundNumber}`];

          const desiredIndex = currentQuestionIndex;

          if (desiredIndex >= quizRound.length) {
            currentQuestionIndex = 0;
            await redis.set("RoundNumber", JSON.parse(roundNumber) + 1);
            return responseHelper(res, 200, "", "Quiz finish");
          }
          const desiredQuestion = quiz.soal[quizRound[desiredIndex] - 1];
          currentQuestionIndex++;

          const displaySoal = {
            id: desiredQuestion.id,
            type: desiredQuestion.type,
            soal: desiredQuestion.soal,
            answer: desiredQuestion.answer,
          };

          // setting waktu default pada saat klik
          const startTime = Date.now();

          await redis.set(
            `startTime:${verifyUserFromDB.username}:${displaySoal.id}`,
            startTime
          );
          await redis.set("RoundNumber", JSON.stringify(roundNumber));
          await redis.set("verifyUser", JSON.stringify(verifyUserFromDB));
          await redis.set("displaySoal", JSON.stringify(displaySoal));
          await redis.set(
            "correctOption",
            JSON.stringify(desiredQuestion.correctOption)
          );
          return res.json(displaySoal);
        } else {
          return responseHelper(res, 400, "", "Round not found");
        }
      }
    } catch (error) {
      return responseHelper(res, 500, "", error, "error");
    }
  },
};

export default quizController;
