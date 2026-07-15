// src/routes/task.routes.ts
import { Router } from "express";
import { TaskController } from "../controllers/task.controller";

const router = Router();
const taskController = new TaskController();

// ---------------------------------------------------------
// 1. タスク管理 基本ルート
// ---------------------------------------------------------
router.get("/", (req, res) => taskController.index(req, res));
router.post("/", (req, res) => taskController.create(req, res));
router.patch("/:id", (req, res) => taskController.update(req, res));
router.delete("/:id", (req, res) => taskController.delete(req, res));

// ⚙️ 完全リセット機能（全データの一括削除）用ルート
router.delete("/", (req, res) => taskController.deleteAll(req, res));

// ---------------------------------------------------------
// 2. メモ管理用ルート
// ---------------------------------------------------------
router.get("/:taskId/memos", (req, res) => taskController.getMemos(req, res));
router.post("/:taskId/memos", (req, res) => taskController.saveMemo(req, res));

// ---------------------------------------------------------
// 3. 【新規追加】 過去の歴史（爆破タスク観測ページ）用ルート
// ---------------------------------------------------------
router.get("/history", (req, res) => taskController.history(req, res));

export default router;
