// src/prisma.ts
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 変数に代入して、名前付きでもデフォルトでもエクスポートできるようにするのじゃ
export const prisma = new PrismaClient({ adapter });
export default prisma; // これを書き足すことで service からの import が通るようになるぞ！
