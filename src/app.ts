// src/app.ts
// 💡 【重要】起動時の一番最初にタイムゾーンを強制設定します
process.env.TZ = "Asia/Tokyo";

import "dotenv/config";
import express from "express";
import path from "node:path";
// import prisma from "./prisma"; // 必要に応じて使用
import taskRoutes from "./routes/task.routes";

const app = express();
const PORT = process.env.PORT || 10000;

// ビューエンジンの設定
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 ルーティング：ルート("/")配下に taskRoutes をマウント
// これにより、taskRoutes.ts 内で定義された URL マッピングがすべて有効になります
app.use("/", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Timezone set to: ${process.env.TZ}`);
});
