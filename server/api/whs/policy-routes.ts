import express from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { hasPermission } from '../../middleware/auth';
import {
  whs_policies,
  whs_documents,
  insertPolicySchema,
  updatePolicySchema,
  insertDocumentSchema,
} from '@shared/schema/whs';

export function setupPolicyRoutes(router: express.Router) {
  // GET all safety policies
  router.get('/policies', async (req, res) => {
    try {
      // Parse query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Get policies with pagination
      const policies = await db
        .select()
        .from(whs_policies)
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${whs_policies.created_at} DESC`);

      // Get total count for pagination
      const countResult = await db
        .select({
          count: sql`count(*)::int`,
        })
        .from(whs_policies);

      const count = countResult[0]?.count || 0;

      res.json({
        policies,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(Number(count) / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching safety policies:', error);
      res.status(500).json({ message: 'Failed to fetch safety policies' });
    }
  });

  // GET safety policy by ID
  router.get('/policies/:id', async (req, res) => {
    try {
      const id = req.params.id;

      // Get policy
      const [policy] = await db
        .select()
        .from(whs_policies)
        .where(sql`${whs_policies.id} = ${id}`);

      if (!policy) {
        return res.status(404).json({ message: 'Safety policy not found' });
      }

      // Get documents
      const documents = await db
        .select()
        .from(whs_documents)
        .where(sql`${whs_documents.policy_id} = ${id}`);

      res.json({
        policy,
        documents,
      });
    } catch (error) {
      console.error('Error fetching safety policy:', error);
      res.status(500).json({ message: 'Failed to fetch safety policy details' });
    }
  });

  // CREATE new safety policy
  router.post('/policies', hasPermission('whs.create_policy'), async (req, res) => {
    try {
      const validatedData = insertPolicySchema.parse(req.body);

      // Create policy
      const [newPolicy] = await db.insert(whs_policies).values(validatedData).returning();

      res.status(201).json(newPolicy);
    } catch (error) {
      console.error('Error creating safety policy:', error);
      res.status(400).json({
        message: 'Failed to create safety policy',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // UPDATE safety policy
  router.patch('/policies/:id', hasPermission('whs.update_policy'), async (req, res) => {
    try {
      const id = req.params.id;

      // Ensure policy exists
      const [existingPolicy] = await db
        .select()
        .from(whs_policies)
        .where(sql`${whs_policies.id} = ${id}`);

      if (!existingPolicy) {
        return res.status(404).json({ message: 'Safety policy not found' });
      }

      const validatedData = updatePolicySchema.parse(req.body);

      // Update policy
      const [updatedPolicy] = await db
        .update(whs_policies)
        .set(validatedData)
        .where(sql`${whs_policies.id} = ${id}`)
        .returning();

      res.json(updatedPolicy);
    } catch (error) {
      console.error('Error updating safety policy:', error);
      res.status(400).json({ message: 'Failed to update safety policy' });
    }
  });

  // DELETE safety policy
  router.delete('/policies/:id', hasPermission('whs.delete_policy'), async (req, res) => {
    try {
      const id = req.params.id;

      // Delete policy
      await db.delete(whs_policies).where(sql`${whs_policies.id} = ${id}`);

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting safety policy:', error);
      res.status(500).json({ message: 'Failed to delete safety policy' });
    }
  });

  // Add document to safety policy
  router.post(
    '/policies/:policyId/documents',
    hasPermission('whs.update_policy'),
    async (req, res) => {
      try {
        const policyId = req.params.policyId;

        // Ensure policy exists
        const [existingPolicy] = await db
          .select()
          .from(whs_policies)
          .where(sql`${whs_policies.id} = ${policyId}`);

        if (!existingPolicy) {
          return res.status(404).json({ message: 'Safety policy not found' });
        }

        const documentData = insertDocumentSchema.parse({
          ...req.body,
          policy_id: policyId,
        });

        // Create document
        const [newDocument] = await db.insert(whs_documents).values(documentData).returning();

        res.status(201).json(newDocument);
      } catch (error) {
        console.error('Error adding document:', error);
        res.status(400).json({ message: 'Failed to add document' });
      }
    }
  );
}
