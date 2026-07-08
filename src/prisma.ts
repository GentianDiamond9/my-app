import { PrismaClient } from "@prisma/client";

// 環境変数は index.ts 側でロード完了しているので、何も渡さなくて大丈夫です！
const prisma = new PrismaClient();

export default prisma;
