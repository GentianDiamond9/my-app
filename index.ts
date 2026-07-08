import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"; // もしエラーが出るなら "./generated/prisma/client" に変えてみておくれ

const app = express();
const PORT = process.env.PORT || 8888;

// --- Prisma 7 の初期化設定 ---
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// --- ルーティング ---
app.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.send(`<h1>こんにちは！</h1><p>ユーザー数: ${users.length}</p>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("データベース接続エラーじゃ...");
  }
});

// --- サーバー起動 ---
// ここが重要じゃ。これがないとアプリはすぐに終了（exit）してしまうのじゃぞ
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
