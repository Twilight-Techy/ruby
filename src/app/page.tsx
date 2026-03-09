'use client';

import Link from 'next/link';
import { Plus, NotePencil, Exam, Sun, Moon, SignOut, User, SignIn } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from '@/lib/ThemeProvider';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

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
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      if (isPending) return;
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (data.unauthorized) {
          // Handle session mismatch
        } else {
          setNotes(data.notes || []);
          setQuizCount(data.quizCount || 0);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session, isPending]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="page-container flex-col items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-blue">
          <Plus size={48} weight="bold" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="page-container">
      <header className="dashboard-header">
        <h1 className="heading-xl no-margin">Ruby</h1>
        <div className="flex-row items-center gap-12">
          <button
            className="glass-card icon-btn-round"
            title="Toggle theme"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={20} weight="bold" color="var(--color-accent-orange)" /> : <Moon size={20} weight="bold" color="var(--color-accent-purple)" />}
          </button>
          {session ? (
            <div className="flex-row items-center gap-8 glass-card py-6 px-12 rounded-full border border-card-border">
              <User size={18} weight="fill" color="var(--color-primary-blue)" />
              <span className="text-xs font-semibold max-w-[100px] truncate">{session.user.name || session.user.email}</span>
              <button onClick={handleLogout} title="Sign Out" className="text-muted hover:text-error transition-colors">
                <SignOut size={16} weight="bold" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-ghost btn-sm py-8">
              <SignIn size={18} weight="bold" /> Sign In
            </Link>
          )}
        </div>
      </header>

      {!session ? (
        <div className="glass-card p-40 text-center flex-col items-center gap-20 mt-40">
          <div className="w-64 h-64 rounded-full bg-blue/10 flex items-center justify-center mb-12">
            <NotePencil size={32} color="var(--color-primary-blue)" />
          </div>
          <h2 className="heading-lg">Sign in to start learning</h2>
          <p className="text-muted max-w-[500px]">
            Rubys AI-powered smarter notes help you summarize, learn, and quiz your lectures.
            Keep your notes safe and accessible anywhere.
          </p>
          <Link href="/login" className="btn-primary px-40">
            Get Started for Free
          </Link>
        </div>
      ) : (
        <>
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
        </>
      )}
    </main>
  );
}
