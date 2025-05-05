import { Router } from 'express';
import { db } from '../db';
import { 
  unitsOfCompetency,
  qualifications,
  qualificationStructure,
  apprenticeUnitProgress,
  apprenticeQualifications,
  apprentices,
  users,
  documents
} from '@shared/schema';
import { eq, and, sql, or, like } from 'drizzle-orm';
import { z } from 'zod';
import {
  insertUnitOfCompetencySchema, 
  insertQualificationSchema, 
  insertQualificationStructureSchema,
  insertApprenticeUnitProgressSchema,
  insertApprenticeQualificationSchema
} from '@shared/schema';
import {
  validateQuery,
  validateParams,
  validateBody,
  vetUnitSearchSchema,
  vetQualificationSearchSchema,
  vetIdParamSchema,
  vetQualUnitAssignSchema,
  vetUnitOrderSchema
} from '../utils/validation';

export const vetRouter = Router();

// ==========================================
// UNITS OF COMPETENCY
// ==========================================

// Get all units of competency
vetRouter.get('/units', validateQuery(vetUnitSearchSchema), async (req, res) => {
  try {
    // Support filtering by training package, status, and search term
    const trainingPackage = req.query.trainingPackage as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const search = req.query.search as string | undefined;
    
    let query = db.select().from(unitsOfCompetency);
    
    if (trainingPackage) {
      query = query.where(eq(unitsOfCompetency.trainingPackage, trainingPackage));
    }
    
    if (isActive !== undefined) {
      query = query.where(eq(unitsOfCompetency.isActive, isActive));
    }
    
    if (search) {
      // Use parameterized queries for search to prevent SQL injection
      query = query.where(
        or(
          like(unitsOfCompetency.unitCode, sql`CONCAT('%', ${search}, '%')`),
          like(unitsOfCompetency.unitTitle, sql`CONCAT('%', ${search}, '%')`)
        )
      );
    }
    
    const units = await query;
    
    res.json(units);
  } catch (error) {
    console.error('Error fetching units of competency:', error);
    res.status(500).json({ message: 'Error fetching units of competency' });
  }
});

// Get unit of competency by ID
vetRouter.get('/units/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [unit] = await db
      .select()
      .from(unitsOfCompetency)
      .where(eq(unitsOfCompetency.id, id));
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit of competency not found' });
    }
    
    res.json(unit);
  } catch (error) {
    console.error('Error fetching unit of competency:', error);
    res.status(500).json({ message: 'Error fetching unit of competency' });
  }
});

// Create unit of competency
vetRouter.post('/units', async (req, res) => {
  try {
    const data = insertUnitOfCompetencySchema.parse(req.body);
    const [unit] = await db
      .insert(unitsOfCompetency)
      .values(data)
      .returning();
    
    res.status(201).json(unit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error creating unit of competency:', error);
    res.status(500).json({ message: 'Error creating unit of competency' });
  }
});

// Update unit of competency
vetRouter.patch('/units/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    const [unit] = await db
      .update(unitsOfCompetency)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(unitsOfCompetency.id, id))
      .returning();
    
    if (!unit) {
      return res.status(404).json({ message: 'Unit of competency not found' });
    }
    
    res.json(unit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error updating unit of competency:', error);
    res.status(500).json({ message: 'Error updating unit of competency' });
  }
});

// ==========================================
// QUALIFICATIONS
// ==========================================

// Get all qualifications
vetRouter.get('/qualifications', validateQuery(vetQualificationSearchSchema), async (req, res) => {
  try {
    // Support filtering by training package, AQF level, and search term
    const trainingPackage = req.query.trainingPackage as string | undefined;
    const aqfLevel = req.query.aqfLevel as string | undefined;
    const isApprenticeshipQualification = req.query.isApprenticeshipQualification !== undefined 
      ? req.query.isApprenticeshipQualification === 'true' 
      : undefined;
    const search = req.query.search as string | undefined;
    
    let query = db.select().from(qualifications);
    
    if (trainingPackage) {
      query = query.where(eq(qualifications.trainingPackage, trainingPackage));
    }
    
    if (aqfLevel) {
      query = query.where(eq(qualifications.aqfLevel, aqfLevel));
    }
    
    if (isApprenticeshipQualification !== undefined) {
      query = query.where(eq(qualifications.isApprenticeshipQualification, isApprenticeshipQualification));
    }
    
    if (search) {
      // Use parameterized queries for search to prevent SQL injection
      query = query.where(
        or(
          like(qualifications.qualificationCode, sql`CONCAT('%', ${search}, '%')`),
          like(qualifications.qualificationTitle, sql`CONCAT('%', ${search}, '%')`)
        )
      );
    }
    
    const quals = await query;
    
    res.json(quals);
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    res.status(500).json({ message: 'Error fetching qualifications' });
  }
});

