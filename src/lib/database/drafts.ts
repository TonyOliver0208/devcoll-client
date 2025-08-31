// This is a utility file to help you integrate with a real database
// Replace the Map-based storage in the API route with these functions

export interface QuestionDraft {
  id?: string;
  userId: string;
  title: string;
  content: any;
  contentHtml: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Example implementation using Prisma (you'll need to adapt to your database)
/*
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function saveDraftToDatabase(userId: string, draft: Partial<QuestionDraft>): Promise<QuestionDraft> {
  return await prisma.questionDraft.upsert({
    where: {
      userId: userId,
    },
    update: {
      title: draft.title || '',
      content: draft.content || null,
      contentHtml: draft.contentHtml || '',
      tags: draft.tags || [],
      updatedAt: new Date(),
    },
    create: {
      userId: userId,
      title: draft.title || '',
      content: draft.content || null,
      contentHtml: draft.contentHtml || '',
      tags: draft.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function getDraftFromDatabase(userId: string): Promise<QuestionDraft | null> {
  return await prisma.questionDraft.findUnique({
    where: {
      userId: userId,
    },
  });
}

export async function deleteDraftFromDatabase(userId: string): Promise<boolean> {
  try {
    await prisma.questionDraft.delete({
      where: {
        userId: userId,
      },
    });
    return true;
  } catch (error) {
    // Draft might not exist
    return false;
  }
}
*/

// Example Prisma schema for the question drafts table:
/*
model QuestionDraft {
  id          String   @id @default(cuid())
  userId      String   @unique
  title       String   @default("")
  content     Json?
  contentHtml String   @default("")
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("question_drafts")
}
*/

// For SQLite/PostgreSQL direct queries:
/*
CREATE TABLE question_drafts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL UNIQUE,
  title TEXT DEFAULT '',
  content TEXT,
  content_html TEXT DEFAULT '',
  tags TEXT, -- JSON array as string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
*/

// Mock functions that match your current Map-based implementation
// You can replace these with real database calls
export class DraftService {
  private static drafts = new Map<string, QuestionDraft>();

  static async saveDraft(userId: string, draft: Partial<QuestionDraft>): Promise<QuestionDraft> {
    const existingDraft = this.drafts.get(userId);
    
    const savedDraft: QuestionDraft = {
      id: existingDraft?.id || `draft_${Date.now()}`,
      userId,
      title: draft.title || '',
      content: draft.content || null,
      contentHtml: draft.contentHtml || '',
      tags: draft.tags || [],
      createdAt: existingDraft?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.drafts.set(userId, savedDraft);
    return savedDraft;
  }

  static async getDraft(userId: string): Promise<QuestionDraft | null> {
    return this.drafts.get(userId) || null;
  }

  static async deleteDraft(userId: string): Promise<boolean> {
    return this.drafts.delete(userId);
  }

  static async getAllDrafts(): Promise<QuestionDraft[]> {
    return Array.from(this.drafts.values());
  }
}
