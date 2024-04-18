/*
  Warnings:

  - You are about to drop the column `link` on the `Item` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "ownerUsername" TEXT NOT NULL,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("author", "categoryId", "genre", "id", "ownerUsername", "title", "year") SELECT "author", "categoryId", "genre", "id", "ownerUsername", "title", "year" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_author_title_year_ownerUsername_key" ON "Item"("author", "title", "year", "ownerUsername");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
