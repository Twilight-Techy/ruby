import Link from 'next/link';
import { Plus, Note, Student, Exam } from '@phosphor-icons/react/dist/ssr';
import { db } from '@/lib/db';
import { notes, quizzes } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export default async function Home() {
  const allNotes = await db.select().from(notes).orderBy(desc(notes.createdAt)).limit(6);
  const allQuizzes = await db.select().from(quizzes);

  return (
    <main className="page-container">
      <header className="dashboard-header">
        <h1 className="heading-xl no-margin">Smart Notes</h1>
        <div className="flex-row gap-16">
          <button className="glass-card icon-btn-round" title="User Profile" aria-label="User Profile">
            <Student size={24} color="var(--color-primary-blue)" weight="fill" />
          </button>
        </div>
      </header>

      <section className="flex-col gap-24">
        <div className="glass-card welcome-card">
          <div>
            <h2 className="text-xl font-semibold mb-8">Welcome back!</h2>
            <p className="text-muted">You have {allNotes.length} notes and {allQuizzes.length} quizzes ready.</p>
          </div>
          <div className="flex-row gap-12">
            <Link href="/quizzes" className="glass-card quiz-nav-link">
              <Exam size={20} color="var(--color-accent-purple)" />
              My Quizzes
            </Link>
            <Link href="/notes/new" className="btn-primary">
              <Plus size={20} weight="bold" />
              New Note
            </Link>
          </div>
        </div>

        <div>
          <h3 className="section-title">Recent Notes</h3>
          <div className="notes-grid">
            {allNotes.length === 0 ? (
              <div className="glass-card note-card-empty">
                <Note size={32} color="var(--color-text-muted)" className="mb-12" />
                <p className="text-muted">No notes yet. Create one!</p>
              </div>
            ) : (
              allNotes.map(n => (
                <Link key={n.id} href={`/notes/${n.id}`} className="glass-card note-card-link">
                  <h4 className="text-md font-bold mb-8">{n.title}</h4>
                  <p className="text-muted text-sm mb-auto">
                    {n.summary ? (n.summary.substring(0, 100) + '...') : 'No summary'}
                  </p>
                  <div className="note-card-footer">
                    <Note size={24} weight="duotone" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
