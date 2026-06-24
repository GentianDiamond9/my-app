import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// データベース接続の準備じゃ
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query"] });

const app = express();
const PORT = process.env.PORT || 8888;

// EJS を使って画面を描画する設定じゃ
app.set("view engine", "ejs");
app.set("views", "./views");
// フォームから送信されたデータを受け取れるようにする設定じゃ
app.use(express.urlencoded({ extended: true }));

// メイン画面：ユーザー一覧を表示するぞ
app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.render("index", { users });
});

// ユーザー追加処理：フォームから送られた名前を DB に保存するぞ
app.post("/users", async (req, res) => {
  const name = req.body.name;
  if (name) {
    await prisma.user.create({ data: { name } });
  }
  res.redirect("/"); // 終わったら一覧画面に戻るのじゃ
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
