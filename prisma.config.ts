import { defineConfig } from "prisma";

export default defineConfig({
  // データベースへの接続設定
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
