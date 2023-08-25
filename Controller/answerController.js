import { Redis } from "ioredis";
import { user } from "../Database/db.js";
import responseHelper from "../Helper/responHelper.js";

const redis = new Redis();
const answerController = {
  answerQuiz: async (req, res) => {
    try {
      const verifyUser = JSON.parse(await redis.get("verifyUser"));
      const displaySoal = JSON.parse(await redis.get("displaySoal"));
      const correctOption = JSON.parse(await redis.get("correctOption"));
      const user = {
        username: req.body.username,
        idSoal: Number(req.body.idSoal),
        answer: req.body.answer,
      };

      const hasAnswered = await redis.get(
        `answered:${user.username}:${user.idSoal}`
      );
      if (hasAnswered) {
        return responseHelper(
          res,
          401,
          "",
          "You have already answered this quiz",
          "Error"
        );
      }

      if (user.username !== verifyUser.username) {
        return responseHelper(res, 401, "", "User not found", "Error");
      }

      if (user.idSoal !== displaySoal.id) {
        return responseHelper(res, 401, "", "idSoal not found", "Error");
      }

      let responseMessage = "";
      let responseType = "";

      let score = 0;

      if (user.answer === correctOption) {
        const startTime = parseInt(
          await redis.get(`startTime:${user.username}:${user.idSoal}`)
        );
        const timeTaken = (Date.now() - startTime) / 1000;
        if (timeTaken <= 10) score = 10;
        else if (timeTaken <= 20) score = 9;
        else if (timeTaken <= 30) score = 8;
        else if (timeTaken <= 40) score = 7;
        else if (timeTaken <= 50) score = 6;
        else if (timeTaken <= 60) score = 5;
        responseMessage = `Answer is correct. Score: +${score}`;
        responseType = "Success";
      } else {
        responseMessage = "Answer is incorrect";
        responseType = "Error";
        score = -5;
      }

      const verifyUserFromDB = await user.findOne({
        where: {
          username: user.username,
        },
      });
      verifyUserFromDB.score = verifyUserFromDB.score + score;
      await verifyUserFromDB.save();
      await redis.set(`answered:${user.username}:${user.idSoal}`, "true");

      res.json({
        username: user.username,
        idSoal: user.idSoal,
        answer: user.answer,
        message: responseMessage,
        type: responseType,
        score: score,
      });
    } catch (error) {
      responseHelper(res, 500, "", error, "Error");
    }
  },
};

export default answerController;
