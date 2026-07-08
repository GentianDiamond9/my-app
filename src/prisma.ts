import { PrismaClient } from "@prisma/client";

// Prisma v7 で確実に環境変数を掴ませるため、明示的に引数に渡して初期化します
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
