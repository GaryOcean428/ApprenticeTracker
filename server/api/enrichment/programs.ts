import { Request, Response } from 'express';
import { db } from '../../db';
import { enrichmentPrograms, enrichmentParticipants } from '@shared/schema';
import { eq, count, and, SQL, sql } from 'drizzle-orm';

/**
 * Get all enrichment programs with participant counts
 * @route GET /api/enrichment/programs
 */
export async function getEnrichmentPrograms(req: Request, res: Response) {
  try {
    // Join with the participants table to get the count
    const programsData = await db
      .select({
        id: enrichmentPrograms.id,
        name: enrichmentPrograms.name,
        description: enrichmentPrograms.description,
        category: enrichmentPrograms.category,
        status: enrichmentPrograms.status,
        startDate: enrichmentPrograms.startDate,
        endDate: enrichmentPrograms.endDate,
        tags: enrichmentPrograms.tags,
        participantCount: count(enrichmentParticipants.id).as('participantCount'),
      })
      .from(enrichmentPrograms)
      .leftJoin(enrichmentParticipants, eq(enrichmentPrograms.id, enrichmentParticipants.programId))
      .groupBy(enrichmentPrograms.id);

    return res.status(200).json(programsData);
  } catch (error) {
    console.error('Error fetching enrichment programs:', error);
    return res.status(500).json({ message: 'Failed to fetch enrichment programs' });
  }
}

/**
 * Get a specific enrichment program with participants
 * @route GET /api/enrichment/programs/:id
 */
export async function getEnrichmentProgram(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Program ID is required' });
  }

  try {
    // Get the program details
    const [program] = await db
      .select()
      .from(enrichmentPrograms)
      .where(eq(enrichmentPrograms.id, parseInt(id)));

    if (!program) {
      return res.status(404).json({ message: 'Enrichment program not found' });
    }

    // Get the program participants
    const participants = await db
      .select({
        id: enrichmentParticipants.id,
        apprenticeId: enrichmentParticipants.apprenticeId,
        enrollmentDate: enrichmentParticipants.enrollmentDate,
        status: enrichmentParticipants.status,
        completionDate: enrichmentParticipants.completionDate,
        notes: enrichmentParticipants.notes,
      })
      .from(enrichmentParticipants)
      .where(eq(enrichmentParticipants.programId, parseInt(id)));

    // Combine the program details with the participants
    const result = {
      ...program,
      participants,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching enrichment program:', error);
    return res.status(500).json({ message: 'Failed to fetch enrichment program' });
  }
}

/**
 * Create a new enrichment program
 * @route POST /api/enrichment/programs
 */
export async function createEnrichmentProgram(req: Request, res: Response) {
  const { name, description, category, status, startDate, endDate, tags } = req.body;

  // Validate required fields
  if (!name || !description || !category || !status || !startDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Create the program
    const [newProgram] = await db
      .insert(enrichmentPrograms)
      .values({
        name,
        description,
        category,
        status,
        startDate,
        endDate: endDate || null,
        tags: tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return res.status(201).json(newProgram);
  } catch (error) {
    console.error('Error creating enrichment program:', error);
    return res.status(500).json({ message: 'Failed to create enrichment program' });
  }
}

/**
 * Update an existing enrichment program
 * @route PATCH /api/enrichment/programs/:id
 */
export async function updateEnrichmentProgram(req: Request, res: Response) {
  const { id } = req.params;
  const { name, description, category, status, startDate, endDate, tags } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Program ID is required' });
  }

  try {
    // Check if the program exists
    const [existingProgram] = await db
      .select({ id: enrichmentPrograms.id })
      .from(enrichmentPrograms)
      .where(eq(enrichmentPrograms.id, parseInt(id)));

    if (!existingProgram) {
      return res.status(404).json({ message: 'Enrichment program not found' });
    }

    // Update the program
    const [updatedProgram] = await db
      .update(enrichmentPrograms)
      .set({
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(status && { status }),
        ...(startDate && { startDate }),
        endDate: endDate === undefined ? undefined : endDate || null,
        ...(tags && { tags }),
        updatedAt: new Date(),
      })
      .where(eq(enrichmentPrograms.id, parseInt(id)))
      .returning();

    return res.status(200).json(updatedProgram);
  } catch (error) {
    console.error('Error updating enrichment program:', error);
    return res.status(500).json({ message: 'Failed to update enrichment program' });
  }
}

/**
 * Delete an enrichment program
 * @route DELETE /api/enrichment/programs/:id
 */
export async function deleteEnrichmentProgram(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Program ID is required' });
  }

  try {
    // Check if the program exists
    const [existingProgram] = await db
      .select({ id: enrichmentPrograms.id })
      .from(enrichmentPrograms)
      .where(eq(enrichmentPrograms.id, parseInt(id)));

    if (!existingProgram) {
      return res.status(404).json({ message: 'Enrichment program not found' });
    }

    // Delete the program
    await db.delete(enrichmentPrograms).where(eq(enrichmentPrograms.id, parseInt(id)));

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting enrichment program:', error);
    return res.status(500).json({ message: 'Failed to delete enrichment program' });
  }
}
