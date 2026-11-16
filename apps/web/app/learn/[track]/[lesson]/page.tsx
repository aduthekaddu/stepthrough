import type { Metadata } from 'next';
import Link from 'next/link';
import { FastPathBar, LessonScope } from '@/components/lesson/lesson-scope';
import { PopoverSupport } from '@/components/lesson/popover-support';
import { findLesson, lessonById, listLessons } from '@/lib/content';
import type { LessonId } from '@/lib/learner';
import { trackTitle } from '@/lib/tracks';

export const dynamicParams = false;

type Params = { params: Promise<{ track: string; lesson: string }> };

export function generateStaticParams() {
  return listLessons().map(({ track, slug }) => ({ track, lesson: slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { track, lesson } = await params;
  return { title: findLesson(track, lesson).meta.title };
}

export default async function LessonPage({ params }: Params) {
  const { track, lesson } = await params;
  const { meta } = findLesson(track, lesson);
  const { default: Body } = await import(`@/content/${track}/${lesson}/index.mdx`);
  const prereqs = meta.prereqs.map(lessonById);

  return (
    <main id="main">
      <article>
        <LessonScope lessonId={meta.id as LessonId}>
          <header className="lesson-header">
            <nav aria-label="Breadcrumb" className="breadcrumb ui">
              <ol>
                <li>
                  <Link href="/">{trackTitle(track)}</Link>
                </li>
                <li aria-current="page">{meta.title}</li>
              </ol>
            </nav>
            <h1 className="lesson-title">{meta.title}</h1>
            <p className="lesson-meta ui">
              {meta.status === 'draft' && <span className="draft-label">Draft</span>}
              <span>{meta.minutes} min</span>
              {prereqs.length > 0 && (
                <span>
                  Before this:{' '}
                  {prereqs.map((p, i) => (
                    <span key={p.meta.id}>
                      {i > 0 && ', '}
                      <Link href={p.href}>{p.meta.title}</Link>
                    </span>
                  ))}
                </span>
              )}
            </p>
            <h2 className="panel-label outcomes-label">You will be able to</h2>
            <ul className="outcomes">
              {meta.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
            <FastPathBar />
          </header>
          <Body />
        </LessonScope>
      </article>
      <PopoverSupport />
    </main>
  );
}
