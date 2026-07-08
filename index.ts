// index.ts
import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT || 8888;

// --- Prisma 7 の正しい接続設定 ---
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));

// --- 画面の表示（読み取り） ---
app.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.render("index", { users });
  } catch (error) {
    console.error(error);
    res.status(500).send("エラーが起きたようじゃ...");
  }
});

// --- データの追加（書き込み） ---
app.post("/users", async (req, res) => {
  const name = req.body.name;
  if (name) {
    try {
      await prisma.user.create({ data: { name } });
    } catch (error) {
      console.error(error);
    }
  }
  res.redirect("/");
});

// --- サーバー起動 ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
