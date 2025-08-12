import type { Request, Response } from 'express';
import { timesheets, apprentices, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db';

/**
 * Get all timesheets with apprentice and approver information
 * @route GET /api/payroll/timesheets
 */
export async function getTimesheets(req: Request, res: Response) {
  try {
    // Join with the apprentices table to get the apprentice name
    // Also join with the users table to get the approver name
    const timesheetData = await db
      .select({
        id: timesheets.id,
        apprenticeId: timesheets.apprenticeId,
        apprenticeName: sql<string>`CONCAT(${apprentices.firstName}, ' ', ${apprentices.lastName})`,
        weekStarting: timesheets.weekStarting,
        // Calculate weekEnding by adding 6 days to weekStarting
        weekEnding: sql<string>`(${timesheets.weekStarting}::date + interval '6 days')::text`,
        status: timesheets.status,
        totalHours: timesheets.totalHours,
        submittedDate: timesheets.submittedDate,
        // Get the approver name from the users table
        approvedByName: sql<
          string | null
        >`CASE WHEN ${timesheets.approvedBy} IS NOT NULL THEN CONCAT(${users.firstName}, ' ', ${users.lastName}) ELSE NULL END`,
        approvalDate: timesheets.approvalDate,
      })
      .from(timesheets)
      .leftJoin(apprentices, eq(timesheets.apprenticeId, apprentices.id))
      .leftJoin(users, eq(timesheets.approvedBy, users.id));

    return res.status(200).json(timesheetData);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return res.status(500).json({ message: 'Failed to fetch timesheets' });
  }
}

/**
 * Get a specific timesheet
 * @route GET /api/payroll/timesheets/:id
 */
export async function getTimesheet(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Timesheet ID is required' });
  }

  try {
    const [timesheet] = await db
      .select({
        id: timesheets.id,
        apprenticeId: timesheets.apprenticeId,
        apprenticeName: sql<string>`CONCAT(${apprentices.firstName}, ' ', ${apprentices.lastName})`,
        weekStarting: timesheets.weekStarting,
        weekEnding: sql<string>`(${timesheets.weekStarting}::date + interval '6 days')::text`,
        status: timesheets.status,
        totalHours: timesheets.totalHours,
        submittedDate: timesheets.submittedDate,
        approvedByName: sql<
          string | null
        >`CASE WHEN ${timesheets.approvedBy} IS NOT NULL THEN CONCAT(${users.firstName}, ' ', ${users.lastName}) ELSE NULL END`,
        approvalDate: timesheets.approvalDate,
      })
      .from(timesheets)
      .leftJoin(apprentices, eq(timesheets.apprenticeId, apprentices.id))
      .leftJoin(users, eq(timesheets.approvedBy, users.id))
      .where(eq(timesheets.id, parseInt(id)));

    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    return res.status(200).json(timesheet);
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    return res.status(500).json({ message: 'Failed to fetch timesheet' });
  }
}

/**
 * Approve a timesheet
 * @route PATCH /api/payroll/timesheets/:id/approve
 */
