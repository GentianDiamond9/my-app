// src/app.ts
import "dotenv/config";
import express from "express";
import taskRoutes from "./routes/task.routes";

const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json()); // JSON形式のデータを受け取れるようにするのじゃ
app.use(express.urlencoded({ extended: true }));

// /tasks という URL でタスク機能を呼び出せるようにするぞ
app.use("/tasks", taskRoutes);

// 動作確認用のルート
app.get("/", (req, res) => {
  res.send("Task Management API is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
