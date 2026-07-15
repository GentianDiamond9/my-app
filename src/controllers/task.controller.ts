import { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

export class TaskController {
  // 1. タスク一覧の取得（未完了が先、期限順に並べ替えて表示）
  async index(req: Request, res: Response): Promise<void> {
    try {
      // データベースからすべてのタスクを取得
      const rawTasks = await taskService.getAllTasks();

      // 【ここで確実にソート】 未完了が上、完了が下。それぞれの中で期限（deadline）が近い順
      const tasks = rawTasks.sort((a, b) => {
        // 完了ステータスの比較 (false = 0, true = 1 に見立てて昇順ソート)
        const aComp = a.is_completed ? 1 : 0;
        const bComp = b.is_completed ? 1 : 0;
        if (aComp !== bComp) {
          return aComp - bComp;
        }
        // ステータスが同じなら期限（deadline）の古い順（近い順）
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

  // 2. 新規作成（フォーム送信なので、作成後はリダイレクトでOK）
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
        // スキーマの定義に則り、完了時は現在時刻、未完了に戻すときは null をセット
        updateData.completed_at = isCompletedBool ? new Date() : null;
      }

      // サービス経由で更新を実行
      const updatedTask = await taskService.updateTask(id, updateData);

      // フロントエンドのfetchが正常に処理できるよう、リダイレクトではなく更新データをJSONで返却
      res.status(200).json(updatedTask);
    } catch (error) {
      console.error("更新エラー:", error);
      res.status(500).json({ message: "Error updating task", error });
    }
  }

  // 4. DELETE /tasks/:id (非同期fetch用にJSONで完了通知を返す)
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
      }

      await taskService.deleteTask(id);

      // 削除成功時もJSONでレスポンスを返す
      res.status(200).json({ message: "Task successfully deleted" });
    } catch (error) {
      console.error("削除エラー:", error);
      res.status(500).json({ message: "Error deleting task", error });
    }
  }

  // 5. 【追加】 DELETE /tasks (完全リセット用の一括削除メソッド)
  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await taskService.deleteAllTasks();
      res.status(200).json({ message: "All tasks successfully deleted" });
    } catch (error) {
      console.error("一括削除エラー:", error);
      res.status(500).json({ message: "Error resetting tasks", error });
    }
  }
}
