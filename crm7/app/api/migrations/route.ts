import { MigrationHandler } from '@/lib/schema/migration-handler';
import { NextResponse } from 'next/server';
import path from 'path';
import type { TableSchema } from '@/lib/types/schema-component';

const migrationHandler = new MigrationHandler(path.join(process.cwd(), 'migrations'));

export async function POST(request: Request) {
  try {
    const { migration, description } = await request.json();
    const oldSchema: TableSchema[] = []; // Empty array for initial schema
    const filename = await migrationHandler.saveMigration(oldSchema, migration, description);
    return NextResponse.json({ success: true, filename });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const history = await migrationHandler.getMigrationHistory();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
