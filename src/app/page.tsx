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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <h1 className="heading-xl" style={{ margin: 0 }}>Smart Notes</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="glass-card" style={{ padding: '12px', borderRadius: '50%', display: 'flex' }}>
            <Student size={24} color="var(--color-primary-blue)" weight="fill" />
          </button>
        </div>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>Welcome back!</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>You have {allNotes.length} notes and {allQuizzes.length} quizzes ready.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/quizzes" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '24px 0 16px', color: 'var(--color-text-muted)' }}>Recent Notes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {allNotes.length === 0 ? (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px', opacity: 0.7, borderStyle: 'dashed' }}>
                <Note size={32} color="var(--color-text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>No notes yet. Create one!</p>
              </div>
            ) : (
              allNotes.map(n => (
                <Link key={n.id} href={`/notes/${n.id}`} className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '160px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>{n.title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'auto' }}>
                    {n.summary ? (n.summary.substring(0, 100) + '...') : 'No summary'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', color: 'var(--color-primary-red)' }}>
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
