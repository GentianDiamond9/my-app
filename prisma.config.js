// C# の appsettings.json のように、環境変数から接続文字列を読み込んで Prisma に渡します
module.exports = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
