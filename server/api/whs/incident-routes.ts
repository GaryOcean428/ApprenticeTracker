import express from 'express';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { hasPermission } from '../../middleware/auth';
import { 
  whs_incidents, 
  whs_witnesses, 
  whs_documents, 
  insertIncidentSchema,
  insertWitnessSchema,
  insertDocumentSchema
} from '@shared/schema/whs';

export function setupIncidentRoutes(router: express.Router) {
  // GET all incidents
  router.get('/incidents', async (req, res) => {
    try {
      // Parse query parameters for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      // Get incidents with pagination
      const incidents = await db.select()
        .from(whs_incidents)
        .limit(limit)
        .offset(offset)
        .orderBy(sql`${whs_incidents.date_occurred} DESC`);
      
      // Get total count for pagination
      const [{ count }] = await db.select({ 
        count: sql`count(*)::int` 
      })
      .from(whs_incidents);
      
      res.json({
        incidents,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching incidents:', error);
      res.status(500).json({ message: 'Failed to fetch incidents' });
    }
  });
  
  // GET incident by ID
  router.get('/incidents/:id', async (req, res) => {
    try {
      const id = req.params.id;
      
      // Get incident
      const [incident] = await db.select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.id} = ${id}`);
      
      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }
      
      // Get witnesses
      const witnesses = await db.select()
        .from(whs_witnesses)
        .where(sql`${whs_witnesses.incident_id} = ${id}`);
      
      // Get documents
      const documents = await db.select()
        .from(whs_documents)
        .where(sql`${whs_documents.incident_id} = ${id}`);
      
      res.json({
        incident,
        witnesses,
        documents
      });
    } catch (error) {
      console.error('Error fetching incident:', error);
      res.status(500).json({ message: 'Failed to fetch incident details' });
    }
  });
  
  // CREATE new incident
  router.post('/incidents', hasPermission('whs.create_incident'), async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      
      // Create incident
      const [newIncident] = await db.insert(whs_incidents)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newIncident);
    } catch (error) {
      console.error('Error creating incident:', error);
      res.status(400).json({ 
        message: 'Failed to create incident',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // UPDATE incident
  router.patch('/incidents/:id', hasPermission('whs.update_incident'), async (req, res) => {
    try {
      const id = req.params.id;
      
      // Ensure incident exists
      const [existingIncident] = await db.select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.id} = ${id}`);
      
      if (!existingIncident) {
        return res.status(404).json({ message: 'Incident not found' });
      }
      
      // Update incident
      const [updatedIncident] = await db.update(whs_incidents)
        .set(req.body)
        .where(sql`${whs_incidents.id} = ${id}`)
        .returning();
      
      res.json(updatedIncident);
    } catch (error) {
      console.error('Error updating incident:', error);
      res.status(400).json({ message: 'Failed to update incident' });
    }
  });
  
  // DELETE incident
  router.delete('/incidents/:id', hasPermission('whs.delete_incident'), async (req, res) => {
    try {
      const id = req.params.id;
      
      // Delete incident
      await db.delete(whs_incidents)
        .where(sql`${whs_incidents.id} = ${id}`);
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting incident:', error);
      res.status(500).json({ message: 'Failed to delete incident' });
    }
  });
  
  // Add witness to incident
  router.post('/incidents/:incidentId/witnesses', hasPermission('whs.update_incident'), async (req, res) => {
    try {
      const incidentId = req.params.incidentId;
      
      // Ensure incident exists
      const [existingIncident] = await db.select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.id} = ${incidentId}`);
      
      if (!existingIncident) {
        return res.status(404).json({ message: 'Incident not found' });
      }
      
      const witnessData = insertWitnessSchema.parse({
        ...req.body,
        incident_id: incidentId
      });
      
      // Create witness
      const [newWitness] = await db.insert(whs_witnesses)
        .values(witnessData)
        .returning();
      
      res.status(201).json(newWitness);
    } catch (error) {
      console.error('Error adding witness:', error);
      res.status(400).json({ message: 'Failed to add witness' });
    }
  });
  
  // Add document to incident
  router.post('/incidents/:incidentId/documents', hasPermission('whs.update_incident'), async (req, res) => {
    try {
      const incidentId = req.params.incidentId;
      
      // Ensure incident exists
      const [existingIncident] = await db.select()
        .from(whs_incidents)
        .where(sql`${whs_incidents.id} = ${incidentId}`);
      
      if (!existingIncident) {
        return res.status(404).json({ message: 'Incident not found' });
      }
      
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        incident_id: incidentId
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
  
  // Delete witness
  router.delete('/incidents/witnesses/:id', hasPermission('whs.update_incident'), async (req, res) => {
    try {
      const id = req.params.id;
      
      // Delete witness
      await db.delete(whs_witnesses)
        .where(sql`${whs_witnesses.id} = ${id}`);
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting witness:', error);
      res.status(500).json({ message: 'Failed to delete witness' });
    }
  });
}