// src/routes/task.routes.ts
import { Router } from "express";
import { TaskController } from "../controllers/task.controller";

const router = Router();
const taskController = new TaskController();

// コントローラーの各機能を URL と紐付け
router.get("/", (req, res) => taskController.index(req, res)); // getAll から index へ修正
router.post("/", (req, res) => taskController.create(req, res));
router.patch("/:id", (req, res) => taskController.update(req, res));
router.delete("/:id", (req, res) => taskController.delete(req, res));

// ⚙️ 【追加】完全リセット機能（全データの一括削除）用ルート
router.delete("/", (req, res) => taskController.deleteAll(req, res));

export default router;
