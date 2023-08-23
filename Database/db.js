import { Sequelize } from "sequelize";
import dbConfig from "../Config/dbConfig.js";
import userModels from "../Models/userModels.js";

const db = new Sequelize(
  dbConfig.name,
  dbConfig.username,
  dbConfig.password,
  dbConfig.options
);

export const user = userModels(db);

export default db;
