import express, { Request, Response } from 'express';
import { db } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import {
  progressReviewTemplates,
  progressReviews,
  progressReviewParticipants,
  progressReviewActionItems,
  progressReviewDocuments,
  apprentices,
  users,
  documents,
  insertProgressReviewTemplateSchema,
  insertProgressReviewSchema,
  insertProgressReviewParticipantSchema,
  insertProgressReviewActionItemSchema,
  insertProgressReviewDocumentSchema,
} from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Permission middleware for progress reviews
const canManageProgressReviews = async (req: Request, res: Response, next: Function) => {
  const user = req.user as any;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check if user has necessary permissions
  const hasPermission = await db.query.rolePermissions.findFirst({
    where: and(
      eq('roleId', user.roleId),
      eq('permissionId', 14) // Assuming 14 is the ID for manage_progress_reviews permission
    ),
  });

  if (!hasPermission) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};

// API Routes for Progress Review Templates

// Get all templates
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await db
      .select()
      .from(progressReviewTemplates)
      .orderBy(desc(progressReviewTemplates.updatedAt));
    return res.json(templates);
  } catch (error) {
    console.error('Error fetching progress review templates:', error);
    return res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const template = await db.query.progressReviewTemplates.findFirst({
      where: eq(progressReviewTemplates.id, id),
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    return res.json(template);
  } catch (error) {
    console.error('Error fetching progress review template:', error);
    return res.status(500).json({ message: 'Failed to fetch template' });
  }
});

// Create template
router.post('/templates', canManageProgressReviews, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const validatedData = insertProgressReviewTemplateSchema.parse({
      ...req.body,
      createdBy: user.id,
    });

    const [template] = await db.insert(progressReviewTemplates).values(validatedData).returning();
    return res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating progress review template:', error);
    return res.status(500).json({ message: 'Failed to create template' });
  }
});

// Update template
router.put('/templates/:id', canManageProgressReviews, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if template exists
    const template = await db.query.progressReviewTemplates.findFirst({
      where: eq(progressReviewTemplates.id, id),
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const validatedData = insertProgressReviewTemplateSchema.parse({
      ...req.body,
      updatedAt: new Date(),
    });

    const [updatedTemplate] = await db
      .update(progressReviewTemplates)
      .set(validatedData)
      .where(eq(progressReviewTemplates.id, id))
      .returning();

    return res.json(updatedTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating progress review template:', error);
    return res.status(500).json({ message: 'Failed to update template' });
  }
});

// Delete template (soft delete by setting isActive to false)
router.delete('/templates/:id', canManageProgressReviews, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if template exists
    const template = await db.query.progressReviewTemplates.findFirst({
      where: eq(progressReviewTemplates.id, id),
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Soft delete by setting isActive to false
    await db
      .update(progressReviewTemplates)
      .set({ isActive: false })
      .where(eq(progressReviewTemplates.id, id));

    return res.json({ message: 'Template deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating progress review template:', error);
    return res.status(500).json({ message: 'Failed to deactivate template' });
  }
});

// API Routes for Progress Reviews

// Get all reviews or filter by apprentice/reviewer
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const { apprenticeId, reviewerId, status } = req.query;
    let query = db.select().from(progressReviews);

    if (apprenticeId) {
      query = query.where(eq(progressReviews.apprenticeId, parseInt(apprenticeId as string)));
    }

    if (reviewerId) {
      query = query.where(eq(progressReviews.reviewerId, parseInt(reviewerId as string)));
    }

    if (status) {
      query = query.where(eq(progressReviews.status, status as string));
    }

    const reviews = await query.orderBy(desc(progressReviews.reviewDate));

    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching progress reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Get single review with all related data
router.get('/reviews/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Fetch the review
    const review = await db.query.progressReviews.findFirst({
      where: eq(progressReviews.id, id),
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Fetch apprentice and reviewer data
    const apprentice = await db.query.apprentices.findFirst({
      where: eq(apprentices.id, review.apprenticeId),
    });

    const reviewer = await db.query.users.findFirst({
      where: eq(users.id, review.reviewerId),
    });

    // Fetch participants
    const participants = await db
      .select()
      .from(progressReviewParticipants)
      .where(eq(progressReviewParticipants.reviewId, id));

    // Fetch action items
    const actionItems = await db
      .select()
      .from(progressReviewActionItems)
      .where(eq(progressReviewActionItems.reviewId, id));

    // Fetch associated documents
    const documentLinks = await db
      .select()
      .from(progressReviewDocuments)
      .where(eq(progressReviewDocuments.reviewId, id));

    const documentIds = documentLinks.map(link => link.documentId);
    const reviewDocuments =
      documentIds.length > 0
        ? await db.select().from(documents).where(eq(documents.id, documentIds[0]))
        : [];

    return res.json({
      review,
      apprentice,
      reviewer,
      participants,
      actionItems,
      documents: reviewDocuments,
    });
  } catch (error) {
    console.error('Error fetching progress review details:', error);
    return res.status(500).json({ message: 'Failed to fetch review details' });
  }
});

// Create review
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const validatedData = insertProgressReviewSchema.parse({
      ...req.body,
      reviewerId: user.id, // Set current user as reviewer
      status: 'scheduled',
      reviewData: req.body.reviewData || {},
    });

    const [review] = await db.insert(progressReviews).values(validatedData).returning();

    // Add creator as a participant with role 'reviewer'
    await db.insert(progressReviewParticipants).values({
      reviewId: review.id,
      userId: user.id,
      role: 'reviewer',
      attendanceStatus: 'confirmed',
    });

    return res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating progress review:', error);
    return res.status(500).json({ message: 'Failed to create review' });
  }
});

