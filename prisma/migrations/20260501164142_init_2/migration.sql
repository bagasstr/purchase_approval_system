/*
  Warnings:

  - The values [PENDING_MANAGER,PENDING_PROCUREMENT,PENDING_FINANCE,COMPLETED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `roleName` on the `approval_steps` table. All the data in the column will be lost.
  - You are about to drop the column `departments` on the `users` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `approval_steps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."purchase_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "purchase_requests" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
ALTER TABLE "purchase_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "approval_steps" DROP COLUMN "roleName",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "departments";

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
