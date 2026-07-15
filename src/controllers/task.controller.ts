import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

export class TaskController {
  // 1. タスク一覧の取得
  async index(req: Request, res: Response): Promise<void> {
    try {
      const rawTasks = await taskService.getAllTasks();

      // 未完了が上、完了が下。それぞれの中で期限（deadline）が近い順
      const tasks = rawTasks.sort((a, b) => {
        const aComp = a.is_completed ? 1 : 0;
        const bComp = b.is_completed ? 1 : 0;
        if (aComp !== bComp) {
          return aComp - bComp;
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

      const stats = await taskService.getStatistics(); // 統計データを取得

      // 画面(ejs)にソート済みの tasks と stats を渡す
      res.render("index", { tasks, stats });
    } catch (error) {
      console.error("一覧取得エラー:", error);
      res.status(500).send("Error");
    }
  }

  // 2. 新規作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, deadline, importance, tag, color } = req.body;

      if (!title || !deadline || importance === undefined) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      await taskService.createTask({
        title,
        deadline: new Date(deadline),
        importance: Number(importance),
        tag: tag || null,
        color: color || null,
      });

      res.redirect("/");
    } catch (error) {
      console.error("作成エラー:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  // 3. PATCH /tasks/:id (非同期fetch用にJSONで結果を返す)
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
      }

      const { title, deadline, importance, is_completed } = req.body;
      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (deadline !== undefined) updateData.deadline = new Date(deadline);
      if (importance !== undefined) updateData.importance = Number(importance);

      if (is_completed !== undefined) {
        const isCompletedBool =
          is_completed === "true" || is_completed === true;
        updateData.is_completed = isCompletedBool;
        updateData.completed_at = isCompletedBool ? new Date() : null;
      }

      const updatedTask = await taskService.updateTask(id, updateData);
      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("更新エラー:", error);
      res.status(500).json({ message: "Error updating task", error });
    }
  }

  // 4. DELETE /tasks/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
      }

      await taskService.deleteTask(id);
      res.status(200).json({ message: "Task successfully deleted" });
    } catch (error) {
      console.error("削除エラー:", error);
      res.status(500).json({ message: "Error deleting task", error });
    }
  }

  // 5. DELETE /tasks (完全リセット用の一括削除メソッド)
  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await taskService.deleteAllTasks();
      res.status(200).json({ message: "All tasks successfully deleted" });
    } catch (error) {
      console.error("一括削除エラー:", error);
      res.status(500).json({ message: "Error resetting tasks", error });
    }
  }

  // GET /tasks/:taskId/memos
  async getMemos(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      if (isNaN(taskId)) {
        res.status(400).json({ message: "Invalid Task ID format" });
        return;
      }

      const memos = await taskService.getMemosByTaskId(taskId);
      res.status(200).json(memos);
    } catch (error) {
      console.error("メモ取得エラー:", error);
      res.status(500).json({ message: "Error retrieving memos", error });
    }
  }

  // POST /tasks/:taskId/memos
  async saveMemo(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const { content } = req.body;

      if (isNaN(taskId)) {
        res.status(400).json({ message: "Invalid Task ID format" });
        return;
      }

      if (content === undefined) {
        res.status(400).json({ message: "Content is required" });
        return;
      }

      const memo = await taskService.saveMemo(taskId, content);
      res.status(200).json(memo);
    } catch (error) {
      console.error("メモ保存エラー:", error);
      res.status(500).json({ message: "Error saving memo", error });
    }
  }

  // ---------------------------------------------------------
  // 6. 【新規追加】 GET /history (過去の砕け散ったタスク履歴)
  // ---------------------------------------------------------
  async history(req: Request, res: Response): Promise<void> {
    try {
      const rawTasks = await taskService.getAllTasks();
      // 完了済みのタスクのみを抽出
      const completedTasks = rawTasks.filter((t) => t.is_completed);
      res.render("history", { tasks: completedTasks });
    } catch (error) {
      console.error("歴史取得エラー:", error);
      res.status(500).send("Error rendering history page");
    }
  }
}
