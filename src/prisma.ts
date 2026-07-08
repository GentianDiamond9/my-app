import { PrismaClient } from "@prisma/client";

// アプリ全体で一つのインスタンスを使い回します
const prisma = new PrismaClient();

export default prisma;
