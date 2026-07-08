// prisma.config.js
export default {
  schema: "prisma/schema.prisma",
  // 本番の migrate deploy コマンドが DATABASE_URL を見つけられるように設定を追加するのじゃ
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
