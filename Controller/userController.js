import { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { user } from "../Database/db.js";
import responseHelper from "../Helper/responHelper.js";

const redis = new Redis();
const userController = {
  addUser: async (req, res) => {
    try {
      const existingUser = await user.findOne({
        where: {
          username: req.body.username,
        },
      });

      if (existingUser) {
        return responseHelper(res, 400, "", "Username already exists", "error");
      }
      const data = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
        phoneNumber: req.body.phoneNumber,
      };

      const newUser = await user.create(data);
      const displayUser = {
        id: newUser.id,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        score: newUser.score,
      };
      return responseHelper(
        res,
        200,
        {
          displayUser,
        },
        "User has been created",
        "success"
      );
    } catch (err) {
      responseHelper(res, 500, "", err, "error");
    }
  },
  getUser: async (req, res) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return responseHelper(res, 401, "", "Token missing");
      }

      let decode;
      let tokenExpired = false;

      jwt.verify(token, process.env.secretLogin, (error, decoded) => {
        if (error) {
          if (error.name === "TokenExpiredError") {
            tokenExpired = true;
          } else {
            return responseHelper(res, 401, "", "Invalid token", "error");
          }
        } else {
          decode = decoded;
        }
      });

      if (tokenExpired) {
        return responseHelper(res, 401, "", "Token has expired", "error");
      }
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

      const token = jwt.sign(
        {
          username: user.username,
        },
        process.env.secretLogin,
        {
          expiresIn: "1d",
        }
      );
      return responseHelper(
        res,
        200,
        {
          id: users.id,
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
      if (!token) {
        return responseHelper(res, 401, "", "Token missing");
      }

      let decode;
      let tokenExpired = false;

      jwt.verify(token, process.env.secretLogin, (error, decoded) => {
        if (error) {
          if (error.name === "TokenExpiredError") {
            tokenExpired = true;
          } else {
            return responseHelper(res, 401, "", "Invalid token", "error");
          }
        } else {
          decode = decoded;
        }
      });

      if (tokenExpired) {
        return responseHelper(res, 401, "", "Token has expired", "error");
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
};

export default userController;
