-- CreateTable
CREATE TABLE "memos" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "memos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "memos" ADD CONSTRAINT "memos_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
