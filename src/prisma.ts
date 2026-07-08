import { PrismaClient } from "@prisma/client";

// 設定は上記の prisma.config.js から自動で適用されます
const prisma = new PrismaClient();

export default prisma;