// Update review
router.put('/reviews/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if review exists
    const review = await db.query.progressReviews.findFirst({
      where: eq(progressReviews.id, id),
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const validatedData = insertProgressReviewSchema
      .omit({
        createdAt: true,
        updatedAt: true,
      })
      .parse({
        ...req.body,
        updatedAt: new Date(),
      });

    const [updatedReview] = await db
      .update(progressReviews)
      .set(validatedData)
      .where(eq(progressReviews.id, id))
      .returning();

    return res.json(updatedReview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating progress review:', error);
    return res.status(500).json({ message: 'Failed to update review' });
  }
});

// Delete review
router.delete('/reviews/:id', canManageProgressReviews, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if review exists
    const review = await db.query.progressReviews.findFirst({
      where: eq(progressReviews.id, id),
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update status to 'cancelled' instead of deleting
    await db.update(progressReviews).set({ status: 'cancelled' }).where(eq(progressReviews.id, id));

    return res.json({ message: 'Review cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling progress review:', error);
    return res.status(500).json({ message: 'Failed to cancel review' });
  }
});

// API Routes for Progress Review Participants

// Add participant to review
router.post('/reviews/:reviewId/participants', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    // Check if review exists
    const review = await db.query.progressReviews.findFirst({
      where: eq(progressReviews.id, reviewId),
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const validatedData = insertProgressReviewParticipantSchema.parse({
      ...req.body,
      reviewId,
    });

    const [participant] = await db
      .insert(progressReviewParticipants)
      .values(validatedData)
      .returning();

    return res.status(201).json(participant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error adding participant to progress review:', error);
    return res.status(500).json({ message: 'Failed to add participant' });
  }
});

// Update participant status
router.put('/participants/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if participant exists
    const participant = await db.query.progressReviewParticipants.findFirst({
      where: eq(progressReviewParticipants.id, id),
    });

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const { attendanceStatus, notes } = req.body;

    const [updatedParticipant] = await db
      .update(progressReviewParticipants)
      .set({ attendanceStatus, notes })
      .where(eq(progressReviewParticipants.id, id))
      .returning();

    return res.json(updatedParticipant);
  } catch (error) {
    console.error('Error updating participant status:', error);
    return res.status(500).json({ message: 'Failed to update participant status' });
  }
});

// Remove participant
router.delete(
  '/participants/:id',
  canManageProgressReviews,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      // Check if participant exists
      const participant = await db.query.progressReviewParticipants.findFirst({
        where: eq(progressReviewParticipants.id, id),
      });

      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }

      await db.delete(progressReviewParticipants).where(eq(progressReviewParticipants.id, id));

      return res.json({ message: 'Participant removed successfully' });
    } catch (error) {
      console.error('Error removing participant:', error);
      return res.status(500).json({ message: 'Failed to remove participant' });
    }
  }
);

// API Routes for Progress Review Action Items

// Add action item to review
router.post('/reviews/:reviewId/action-items', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const user = req.user as any;

    // Check if review exists
    const review = await db.query.progressReviews.findFirst({
      where: eq(progressReviews.id, reviewId),
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const validatedData = insertProgressReviewActionItemSchema.parse({
      ...req.body,
      reviewId,
      createdBy: user.id,
    });

    const [actionItem] = await db
      .insert(progressReviewActionItems)
      .values(validatedData)
      .returning();

    return res.status(201).json(actionItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error adding action item:', error);
    return res.status(500).json({ message: 'Failed to add action item' });
  }
});

// Update action item
router.put('/action-items/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if action item exists
    const actionItem = await db.query.progressReviewActionItems.findFirst({
      where: eq(progressReviewActionItems.id, id),
    });

    if (!actionItem) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    // Mark as completed if the status is changing to completed
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    if (req.body.status === 'completed' && actionItem.status !== 'completed') {
      updateData.completionDate = new Date();
    }

    const [updatedActionItem] = await db
      .update(progressReviewActionItems)
      .set(updateData)
      .where(eq(progressReviewActionItems.id, id))
      .returning();

    return res.json(updatedActionItem);
  } catch (error) {
    console.error('Error updating action item:', error);
    return res.status(500).json({ message: 'Failed to update action item' });
  }
});

