/*
  Warnings:

  - You are about to drop the column `descricao` on the `produtos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "descricao";

-- CreateTable
CREATE TABLE "familias" (
    "id" SERIAL NOT NULL,
    "nomePai" TEXT NOT NULL,
    "nomeMae" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "familias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filhos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "familiaId" INTEGER NOT NULL,

    CONSTRAINT "filhos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "filhos" ADD CONSTRAINT "filhos_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
