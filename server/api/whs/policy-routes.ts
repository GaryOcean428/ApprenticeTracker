import express from 'express';
import { storage } from '../../storage';
import { db } from '../../db';
import { z } from 'zod';
import { 
  whs_policies,
  whs_documents,
  insertPolicySchema,
  insertDocumentSchema
} from '@shared/schema/whs';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { isAuthenticated, hasPermission } from '../../middleware/auth';

export function setupPolicyRoutes(router: express.Router) {
  // GET all policies with pagination
  router.get('/policies', async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Filter by status if provided
      const statusFilter = req.query.status ? 
        sql`${whs_policies.status} = ${req.query.status}` : 
        undefined;
      
      // Get policies with pagination
      const query = db.select()
        .from(whs_policies)
        .orderBy(desc(whs_policies.effective_date));
      
      if (statusFilter) {
        query.where(statusFilter);
      }
      
      const policies = await query
        .limit(limit)
        .offset(offset);
      
      // Get total count for pagination
      const totalPolicies = await db.select()
        .from(whs_policies);
      
      const totalCount = totalPolicies.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      res.json({
        policies,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching policies:', error);
      res.status(500).json({ message: 'Failed to fetch policies' });
    }
  });
  
  // GET policy by ID with related data
  router.get('/policies/:id', async (req, res) => {
    try {
      const id = req.params.id;
      
      // Get policy
      const [policy] = await db.select()
        .from(whs_policies)
        .where(sql`${whs_policies.id} = ${id}`);
      
      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      
      // Get documents
      const documents = await db.select()
        .from(whs_documents)
        .where(eq(whs_documents.policy_id, id));
      
      res.json({
        policy,
        documents
      });
    } catch (error) {
      console.error('Error fetching policy:', error);
      res.status(500).json({ message: 'Failed to fetch policy details' });
    }
  });
  
  // CREATE new policy
  router.post('/policies', hasPermission('whs.create_policy'), async (req, res) => {
    try {
      const validatedData = insertPolicySchema.parse(req.body);
      
      // Create policy
      const [newPolicy] = await db.insert(whs_policies)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newPolicy);
    } catch (error) {
      console.error('Error creating policy:', error);
      res.status(400).json({ 
        message: 'Failed to create policy',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // UPDATE policy
  router.patch('/policies/:id', hasPermission('whs.update_policy'), async (req, res) => {
    try {
      const id = req.params.id;
      
      // Ensure policy exists
      const [existingPolicy] = await db.select()
        .from(whs_policies)
        .where(sql`${whs_policies.id} = ${id}`);
      
      if (!existingPolicy) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      
      // Update policy
      const [updatedPolicy] = await db.update(whs_policies)
        .set(req.body)
        .where(sql`${whs_policies.id} = ${id}`)
        .returning();
      
      res.json(updatedPolicy);
    } catch (error) {
      console.error('Error updating policy:', error);
      res.status(400).json({ message: 'Failed to update policy' });
    }
  });
  
  // DELETE policy
  router.delete('/policies/:id', hasPermission('whs.delete_policy'), async (req, res) => {
    try {
      const id = req.params.id;
      
      // Delete policy
      await db.delete(whs_policies)
        .where(sql`${whs_policies.id} = ${id}`);
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting policy:', error);
      res.status(500).json({ message: 'Failed to delete policy' });
    }
  });
  
  // Add document to policy
  router.post('/policies/:policyId/documents', hasPermission('whs.update_policy'), async (req, res) => {
    try {
      const policyId = req.params.policyId;
      
      // Ensure policy exists
      const [existingPolicy] = await db.select()
        .from(whs_policies)
        .where(sql`${whs_policies.id} = ${policyId}`);
      
      if (!existingPolicy) {
        return res.status(404).json({ message: 'Policy not found' });
      }
      
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        policy_id: policyId
      });
      
      // Create document
      const [newDocument] = await db.insert(whs_documents)
        .values(documentData)
        .returning();
      
      res.status(201).json(newDocument);
    } catch (error) {
      console.error('Error adding document:', error);
      res.status(400).json({ message: 'Failed to add document' });
    }
  });
}