import { Router } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  mentors,
  mentorAssignments,
  mentoringSessions,
  competencies,
  apprenticeCompetencies,
  apprenticeMilestones,
  performanceMetrics,
  communicationLog,
  trainingPlans,
  apprentices,
  users,
  insertMentorSchema,
  insertMentorAssignmentSchema,
  insertMentoringSessionSchema,
  insertApprenticeMilestoneSchema,
  insertPerformanceMetricSchema,
  insertCommunicationLogSchema,
  insertTrainingPlanSchema,
} from '@shared/schema';
import { db } from '../db';

const router = Router();

// ===== MENTORS MANAGEMENT =====

// Get all mentors
router.get('/mentors', async (req, res) => {
  try {
    const allMentors = await db.select().from(mentors).orderBy(mentors.lastName);
    res.json(allMentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

// Get mentor by ID with their assignments
router.get('/mentors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mentor = await db.select().from(mentors).where(eq(mentors.id, id)).limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Get mentor's current assignments with apprentice details
    const assignments = await db
      .select({
        assignment: mentorAssignments,
        apprentice: apprentices,
      })
      .from(mentorAssignments)
      .leftJoin(apprentices, eq(mentorAssignments.apprenticeId, apprentices.id))
      .where(eq(mentorAssignments.mentorId, id))
      .orderBy(desc(mentorAssignments.createdAt));

    res.json({ ...mentor[0], assignments });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ error: 'Failed to fetch mentor' });
  }
});

// Create new mentor
router.post('/mentors', async (req, res) => {
  try {
    const mentorData = insertMentorSchema.parse(req.body);
    const [mentor] = await db.insert(mentors).values(mentorData).returning();
    res.status(201).json(mentor);
  } catch (error) {
    console.error('Error creating mentor:', error);
    res.status(400).json({ error: 'Failed to create mentor' });
  }
});

// Update mentor
router.patch('/mentors/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const mentorData = req.body;

    const [updatedMentor] = await db
      .update(mentors)
      .set({ ...mentorData, updatedAt: new Date() })
      .where(eq(mentors.id, id))
      .returning();

    if (!updatedMentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json(updatedMentor);
  } catch (error) {
    console.error('Error updating mentor:', error);
    res.status(400).json({ error: 'Failed to update mentor' });
  }
});

// ===== MENTOR ASSIGNMENTS =====

// Get assignments for an apprentice
router.get('/apprentices/:id/mentors', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);

    const assignments = await db
      .select({
        assignment: mentorAssignments,
        mentor: mentors,
      })
      .from(mentorAssignments)
      .leftJoin(mentors, eq(mentorAssignments.mentorId, mentors.id))
      .where(eq(mentorAssignments.apprenticeId, apprenticeId))
      .orderBy(desc(mentorAssignments.createdAt));

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching apprentice mentors:', error);
    res.status(500).json({ error: 'Failed to fetch apprentice mentors' });
  }
});

// Assign mentor to apprentice
router.post('/mentor-assignments', async (req, res) => {
  try {
    const assignmentData = insertMentorAssignmentSchema.parse(req.body);
    const [assignment] = await db.insert(mentorAssignments).values(assignmentData).returning();
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating mentor assignment:', error);
    res.status(400).json({ error: 'Failed to create mentor assignment' });
  }
});

// Update mentor assignment status
router.patch('/mentor-assignments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, endDate, notes } = req.body;

    const [updatedAssignment] = await db
      .update(mentorAssignments)
      .set({ status, endDate, notes, updatedAt: new Date() })
      .where(eq(mentorAssignments.id, id))
      .returning();

    if (!updatedAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating mentor assignment:', error);
    res.status(400).json({ error: 'Failed to update mentor assignment' });
  }
});

// ===== MENTORING SESSIONS =====

