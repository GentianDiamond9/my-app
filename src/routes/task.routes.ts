import { Router } from "express";
import { TaskController } from "../controllers/task.controller";

const router = Router();
const taskController = new TaskController();

// 矢印関数 () => ... を使うことで、Controller内での `this` のバインドエラーを防ぎます
router.get("/", (req, res) => taskController.getAll(req, res));
router.post("/", (req, res) => taskController.create(req, res));
router.patch("/:id", (req, res) => taskController.update(req, res));
router.delete("/:id", (req, res) => taskController.delete(req, res));

export default router;
