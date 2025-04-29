import { FairWorkClient } from '@/lib/fairwork/client';
import { NextResponse } from 'next/server';

interface LeaveEntitlementsParams {
  awardCode: string;
  classificationCode: string;
}

const fairworkClient = new FairWorkClient();

export async function GET(
  _req: Request,
  { params }: { params: Promise<LeaveEntitlementsParams> }
) {
  try {
    const { awardCode, classificationCode } = await params;
    if (!awardCode || !classificationCode) {
      return NextResponse.json(
        { error: 'Missing required parameters: awardCode and classificationCode' },
        { status: 400 }
      );
    }

    const url = new URL(_req.url);
    const query = {
      date: url.searchParams.get('date') || undefined,
      employmentType: url.searchParams.get('employmentType') || undefined,
    };

    const leaveEntitlements = await fairworkClient.getLeaveEntitlements(awardCode, classificationCode, query);
    return NextResponse.json(leaveEntitlements);
  } catch (error) {
    console.error('Failed to fetch leave entitlements:', error);
    return NextResponse.json({ error: 'Failed to fetch leave entitlements' }, { status: 500 });
  }
}
