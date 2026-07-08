// src/app.ts
import "dotenv/config";
import express from "express";
import taskRoutes from "./routes/task.routes";
import prisma from "./prisma"; // データベースに触るために追加

const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json()); // JSON形式のデータを受け取れるようにするのじゃ
app.use(express.urlencoded({ extended: true }));

// /tasks という URL でタスク機能を呼び出せるようにするぞ
app.use("/tasks", taskRoutes);

// 動作確認用のルート
app.get("/", async (req, res) => {
  try {
    // データベースからタスクを持ってくる
    const tasks = await prisma.task.findMany({
      orderBy: { importance: "desc" },
    });
    // index.ejs にタスクを渡して表示する
    res.render("index", { tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send("エラーが起きたようじゃ...");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
