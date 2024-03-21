/*
  Warnings:

  - You are about to drop the column `data` on the `Item` table. All the data in the column will be lost.
  - Added the required column `itemId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    CONSTRAINT "File_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_File" ("fileName", "filePath", "id", "mimeType", "originalName") SELECT "fileName", "filePath", "id", "mimeType", "originalName" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_itemId_key" ON "File"("itemId");
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "link" TEXT,
    "ownerUsername" TEXT NOT NULL,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("author", "categoryId", "genre", "id", "link", "ownerUsername", "title", "year") SELECT "author", "categoryId", "genre", "id", "link", "ownerUsername", "title", "year" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_author_title_year_ownerUsername_key" ON "Item"("author", "title", "year", "ownerUsername");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
