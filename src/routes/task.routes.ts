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
// 2. 【新規追加】メモ管理用ルート
// ---------------------------------------------------------
// 指定したタスクに紐づくメモ一覧を取得する (GET /tasks/:taskId/memos)
router.get("/:taskId/memos", (req, res) => taskController.getMemos(req, res));

// 指定したタスクに新しいメモを追加・更新する (POST /tasks/:taskId/memos)
// ※今回はシンプルに「1つのタスクに1つの最新メモ」または「追加していく」両対応しやすいように、このパスで制御します
router.post("/:taskId/memos", (req, res) => taskController.saveMemo(req, res));

export default router;
