import { listLessons, readLesson } from '@/lib/content';

export const dynamicParams = false;

export async function generateStaticParams() {
  return listLessons();
}

function Probe({ label }: { label: string }) {
  return <p data-probe>{label}</p>;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; lesson: string }>;
}) {
  const { track, lesson } = await params;
  const meta = await readLesson(track, lesson);
  const { default: Body } = await import(`@/content/${track}/${lesson}.mdx`);
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p>{meta.title}</p>
      <Body components={{ Probe }} />
    </main>
  );
}
