"use client";

import { useState } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import StatCard from "@/components/StatCard";
import type { ExerciseProgress } from "@/types/progress";

interface Props {
  exercises: ExerciseProgress[];
  sessionCount: number;
}

const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

export default function ProgressTab({ exercises, sessionCount }: Props) {
  const [selected, setSelected] = useState(exercises[0]?.name ?? "");

  const current = exercises.find((e) => e.name === selected) ?? exercises[0];

  const topPR = exercises[0]?.pr;

  // Total volume rough estimate from all tracked weights
  const totalVol = exercises.reduce((s, ex) => s + ex.data.reduce((a, d) => a + d.weight, 0), 0);
  const totalVolDisplay = totalVol >= 1000 ? `${(totalVol / 1000).toFixed(0)}k` : String(totalVol);

  if (exercises.length === 0) {
    return (
      <div style={{ background: 'var(--surface-1)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Log workouts with weights to see progress charts.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* StatCard strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 8 }}>
        <StatCard
          label={topPR ? exercises[0].name : "Top PR"}
          value={topPR ? String(topPR.weight) : "—"}
          unit={topPR?.unit ?? "kg"}
          delta={topPR ? `PR · ${topPR.date}` : undefined}
          feature
        />
        <StatCard label="Sessions" value={String(sessionCount)} delta="all time" />
        <StatCard label="Volume" value={totalVolDisplay} unit="kg" delta="tracked" />
      </div>

      {/* Exercise chips */}
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Exercise</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {exercises.map((e) => (
            <button key={e.name} onClick={() => setSelected(e.name)} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
              padding: '5px 10px', borderRadius: 999,
              background: e.name === selected ? 'var(--primary-soft)' : 'transparent',
              color: e.name === selected ? 'var(--primary)' : 'var(--muted-foreground)',
              border: `1px solid ${e.name === selected ? 'color-mix(in oklab, var(--primary) 30%, transparent)' : 'var(--border)'}`,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'background 100ms, color 100ms',
            }}>
              {e.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {current && current.data.length >= 2 ? (
        <div style={{ background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', textTransform: 'capitalize' }}>{current.name}</div>
              {current.pr && (
                <div className="metric" style={{ fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                  PR {current.pr.date} · {current.pr.weight}{current.pr.unit}
                </div>
              )}
            </div>
            {current.pr && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span className="metric" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{current.pr.weight}</span>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{current.pr.unit}</span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={current.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="voltGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.92 0.22 122)" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="oklch(0.92 0.22 122)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)"/>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickFormatter={(d) => d.slice(5)} stroke="transparent"/>
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} stroke="transparent" unit={current.data[0]?.unit ?? "kg"}/>
              <Tooltip
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                formatter={(v) => [`${v}${current.data[0]?.unit ?? "kg"}`, "Weight"]}
              />
              <Area type="monotone" dataKey="weight" stroke="oklch(0.92 0.22 122)" strokeWidth={2} fill="url(#voltGrad)" dot={{ r: 3, fill: 'oklch(0.92 0.22 122)', stroke: 'oklch(0.92 0.22 122)' }} activeDot={{ r: 5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : current ? (
        <div style={{ background: 'var(--surface-1)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
            Log <span style={{ textTransform: 'capitalize' }}>{current.name}</span> at least twice with weights to see a chart.
          </p>
        </div>
      ) : null}

      {/* PR table */}
      <div style={{ background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--border)', borderRadius: 14, padding: '14px 16px 4px' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Personal records</div>
        {exercises.filter((e) => e.pr).map((e, i, arr) => {
          const isNew = e.pr!.date >= SEVEN_DAYS_AGO;
          return (
            <div key={e.name} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{e.name}</div>
                <div className="metric" style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 2 }}>{e.pr!.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                {isNew && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '2px 6px', background: 'var(--primary-soft)', borderRadius: 4 }}>
                    NEW
                  </span>
                )}
                <span className="metric" style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{e.pr!.weight}</span>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{e.pr!.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
