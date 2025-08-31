import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DraftService } from '@/lib/database/drafts';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const draft = await DraftService.getDraft(session.user.id);
    
    if (!draft) {
      return NextResponse.json(
        { data: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      data: {
        title: draft.title,
        content: draft.content,
        contentHtml: draft.contentHtml,
        tags: draft.tags,
        updatedAt: draft.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, contentHtml, tags } = body;

    // Validate input
    if (!title && !contentHtml && (!tags || tags.length === 0)) {
      return NextResponse.json(
        { error: 'At least one field (title, content, or tags) is required' },
        { status: 400 }
      );
    }

    // Save draft using the service
    const savedDraft = await DraftService.saveDraft(session.user.id, {
      title: title || '',
      content: content || null,
      contentHtml: contentHtml || '',
      tags: tags || [],
    });

    return NextResponse.json({
      message: 'Draft saved successfully',
      updatedAt: savedDraft.updatedAt
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete draft
    const existed = await DraftService.deleteDraft(session.user.id);

    return NextResponse.json({
      message: existed ? 'Draft discarded successfully' : 'No draft found',
      existed
    });

  } catch (error) {
    console.error('Error discarding draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
