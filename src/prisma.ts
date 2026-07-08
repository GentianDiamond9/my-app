import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// 環境変数 DATABASE_URL を使って PostgreSQL への接続を作る
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Prisma 7 では datasourceUrl ではなく、この adapter を渡すのが正解じゃ
export const prisma = new PrismaClient({ adapter });
