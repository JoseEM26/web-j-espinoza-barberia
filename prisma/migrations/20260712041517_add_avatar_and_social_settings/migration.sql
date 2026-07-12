-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "instagramUrl" TEXT DEFAULT 'https://www.instagram.com/joseem2611/',
ADD COLUMN     "whatsappNumber" TEXT DEFAULT '51975026835';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarBase64" TEXT;
