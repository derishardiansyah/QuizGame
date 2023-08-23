import { quiz } from "../Database/quiz.js";
import { user } from "../Database/db.js";
import responseHelper from "../Helper/responHelper.js";

const answerController = {
  answerQuiz: async (req, res, next) => {
    try {
      const { username } = req.body;
      const searchUsername = await user.findOne({ where: { username } });
      res.json(searchUsername);
    } catch (error) {
      console.log(error);
      responseHelper(res, 500, "", error, "Error");
    }
  },
};

export default answerController;
