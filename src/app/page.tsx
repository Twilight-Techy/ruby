'use client';

import Link from 'next/link';
import { Plus, NotePencil, Exam, Sun, Moon } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from '@/lib/ThemeProvider';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NoteData {
  id: string;
  title: string;
  summary: string | null;
  createdAt: string;
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setNotes(data.notes || []);
        setQuizCount(data.quizCount || 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="page-container">
      <header className="dashboard-header">
        <h1 className="heading-xl no-margin">Ruby Smart Notes</h1>
        <button
          className="glass-card icon-btn-round"
          title="Toggle theme"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={22} weight="bold" color="var(--color-accent-orange)" /> : <Moon size={22} weight="bold" color="var(--color-accent-purple)" />}
        </button>
      </header>

      {/* Stats */}
      <div className="stat-row">
        <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-number">{notes.length}</div>
          <div className="stat-label">Notes</div>
        </motion.div>
        <motion.div className="glass-card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-number">{quizCount}</div>
          <div className="stat-label">Quizzes</div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="action-bar">
        <Link href="/notes/new" className="btn-primary">
          <Plus size={18} weight="bold" /> New Note
        </Link>
        <Link href="/quizzes" className="btn-secondary">
          <Exam size={18} weight="bold" /> Quizzes
        </Link>
      </div>

      {/* Recent Notes */}
      <div className="section-title">Recent Notes</div>
      <div className="notes-grid">
        {loading ? (
          <div className="glass-card note-card-empty">
            <p className="text-muted">Loading...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="glass-card note-card-empty">
            <NotePencil size={36} color="var(--color-text-muted)" className="mb-12" />
            <p className="text-muted text-sm">No notes yet. Create your first!</p>
          </div>
        ) : (
          notes.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <Link href={`/notes/${n.id}`} className="glass-card note-card-link">
                <h4 className="heading-md mb-4">{n.title}</h4>
                <p className="text-muted text-sm mb-auto">
                  {n.summary ? (n.summary.substring(0, 90) + '...') : 'Tap to view'}
                </p>
                <div className="note-card-footer">
                  <span className="text-xs text-muted">{new Date(n.createdAt).toLocaleDateString()}</span>
                  <NotePencil size={18} color="var(--color-primary-red)" weight="duotone" />
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </main>
  );
}
