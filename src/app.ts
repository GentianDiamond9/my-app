// src/app.ts
import "dotenv/config";
import express from "express";
import path from "node:path";
import prisma from "./prisma";
import taskRoutes from "./routes/task.routes";
// ⚠️ ルートURLの処理をタスクコントローラーに一本化するため、
// ここでの TaskService のインポートやインスタンス作成、個別定義は不要になります。

const app = express();
const PORT = process.env.PORT || 10000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 ここを "/tasks" から "/" に変更します！
// これにより、taskRoutes 内で定義した "/" や "/history" がそのまま適用されます。
app.use("/", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