// Get mentoring sessions for an assignment
router.get('/mentor-assignments/:id/sessions', async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);

    const sessions = await db
      .select()
      .from(mentoringSessions)
      .where(eq(mentoringSessions.assignmentId, assignmentId))
      .orderBy(desc(mentoringSessions.sessionDate));

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching mentoring sessions:', error);
    res.status(500).json({ error: 'Failed to fetch mentoring sessions' });
  }
});

// Get all mentoring sessions for an apprentice
router.get('/apprentices/:id/mentoring-sessions', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);

    const sessions = await db
      .select({
        session: mentoringSessions,
        assignment: mentorAssignments,
        mentor: mentors,
      })
      .from(mentoringSessions)
      .leftJoin(mentorAssignments, eq(mentoringSessions.assignmentId, mentorAssignments.id))
      .leftJoin(mentors, eq(mentorAssignments.mentorId, mentors.id))
      .where(eq(mentorAssignments.apprenticeId, apprenticeId))
      .orderBy(desc(mentoringSessions.sessionDate));

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching apprentice mentoring sessions:', error);
    res.status(500).json({ error: 'Failed to fetch apprentice mentoring sessions' });
  }
});

// Create mentoring session
router.post('/mentoring-sessions', async (req, res) => {
  try {
    const sessionData = insertMentoringSessionSchema.parse(req.body);
    const [session] = await db.insert(mentoringSessions).values(sessionData).returning();
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating mentoring session:', error);
    res.status(400).json({ error: 'Failed to create mentoring session' });
  }
});

// ===== COMPETENCY TRACKING =====

// Get all competencies
router.get('/competencies', async (req, res) => {
  try {
    const { tradeArea, category } = req.query;

    let query = db.select().from(competencies).where(eq(competencies.isActive, true));

    if (tradeArea) {
      query = query.where(eq(competencies.tradeArea, tradeArea as string));
    }

    if (category) {
      query = query.where(eq(competencies.category, category as string));
    }

    const allCompetencies = await query.orderBy(competencies.code);
    res.json(allCompetencies);
  } catch (error) {
    console.error('Error fetching competencies:', error);
    res.status(500).json({ error: 'Failed to fetch competencies' });
  }
});

// Get apprentice competency progress
router.get('/apprentices/:id/competencies', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);

    const competencyProgress = await db
      .select({
        progress: apprenticeCompetencies,
        competency: competencies,
      })
      .from(apprenticeCompetencies)
      .leftJoin(competencies, eq(apprenticeCompetencies.competencyId, competencies.id))
      .where(eq(apprenticeCompetencies.apprenticeId, apprenticeId))
      .orderBy(competencies.code);

    res.json(competencyProgress);
  } catch (error) {
    console.error('Error fetching apprentice competencies:', error);
    res.status(500).json({ error: 'Failed to fetch apprentice competencies' });
  }
});

// Update apprentice competency progress
router.patch('/apprentice-competencies/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const progressData = req.body;

    const [updatedProgress] = await db
      .update(apprenticeCompetencies)
      .set({ ...progressData, lastUpdated: new Date() })
      .where(eq(apprenticeCompetencies.id, id))
      .returning();

    if (!updatedProgress) {
      return res.status(404).json({ error: 'Competency progress not found' });
    }

    res.json(updatedProgress);
  } catch (error) {
    console.error('Error updating competency progress:', error);
    res.status(400).json({ error: 'Failed to update competency progress' });
  }
});

// ===== MILESTONES & ACHIEVEMENTS =====

// Get apprentice milestones
router.get('/apprentices/:id/milestones', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);

    const milestones = await db
      .select()
      .from(apprenticeMilestones)
      .where(eq(apprenticeMilestones.apprenticeId, apprenticeId))
      .orderBy(apprenticeMilestones.targetDate);

    res.json(milestones);
  } catch (error) {
    console.error('Error fetching apprentice milestones:', error);
    res.status(500).json({ error: 'Failed to fetch apprentice milestones' });
  }
});

