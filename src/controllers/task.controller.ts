import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

// 💡 【修正】手動でミリ秒を加算する JST 変換を廃止します。
// Node.jsのTZ="Asia/Tokyo"設定により、Dateオブジェクト自体が自動的に正しいローカル時間を解釈します。
const parseDate = (date: Date | string) => {
  return new Date(date);
};

export class TaskController {
  // 1. タスク一覧の取得
  async index(req: Request, res: Response): Promise<void> {
    try {
      const rawTasks = await taskService.getAllTasks();

      // 日時を Date オブジェクトに変換してからソート・表示
      const tasks = rawTasks
        .map((t) => ({
          ...t,
          deadline: parseDate(t.deadline),
        }))
        .sort((a, b) => {
          const aComp = a.is_completed ? 1 : 0;
          const bComp = b.is_completed ? 1 : 0;
          if (aComp !== bComp) return aComp - bComp;
          return a.deadline.getTime() - b.deadline.getTime();
        });

      const stats = await taskService.getStatistics();
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

      // 💡 クライアントからの "YYYY-MM-DDTHH:mm" 形式を、
      // タイムゾーンが混ざらないようにローカル時刻として解釈して保存します
      await taskService.createTask({
        title,
        deadline: new Date(deadline),
        importance: Number(importance),
        tag: tag || null,
        color: color || null,
      });

      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  // 3. 更新
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { deadline, ...rest } = req.body;

      const updateData: any = { ...rest };
      if (deadline) updateData.deadline = new Date(deadline);
      if (rest.is_completed) updateData.completed_at = new Date();

      const updatedTask = await taskService.updateTask(id, updateData);
      res.status(200).json(updatedTask);
    } catch (error) {
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

  // 6. 過去の履歴取得
  async history(req: Request, res: Response): Promise<void> {
    try {
      const rawTasks = await taskService.getAllTasks();
      const completedTasks = rawTasks
        .filter((t) => t.is_completed)
        .map((t) => ({ ...t, deadline: parseDate(t.deadline) }));

      res.render("history", { tasks: completedTasks });
    } catch (error) {
      res.status(500).send("Error rendering history page");
    }
  }
}
