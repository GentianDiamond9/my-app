import prisma from "../prisma";

// C#の引数用DTOやモデル定義の代わりに、Prismaが自動生成した型を利用できます
import { Task } from "@prisma/client";

export class TaskService {
  // 1. 一覧取得 (ツリーマップで扱いやすいよう、重要度順などでソートしておくと便利です)
  async getAllTasks(): Promise<Task[]> {
    return await prisma.task.findMany({
      orderBy: [
        { is_completed: "asc" }, // 未完了を優先
        { importance: "desc" }, // 重要度が高い順
      ],
    });
  }

  // 2. 作成
  async createTask(data: {
    title: string;
    deadline: Date;
    importance: number;
  }): Promise<Task> {
    return await prisma.task.create({
      data: {
        title: data.title,
        deadline: data.deadline,
        importance: data.importance,
        is_completed: false, // 初期値
      },
    });
  }

  // 3. 更新 (一部のプロパティのみ更新する PATCH に対応)
  async updateTask(
    id: number,
    data: Partial<Omit<Task, "id" | "created_at">>,
  ): Promise<Task> {
    return await prisma.task.update({
      where: { id },
      data: data,
    });
  }

  // 4. 削除
  async deleteTask(id: number): Promise<Task> {
    return await prisma.task.delete({
      where: { id },
    });
  }
}
