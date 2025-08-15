import type express from 'express';
import { sql } from 'drizzle-orm';
import {
  claims,
  eligibility_criteria,
  apprentice_eligibility,
  claim_documents,
  claim_history,
  claim_reminders,
  insertClaimSchema,
  updateClaimSchema,
} from '@shared/schema/claims';
import { db } from '../../db';
import { hasPermission } from '../../middleware/auth';
import {
  sendEmailNotification,
  sendInAppNotification,
  sendSystemAlert,
} from '../../services/notification-service';

export function setupClaimsRoutes(router: express.Router) {
  // GET all claims with pagination and filtering
  router.get('/claims', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const { status, claim_type, funding_body, startDate, endDate } = req.query;

      let query = db.select().from(claims);

      // Apply filters
      if (status) {
        query = query.where(sql`${claims.status} = ${status}`);
      }

      if (claim_type) {
        query = query.where(sql`${claims.claim_type} = ${claim_type}`);
      }

      if (funding_body) {
        query = query.where(sql`${claims.funding_body} = ${funding_body}`);
      }

      if (startDate && endDate) {
        query = query.where(sql`${claims.submission_date} BETWEEN ${startDate} AND ${endDate}`);
      }

      const claimsData = await query
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${claims.created_at} DESC`);

      // Get total count for pagination
      const countResult = await db
        .select({
          count: sql`count(*)::int`,
        })
        .from(claims);

      const count = countResult[0]?.count || 0;

      res.json({
        claims: claimsData,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(Number(count) / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching claims:', error);
      res.status(500).json({ message: 'Failed to fetch claims' });
    }
  });

  // GET claim by ID with full details
  router.get('/claims/:id', async (req, res) => {
    try {
      const id = req.params.id;

      // Get claim details
      const [claim] = await db
        .select()
        .from(claims)
        .where(sql`${claims.id} = ${id}`);

      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      // Get associated documents
      const documents = await db
        .select()
        .from(claim_documents)
        .where(sql`${claim_documents.claim_id} = ${id}`);

      // Get claim history
      const history = await db
        .select()
        .from(claim_history)
        .where(sql`${claim_history.claim_id} = ${id}`)
        .orderBy(sql`${claim_history.change_date} DESC`);

      // Get reminders
      const reminders = await db
        .select()
        .from(claim_reminders)
        .where(sql`${claim_reminders.claim_id} = ${id}`);

      res.json({
        claim,
        documents,
        history,
        reminders,
      });
    } catch (error) {
      console.error('Error fetching claim:', error);
      res.status(500).json({ message: 'Failed to fetch claim details' });
    }
  });

  // CREATE new claim
  router.post('/claims', hasPermission('claims.create'), async (req, res) => {
    try {
      const validatedData = insertClaimSchema.parse(req.body);

      // Generate claim number if not provided
      if (!validatedData.claim_number) {
        const claimNumber = await generateClaimNumber(validatedData.claim_type);
        validatedData.claim_number = claimNumber;
      }

      // Create claim
      const [newClaim] = await db.insert(claims).values(validatedData).returning();

      // Create initial history entry
      await db.insert(claim_history).values({
        claim_id: newClaim.id,
        status: newClaim.status,
        changed_by_id: validatedData.submitted_by_id,
        changed_by_name: validatedData.submitted_by_name,
        notes: 'Claim created',
        changes: { action: 'created', status: newClaim.status },
      });

      // Send new claim notifications
      try {
        await sendNewClaimNotifications(newClaim);
      } catch (notificationError) {
        console.error('Error sending new claim notifications:', notificationError);
      }

      res.status(201).json(newClaim);
    } catch (error) {
      console.error('Error creating claim:', error);
      res.status(400).json({
        message: 'Failed to create claim',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // UPDATE claim
  router.patch('/claims/:id', hasPermission('claims.update'), async (req, res) => {
    try {
      const id = req.params.id;
      const { user_id, user_name, ...updateData } = req.body;

      // Get current claim for comparison
      const [currentClaim] = await db
        .select()
        .from(claims)
        .where(sql`${claims.id} = ${id}`);

      if (!currentClaim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      // Validate update data
      const validatedData = updateClaimSchema.parse(updateData);

      // Update claim
      const [updatedClaim] = await db
        .update(claims)
        .set({
          ...validatedData,
          updated_at: new Date(),
        })
        .where(sql`${claims.id} = ${id}`)
        .returning();

      // Log changes in history
      const changes = Object.keys(validatedData).reduce((acc: any, key) => {
        if ((currentClaim as any)[key] !== (validatedData as any)[key]) {
          acc[key] = {
            from: (currentClaim as any)[key],
            to: (validatedData as any)[key],
          };
        }
        return acc;
      }, {});

      if (Object.keys(changes).length > 0) {
        await db.insert(claim_history).values({
          claim_id: id,
          status: updatedClaim.status,
          changed_by_id: user_id,
          changed_by_name: user_name,
          notes: 'Claim updated',
          changes,
        });
      }

      res.json(updatedClaim);
    } catch (error) {
      console.error('Error updating claim:', error);
      res.status(400).json({ message: 'Failed to update claim' });
    }
  });

  // UPDATE claim status (workflow management)
  router.patch('/claims/:id/status', hasPermission('claims.update'), async (req, res) => {
    try {
      const id = req.params.id;
      const { status, notes, user_id, user_name } = req.body;

      // Validate status transition
      const validStatuses = [
        'draft',
        'pending',
        'submitted',
        'in-review',
        'approved',
        'rejected',
        'paid',
        'reconciled',
        'cancelled',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status transition' });
      }

      // Get current claim
      const [currentClaim] = await db
        .select()
        .from(claims)
        .where(sql`${claims.id} = ${id}`);

      if (!currentClaim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      // Validate business rules for status transitions
      const transitionValid = validateStatusTransition(currentClaim.status, status);
      if (!transitionValid.valid) {
        return res.status(400).json({ message: transitionValid.reason });
      }

      // Update claim status
      const updateData: any = {
        status,
        updated_at: new Date(),
      };

      // Set additional fields based on status
      if (status === 'submitted' && !currentClaim.submission_date) {
        updateData.submission_date = new Date();
      }

      if (status === 'approved' || status === 'rejected') {
        updateData.reviewed_by_id = user_id;
        updateData.reviewed_by_name = user_name;
        updateData.review_date = new Date();
        if (notes) {
          if (status === 'rejected') {
            updateData.rejection_reason = notes;
          } else {
            updateData.notes = notes;
          }
        }
      }

      if (status === 'paid') {
        updateData.payment_date = new Date();
        // Payment reference would be set separately via another endpoint
      }

      const [updatedClaim] = await db
        .update(claims)
        .set(updateData)
        .where(sql`${claims.id} = ${id}`)
        .returning();

      // Create history entry
      await db.insert(claim_history).values({
        claim_id: id,
        status: status,
        changed_by_id: user_id,
        changed_by_name: user_name,
        notes: notes || `Status changed from ${currentClaim.status} to ${status}`,
        changes: {
          status: { from: currentClaim.status, to: status },
        },
      });

      // Create automatic reminders if needed
      await createAutomaticReminders(updatedClaim, status);

      // Send status change notifications
      try {
        await sendClaimStatusNotifications(updatedClaim, currentClaim.status, status);
      } catch (notificationError) {
        console.error('Error sending status change notifications:', notificationError);
      }

      res.json(updatedClaim);
    } catch (error) {
      console.error('Error updating claim status:', error);
      res.status(400).json({ message: 'Failed to update claim status' });
    }
  });

  // GET eligibility criteria
  router.get('/eligibility-criteria', async (req, res) => {
    try {
      const { claim_type, jurisdiction, active = true } = req.query;

      let query = db.select().from(eligibility_criteria);

      if (claim_type) {
        query = query.where(sql`${eligibility_criteria.claim_type} = ${claim_type}`);
      }

      if (jurisdiction) {
        query = query.where(sql`${eligibility_criteria.jurisdiction} = ${jurisdiction}`);
      }

      if (active !== undefined) {
        query = query.where(sql`${eligibility_criteria.active} = ${active}`);
      }

      const criteria = await query.orderBy(sql`${eligibility_criteria.created_at} DESC`);

      res.json({ criteria });
    } catch (error) {
      console.error('Error fetching eligibility criteria:', error);
      res.status(500).json({ message: 'Failed to fetch eligibility criteria' });
    }
  });

  // CHECK apprentice eligibility
  router.post('/eligibility/check', hasPermission('claims.create'), async (req, res) => {
    try {
      const { apprentice_id, criteria_id } = req.body;

      if (!apprentice_id || !criteria_id) {
        return res.status(400).json({ message: 'Apprentice ID and criteria ID are required' });
      }

      // Get criteria details
      const [criteria] = await db
        .select()
        .from(eligibility_criteria)
        .where(sql`${eligibility_criteria.id} = ${criteria_id}`);

      if (!criteria) {
        return res.status(404).json({ message: 'Eligibility criteria not found' });
      }

      // Check if apprentice already has eligibility record for this criteria
      const [existingEligibility] = await db.select().from(apprentice_eligibility)
        .where(sql`${apprentice_eligibility.apprentice_id} = ${apprentice_id} 
                   AND ${apprentice_eligibility.criteria_id} = ${criteria_id}`);

      if (existingEligibility) {
        return res.json({
          eligibility: existingEligibility,
          isEligible: existingEligibility.status === 'eligible',
          message: `Existing eligibility record found with status: ${existingEligibility.status}`,
        });
      }

      // Perform eligibility check (this would contain complex business logic)
      const eligibilityResult = await performEligibilityCheck(apprentice_id, criteria);

      res.json({
        isEligible: eligibilityResult.eligible,
        eligibility: eligibilityResult.eligibility,
        requirements: eligibilityResult.requirements,
        message: eligibilityResult.message,
      });
    } catch (error) {
      console.error('Error checking eligibility:', error);
      res.status(500).json({ message: 'Failed to check eligibility' });
    }
  });

  // GET claims dashboard metrics
  router.get('/claims/dashboard', async (req, res) => {
    try {
      const { timeframe = '30days' } = req.query;

      const daysAgo = timeframe === '7days' ? 7 : timeframe === '90days' ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Get claims counts
      const recentClaims = await db
        .select()
        .from(claims)
        .where(sql`${claims.created_at} >= ${startDate}`);

      const totalClaims = recentClaims.length;
      const pendingClaims = recentClaims.filter(c =>
        ['draft', 'pending', 'submitted', 'in-review'].includes(c.status)
      ).length;

      const approvedClaims = recentClaims.filter(c => c.status === 'approved').length;
      const paidClaims = recentClaims.filter(c => c.status === 'paid').length;

      // Calculate totals
      const totalRequested = recentClaims.reduce(
        (sum, claim) => sum + (claim.amount_requested || 0),
        0
      );

      const totalApproved = recentClaims
        .filter(c => c.status === 'approved' || c.status === 'paid')
        .reduce((sum, claim) => sum + (claim.amount_approved || claim.amount_requested || 0), 0);

      // Status distribution
      const statusCounts = recentClaims.reduce((acc: any, claim) => {
        acc[claim.status] = (acc[claim.status] || 0) + 1;
        return acc;
      }, {});

      // Claim type distribution
      const typeCounts = recentClaims.reduce((acc: any, claim) => {
        acc[claim.claim_type] = (acc[claim.claim_type] || 0) + 1;
        return acc;
      }, {});

      res.json({
        metrics: {
          totalClaims,
          pendingClaims,
          approvedClaims,
          paidClaims,
          totalRequested,
          totalApproved,
          approvalRate: totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0,
        },
        chartData: {
          statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
          })),
          typeDistribution: Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count,
          })),
        },
        recentActivity: recentClaims.slice(0, 10),
      });
    } catch (error) {
      console.error('Error fetching claims dashboard:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });
}

// Helper function to generate claim numbers
async function generateClaimNumber(claimType: string): Promise<string> {
  const year = new Date().getFullYear();
  const typePrefix = claimType.substring(0, 3).toUpperCase();

  // Get the latest claim number for this year and type
  const result = await db
    .select({ claim_number: claims.claim_number })
    .from(claims)
    .where(sql`${claims.claim_number} LIKE ${`${typePrefix}-${year}-%`}`)
    .orderBy(sql`${claims.claim_number} DESC`)
    .limit(1);

  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = result[0].claim_number.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `${typePrefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

// Helper function to validate status transitions
function validateStatusTransition(currentStatus: string, newStatus: string) {
  const transitions: Record<string, string[]> = {
    draft: ['pending', 'submitted', 'cancelled'],
    pending: ['submitted', 'draft', 'cancelled'],
    submitted: ['in-review', 'cancelled'],
    'in-review': ['approved', 'rejected', 'pending'],
    approved: ['paid', 'cancelled'],
    rejected: ['pending', 'cancelled'],
    paid: ['reconciled'],
    reconciled: [], // Final state
    cancelled: [], // Final state
  };

  const allowedTransitions = transitions[currentStatus] || [];

  if (allowedTransitions.includes(newStatus)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Cannot transition from ${currentStatus} to ${newStatus}`,
  };
}

// Helper function to perform eligibility checks
async function performEligibilityCheck(apprenticeId: string, criteria: any) {
  try {
    // This is a placeholder for complex eligibility logic
    // In a real system, this would check apprentice data against criteria rules

    // For now, return a basic eligibility result
    const eligibilityResult = {
      eligible: true,
      eligibility: {
        apprentice_id: apprenticeId,
        criteria_id: criteria.id,
        status: 'eligible' as const,
        eligible_from_date: new Date(),
        eligible_to_date: criteria.expiry_date ? new Date(criteria.expiry_date) : null,
        notes: 'Automatic eligibility check passed',
        documentation_status: [],
      },
      requirements: {
        documentsRequired: criteria.documentation_required || [],
        additionalChecks: criteria.eligibility_rules?.checks || [],
      },
      message: 'Apprentice meets eligibility criteria',
    };

    // Create eligibility record
    const [newEligibility] = await db
      .insert(apprentice_eligibility)
      .values(eligibilityResult.eligibility)
      .returning();

    eligibilityResult.eligibility = newEligibility;

    return eligibilityResult;
  } catch (error) {
    console.error('Error performing eligibility check:', error);
    return {
      eligible: false,
      eligibility: null,
      requirements: {},
      message: 'Error performing eligibility check',
    };
  }
}

// Helper function to create automatic reminders
async function createAutomaticReminders(claim: any, status: string) {
  try {
    const reminders = [];

    if (status === 'submitted') {
      // Create reminder for review deadline
      reminders.push({
        claim_id: claim.id,
        title: 'Claim Review Required',
        description: `Claim ${claim.claim_number} requires review`,
        reminder_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        reminder_type: 'review',
        assigned_to_id: claim.submitted_by_id,
        assigned_to_name: claim.submitted_by_name,
      });
    }

    if (status === 'approved') {
      // Create reminder for payment processing
      reminders.push({
        claim_id: claim.id,
        title: 'Payment Processing Required',
        description: `Approved claim ${claim.claim_number} requires payment processing`,
        reminder_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        reminder_type: 'payment',
        assigned_to_id: claim.reviewed_by_id,
        assigned_to_name: claim.reviewed_by_name,
      });
    }

    if (reminders.length > 0) {
      await db.insert(claim_reminders).values(reminders);
    }
  } catch (error) {
    console.error('Error creating automatic reminders:', error);
  }
}

// Helper function to send new claim notifications
async function sendNewClaimNotifications(claim: any) {
  try {
    console.log(`[CLAIMS_NOTIFICATION] New claim created: ${claim.id} - ${claim.claim_number}`);

    const emailRecipients: string[] = [];

    // Notify claims administrators
    const claimsAdminEmails = process.env.CLAIMS_ADMIN_EMAILS?.split(',') || [];
    emailRecipients.push(...claimsAdminEmails.filter(email => email.trim()));

    if (emailRecipients.length > 0) {
      try {
        await sendEmailNotification({
          recipients: emailRecipients,
          subject: `New Government Claim Created: ${claim.claim_number}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; color: white;">New Government Claim Created</h2>
                <p style="margin: 10px 0 0 0; color: white;">Claim Type: ${claim.claim_type}</p>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; margin: 0;">
                <h3 style="margin-top: 0; color: #1f2937;">${claim.claim_number}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Apprentice:</td><td style="padding: 8px 0;">${claim.apprentice_name || 'Unknown'}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Claim Type:</td><td style="padding: 8px 0;">${claim.claim_type}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Amount Requested:</td><td style="padding: 8px 0;">$${claim.amount_requested?.toLocaleString() || '0'}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Funding Body:</td><td style="padding: 8px 0;">${claim.funding_body}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Jurisdiction:</td><td style="padding: 8px 0;">${claim.jurisdiction}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Status:</td><td style="padding: 8px 0;">${claim.status}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Submitted By:</td><td style="padding: 8px 0;">${claim.submitted_by_name || 'Unknown'}</td></tr>
                </table>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This claim requires review and processing. Please log into the ApprenticeTracker system to manage this claim.
              </p>
            </div>
          `,
          textContent: `New Government Claim Created\n\nClaim Number: ${claim.claim_number}\nApprentice: ${claim.apprentice_name}\nType: ${claim.claim_type}\nAmount: $${claim.amount_requested?.toLocaleString()}`,
        });
        console.log(
          `New claim email notifications sent to ${emailRecipients.length} recipients for claim ${claim.id}`
        );
      } catch (emailError) {
        console.error('Error sending new claim email notifications:', emailError);
      }
    }

    return [];
  } catch (error) {
    console.error('Error sending new claim notifications:', error);
    return [];
  }
}

// Helper function to send claim status notifications
async function sendClaimStatusNotifications(claim: any, previousStatus: string, newStatus: string) {
  try {
    console.log(
      `[CLAIMS_NOTIFICATION] Claim ${claim.id} status changed from ${previousStatus} to ${newStatus}`
    );

    const emailRecipients: string[] = [];
    const notifications = [];

    // Determine notification message and styling based on status
    const statusMessages = {
      pending: 'Claim is pending review',
      submitted: 'Claim has been submitted for review',
      'in-review': 'Claim is currently under review',
      approved: 'Claim has been approved for payment',
      rejected: 'Claim has been rejected',
      paid: 'Payment has been processed',
      reconciled: 'Claim has been reconciled',
      cancelled: 'Claim has been cancelled',
    };

    const statusColors = {
      pending: '#f59e0b',
      submitted: '#3b82f6',
      'in-review': '#8b5cf6',
      approved: '#10b981',
      rejected: '#ef4444',
      paid: '#059669',
      reconciled: '#065f46',
      cancelled: '#9ca3af',
    };

    const statusMessage =
      statusMessages[newStatus as keyof typeof statusMessages] || `Status updated to ${newStatus}`;
    const statusColor = statusColors[newStatus as keyof typeof statusColors] || '#6b7280';

    // Notify claim submitter
    if (claim.submitted_by_id) {
      notifications.push({
        userId: claim.submitted_by_id,
        type: 'claim_status_update',
        message: `Claim ${claim.claim_number}: ${statusMessage}`,
        claimId: claim.id,
      });
    }

    // Notify claims administrators
    const claimsAdminEmails = process.env.CLAIMS_ADMIN_EMAILS?.split(',') || [];
    emailRecipients.push(...claimsAdminEmails.filter(email => email.trim()));

    // Send email notifications
    if (emailRecipients.length > 0) {
      try {
        await sendEmailNotification({
          recipients: emailRecipients,
          subject: `Claim Status Update: ${claim.claim_number} - ${statusMessage}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: ${statusColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; color: white;">Claim Status Update</h2>
                <p style="margin: 10px 0 0 0; color: white;">Status: ${newStatus.toUpperCase()}</p>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; margin: 0;">
                <h3 style="margin-top: 0; color: #1f2937;">${claim.claim_number}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Apprentice:</td><td style="padding: 8px 0;">${claim.apprentice_name || 'Unknown'}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Claim Type:</td><td style="padding: 8px 0;">${claim.claim_type}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Amount Requested:</td><td style="padding: 8px 0;">$${claim.amount_requested?.toLocaleString() || '0'}</td></tr>
                  ${claim.amount_approved ? `<tr><td style="padding: 8px 0; font-weight: bold;">Amount Approved:</td><td style="padding: 8px 0;">$${claim.amount_approved.toLocaleString()}</td></tr>` : ''}
                  <tr><td style="padding: 8px 0; font-weight: bold;">Previous Status:</td><td style="padding: 8px 0;">${previousStatus}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">New Status:</td><td style="padding: 8px 0;">${newStatus}</td></tr>
                  ${claim.review_date ? `<tr><td style="padding: 8px 0; font-weight: bold;">Review Date:</td><td style="padding: 8px 0;">${new Date(claim.review_date).toLocaleDateString()}</td></tr>` : ''}
                  ${claim.reviewed_by_name ? `<tr><td style="padding: 8px 0; font-weight: bold;">Reviewed By:</td><td style="padding: 8px 0;">${claim.reviewed_by_name}</td></tr>` : ''}
                </table>
                <div style="margin: 15px 0;">
                  <strong>Update:</strong> ${statusMessage}
                </div>
                ${
                  claim.rejection_reason
                    ? `
                <div style="margin: 15px 0; background: #fef2f2; padding: 15px; border-radius: 4px; border-left: 4px solid #ef4444;">
                  <strong>Rejection Reason:</strong>
                  <p style="margin: 5px 0 0 0;">${claim.rejection_reason}</p>
                </div>`
                    : ''
                }
                ${
                  claim.notes && claim.notes !== claim.rejection_reason
                    ? `
                <div style="margin: 15px 0;">
                  <strong>Notes:</strong>
                  <p style="background: white; padding: 15px; border-radius: 4px; margin: 5px 0 0 0;">${claim.notes}</p>
                </div>`
                    : ''
                }
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This is an automated notification from the ApprenticeTracker Claims Management system.
              </p>
            </div>
          `,
          textContent: `Claim Status Update: ${claim.claim_number}\nStatus: ${previousStatus} → ${newStatus}\n${statusMessage}\nApprentice: ${claim.apprentice_name}\nAmount: $${claim.amount_requested?.toLocaleString()}`,
        });
        console.log(
          `Claim status notifications sent to ${emailRecipients.length} recipients for claim ${claim.id}`
        );
      } catch (emailError) {
        console.error('Error sending claim status email notifications:', emailError);
      }
    }

    // Send system alerts for critical status changes
    if (['approved', 'rejected'].includes(newStatus)) {
      try {
        await sendSystemAlert(
          `Claim ${claim.claim_number} has been ${newStatus} - Amount: $${claim.amount_requested?.toLocaleString()}`,
          newStatus === 'approved' ? 'normal' : 'medium'
        );
      } catch (alertError) {
        console.error('Error sending system alert for claim status:', alertError);
      }
    }

    // Send in-app notifications
    for (const notification of notifications) {
      try {
        if (notification.userId) {
          await sendInAppNotification(notification.userId, {
            type: notification.type,
            message: notification.message,
            data: { claimId: claim.id, newStatus, previousStatus },
            priority: ['approved', 'rejected', 'paid'].includes(newStatus) ? 'high' : 'normal',
          });
        }
      } catch (inAppError) {
        console.error('Error sending in-app notification:', inAppError);
      }
    }

    console.log(`Generated ${notifications.length} notifications for claim ${claim.id}`);
    return notifications;
  } catch (error) {
    console.error('Error sending claim status notifications:', error);
    return [];
  }
}
