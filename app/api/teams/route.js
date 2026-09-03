import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';

const INITIAL_TEAMS = [
  { 
    id: 'engineers', 
    name: 'المهندسون الحاذقون', 
    englishName: 'Skilled Engineers',
    color: 'bg-sky-950/90', 
    hover: 'hover:bg-sky-900',
    borderColor: 'border-sky-400/30',
    glowColor: 'rgba(56, 189, 248, 0.4)'
  },
  { 
    id: 'chefs', 
    name: 'الطباخون الماهرون', 
    englishName: 'Skilled Chefs',
    color: 'bg-rose-950/90', 
    hover: 'hover:bg-rose-900',
    borderColor: 'border-rose-400/30',
    glowColor: 'rgba(251, 113, 133, 0.4)'
  },
  { 
    id: 'teachers', 
    name: 'المعلمون المتعلمون', 
    englishName: 'Educated Teachers',
    color: 'bg-emerald-950/90', 
    hover: 'hover:bg-emerald-900',
    borderColor: 'border-emerald-400/30',
    glowColor: 'rgba(52, 211, 153, 0.4)'
  },
  { 
    id: 'technicians', 
    name: 'التقنيون المتطورون', 
    englishName: 'Advanced Technicians',
    color: 'bg-violet-950/90', 
    hover: 'hover:bg-violet-900',
    borderColor: 'border-violet-400/30',
    glowColor: 'rgba(167, 139, 250, 0.4)'
  },
];

async function checkAndSyncDatabase() {
  const snapshot = await getDocs(collection(db, 'teams'));
  const currentDocs = snapshot.docs.map(doc => doc.id);
  
  // If the old wrong teams are there (e.g. 'team-yellow'), delete them all!
  if (currentDocs.includes('team-yellow')) {
    for (const docId of currentDocs) {
      await deleteDoc(doc(db, 'teams', docId));
    }
    // Re-create the correct teams
    for (const team of INITIAL_TEAMS) {
      await setDoc(doc(db, 'teams', team.id), { ...team, votes: 0 });
    }
  } else if (snapshot.empty) {
    // Standard initialization if truly empty
    for (const team of INITIAL_TEAMS) {
      await setDoc(doc(db, 'teams', team.id), { ...team, votes: 0 });
    }
  }
}

export async function GET() {
  try {
    await checkAndSyncDatabase();
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
