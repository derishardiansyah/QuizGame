import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const dbConfig = {
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

export default dbConfig;
