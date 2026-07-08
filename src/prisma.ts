import { PrismaClient } from "@prisma/client";
import config from "../prisma.config"; // 設定ファイルをインポート

// 新しい初期化方法
const prisma = new PrismaClient(config);

export default prisma;