// Get qualification by ID
vetRouter.get('/qualifications/:id', validateParams(vetIdParamSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [qualification] = await db
      .select()
      .from(qualifications)
      .where(eq(qualifications.id, id));
    
    if (!qualification) {
      return res.status(404).json({ message: 'Qualification not found' });
    }
    
    // Get units for this qualification
    const qualificationUnits = await db
      .select({
        structure: qualificationStructure,
        unit: unitsOfCompetency
      })
      .from(qualificationStructure)
      .innerJoin(unitsOfCompetency, eq(qualificationStructure.unitId, unitsOfCompetency.id))
      .where(eq(qualificationStructure.qualificationId, id));
    
    // Organize units by core/elective
    const units = {
      core: qualificationUnits.filter(qu => qu.structure.isCore),
      elective: qualificationUnits.filter(qu => !qu.structure.isCore)
    };
    
    res.json({
      qualification,
      units
    });
  } catch (error) {
    console.error('Error fetching qualification:', error);
    res.status(500).json({ message: 'Error fetching qualification' });
  }
});

// Add units to qualification structure
vetRouter.post('/qualifications/:id/units', async (req, res) => {
  try {
    const qualificationId = parseInt(req.params.id);
    const { units } = req.body;
    
    if (!units || !Array.isArray(units) || units.length === 0) {
      return res.status(400).json({ message: 'No units provided' });
    }
    
    // Check if qualification exists
    const [qualification] = await db
      .select()
      .from(qualifications)
      .where(eq(qualifications.id, qualificationId));
    
    if (!qualification) {
      return res.status(404).json({ message: 'Qualification not found' });
    }
    
    // Get the current highest order for core and elective units
    const existingUnits = await db
      .select()
      .from(qualificationStructure)
      .where(eq(qualificationStructure.qualificationId, qualificationId));
    
    const maxCoreOrder = existingUnits
      .filter(u => u.isCore)
      .reduce((max, unit) => Math.max(max, unit.order || 0), 0);
    
    const maxElectiveOrderByGroup: Record<string, number> = {};
    existingUnits
      .filter(u => !u.isCore)
      .forEach(unit => {
        const group = unit.groupName || 'General Electives';
        maxElectiveOrderByGroup[group] = Math.max(
          maxElectiveOrderByGroup[group] || 0,
          unit.order || 0
        );
      });
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Process each unit
      for (const unit of units) {
        const { unitId, isCore, groupName, isMandatoryElective } = unit;
        
        // Determine the order
        let order;
        if (isCore) {
          order = maxCoreOrder + 1;
        } else {
          const group = groupName || 'General Electives';
          order = (maxElectiveOrderByGroup[group] || 0) + 1;
          maxElectiveOrderByGroup[group] = order;
        }
        
        // Insert into structure
        await tx.insert(qualificationStructure).values({
          qualificationId,
          unitId,
          isCore,
          groupName: groupName || null,
          isMandatoryElective: !!isMandatoryElective,
          order
        });
      }
    });
    
    res.status(201).json({ message: 'Units added successfully' });
  } catch (error) {
    console.error('Error adding units to qualification:', error);
    res.status(500).json({ message: 'Error adding units to qualification structure' });
  }
});

