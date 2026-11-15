'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { db } from '@/lib/learner';

type LessonLink = { id: string; title: string; href: string };

/** Links to the lesson visited last, or to the first lesson before any visit. */
export function ContinueLink({ lessons }: { lessons: LessonLink[] }) {
  const last = useLiveQuery(() => db.lessonProgress.orderBy('lastVisitedAt').last());
  const visited = lessons.find((l) => l.id === last?.lessonId);
  const target = visited ?? lessons[0];
  if (!target) return null;
  return (
    <p className="continue">
      <Link href={target.href} className="btn btn-primary">
        {visited ? 'Continue' : 'Start'}: {target.title}
      </Link>
    </p>
  );
}
