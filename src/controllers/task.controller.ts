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
      res.status(500).send("Internal Server Error");
    }
  }

  // 2. タスクの新規作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, deadline, importance, tag, color } = req.body;

      // 送信された日時文字列をそのままDateオブジェクトへパース
      const parsedDeadline = deadline ? parseDate(deadline) : new Date();

      await taskService.createTask({
        title,
        deadline: parsedDeadline,
        importance: Number(importance),
        tag,
        color,
      });

      res.redirect("/");
    } catch (error) {
      console.error("作成エラー:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // 3. タスクの更新（完了フラグの切り替え等）
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_completed } = req.body;

      // 文字列や真偽値が混在しても確実に boolean に変換
      const isCompletedBool = is_completed === true || is_completed === "true";

      await taskService.updateTask(Number(id), {
        is_completed: isCompletedBool,
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("更新エラー:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // 4. タスクの削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await taskService.deleteTask(Number(id));
      res.sendStatus(200);
    } catch (error) {
      console.error("削除エラー:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // 5. メモの取得
  async getMemos(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const memo = await taskService.getMemo(Number(taskId));
      res.json(memo || { content: "" });
    } catch (error) {
      res.status(500).send("Error fetching memo");
    }
  }

  // 6. メモの保存
  async saveMemo(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { content } = req.body;
      await taskService.saveMemo(Number(taskId), content);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send("Error saving memo");
    }
  }

  // 7. 全削除機能
  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await taskService.deleteAllTasks();
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send("Error deleting all tasks");
    }
  }

  // 8. 過去の歴史画面のレンダリング
  async history(req: Request, res: Response): Promise<void> {
    try {
      const allTasks = await taskService.getAllTasks();

      // 完了済みタスクのみをフィルタリング
      const completedTasks = allTasks
        .filter((t) => t.is_completed)
        .map((t) => ({ ...t, deadline: parseDate(t.deadline) }));

      res.render("history", { tasks: completedTasks });
    } catch (error) {
      res.status(500).send("Error rendering history page");
    }
  }

  // 9. JSONデータインポート機能（上書き・追加対応）
  async importTasks(req: Request, res: Response): Promise<void> {
    try {
      const { mode, tasks } = req.body;

      if (!Array.isArray(tasks)) {
        res.status(400).send("インポートデータが配列ではありません。");
        return;
      }

      // 💡 「上書き」モードの場合は、現在のデータをすべてクリアする
      if (mode === "overwrite") {
        await taskService.deleteAllTasks();
      }

      // 各タスクデータを安全にバリデーション・整形してストレージへ保存
      for (const taskData of tasks) {
        // バックアップ元データの完了フラグ形式が異なっていても安全にマッピング
        const isCompleted =
          taskData.is_completed !== undefined
            ? !!taskData.is_completed
            : !!taskData.isCompleted;

        // 日付の妥当性チェック
        let deadlineDate = new Date();
        if (taskData.deadline) {
          const parsed = parseDate(taskData.deadline);
          if (!isNaN(parsed.getTime())) {
            deadlineDate = parsed;
          }
        }

        let completedAtDate: Date | undefined = undefined;
        if (taskData.completed_at) {
          const parsedComp = parseDate(taskData.completed_at);
          if (!isNaN(parsedComp.getTime())) {
            completedAtDate = parsedComp;
          }
        }

        // タスクを新規に登録
        await taskService.createTask({
          title: taskData.title || "無題のインポートタスク",
          tag: taskData.tag || "",
          deadline: deadlineDate,
          importance: Number(taskData.importance) || 1,
          color: taskData.color || "#64748b",
          is_completed: isCompleted,
          completed_at: completedAtDate,
        });
      }

      res.status(200).send("インポート成功");
    } catch (error) {
      console.error(
        "❌ インポート処理中にサーバーエラーが発生しました:",
        error,
      );
      res.status(500).send("サーバー内部エラーでインポートに失敗しました。");
    }
  }
}
