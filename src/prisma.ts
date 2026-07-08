import { PrismaClient } from "@prisma/client";

// オプションを渡さず、標準の初期化（自動で環境変数の DATABASE_URL を見に行きます）
const prisma = new PrismaClient();

export default prisma;
