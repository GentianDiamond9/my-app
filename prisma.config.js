// prisma.config.js
import "dotenv/config"; // これを入れることで .env から DATABASE_URL を読み込めるようになるぞ

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
