import { Redis } from "ioredis";
import { user } from "../Database/db.js";
import { quiz } from "../Database/quiz.js";
import { bucketQuiz } from "../Database/bucketQuiz.js";
import responseHelper from "../Helper/responHelper.js";

const redis = new Redis();
const quizController = {
  randomQuiz: async (req, res) => {
    try {
      const cacheData = await redis.get("verifyUser");
      if (cacheData) {
        return responseHelper(res, 200, cacheData, "Success");
      }
      const verifyUser = await user.findOne({
        raw: true,
        where: {
          username: req.body.username,
        },
      });

      await redis.set("verifyUser", JSON.stringify(verifyUser));
      if (!verifyUser) {
        return responseHelper(res, 401, "", "Username not found");
      }
      const phoneNumberLastDigit = parseInt(verifyUser.phoneNumber.slice(-1));
      const roundNumber = phoneNumberLastDigit + 1;

      if (roundNumber >= 1 && roundNumber <= 10) {
        const quizz = bucketQuiz.round[`round-${roundNumber}`];
        const soal = quizz.map((item) => quiz.soal[item - 1]);

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
