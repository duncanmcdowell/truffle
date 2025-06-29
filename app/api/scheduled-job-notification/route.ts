import { NextRequest, NextResponse } from 'next/server';
import { createNotificationsTable, addScheduledJobNotification, getUnreadScheduledJobNotifications, markScheduledJobNotificationsRead } from '../../../db';

// Ensure notifications table exists
createNotificationsTable();

export async function POST(req: NextRequest) {
  const { inserted, skipped } = await req.json();
  
  const timestamp = new Date().toISOString();
  addScheduledJobNotification({ timestamp, inserted, skipped });
  console.log('Scheduled job notification stored:', { timestamp, inserted, skipped });
  return NextResponse.json({ success: true });
}

export async function GET() {
  // Return unread notifications from the database
  const unread = getUnreadScheduledJobNotifications() as Array<{ id: number; timestamp: string; inserted: number; skipped: number; read: number }>;
  if (unread.length > 0) {
    markScheduledJobNotificationsRead(unread.map(n => n.id));
  }
  // For compatibility with frontend, add string id
  const notifications = unread.map(n => ({
    id: `scheduled-${n.id}`,
    timestamp: n.timestamp,
    inserted: n.inserted,
    skipped: n.skipped,
    read: !!n.read,
  }));
  return NextResponse.json({ notifications });
} 