// src/routes/task.routes.ts
import { Router } from "express";
import { TaskController } from "../controllers/task.controller";

const router = Router();
const taskController = new TaskController();

// コントローラーの各機能を URL と紐付けるのじゃ
router.get("/", (req, res) => taskController.getAll(req, res));
router.post("/", (req, res) => taskController.create(req, res));
router.patch("/:id", (req, res) => taskController.update(req, res));
router.delete("/:id", (req, res) => taskController.delete(req, res));

export default router;
