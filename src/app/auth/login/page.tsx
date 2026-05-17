"use client";

import { useState } from "react";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      {/* Volt halo */}
      <div style={{ position: 'fixed', inset: '0 0 auto 0', height: 400, pointerEvents: 'none', background: 'radial-gradient(50% 50% at 50% 0%, oklch(0.92 0.22 122 / 0.12) 0%, transparent 70%)', zIndex: 0 }}/>

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* Bolt mark */}
        <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'var(--primary-foreground)', boxShadow: '0 8px 24px -4px var(--primary-glow)' }}>
          <Zap size={24} strokeWidth={2.5}/>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '24px 0 6px' }}>
          {isSignUp ? 'Create account.' : 'Welcome back.'}
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.5, marginBottom: 32 }}>
          {isSignUp ? 'Start logging your training today.' : 'Pick up your streak. Your log is waiting.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle-foreground)', pointerEvents: 'none' }}>
                <Mail size={15}/>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%', height: 44, paddingLeft: 38, paddingRight: 12,
                  background: 'color-mix(in oklab, var(--input) 30%, transparent)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, outline: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: 'var(--foreground)',
                  transition: 'border-color 120ms, box-shadow 120ms',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--ring)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="eyebrow">Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--subtle-foreground)', pointerEvents: 'none' }}>
                <Lock size={15}/>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                style={{
                  width: '100%', height: 44, paddingLeft: 38, paddingRight: 44,
                  background: 'color-mix(in oklab, var(--input) 30%, transparent)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, outline: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: 14,
                  color: 'var(--foreground)',
                  transition: 'border-color 120ms, box-shadow 120ms',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--ring)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--destructive)', fontFamily: 'var(--font-mono)' }}>{error}</p>
          )}

          {/* Primary CTA */}
          <button type="submit" disabled={loading} style={{
            width: '100%', height: 48, marginTop: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: loading ? 'color-mix(in oklab, var(--primary) 50%, transparent)' : 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: 'none', borderRadius: 12,
            fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 120ms, box-shadow 120ms',
          }}>
            {loading ? 'Loading…' : isSignUp ? 'Create account' : 'Sign in'}
            {!loading && <ArrowRight size={16}/>}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          <span className="eyebrow" style={{ color: 'var(--subtle-foreground)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
        </div>

        {/* Apple SSO (stub) */}
        <button type="button" onClick={() => alert('Apple SSO not yet configured')} style={{
          width: '100%', height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: 'transparent', color: 'var(--foreground)',
          border: '1px solid var(--border-strong)', borderRadius: 12,
          fontFamily: 'inherit', fontSize: 15, fontWeight: 500,
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>

        {/* Toggle sign in / sign up */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted-foreground)', marginTop: 28 }}>
          {isSignUp ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, fontSize: 14, cursor: 'pointer', padding: 0 }}>
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </main>
  );
}
