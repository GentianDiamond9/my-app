import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

export class TaskController {
  // getAll または 画面を表示しているメソッド（indexなど）を探して、次のように書き換えるのじゃ
  async index(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await taskService.getAllTasks();
      const stats = await taskService.getStatistics(); // 統計データを取得
      // 画面(ejs)に tasks と stats 両方を渡す
      res.render("index", { tasks, stats });
    } catch (error) {
      res.status(500).send("Error");
    }
  }

  // POST /tasks
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, deadline, importance } = req.body;

      // 簡単なバリデーション (C#の ModelState.IsValid のようなイメージ)
      if (!title || !deadline || importance === undefined) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const newTask = await taskService.createTask({
        title,
        deadline: new Date(deadline), // 文字列からDate型へ変換
        importance: Number(importance),
      });

      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  // PATCH /tasks/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10); // URLパラメータからIDを取得 (C#の [FromRoute] に相当)
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
      }

      // リクエストボディから更新データを取得 (C#の [FromBody] に相当)
      const { title, deadline, importance, is_completed } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (deadline !== undefined) updateData.deadline = new Date(deadline);
      if (importance !== undefined) updateData.importance = Number(importance);
      if (is_completed !== undefined)
        updateData.is_completed =
          is_completed === "true" || is_completed === true;

      const updatedTask = await taskService.updateTask(id, updateData);
      res.redirect("/");
    } catch (error) {
      // Prismaでレコードが見つからない場合のエラーハンドリング
      res.status(500).json({ message: "Error updating task", error });
    }
  }

  // DELETE /tasks/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
      }

      await taskService.deleteTask(id);
      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: "Error deleting task", error });
    }
  }
}
