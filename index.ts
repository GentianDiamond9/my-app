import "dotenv/config";
import express from "express";
import { Pool } from "pg"; // pg をインポート
import { PrismaPg } from "@prisma/adapter-pg"; // アダプターをインポート
import { PrismaClient } from "@prisma/client"; // または "./generated/prisma/client"

// 1. PostgreSQL への接続プールを作る
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });

// 2. Prisma 用のアダプターを作る
const adapter = new PrismaPg(pool);

// 3. アダプターを渡して PrismaClient を初期化する
// ここで { datasourceUrl: ... } と書いていたのがエラーの原因じゃ
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 8888;

// ...あとの Express の設定などはそのまま ...
