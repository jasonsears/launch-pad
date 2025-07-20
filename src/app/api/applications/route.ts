import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

// GET: List all applications
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      include: { job: true },
      orderBy: { viewedAt: 'desc' },
    });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST: Mark a job as viewed (or update status)
export async function POST(request: NextRequest) {
  console.log('=== API CALL STARTED ===');
  
  try {
    const body = await request.json();
    console.log('✅ Received request body:', JSON.stringify(body, null, 2));
    
    const { jobId, company, position, source, jobTitle, jobSnippet, datePosted } = body;
    
    if (!jobId || !company || !position) {
      console.log('❌ Missing required fields:', { jobId, company, position });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('✅ All required fields present');
    console.log('🔍 Looking for existing job with URL:', jobId);
    
    // First, try to find or create the Job record
    let job;
    try {
      job = await prisma.job.findFirst({ where: { url: jobId } });
      console.log('✅ Job query completed. Found:', job ? `Job ID ${job.id}` : 'No existing job');
    } catch (jobFindError) {
      console.error('❌ Error finding job:', jobFindError);
      throw jobFindError;
    }
    
    if (!job) {
      console.log('📝 Creating new job record with data:', {
        title: jobTitle || position,
        company: company,
        url: jobId,
        source: source || 'Unknown',
        description: (jobSnippet || '').substring(0, 50) + '...',
        datePosted: datePosted ? new Date(datePosted) : new Date(),
      });
      
      try {
        job = await prisma.job.create({
          data: {
            title: jobTitle || position,
            company: company,
            url: jobId,
            source: source || 'Unknown',
            description: jobSnippet || '',
            datePosted: datePosted ? new Date(datePosted) : new Date(),
            isRemote: false,
          },
        });
        console.log('✅ Successfully created job with ID:', job.id);
      } catch (jobCreateError) {
        console.error('❌ Error creating job:', jobCreateError);
        throw jobCreateError;
      }
    }

    console.log('🔍 Looking for existing application for job ID:', job.id);
    
    // Now find if an application already exists for this job
    let application;
    try {
      application = await prisma.application.findFirst({ where: { jobId: job.id } });
      console.log('✅ Application query completed. Found:', application ? `Application ID ${application.id}` : 'No existing application');
    } catch (appFindError) {
      console.error('❌ Error finding application:', appFindError);
      throw appFindError;
    }
    
    if (application) {
      console.log('📝 Updating existing application:', application.id);
      try {
        application = await prisma.application.update({
          where: { id: application.id },
          data: {
            status: ApplicationStatus.VIEWED,
            viewedAt: new Date(),
          },
        });
        console.log('✅ Successfully updated application');
      } catch (appUpdateError) {
        console.error('❌ Error updating application:', appUpdateError);
        throw appUpdateError;
      }
    } else {
      console.log('📝 Creating new application with data:', {
        jobId: job.id,
        company,
        position,
        status: 'VIEWED',
        source,
      });
      
      try {
        application = await prisma.application.create({
          data: {
            jobId: job.id,
            company,
            position,
            status: ApplicationStatus.VIEWED,
            viewedAt: new Date(),
            source,
          },
        });
        console.log('✅ Successfully created application with ID:', application.id);
      } catch (appCreateError) {
        console.error('❌ Error creating application:', appCreateError);
        throw appCreateError;
      }
    }
    
    console.log('🎉 API call completed successfully');
    return NextResponse.json(application);
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR in API call:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Failed to mark as viewed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 });
  }
}

// PUT: Update application status/fields
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PUT request body:', body);
    
    const { id, status, notes, appliedAt, responseDate, interviewDate } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }
    
    const updateData: {
      status?: ApplicationStatus;
      notes?: string | null;
      appliedAt?: string | null;
      responseDate?: string | null;
      interviewDate?: string | null;
    } = {};
    if (status !== undefined) updateData.status = status as ApplicationStatus;
    if (notes !== undefined) updateData.notes = notes;
    if (appliedAt !== undefined) updateData.appliedAt = appliedAt;
    if (responseDate !== undefined) updateData.responseDate = responseDate;
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate;
    
    console.log('Updating application with data:', updateData);
    
    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        job: true, // Include the job data in the response
      },
    });
    
    console.log('Successfully updated application:', application);
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

// DELETE: Remove an application
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }
    
    await prisma.application.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
