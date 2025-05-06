/**
 * Charge Rate Calculations API
 * 
 * This module provides endpoints for managing charge rate calculations.
 */

import { Router } from 'express';
import { ChargeRateCalculator } from '../../services/charge-rate-calculator';
import { z } from 'zod';
import { db } from '../../db';
import { 
  chargeRateCalculations, 
  apprentices, 
  hostEmployers,
  awards,
  awardClassifications 
} from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import logger from '../../utils/logger';
import { authenticateUser, requirePermission } from '../../middleware/permissions';

// Create router
const router = Router();

// Calculator instance
const calculator = new ChargeRateCalculator();

/**
 * @route GET /api/payroll/charge-rates
 * @description Get all charge rate calculations
 * @access Admin, Developer, Field Officer
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    logger.info('Fetching all charge rate calculations');
    
    // Get calculations and join with apprentice and host employer data
    const calculations = await db
      .select({
        id: chargeRateCalculations.id,
        apprenticeId: chargeRateCalculations.apprenticeId,
        hostEmployerId: chargeRateCalculations.hostEmployerId,
        payRate: chargeRateCalculations.payRate,
        chargeRate: chargeRateCalculations.chargeRate,
        calculationDate: chargeRateCalculations.calculationDate,
        approved: chargeRateCalculations.approved,
        rejectionReason: chargeRateCalculations.rejectionReason,
        apprenticeName: db.raw('CONCAT(apprentices.first_name, \' \', apprentices.last_name)'),
        hostEmployerName: hostEmployers.companyName,
      })
      .from(chargeRateCalculations)
      .leftJoin(apprentices, eq(chargeRateCalculations.apprenticeId, apprentices.id))
      .leftJoin(hostEmployers, eq(chargeRateCalculations.hostEmployerId, hostEmployers.id))
      .orderBy(desc(chargeRateCalculations.calculationDate));
    
    return res.json({
      success: true,
      data: calculations,
    });
  } catch (error) {
    logger.error('Error fetching charge rate calculations', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch charge rate calculations',
    });
  }
});

/**
 * @route GET /api/payroll/charge-rates/:id
 * @description Get a specific charge rate calculation
 * @access Admin, Developer, Field Officer
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching charge rate calculation with ID ${id}`);
    
    // Get calculation by ID
    const [calculation] = await db
      .select()
      .from(chargeRateCalculations)
      .where(eq(chargeRateCalculations.id, parseInt(id)));
    
    if (!calculation) {
      return res.status(404).json({
        success: false,
        error: `Charge rate calculation with ID ${id} not found`,
      });
    }
    
    // Parse JSON fields
    const parsedCalc = {
      ...calculation,
      oncosts: JSON.parse(calculation.onCosts),
      penaltyEstimates: calculation.penaltyEstimates ? JSON.parse(calculation.penaltyEstimates) : undefined,
      approvalWorkflow: calculation.approvalWorkflow ? JSON.parse(calculation.approvalWorkflow) : undefined,
    };
    
    return res.json({
      success: true,
      data: parsedCalc,
    });
  } catch (error) {
    logger.error(`Error fetching charge rate calculation with ID ${req.params.id}`, { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch charge rate calculation',
    });
  }
});

/**
 * @route POST /api/payroll/charge-rates/calculate
 * @description Calculate a charge rate without saving it
 * @access Admin, Developer, Field Officer
 */
router.post('/calculate', authenticateUser, async (req, res) => {
  try {
    logger.info('Calculating charge rate');
    
    const { 
      payRate, 
      awardId, 
      costConfig, 
      workConfig, 
      billableOptions,
      customMargin 
    } = req.body;
    
    if (!payRate) {
      return res.status(400).json({
        success: false,
        error: 'Pay rate is required',
      });
    }
    
    // Use the calculator service to calculate the charge rate
    const calculation = await calculator.calculateChargeRate(
      parseFloat(payRate),
      workConfig,
      costConfig,
      billableOptions,
      customMargin,
      awardId ? parseInt(awardId) : undefined
    );
    
    return res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    logger.error('Error calculating charge rate', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate charge rate',
    });
  }
});

/**
 * @route POST /api/payroll/charge-rates
 * @description Create a new charge rate calculation
 * @access Admin, Developer, Field Officer
 */
router.post('/', authenticateUser, requirePermission('create', 'charge_rate'), async (req, res) => {
  try {
    logger.info('Creating new charge rate calculation');
    
    const { 
      apprenticeId, 
      hostEmployerId, 
      payRate, 
      chargeRate,
      totalHours,
      billableHours,
      baseWage,
      oncosts,
      totalCost,
      costPerHour,
      awardId,
      classificationId,
      awardName,
      classificationName,
      notes,
      penaltyEstimates,
    } = req.body;
    
    // Validate required fields
    if (!apprenticeId || !hostEmployerId || !payRate || !chargeRate) {
      return res.status(400).json({
        success: false,
        error: 'Apprentice ID, Host Employer ID, Pay Rate, and Charge Rate are required',
      });
    }
    
    // Create the calculation record
    const [savedCalculation] = await db
      .insert(chargeRateCalculations)
      .values({
        apprenticeId: parseInt(apprenticeId),
        hostEmployerId: parseInt(hostEmployerId),
        payRate: payRate.toString(),
        totalHours: totalHours.toString(),
        billableHours: billableHours.toString(),
        baseWage: baseWage.toString(),
        onCosts: JSON.stringify(oncosts),
        totalCost: totalCost.toString(),
        costPerHour: costPerHour.toString(),
        chargeRate: chargeRate.toString(),
        calculationDate: new Date(),
        marginRate: ((chargeRate / costPerHour) - 1).toString(),
        approved: false, // Requires approval by default
        awardId: awardId ? parseInt(awardId) : null,
        classificationId: classificationId ? parseInt(classificationId) : null,
        awardName,
        classificationName,
        notes,
        penaltyEstimates: penaltyEstimates ? JSON.stringify(penaltyEstimates) : null,
        approvalWorkflow: JSON.stringify([
          {
            id: '1',
            name: 'Team Lead Review',
            role: 'team_lead',
            status: 'pending',
          },
          {
            id: '2',
            name: 'Financial Manager Approval',
            role: 'financial_manager',
            status: 'not_started',
          },
          {
            id: '3',
            name: 'Final Confirmation',
            role: 'executive',
            status: 'not_started',
          },
        ]),
      })
      .returning();
    
    return res.status(201).json({
      success: true,
      data: savedCalculation,
    });
  } catch (error) {
    logger.error('Error creating charge rate calculation', { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to create charge rate calculation',
    });
  }
});