// Create milestone
router.post('/apprentice-milestones', async (req, res) => {
  try {
    const milestoneData = insertApprenticeMilestoneSchema.parse(req.body);
    const [milestone] = await db.insert(apprenticeMilestones).values(milestoneData).returning();
    res.status(201).json(milestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(400).json({ error: 'Failed to create milestone' });
  }
});

// Update milestone status
router.patch('/apprentice-milestones/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const milestoneData = req.body;

    const [updatedMilestone] = await db
      .update(apprenticeMilestones)
      .set({ ...milestoneData, updatedAt: new Date() })
      .where(eq(apprenticeMilestones.id, id))
      .returning();

    if (!updatedMilestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(updatedMilestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(400).json({ error: 'Failed to update milestone' });
  }
});

// ===== PERFORMANCE ANALYTICS =====

// Get apprentice performance metrics
router.get('/apprentices/:id/performance', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);
    const { startDate, endDate, metricType } = req.query;

    let query = db
      .select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.apprenticeId, apprenticeId));

    if (startDate) {
      query = query.where(sql`${performanceMetrics.periodStart} >= ${startDate}`);
    }

    if (endDate) {
      query = query.where(sql`${performanceMetrics.periodEnd} <= ${endDate}`);
    }

    if (metricType) {
      query = query.where(eq(performanceMetrics.metricType, metricType as string));
    }

    const metrics = await query.orderBy(desc(performanceMetrics.periodStart));
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Create performance metric
router.post('/performance-metrics', async (req, res) => {
  try {
    const metricData = insertPerformanceMetricSchema.parse(req.body);
    const [metric] = await db.insert(performanceMetrics).values(metricData).returning();
    res.status(201).json(metric);
  } catch (error) {
    console.error('Error creating performance metric:', error);
    res.status(400).json({ error: 'Failed to create performance metric' });
  }
});

// ===== TRAINING PLANS =====

// Get apprentice training plan
router.get('/apprentices/:id/training-plan', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);

    const trainingPlan = await db
      .select()
      .from(trainingPlans)
      .where(and(eq(trainingPlans.apprenticeId, apprenticeId), eq(trainingPlans.status, 'active')))
      .limit(1);

    res.json(trainingPlan[0] || null);
  } catch (error) {
    console.error('Error fetching training plan:', error);
    res.status(500).json({ error: 'Failed to fetch training plan' });
  }
});

// Create or update training plan
router.post('/training-plans', async (req, res) => {
  try {
    const planData = insertTrainingPlanSchema.parse(req.body);
    const [plan] = await db.insert(trainingPlans).values(planData).returning();
    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating training plan:', error);
    res.status(400).json({ error: 'Failed to create training plan' });
  }
});

// Update training plan progress
router.patch('/training-plans/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const planData = req.body;

    const [updatedPlan] = await db
      .update(trainingPlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(trainingPlans.id, id))
      .returning();

    if (!updatedPlan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating training plan:', error);
    res.status(400).json({ error: 'Failed to update training plan' });
  }
});

// ===== COMMUNICATION LOG =====

// Get communication log for an apprentice
router.get('/apprentices/:id/communications', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);

    const communications = await db
      .select({
        communication: communicationLog,
        fromUser: users,
        toUser: users,
      })
      .from(communicationLog)
      .leftJoin(users, eq(communicationLog.fromUserId, users.id))
      .leftJoin(users, eq(communicationLog.toUserId, users.id))
      .where(eq(communicationLog.apprenticeId, apprenticeId))
      .orderBy(desc(communicationLog.createdAt));

    res.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Create communication log entry
router.post('/communications', async (req, res) => {
  try {
    const communicationData = insertCommunicationLogSchema.parse(req.body);
    const [communication] = await db.insert(communicationLog).values(communicationData).returning();
    res.status(201).json(communication);
  } catch (error) {
    console.error('Error creating communication log:', error);
    res.status(400).json({ error: 'Failed to create communication log' });
  }
});

export { router as apprenticeMentoringRouter };