export async function approveTimesheet(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id; // Assuming the authenticated user ID is available in req.user

  if (!id) {
    return res.status(400).json({ message: 'Timesheet ID is required' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User must be authenticated' });
  }

  try {
    // Check if the timesheet exists
    const [existingTimesheet] = await db
      .select({ id: timesheets.id, status: timesheets.status })
      .from(timesheets)
      .where(eq(timesheets.id, parseInt(id)));

    if (!existingTimesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    // Check if the timesheet is in a status that can be approved
    if (existingTimesheet.status !== 'submitted') {
      return res.status(400).json({
        message: 'Only submitted timesheets can be approved',
        currentStatus: existingTimesheet.status,
      });
    }

    // Update the timesheet status
    const [updatedTimesheet] = await db
      .update(timesheets)
      .set({
        status: 'approved',
        approvedBy: userId,
        approvalDate: new Date(),
      })
      .where(eq(timesheets.id, parseInt(id)))
      .returning();

    // Get the full timesheet details with apprentice name
    const [fullTimesheet] = await db
      .select({
        id: timesheets.id,
        apprenticeId: timesheets.apprenticeId,
        apprenticeName: sql<string>`CONCAT(${apprentices.firstName}, ' ', ${apprentices.lastName})`,
        weekStarting: timesheets.weekStarting,
        weekEnding: sql<string>`(${timesheets.weekStarting}::date + interval '6 days')::text`,
        status: timesheets.status,
        totalHours: timesheets.totalHours,
        submittedDate: timesheets.submittedDate,
        approvedByName: sql<
          string | null
        >`CASE WHEN ${timesheets.approvedBy} IS NOT NULL THEN CONCAT(${users.firstName}, ' ', ${users.lastName}) ELSE NULL END`,
        approvalDate: timesheets.approvalDate,
      })
      .from(timesheets)
      .leftJoin(apprentices, eq(timesheets.apprenticeId, apprentices.id))
      .leftJoin(users, eq(timesheets.approvedBy, users.id))
      .where(eq(timesheets.id, parseInt(id)));

    return res.status(200).json(fullTimesheet);
  } catch (error) {
    console.error('Error approving timesheet:', error);
    return res.status(500).json({ message: 'Failed to approve timesheet' });
  }
}

/**
 * Reject a timesheet
 * @route PATCH /api/payroll/timesheets/:id/reject
 */
export async function rejectTimesheet(req: Request, res: Response) {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  const userId = req.user?.id; // Assuming the authenticated user ID is available in req.user

  if (!id) {
    return res.status(400).json({ message: 'Timesheet ID is required' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User must be authenticated' });
  }

  if (!rejectionReason) {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  try {
    // Check if the timesheet exists
    const [existingTimesheet] = await db
      .select({ id: timesheets.id, status: timesheets.status })
      .from(timesheets)
      .where(eq(timesheets.id, parseInt(id)));

    if (!existingTimesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }

    // Check if the timesheet is in a status that can be rejected
    if (existingTimesheet.status !== 'submitted') {
      return res.status(400).json({
        message: 'Only submitted timesheets can be rejected',
        currentStatus: existingTimesheet.status,
      });
    }

    // Update the timesheet status
    const [updatedTimesheet] = await db
      .update(timesheets)
      .set({
        status: 'rejected',
        notes: rejectionReason,
      })
      .where(eq(timesheets.id, parseInt(id)))
      .returning();

    // Get the full timesheet details with apprentice name
    const [fullTimesheet] = await db
      .select({
        id: timesheets.id,
        apprenticeId: timesheets.apprenticeId,
        apprenticeName: sql<string>`CONCAT(${apprentices.firstName}, ' ', ${apprentices.lastName})`,
        weekStarting: timesheets.weekStarting,
        weekEnding: sql<string>`(${timesheets.weekStarting}::date + interval '6 days')::text`,
        status: timesheets.status,
        totalHours: timesheets.totalHours,
        submittedDate: timesheets.submittedDate,
        approvedByName: sql<
          string | null
        >`CASE WHEN ${timesheets.approvedBy} IS NOT NULL THEN CONCAT(${users.firstName}, ' ', ${users.lastName}) ELSE NULL END`,
        approvalDate: timesheets.approvalDate,
        notes: timesheets.notes,
      })
      .from(timesheets)
      .leftJoin(apprentices, eq(timesheets.apprenticeId, apprentices.id))
      .leftJoin(users, eq(timesheets.approvedBy, users.id))
      .where(eq(timesheets.id, parseInt(id)));

    return res.status(200).json(fullTimesheet);
  } catch (error) {
    console.error('Error rejecting timesheet:', error);
    return res.status(500).json({ message: 'Failed to reject timesheet' });
  }
}
