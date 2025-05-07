import { Request, Response } from 'express';
import { storage } from '../../storage';

/**
 * Get financial summary data
 * 
 * @route GET /api/financial/summary
 * @query {string} timeframe - The timeframe for the financial data (month, quarter, year, ytd)
 * @returns {object} Financial summary data
 */
export async function getFinancialSummary(req: Request, res: Response) {
  try {
    const { timeframe = 'month' } = req.query;
    
    // For demonstration purposes, we'll use some sample data that would normally
    // come from the database. In a real implementation, this would query expense,
    // invoice, and other financial tables with proper date filtering.
    
    let totalRevenue = 0;
    let totalExpenses = 0;
    let revenueYTD = 0;
    let expensesYTD = 0;
    
    // Set different values based on timeframe
    switch (timeframe) {
      case 'month':
        totalRevenue = 527850.00;
        totalExpenses = 412635.45;
        break;
      case 'quarter':
        totalRevenue = 1368250.00;
        totalExpenses = 1054328.75;
        break;
      case 'year':
        totalRevenue = 4982650.00;
        totalExpenses = 3752980.32;
        break;
      case 'ytd':
        totalRevenue = 1827850.00;
        totalExpenses = 1412635.45;
        break;
      default:
        totalRevenue = 527850.00;
        totalExpenses = 412635.45;
    }
    
    // Calculate net profit and profit margin
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = netProfit / totalRevenue;
    
    // Sample recent expenses
    const recentExpenses = [
      {
        id: 'exp-1001',
        category: 'Office Supplies',
        amount: 3250.75,
        date: '2025-05-03'
      },
      {
        id: 'exp-1002',
        category: 'Travel',
        amount: 5820.50,
        date: '2025-05-01'
      },
      {
        id: 'exp-1003',
        category: 'Software Subscriptions',
        amount: 1875.25,
        date: '2025-04-28'
      },
      {
        id: 'exp-1004',
        category: 'Training Materials',
        amount: 4325.00,
        date: '2025-04-25'
      },
      {
        id: 'exp-1005',
        category: 'Utilities',
        amount: 2150.80,
        date: '2025-04-20'
      }
    ];
    
    // Sample recent invoices
    const recentInvoices = [
      {
        id: 'inv-8001',
        number: 'INV-8001',
        amount: 12850.00,
        status: 'sent',
        date: '2025-05-01'
      },
      {
        id: 'inv-7999',
        number: 'INV-7999',
        amount: 4850.00,
        status: 'paid',
        date: '2025-04-15'
      },
      {
        id: 'inv-7995',
        number: 'INV-7995',
        amount: 7800.00,
        status: 'overdue',
        date: '2025-04-01'
      },
      {
        id: 'inv-8002',
        number: 'INV-8002',
        amount: 3900.00,
        status: 'draft',
        date: '2025-05-05'
      }
    ];
    
    // Return the financial summary data
    res.status(200).json({
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      revenueYTD: 1827850.00,
      expensesYTD: 1412635.45,
      recentExpenses,
      recentInvoices
    });
    
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch financial summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}