// Remove a unit from qualification structure
vetRouter.delete('/qualifications/:id/units/:unitStructureId', async (req, res) => {
  try {
    const qualificationId = parseInt(req.params.id);
    const unitStructureId = parseInt(req.params.unitStructureId);
    
    // Delete the unit from structure
    const result = await db
      .delete(qualificationStructure)
      .where(
        and(
          eq(qualificationStructure.id, unitStructureId),
          eq(qualificationStructure.qualificationId, qualificationId)
        )
      );
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Unit not found in qualification structure' });
    }
    
    res.json({ message: 'Unit removed successfully' });
  } catch (error) {
    console.error('Error removing unit from qualification:', error);
    res.status(500).json({ message: 'Error removing unit from qualification structure' });
  }
});

// Update unit order in qualification structure
vetRouter.patch('/qualifications/:id/units/:unitStructureId/order', validateParams(vetIdParamSchema), validateBody(vetUnitOrderSchema), async (req, res) => {
  try {
    const qualificationId = parseInt(req.params.id);
    const unitStructureId = parseInt(req.params.unitStructureId);
    const { direction } = req.body;
    
    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ message: 'Invalid direction. Must be "up" or "down"' });
    }
    
    // Get the current unit
    const [currentUnit] = await db
      .select()
      .from(qualificationStructure)
      .where(
        and(
          eq(qualificationStructure.id, unitStructureId),
          eq(qualificationStructure.qualificationId, qualificationId)
        )
      );
    
    if (!currentUnit) {
      return res.status(404).json({ message: 'Unit not found in qualification structure' });
    }
    
    // Get adjacent unit (the one we need to swap with)
    const adjacentUnitQuery = db
      .select()
      .from(qualificationStructure)
      .where(
        and(
          eq(qualificationStructure.qualificationId, qualificationId),
          eq(qualificationStructure.isCore, currentUnit.isCore)
        )
      );
    
    // If unit is in a group, ensure we only swap within the same group
    if (!currentUnit.isCore && currentUnit.groupName) {
      adjacentUnitQuery.where(eq(qualificationStructure.groupName, currentUnit.groupName));
    }
    
    // Find the unit to swap with based on direction
    if (direction === 'up') {
      adjacentUnitQuery
        .where(eq(qualificationStructure.order, currentUnit.order - 1))
        .orderBy(qualificationStructure.order);
    } else {
      adjacentUnitQuery
        .where(eq(qualificationStructure.order, currentUnit.order + 1))
        .orderBy(qualificationStructure.order);
    }
    
    const [adjacentUnit] = await adjacentUnitQuery;
    
    if (!adjacentUnit) {
      return res.status(400).json({ message: 'Cannot move unit in that direction' });
    }
    
    // Swap the orders
    await db.transaction(async (tx) => {
      await tx
        .update(qualificationStructure)
        .set({ order: adjacentUnit.order })
        .where(eq(qualificationStructure.id, currentUnit.id));
      
      await tx
        .update(qualificationStructure)
        .set({ order: currentUnit.order })
        .where(eq(qualificationStructure.id, adjacentUnit.id));
    });
    
    res.json({ message: 'Unit order updated successfully' });
  } catch (error) {
    console.error('Error updating unit order:', error);
    res.status(500).json({ message: 'Error updating unit order' });
  }
});

// Create qualification
vetRouter.post('/qualifications', async (req, res) => {
  try {
    const { qualificationData, units } = req.body;
    
    // Validate qualification data
    const validQualificationData = insertQualificationSchema.parse(qualificationData);
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Create qualification
      const [qualification] = await tx
        .insert(qualifications)
        .values(validQualificationData)
        .returning();
      
      // If units are provided, add them to the qualification structure
      if (units && Array.isArray(units) && units.length > 0) {
        const structureRecords = units.map(unit => ({
          qualificationId: qualification.id,
          unitId: unit.unitId,
          isCore: unit.isCore,
          groupName: unit.groupName,
          isMandatoryElective: unit.isMandatoryElective
        }));
        
        await tx
          .insert(qualificationStructure)
          .values(structureRecords);
      }
      
      res.status(201).json(qualification);
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error creating qualification:', error);
    res.status(500).json({ message: 'Error creating qualification' });
  }
});

