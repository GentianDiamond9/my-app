module.exports = {
  datasource: {
    // Renderの環境変数があればそれを使い、なければ直接の接続文字列を強制適用します
    url:
      process.env.DATABASE_URL ||
      "postgresql://treemap_task_database_user:a88kMddTQRQylZbI3P39Uut2KeQIqMhU@dpg-d8to0mog4nts73d4n93g-a.oregon-postgres.render.com/treemap_task_database",
  },
};
