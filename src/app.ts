import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes";

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定 (C# の Builder.Services / app.Use... に相当)
app.use(cors()); // CORSを許可 (フロントエンドからの接続に必要)
app.use(express.json()); // JSONリクエストボディのパースを有効化

// ルーティングの登録
// 全てのタスク関連APIに "/tasks" のプレフィックスを付与
app.use("/tasks", taskRoutes);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
