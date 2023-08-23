import express from "express";
import cors from "cors";
import db from "./Database/db.js";
import userRouter from "./Route/userRoute.js";
import quizRouter from "./Route/quizRoute.js";
import answerRouter from "./Route/answerRoute.js";

const port = process.env.PORT || 3000;
const app = express();

// untuk menangkap json
app.use(express.json());
// untuk menangkap request body
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// kalau ubah models harus sync dinyalakan
db.sync()
  .then(() => {
    console.log("Database connected!");
  })
  .catch((err) => {
    console.log("Failed to sync database", err);
  });

app.use("/auth", userRouter);
app.use("/quiz", quizRouter);
app.use("/quiz", answerRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
