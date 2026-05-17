import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Zap, Mic, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', overflowX: 'hidden' }}>

      {/* Volt halo */}
      <div style={{ position: 'fixed', inset: '0 0 auto 0', height: 480, pointerEvents: 'none', background: 'radial-gradient(60% 60% at 50% 0%, oklch(0.92 0.22 122 / 0.15) 0%, transparent 70%)', zIndex: 0 }}/>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--primary)', display: 'grid', placeItems: 'center', color: 'var(--primary-foreground)' }}>
              <Zap size={14} strokeWidth={2.5}/>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>GymBuddy AI</span>
          </div>
          <Link href="/auth/login" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.12em', textDecoration: 'none' }}>
            Sign in →
          </Link>
        </nav>

        {/* Hero + preview — two col on desktop */}
        <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center" style={{ paddingTop: 64 }}>

          {/* Left: copy + CTAs */}
          <div>
            <div className="eyebrow" style={{ color: 'var(--primary)' }}>Voice-first workout log</div>
            <h1 style={{ fontSize: 'clamp(52px, 8vw, 72px)', lineHeight: 0.97, fontWeight: 800, letterSpacing: '-0.04em', margin: '16px 0 0' }}>
              Train.<br/>Talk.<br/><span style={{ color: 'var(--primary)' }}>Tracked.</span>
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 16, lineHeight: 1.6, marginTop: 20, maxWidth: 380 }}>
              Speak your set. AI structures every rep, weight, and muscle group — then tells you what to lift next.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 36, maxWidth: 340 }}>
              <Link href="/auth/login?signup=1" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: 48, borderRadius: 12, border: 'none',
                background: 'var(--primary)', color: 'var(--primary-foreground)',
                fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
                textDecoration: 'none', transition: 'box-shadow 120ms',
              }}>
                Create your account <ArrowRight size={16}/>
              </Link>
              <Link href="/auth/login" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: 48, borderRadius: 12, border: '1px solid var(--border-strong)',
                background: 'transparent', color: 'var(--muted-foreground)',
                fontFamily: 'inherit', fontSize: 15, fontWeight: 500,
                textDecoration: 'none',
              }}>
                I already have an account
              </Link>
            </div>
          </div>

          {/* Right: preview card */}
          <div style={{ marginTop: 48 }} className="md:mt-0">
            <div style={{ background: 'var(--surface-1)', borderRadius: 20, boxShadow: 'inset 0 0 0 1px var(--border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* User message */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--muted)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Mic size={13}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="eyebrow" style={{ fontSize: 9 }}>You · 06:42</div>
                  <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.55 }}>
                    &ldquo;Four sets of bench at eighty kilos, eight reps. Then three by twelve rows at twenty-five, finished with a twenty minute run.&rdquo;
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border)' }}/>

              {/* AI response */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--primary-foreground)' }}>
                  <Zap size={14} strokeWidth={2.5}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="eyebrow" style={{ fontSize: 9, color: 'var(--primary)' }}>Logged · push day</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                    {[
                      ['Bench Press',   '4×8',   '80 kg'],
                      ['Dumbbell Row',  '3×12',  '25 kg'],
                      ['Run',           '20 min', ''],
                    ].map(([name, sr, w]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
                        <span className="metric" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                          <span style={{ color: 'var(--foreground)' }}>{sr}</span>{w ? ` · ${w}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature trio */}
        <div className="md:grid md:grid-cols-3" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 64 }}>
          {[
            { label: 'Voice',  sub: 'Hands-free logging. Just speak your workout as you finish it.' },
            { label: 'AI',     sub: 'Auto-parses sets, reps, weight, distance, and muscle groups.' },
            { label: 'Coach',  sub: 'Analyzes 30 days of history and tells you exactly what to lift next.' },
          ].map((f) => (
            <div key={f.label} style={{ background: 'var(--surface-1)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: 20 }}>
              <div className="eyebrow" style={{ color: 'var(--primary)' }}>{f.label}</div>
              <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 8, lineHeight: 1.6 }}>{f.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--subtle-foreground)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '48px 0 32px' }}>
          Built on Groq · llama-3.3-70b
        </div>
      </div>
    </main>
  );
}
