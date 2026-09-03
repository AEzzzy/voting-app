import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, increment, setDoc } from 'firebase/firestore';

const INITIAL_TEAMS = [
  { id: 'team-yellow', name: 'الفريق الأصفر', englishName: 'Yellow Team', color: 'bg-amber-500', hover: 'hover:bg-amber-400' },
  { id: 'team-silver', name: 'الفريق الفضي', englishName: 'Silver Team', color: 'bg-slate-400', hover: 'hover:bg-slate-300' },
  { id: 'team-orange', name: 'الفريق البرتقالي', englishName: 'Orange Team', color: 'bg-orange-500', hover: 'hover:bg-orange-400' },
  { id: 'team-blue', name: 'الفريق الأزرق', englishName: 'Blue Team', color: 'bg-indigo-600', hover: 'hover:bg-indigo-500' }
];

async function initializeDatabaseIfEmpty() {
  const snapshot = await getDocs(collection(db, 'teams'));
  if (snapshot.empty) {
    for (const team of INITIAL_TEAMS) {
      await setDoc(doc(db, 'teams', team.id), { ...team, votes: 0 });
    }
  }
}

export async function GET() {
  try {
    await initializeDatabaseIfEmpty();
    const snapshot = await getDocs(collection(db, 'teams'));
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Firebase GET Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { teamId } = await request.json();
    const teamRef = doc(db, 'teams', teamId);
    
    // Automatically increments the vote by 1 in Firebase directly!
    await updateDoc(teamRef, { votes: increment(1) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Firebase POST Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const snapshot = await getDocs(collection(db, 'teams'));
    for (const document of snapshot.docs) {
      const teamRef = doc(db, 'teams', document.id);
      await updateDoc(teamRef, { votes: 0 }); // Reset votes to 0
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Firebase DELETE Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
