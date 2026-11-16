import Link from 'next/link';
import { ContinueLink } from '@/components/continue-link';
import { type Lesson, listPathLessons } from '@/lib/content';
import { trackTitle } from '@/lib/tracks';

export default function Home() {
  const lessons = listPathLessons();
  const tracks = new Map<string, Lesson[]>();
  for (const lesson of lessons)
    tracks.set(lesson.track, [...(tracks.get(lesson.track) ?? []), lesson]);
  return (
    <main id="main" className="home">
      <h1 className="lesson-title">Stepthrough</h1>
      <p className="home-intro">Software engineering from first principles, one step at a time.</p>
      <ContinueLink
        lessons={lessons.map((l) => ({ id: l.meta.id, title: l.meta.title, href: l.href }))}
      />
      {[...tracks].map(([track, trackLessons]) => (
        <section key={track} className="home-track" aria-labelledby={`track-${track}`}>
          <h2 id={`track-${track}`} className="panel-label home-track-title">
            {trackTitle(track)}
          </h2>
          <ol className="home-lessons">
            {trackLessons.map((l) => (
              <li key={l.meta.id} className="home-lesson">
                <Link href={l.href}>{l.meta.title}</Link>
                <span className="ui home-lesson-meta">
                  {l.meta.minutes} min
                  {l.meta.status === 'draft' && <span className="draft-label">Draft</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
