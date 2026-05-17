"use client";

import { Mic, MicOff, ArrowRight } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onLog: () => void;
  onToggleVoice: () => void;
  isListening: boolean;
  loading: boolean;
}

const BARS = [10, 18, 6, 22, 14, 20, 8, 16, 12, 24, 10, 18, 6, 14, 20, 12, 22, 8, 16, 10, 18, 6, 12, 20, 14, 10, 16, 8, 22, 12];

export default function AICaptureCard({ value, onChange, onLog, onToggleVoice, isListening, loading }: Props) {
  const canSubmit = !loading && value.trim().length > 0;

  return (
    <div style={{
      background: 'linear-gradient(180deg, var(--surface-1) 0%, var(--surface-2) 100%)',
      boxShadow: 'inset 0 0 0 1px var(--border-strong)',
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Status row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 22 }}>
        {isListening ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
            color: 'var(--primary)',
            background: 'var(--primary-soft)',
            border: '1px solid color-mix(in oklab, var(--primary) 30%, transparent)',
            borderRadius: 999, padding: '3px 8px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }}/>
            Listening
          </span>
        ) : (
          <span className="eyebrow">Describe your workout</span>
        )}
      </div>

      {/* Transcription / text input */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'e.g. "Four sets of bench at 80kg, eight reps. Then 3×12 rows, 20 min run"'}
        rows={3}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          lineHeight: 1.55,
          color: value ? 'var(--foreground)' : 'var(--subtle-foreground)',
          minHeight: 70,
        }}
      />

      {/* Waveform (visible while listening) */}
      {isListening && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 24 }}>
          {BARS.map((h, i) => (
            <span key={i} style={{
              flex: 1,
              height: h,
              background: 'var(--primary)',
              borderRadius: 1,
              opacity: i > 22 ? 0.25 : 1,
            }}/>
          ))}
        </div>
      )}

      {/* Footer: mic + log */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={onToggleVoice}
          title={isListening ? 'Stop recording' : 'Speak your workout'}
          style={{
            width: 40, height: 40, flexShrink: 0,
            display: 'grid', placeItems: 'center',
            borderRadius: 10, border: '1px solid',
            borderColor: isListening
              ? 'color-mix(in oklab, var(--destructive) 50%, var(--border-strong))'
              : 'color-mix(in oklab, var(--primary) 40%, var(--border-strong))',
            background: 'transparent',
            color: isListening ? 'var(--destructive)' : 'var(--primary)',
            cursor: 'pointer',
            transition: 'border-color 120ms, color 120ms',
          }}
        >
          {isListening ? <MicOff size={16}/> : <Mic size={16}/>}
        </button>

        <button
          type="button"
          onClick={onLog}
          disabled={!canSubmit}
          style={{
            flex: 1, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            borderRadius: 10, border: 'none',
            background: canSubmit ? 'var(--primary)' : 'color-mix(in oklab, var(--primary) 30%, transparent)',
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background 120ms, box-shadow 120ms',
            boxShadow: canSubmit ? 'none' : undefined,
          }}
          onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          {loading ? 'Parsing…' : 'Log workout'}
          {!loading && <ArrowRight size={14}/>}
        </button>
      </div>
    </div>
  );
}
