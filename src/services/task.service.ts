import prisma from "../prisma";
import { Task } from "@prisma/client";

export class TaskService {
  // 一覧取得
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

  // 過去1週間・1ヶ月の「期限内達成率」を計算する
  async getStatistics() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const calculateRate = async (since: Date) => {
      // 指定期間内に期限が設定されていたタスクを取得
      const tasks = await prisma.task.findMany({
        where: { deadline: { gte: since, lte: now } },
      });
      if (tasks.length === 0) return 0;
      // 「完了済み」かつ「完了日時が期限内」のものをカウント
      const onTime = tasks.filter(
        (t) => t.is_completed && t.completed_at && t.completed_at <= t.deadline,
      ).length;
      return Math.round((onTime / tasks.length) * 100);
    };

    return {
      weekRate: await calculateRate(oneWeekAgo),
      monthRate: await calculateRate(oneMonthAgo),
    };
  }
}
