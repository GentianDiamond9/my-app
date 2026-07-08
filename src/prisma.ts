import { PrismaClient } from "@prisma/client";

// Render の環境変数、または直接の接続文字列をここで確実に結合します
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://treemap_task_database_user:a88kMddTQRQylZbI3P39Uut2KeQIqMhU@dpg-d8to0mog4nts73d4n93g-a.oregon-postgres.render.com/treemap_task_database";

const prisma = new PrismaClient({
  datasourceUrl: databaseUrl, // 👈 Prisma v7 では 'datasources' ではなく 'datasourceUrl' が正解でした！
});

export default prisma;