// Delete action item
router.delete(
  '/action-items/:id',
  canManageProgressReviews,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      // Check if action item exists
      const actionItem = await db.query.progressReviewActionItems.findFirst({
        where: eq(progressReviewActionItems.id, id),
      });

      if (!actionItem) {
        return res.status(404).json({ message: 'Action item not found' });
      }

      await db.delete(progressReviewActionItems).where(eq(progressReviewActionItems.id, id));

      return res.json({ message: 'Action item deleted successfully' });
    } catch (error) {
      console.error('Error deleting action item:', error);
      return res.status(500).json({ message: 'Failed to delete action item' });
    }
  }
);

// API Routes for Progress Review Documents

// Link document to review
router.post('/reviews/:reviewId/documents', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.reviewId);

    // Check if review exists
    const review = await db.query.progressReviews.findFirst({
      where: eq(progressReviews.id, reviewId),
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const validatedData = insertProgressReviewDocumentSchema.parse({
      ...req.body,
      reviewId,
    });

    const [document] = await db.insert(progressReviewDocuments).values(validatedData).returning();

    return res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error linking document:', error);
    return res.status(500).json({ message: 'Failed to link document' });
  }
});

// Remove document link
router.delete('/documents/:id', canManageProgressReviews, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if document link exists
    const documentLink = await db.query.progressReviewDocuments.findFirst({
      where: eq(progressReviewDocuments.id, id),
    });

    if (!documentLink) {
      return res.status(404).json({ message: 'Document link not found' });
    }

    await db.delete(progressReviewDocuments).where(eq(progressReviewDocuments.id, id));

    return res.json({ message: 'Document unlinked successfully' });
  } catch (error) {
    console.error('Error unlinking document:', error);
    return res.status(500).json({ message: 'Failed to unlink document' });
  }
});

// Get upcoming reviews for dashboard
router.get('/dashboard/upcoming', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    // Get reviews where current user is the reviewer or a participant
    const reviewerReviews = await db
      .select()
      .from(progressReviews)
      .where(and(eq(progressReviews.reviewerId, user.id), eq(progressReviews.status, 'scheduled')))
      .orderBy(progressReviews.scheduledDate)
      .limit(5);

    const participantReviews = await db
      .select()
      .from(progressReviewParticipants)
      .innerJoin(progressReviews, eq(progressReviewParticipants.reviewId, progressReviews.id))
      .where(
        and(eq(progressReviewParticipants.userId, user.id), eq(progressReviews.status, 'scheduled'))
      )
      .orderBy(progressReviews.scheduledDate)
      .limit(5);

    // Combine and deduplicate
    const allReviews = [...reviewerReviews, ...participantReviews.map(p => p.progress_reviews)];
    const uniqueReviews = allReviews
      .filter((review, index, self) => index === self.findIndex(r => r.id === review.id))
      .slice(0, 5);

    return res.json(uniqueReviews);
  } catch (error) {
    console.error('Error fetching upcoming reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch upcoming reviews' });
  }
});

// Get review stats for dashboard
router.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    // Count reviews by status
    const counts = await Promise.all([
      db
        .select({ count: db.fn.count() })
        .from(progressReviews)
        .where(eq(progressReviews.status, 'scheduled')),
      db
        .select({ count: db.fn.count() })
        .from(progressReviews)
        .where(eq(progressReviews.status, 'in_progress')),
      db
        .select({ count: db.fn.count() })
        .from(progressReviews)
        .where(eq(progressReviews.status, 'completed')),
      db
        .select({ count: db.fn.count() })
        .from(progressReviews)
        .where(eq(progressReviews.status, 'cancelled')),
    ]);

    // Count action items by status
    const actionItemCounts = await Promise.all([
      db
        .select({ count: db.fn.count() })
        .from(progressReviewActionItems)
        .where(eq(progressReviewActionItems.status, 'pending')),
      db
        .select({ count: db.fn.count() })
        .from(progressReviewActionItems)
        .where(eq(progressReviewActionItems.status, 'in_progress')),
      db
        .select({ count: db.fn.count() })
        .from(progressReviewActionItems)
        .where(eq(progressReviewActionItems.status, 'completed')),
      db
        .select({ count: db.fn.count() })
        .from(progressReviewActionItems)
        .where(eq(progressReviewActionItems.status, 'cancelled')),
    ]);

    return res.json({
      reviews: {
        scheduled: Number(counts[0][0].count),
        inProgress: Number(counts[1][0].count),
        completed: Number(counts[2][0].count),
        cancelled: Number(counts[3][0].count),
      },
      actionItems: {
        pending: Number(actionItemCounts[0][0].count),
        inProgress: Number(actionItemCounts[1][0].count),
        completed: Number(actionItemCounts[2][0].count),
        cancelled: Number(actionItemCounts[3][0].count),
      },
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return res.status(500).json({ message: 'Failed to fetch review stats' });
  }
});

export default router;
