// src/app.ts
import "dotenv/config";
import express from "express";
import path from "node:path";
import prisma from "./prisma";
import taskRoutes from "./routes/task.routes";
import { TaskService } from "./services/task.service"; // サービスをインポート

const app = express();
const PORT = process.env.PORT || 10000;
const taskService = new TaskService(); // インスタンスを作成

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/tasks", taskRoutes);

// ルート URL の処理を修正
app.get("/", async (req, res) => {
  try {
    // 1. タスク一覧を取得
    const tasks = await taskService.getAllTasks();

    // 2. 統計データ（達成率）を取得
    const stats = await taskService.getStatistics();

    // 3. 両方のデータを EJS に渡す
    res.render("index", { tasks, stats });
  } catch (error) {
    console.error("エラーが発生したぞ:", error);
    res.status(500).send("サーバーエラーじゃ...");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