// Update qualification
vetRouter.patch('/qualifications/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { qualificationData, units } = req.body;
    
    await db.transaction(async (tx) => {
      // Update qualification
      const [qualification] = await tx
        .update(qualifications)
        .set({ ...qualificationData, updatedAt: new Date() })
        .where(eq(qualifications.id, id))
        .returning();
      
      if (!qualification) {
        return res.status(404).json({ message: 'Qualification not found' });
      }
      
      // If units are provided, update the qualification structure
      if (units && Array.isArray(units)) {
        // Delete existing structure
        await tx
          .delete(qualificationStructure)
          .where(eq(qualificationStructure.qualificationId, id));
        
        // Add new structure
        if (units.length > 0) {
          const structureRecords = units.map(unit => ({
            qualificationId: qualification.id,
            unitId: unit.unitId,
            isCore: unit.isCore,
            groupName: unit.groupName,
            isMandatoryElective: unit.isMandatoryElective
          }));
          
          await tx
            .insert(qualificationStructure)
            .values(structureRecords);
        }
      }
      
      res.json(qualification);
    });
  } catch (error) {
    console.error('Error updating qualification:', error);
    res.status(500).json({ message: 'Error updating qualification' });
  }
});

// ==========================================
// APPRENTICE QUALIFICATIONS & PROGRESS
// ==========================================

// Get qualifications for an apprentice
vetRouter.get('/apprentices/:id/qualifications', validateParams(vetIdParamSchema), async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);
    
    const apprenticeQuals = await db
      .select({
        enrollment: apprenticeQualifications,
        qualification: qualifications
      })
      .from(apprenticeQualifications)
      .innerJoin(qualifications, eq(apprenticeQualifications.qualificationId, qualifications.id))
      .where(eq(apprenticeQualifications.apprenticeId, apprenticeId));
    
    if (!apprenticeQuals.length) {
      return res.json([]);
    }
    
    res.json(apprenticeQuals);
  } catch (error) {
    console.error('Error fetching apprentice qualifications:', error);
    res.status(500).json({ message: 'Error fetching apprentice qualifications' });
  }
});

// Enroll apprentice in qualification
vetRouter.post('/apprentices/:id/qualifications', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);
    const data = insertApprenticeQualificationSchema.parse({
      ...req.body,
      apprenticeId
    });
    
    // Check if apprentice exists
    const [apprentice] = await db
      .select()
      .from(apprentices)
      .where(eq(apprentices.id, apprenticeId));
    
    if (!apprentice) {
      return res.status(404).json({ message: 'Apprentice not found' });
    }
    
    // Check if qualification exists
    const [qualification] = await db
      .select()
      .from(qualifications)
      .where(eq(qualifications.id, data.qualificationId));
    
    if (!qualification) {
      return res.status(404).json({ message: 'Qualification not found' });
    }
    
    // Create enrollment
    const [enrollment] = await db
      .insert(apprenticeQualifications)
      .values(data)
      .returning();
    
    // Return with qualification details
    const result = {
      ...enrollment,
      qualification
    };
    
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error enrolling apprentice in qualification:', error);
    res.status(500).json({ message: 'Error enrolling apprentice in qualification' });
  }
});

