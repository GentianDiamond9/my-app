// src/routes/task.routes.ts
import { Router } from "express";
import { TaskController } from "../controllers/task.controller";

const router = Router();
const taskController = new TaskController();

// ---------------------------------------------------------
// 1. 画面表示ルート (ルート配下)
// ---------------------------------------------------------
router.get("/", (req, res) => taskController.index(req, res));
router.get("/history", (req, res) => taskController.history(req, res));

// ---------------------------------------------------------
// 2. タスク管理 API & フォーム送信ルート (/tasks 配下)
// ---------------------------------------------------------
router.post("/tasks", (req, res) => taskController.create(req, res));
router.patch("/tasks/:id", (req, res) => taskController.update(req, res));
router.delete("/tasks/:id", (req, res) => taskController.delete(req, res));

// ⚙️ 完全リセット機能
router.delete("/tasks", (req, res) => taskController.deleteAll(req, res));

// ---------------------------------------------------------
// 3. メモ管理用 API ルート
// ---------------------------------------------------------
router.get("/tasks/:taskId/memos", (req, res) =>
  taskController.getMemos(req, res),
);
router.post("/tasks/:taskId/memos", (req, res) =>
  taskController.saveMemo(req, res),
);

export default router;
