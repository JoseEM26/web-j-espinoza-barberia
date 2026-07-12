/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "CutType" ADD VALUE 'FIADO';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone";