// Get units progress for an apprentice
vetRouter.get('/apprentices/:id/units', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.id);
    const qualificationId = req.query.qualificationId 
      ? parseInt(req.query.qualificationId as string) 
      : undefined;
    
    let unitsQuery;
    
    // If qualification ID is provided, get units for that qualification
    if (qualificationId) {
      unitsQuery = db
        .select({
          progress: apprenticeUnitProgress,
          unit: unitsOfCompetency,
          structure: qualificationStructure
        })
        .from(apprenticeUnitProgress)
        .innerJoin(unitsOfCompetency, eq(apprenticeUnitProgress.unitId, unitsOfCompetency.id))
        .innerJoin(
          qualificationStructure, 
          and(
            eq(qualificationStructure.unitId, unitsOfCompetency.id),
            eq(qualificationStructure.qualificationId, qualificationId)
          )
        )
        .where(eq(apprenticeUnitProgress.apprenticeId, apprenticeId));
    } else {
      // Get all units for the apprentice
      unitsQuery = db
        .select({
          progress: apprenticeUnitProgress,
          unit: unitsOfCompetency
        })
        .from(apprenticeUnitProgress)
        .innerJoin(unitsOfCompetency, eq(apprenticeUnitProgress.unitId, unitsOfCompetency.id))
        .where(eq(apprenticeUnitProgress.apprenticeId, apprenticeId));
    }
    
    const units = await unitsQuery;
    
    // Get details of assessors
    const assessorIds = units
      .filter(u => u.progress.assessorId)
      .map(u => u.progress.assessorId);
    
    let assessors: any[] = [];
    if (assessorIds.length > 0) {
      assessors = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName
        })
        .from(users)
        .where(sql`${users.id} = ANY(${assessorIds})`);
    }
    
    // Map assessors to units
    const unitsWithAssessors = units.map(u => {
      const assessor = u.progress.assessorId 
        ? assessors.find(a => a.id === u.progress.assessorId) 
        : null;
      
      return {
        ...u,
        assessor
      };
    });
    
    res.json(unitsWithAssessors);
  } catch (error) {
    console.error('Error fetching apprentice unit progress:', error);
    res.status(500).json({ message: 'Error fetching apprentice unit progress' });
  }
});

// Update unit progress for an apprentice
vetRouter.post('/apprentices/:apprenticeId/units/:unitId/progress', async (req, res) => {
  try {
    const apprenticeId = parseInt(req.params.apprenticeId);
    const unitId = parseInt(req.params.unitId);
    
    // Validate and prepare progress data
    const progressData = {
      ...req.body,
      apprenticeId,
      unitId
    };
    
    const validProgressData = insertApprenticeUnitProgressSchema.parse(progressData);
    
    // Check if progress entry already exists
    const [existingProgress] = await db
      .select()
      .from(apprenticeUnitProgress)
      .where(
        and(
          eq(apprenticeUnitProgress.apprenticeId, apprenticeId),
          eq(apprenticeUnitProgress.unitId, unitId)
        )
      );
    
    let progress;
    
    if (existingProgress) {
      // Update existing progress
      [progress] = await db
        .update(apprenticeUnitProgress)
        .set({ ...validProgressData, updatedAt: new Date() })
        .where(eq(apprenticeUnitProgress.id, existingProgress.id))
        .returning();
    } else {
      // Create new progress entry
      [progress] = await db
        .insert(apprenticeUnitProgress)
        .values(validProgressData)
        .returning();
    }
    
    // Get unit details
    const [unit] = await db
      .select()
      .from(unitsOfCompetency)
      .where(eq(unitsOfCompetency.id, unitId));
    
    // Get assessor details if provided
    let assessor = null;
    if (progress.assessorId) {
      [assessor] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName
        })
        .from(users)
        .where(eq(users.id, progress.assessorId));
    }
    
    res.json({
      progress,
      unit,
      assessor
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error updating apprentice unit progress:', error);
    res.status(500).json({ message: 'Error updating apprentice unit progress' });
  }
});

// Get training packages list (for filters)
vetRouter.get('/training-packages', async (req, res) => {
  try {
    const packages = await db
      .select({
        trainingPackage: unitsOfCompetency.trainingPackage
      })
      .from(unitsOfCompetency)
      .groupBy(unitsOfCompetency.trainingPackage)
      .orderBy(unitsOfCompetency.trainingPackage);
    
    res.json(packages.map(p => p.trainingPackage).filter(Boolean));
  } catch (error) {
    console.error('Error fetching training packages:', error);
    res.status(500).json({ message: 'Error fetching training packages' });
  }
});

// Get AQF levels list (for filters)
vetRouter.get('/aqf-levels', async (req, res) => {
  try {
    const levels = await db
      .select({
        aqfLevel: qualifications.aqfLevel,
        aqfLevelNumber: qualifications.aqfLevelNumber
      })
      .from(qualifications)
      .groupBy(qualifications.aqfLevel, qualifications.aqfLevelNumber)
      .orderBy(qualifications.aqfLevelNumber);
    
    res.json(levels);
  } catch (error) {
    console.error('Error fetching AQF levels:', error);
    res.status(500).json({ message: 'Error fetching AQF levels' });
  }
});