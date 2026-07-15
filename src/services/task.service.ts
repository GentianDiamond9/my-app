import prisma from "../prisma";
import { Task, Memo } from "@prisma/client";

export class TaskService {
  // 1. 一覧取得（ソート順などはそのままでOK）
  async getAllTasks(): Promise<Task[]> {
    return await prisma.task.findMany({
      orderBy: [{ is_completed: "asc" }, { importance: "desc" }],
    });
  }

  // 2. 作成
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
        // ここで送信されたDateは、TZ=Asia/Tokyoの設定により適切にUTCとして保存されます
      },
    });
  }

  // 3. 更新
  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    const updateData = { ...data };

    // 完了フラグの制御
    if (data.is_completed === true) {
      updateData.completed_at = new Date();
    } else if (data.is_completed === false) {
      updateData.completed_at = null;
    }

    return await prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  // 統計データ取得 (時刻のずれ対策)
  async getStatistics() {
    const now = new Date(); // TZ設定により日本基準の時刻として扱われる

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const calculateRate = async (since: Date) => {
      // 期間内に期限が来たタスクを取得
      const tasks = await prisma.task.findMany({
        where: { deadline: { gte: since, lte: now } },
      });

      if (tasks.length === 0) return 0;

      // 期限内完了の判定
      const onTimeTasks = tasks.filter((t) => {
        // DBから取得した日付はDate型なのでそのまま比較可能
        return (
          t.is_completed &&
          t.completed_at &&
          t.completed_at.getTime() <= t.deadline.getTime()
        );
      });

      return Math.round((onTimeTasks.length / tasks.length) * 100);
    };

    return {
      weekRate: await calculateRate(oneWeekAgo),
      monthRate: await calculateRate(oneMonthAgo),
    };
  }

  // 📝 メモ関連メソッドはそのまま利用可能です...
  async getMemosByTaskId(taskId: number): Promise<Memo[]> {
    return await prisma.memo.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: "desc" },
    });
  }

  async saveMemo(taskId: number, content: string): Promise<Memo> {
    const existingMemo = await prisma.memo.findFirst({
      where: { task_id: taskId },
    });
    if (existingMemo) {
      return await prisma.memo.update({
        where: { id: existingMemo.id },
        data: { content },
      });
    }
    return await prisma.memo.create({ data: { task_id: taskId, content } });
  }

  async deleteTask(id: number): Promise<Task> {
    return await prisma.task.delete({ where: { id } });
  }

  async deleteAllTasks(): Promise<void> {
    await prisma.task.deleteMany({});
  }
}
