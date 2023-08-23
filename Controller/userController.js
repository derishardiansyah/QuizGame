import { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { user } from "../Database/db.js";
import { quiz } from "../Database/quiz.js";
import responseHelper from "../Helper/responHelper.js";

const redis = new Redis();
const userController = {
  addUser: async (req, res) => {
    try {
      const data = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
        phoneNumber: req.body.phoneNumber,
      };
      const newUser = await user.create(data);
      return responseHelper(
        res,
        200,
        {
          data: newUser,
        },
        "User has been created",
        "success"
      );
    } catch (err) {
      const typeError = err?.errors?.[0]?.type;
      if (typeError === "unique violation") {
        return responseHelper(
          res,
          400,
          "",
          "User with this email already exists"
        );
      }
      responseHelper(res, 500, "", err, "error");
    }
  },
  verify: async (req, res) => {
    try {
      // didapat dari token addUser
      const { token } = req.params;
      const verifyToken = jwt.verify(token, process.env.secretVerify);
      await user.update(
        {
          // nama table di database
          isVerify: true,
        },
        { where: { email: verifyToken.email } }
      );
      return responseHelper(res, 200, "", "Verify success", "success");
    } catch (err) {
      responseHelper(res, 400, "", "Verify failed", "error");
    }
  },
  getUser: async (req, res) => {
    try {
      const chachedUser = await redis.get("getUserQuiz");
      if (chachedUser) {
        return responseHelper(
          res,
          200,
          { data: JSON.parse(chachedUser) },
          "User data",
          "success"
        );
      }
      let token = req.headers.authorization.split(" ")[1];

      const users = await user.findAll();

      const usersScore = users.map((users) => ({
        username: users.username,
        score: users.score,
      }));

      await redis.setex("getUserQuiz", 300, JSON.stringify(usersScore));
      if (!users) {
        return responseHelper(res, 401, "", "User not found", "error");
      }
      return responseHelper(res, 200, usersScore, "success", "data");
    } catch (err) {
      console.log(err);
      responseHelper(res, 500, "", err, "error");
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return responseHelper(
          res,
          400,
          "",
          "Username or Password is empty",
          "error"
        );
      }

      const users = await user.findOne({
        where: {
          username: username,
        },
      });

      if (!users) {
        return responseHelper(res, 401, "", "Invalid Username", "error");
      }

      const passwordIsValid = await bcrypt.compare(password, users.password);
      if (!passwordIsValid) {
        return responseHelper(res, 401, "", "Invalid Password", "error");
      }

      // supaya token hanya bisa digunakan by User
      const token = jwt.sign(
        {
          username: username,
        },
        process.env.secretLogin,
        {
          expiresIn: "1h",
        }
      );
      return responseHelper(
        res,
        200,
        {
          username: username,
          token: token,
        },
        "Login successful"
      );
    } catch (error) {
      console.log(error);
      responseHelper(res, 500, "", error, "error");
    }
  },
  getProfile: async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, process.env.secretLogin);

      const requestedUsername = req.params.username;
      if (decode.username !== requestedUsername) {
        return responseHelper(
          res,
          401,
          "",
          "Unauthorized access to this profile"
        );
      }
      const users = await user.findOne({
        where: {
          username: req.params.username,
        },
      });
      return responseHelper(res, 200, users, "Success");
    } catch (err) {
      responseHelper(res, 500, "", err.message);
    }
  },
  randomQuiz: async (req, res) => {
    try {
      const randomIndex = Math.floor(Math.random() * quiz.soal.length);
      const randomQuiz = quiz.soal[randomIndex];
      const quizDisplay = {
        id: randomQuiz.id,
        type: randomQuiz.type,
        soal: randomQuiz.soal,
        answer: randomQuiz.answer,
      };
      res.json(quizDisplay);
    } catch (error) {
      console.log(error);
      responseHelper(res, 500, "", error, "error");
    }
  },
};

export default userController;
