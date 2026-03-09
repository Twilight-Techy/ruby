'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { CaretLeft, GoogleLogo, GithubLogo, Envelope, Lock, UserPlus, SignIn } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { error: signUpError } = await authClient.signUp.email({
                    email,
                    password,
                    name: email.split('@')[0],
                });
                if (signUpError) throw signUpError;
            } else {
                const { error: signInError } = await authClient.signIn.email({
                    email,
                    password,
                });
                if (signInError) throw signInError;
            }
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (provider: 'google' | 'github') => {
        await authClient.signIn.social({
            provider,
            callbackURL: '/',
        });
    };

    return (
        <main className="page-container flex-col items-center justify-center min-h-[80vh]">
            <Link href="/" className="nav-link-back self-start">
                <CaretLeft weight="bold" /> Back to home
            </Link>

            <div className="glass-card max-w-[400px] w-full p-32">
                <header className="text-center mb-32">
                    <h1 className="heading-lg mb-8">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className="text-muted text-sm">
                        {isSignUp ? 'Join Ruby to start organizing your notes' : 'Sign in to access your smart notes'}
                    </p>
                </header>

                <form onSubmit={handleEmailAuth} className="form-vertical">
                    <div className="field-group">
                        <label className="field-label">Email Address</label>
                        <div className="relative">
                            <Envelope size={18} className="absolute left-12 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="email"
                                className="input-dark pl-40"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-12 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="password"
                                className="input-dark pl-40"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-error text-xs">{error}</p>}

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-8">
                        {loading ? 'Processing...' : (isSignUp ? <UserPlus size={18} weight="bold" /> : <SignIn size={18} weight="bold" />)}
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="relative my-24 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-card-border"></div>
                    </div>
                    <span className="relative px-8 bg-bg-surface text-muted text-xs uppercase letter-spacing-widest">Or continue with</span>
                </div>

                <div className="flex-row gap-12">
                    <button
                        onClick={() => handleSocialAuth('google')}
                        className="btn-ghost flex-1 py-12 px-0 justify-center"
                        title="Sign in with Google"
                        aria-label="Sign in with Google"
                    >
                        <GoogleLogo size={20} weight="bold" />
                        <span className="text-sm font-semibold ml-8">Google</span>
                    </button>
                </div>

                <footer className="mt-32 text-center text-sm">
                    <p className="text-muted">
                        {isSignUp ? 'Already have an account? ' : 'Need an account? '}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-blue font-semibold ml-4 hover:underline"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </footer>
            </div>
        </main>
    );
}
