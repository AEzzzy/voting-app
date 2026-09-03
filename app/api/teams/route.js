import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory database for local testing
let teams = [
  { id: 'engineers', name: 'المهندسون الحاذقون', englishName: 'The Skillful Engineers', color: 'bg-sky-500', votes: 0 },
  { id: 'chefs', name: 'الطباخون الماهرون', englishName: 'The Skilled Chefs', color: 'bg-rose-500', votes: 0 },
  { id: 'teachers', name: 'المعلمون المتعلمون', englishName: 'The Educated Teachers', color: 'bg-emerald-500', votes: 0 },
  { id: 'technicians', name: 'التقنيون المتطورون', englishName: 'The Advanced Technicians', color: 'bg-violet-500', votes: 0 },
];

export async function GET() {
  return NextResponse.json(teams);
}

export async function POST(request) {
  try {
    const { teamId } = await request.json();
    const team = teams.find(t => t.id === teamId);
    if (team) {
      team.votes += 1;
      return NextResponse.json({ success: true, team });
    }
    return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  teams = teams.map(t => ({ ...t, votes: 0 }));
  return NextResponse.json({ success: true });
}
