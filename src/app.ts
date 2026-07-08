// src/app.ts
import "dotenv/config";
import express from "express";
import path from "node:path"; // パスを扱う道具を追加
import prisma from "./prisma";
import taskRoutes from "./routes/task.routes";

const app = express();
const PORT = process.env.PORT || 10000; // Renderのポートに対応

// --- ここが重要！View Engine の設定じゃ ---
app.set("view engine", "ejs");
// フォルダの場所を確実に教えるのじゃ（srcの中にapp.tsがある場合の指定）
app.set("views", path.join(process.cwd(), "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// タスク管理のAPIルート
app.use("/tasks", taskRoutes);

// ルート URL にアクセスした時にタスク一覧画面を表示するのじゃ
app.get("/", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [{ is_completed: "asc" }, { importance: "desc" }],
    });
    // views/index.ejs を使って画面を表示するぞ
    res.render("index", { tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send("データベース接続エラーじゃ...");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
