interface Props {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  feature?: boolean;
}

export default function StatCard({ label, value, unit, delta, feature }: Props) {
  return (
    <div style={{
      background: feature
        ? 'linear-gradient(160deg, oklch(0.92 0.22 122 / 0.10) 0%, var(--surface-1) 55%)'
        : 'var(--surface-1)',
      boxShadow: `inset 0 0 0 1px ${feature ? 'color-mix(in oklab, var(--primary) 25%, var(--border))' : 'var(--border)'}`,
      borderRadius: 12,
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <span className="eyebrow" style={{ fontSize: 10 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span className="metric" style={{
          fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1,
          color: feature ? 'var(--primary)' : 'var(--foreground)',
        }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{unit}</span>}
      </div>
      {delta && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: feature ? 'var(--primary)' : 'var(--muted-foreground)',
        }}>
          {delta}
        </span>
      )}
    </div>
  );
}
