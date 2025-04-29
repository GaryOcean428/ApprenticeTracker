import { NextRequest, NextResponse } from 'next/server';
import { leadService, taskService, staffService } from '@/services/adaptedServices';

// Adapted API route to work with existing database schema
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { error: 'Missing required fields: first name, last name, and email are required' },
        { status: 400 }
      );
    }
    
    // Create lead using the adapted service
    const result = await leadService.createLead(body);
    
    return NextResponse.json({ 
      success: true, 
      lead_id: result.lead.id,
      task_id: result.task?.id,
      message: 'Lead created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead', details: error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    
    if (!email && !id) {
      return NextResponse.json(
        { error: 'Missing search parameters: email or id required' },
        { status: 400 }
      );
    }
    
    let lead;
    if (id) {
      lead = await leadService.getLeadById(id);
    } else {
      // Get leads with filter by email
      const result = await leadService.getLeads(1, 1, {}, email);
      lead = result.leads[0];
    }
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ lead }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead', details: error },
      { status: 500 }
    );
  }
}
