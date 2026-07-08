import { PrismaClient } from "@prisma/client";

// 引数は一切渡しません（Prisma v7 の標準仕様）
const prisma = new PrismaClient();

export default prisma;
