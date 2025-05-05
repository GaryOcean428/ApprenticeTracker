import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

/**
 * A helper class for managing database transactions in the rates service
 * Inspired by atomic-crm's transaction handling pattern
 */
export class TransactionManager {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Executes a series of operations within a transaction
   * If any operation fails, the entire transaction is rolled back
   */
  async executeTransaction<T>(
    operations: (client: SupabaseClient) => Promise<T>,
    description: string
  ): Promise<T> {
    try {
      logger.debug(`Starting transaction: ${description}`);
      
      // Begin transaction
      await this.client.rpc('begin_transaction');
      
      // Execute operations
      const result = await operations(this.client);
      
      // Commit transaction
      await this.client.rpc('commit_transaction');
      
      logger.debug(`Transaction completed successfully: ${description}`);
      return result;
    } catch (error) {
      // Roll back transaction on failure
      try {
        await this.client.rpc('rollback_transaction');
        logger.error(`Transaction rolled back: ${description}`, { error });
      } catch (rollbackError) {
        logger.error(`Failed to roll back transaction: ${description}`, { 
          originalError: error,
          rollbackError 
        });
      }
      
      throw error;
    }
  }

  /**
   * Creates a transaction-aware version of the client
   */
  getTransactionClient(): SupabaseClient {
    return this.client;
  }
}
