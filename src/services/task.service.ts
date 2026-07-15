import prisma from "../prisma";
import { Task, Memo } from "@prisma/client";

export class TaskService {
  // 一覧取得 (メモの件数なども含めて取得可能)
  async getAllTasks(): Promise<Task[]> {
    return await prisma.task.findMany({
      orderBy: [{ is_completed: "asc" }, { importance: "desc" }],
    });
  }

  // 作成
  async createTask(data: {
    title: string;
    deadline: Date;
    importance: number;
    tag?: string;
    color?: string;
  }): Promise<Task> {
    return await prisma.task.create({
      data: {
        ...data,
        is_completed: false,
      },
    });
  }

  // 更新：完了フラグが立った時に完了日時を記録する
  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    if (data.is_completed === true) {
      data.completed_at = new Date(); // 完了ボタンが押された現在時刻を記録
    } else if (data.is_completed === false) {
      data.completed_at = null; // 未完了に戻すときはクリア
    }

    return await prisma.task.update({
      where: { id },
      data: data,
    });
  }

  // 削除
  async deleteTask(id: number): Promise<Task> {
    return await prisma.task.delete({
      where: { id },
    });
  }

  // 全件削除（完全リセット機能用）
  async deleteAllTasks(): Promise<void> {
    await prisma.task.deleteMany({});
  }

  // ---------------------------------------------------------
  // 📝 【追加】メモ操作用のメソッド
  // ---------------------------------------------------------

  // 特定のタスクに紐づくメモ一覧を最新順で取得する
  async getMemosByTaskId(taskId: number): Promise<Memo[]> {
    return await prisma.memo.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: "desc" },
    });
  }

  // 特定のタスクに対してメモを保存する
  // (今回は1タスク1メモの要件やシンプルな更新をカバーできるよう、upsert的な処理にしています)
  async saveMemo(taskId: number, content: string): Promise<Memo> {
    // まず既存のメモがあるか確認
    const existingMemo = await prisma.memo.findFirst({
      where: { task_id: taskId },
    });

    if (existingMemo) {
      // 既にメモがある場合は更新
      return await prisma.memo.update({
        where: { id: existingMemo.id },
        data: { content },
      });
    } else {
      // 新規作成
      return await prisma.memo.create({
        data: {
          task_id: taskId,
          content,
        },
      });
    }
  }

  // getStatistics メソッド
  async getStatistics() {
    const now = new Date();
    // 過去1週間、1ヶ月の「期限」が設定されていたタスクを対象にする
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const calculateRate = async (since: Date) => {
      // 期間内に期限(deadline)が来たタスクをすべて取得（完了・未完了問わず）
      const tasks = await prisma.task.findMany({
        where: { deadline: { gte: since, lte: now } },
      });

      if (tasks.length === 0) return 0;

      // 「完了済み」かつ「期限が切れる前に完了していた」タスクを抽出
      const onTimeTasks = tasks.filter((t) => {
        return (
          t.is_completed &&
          t.completed_at &&
          new Date(t.completed_at) <= new Date(t.deadline)
        );
      });

      const rate = Math.round((onTimeTasks.length / tasks.length) * 100);
      console.log(
        `統計計算 [${since.toLocaleDateString()}〜]: 対象 ${tasks.length}件, 期限内完了 ${onTimeTasks.length}件 -> ${rate}%`,
      );
      return rate;
    };

    return {
      weekRate: await calculateRate(oneWeekAgo),
      monthRate: await calculateRate(oneMonthAgo),
    };
  }
}