/**
 * @route POST /api/payroll/charge-rates/:id/approve
 * @description Approve a charge rate calculation
 * @access Admin, Developer, Financial Manager
 */
router.post('/:id/approve', authenticateUser, requirePermission('approve', 'charge_rate'), async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    
    logger.info(`Approving charge rate calculation with ID ${id}`);
    
    // Get the calculation
    const [calculation] = await db
      .select()
      .from(chargeRateCalculations)
      .where(eq(chargeRateCalculations.id, parseInt(id)));
    
    if (!calculation) {
      return res.status(404).json({
        success: false,
        error: `Charge rate calculation with ID ${id} not found`,
      });
    }
    
    // Check if it's already approved
    if (calculation.approved) {
      return res.status(400).json({
        success: false,
        error: 'Calculation is already approved',
      });
    }
    
    // Update the workflow status
    let workflow = calculation.approvalWorkflow ? 
      JSON.parse(calculation.approvalWorkflow) : 
      [];
    
    // Find the first pending step
    const pendingStepIndex = workflow.findIndex((step: any) => step.status === 'pending');
    
    if (pendingStepIndex >= 0) {
      // Mark this step as approved
      workflow[pendingStepIndex].status = 'approved';
      workflow[pendingStepIndex].completedBy = req.user.username;
      workflow[pendingStepIndex].completedAt = new Date().toISOString();
      workflow[pendingStepIndex].comments = comments;
      
      // If there's a next step, mark it as pending
      if (pendingStepIndex < workflow.length - 1) {
        workflow[pendingStepIndex + 1].status = 'pending';
      } else {
        // This was the last step, mark the calculation as approved
        await db
          .update(chargeRateCalculations)
          .set({
            approved: true,
            approvalWorkflow: JSON.stringify(workflow),
          })
          .where(eq(chargeRateCalculations.id, parseInt(id)));
      }
    } else {
      // No pending steps, directly approve the calculation
      await db
        .update(chargeRateCalculations)
        .set({
          approved: true,
        })
        .where(eq(chargeRateCalculations.id, parseInt(id)));
    }
    
    return res.json({
      success: true,
      message: 'Charge rate calculation approved successfully',
    });
  } catch (error) {
    logger.error(`Error approving charge rate calculation with ID ${req.params.id}`, { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to approve charge rate calculation',
    });
  }
});

/**
 * @route POST /api/payroll/charge-rates/:id/reject
 * @description Reject a charge rate calculation
 * @access Admin, Developer, Financial Manager
 */
router.post('/:id/reject', authenticateUser, requirePermission('approve', 'charge_rate'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    logger.info(`Rejecting charge rate calculation with ID ${id}`);
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required',
      });
    }
    
    // Get the calculation
    const [calculation] = await db
      .select()
      .from(chargeRateCalculations)
      .where(eq(chargeRateCalculations.id, parseInt(id)));
    
    if (!calculation) {
      return res.status(404).json({
        success: false,
        error: `Charge rate calculation with ID ${id} not found`,
      });
    }
    
    // Check if it's already approved
    if (calculation.approved) {
      return res.status(400).json({
        success: false,
        error: 'Calculation is already approved and cannot be rejected',
      });
    }
    
    // Update the workflow status
    let workflow = calculation.approvalWorkflow ? 
      JSON.parse(calculation.approvalWorkflow) : 
      [];
    
    // Find the first pending step
    const pendingStepIndex = workflow.findIndex((step: any) => step.status === 'pending');
    
    if (pendingStepIndex >= 0) {
      // Mark this step as rejected
      workflow[pendingStepIndex].status = 'rejected';
      workflow[pendingStepIndex].completedBy = req.user.username;
      workflow[pendingStepIndex].completedAt = new Date().toISOString();
      workflow[pendingStepIndex].comments = rejectionReason;
    }
    
    // Update the calculation
    await db
      .update(chargeRateCalculations)
      .set({
        rejectionReason,
        approvalWorkflow: JSON.stringify(workflow),
      })
      .where(eq(chargeRateCalculations.id, parseInt(id)));
    
    return res.json({
      success: true,
      message: 'Charge rate calculation rejected successfully',
    });
  } catch (error) {
    logger.error(`Error rejecting charge rate calculation with ID ${req.params.id}`, { error });
    return res.status(500).json({
      success: false,
      error: 'Failed to reject charge rate calculation',
    });
  }
});

export default router;
