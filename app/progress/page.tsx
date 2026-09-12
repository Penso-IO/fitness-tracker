'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { formatDate, todayStr } from '@/lib/utils'
import { Plus, Trash2, TrendingUp, Dumbbell, ChevronDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ProgressPage() {
  const progressLog = useStore((s) => s.progressLog)
  const addProgressEntry = useStore((s) => s.addProgressEntry)
  const deleteProgressEntry = useStore((s) => s.deleteProgressEntry)
  const sessions = useStore((s) => s.sessions)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: todayStr(), weight: '', bodyFat: '', chest: '', waist: '', hips: '', notes: '' })
  const [selectedExercise, setSelectedExercise] = useState<string>('')

  const exerciseNames = useMemo(() => {
    const names = new Set<string>()
    sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.exerciseName)))
    return Array.from(names).sort()
  }, [sessions])

  const exerciseProgressData = useMemo(() => {
    if (!selectedExercise) return []
    const byDate = new Map<string, { maxWeight: number; volume: number }>()
    sessions.forEach((session) => {
      const ex = session.exercises.find((e) => e.exerciseName === selectedExercise)
      if (!ex) return
      const completedSets = ex.sets.filter((s) => s.completed && s.weight > 0)
      if (completedSets.length === 0) return
      const maxWeight = Math.max(...completedSets.map((s) => s.weight))
      const volume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0)
      const existing = byDate.get(session.date)
      if (!existing || maxWeight > existing.maxWeight) {
        byDate.set(session.date, { maxWeight, volume })
      }
    })
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { maxWeight, volume }]) => ({
        date: date.slice(5),
        'Peso max': maxWeight,
        Volume: Math.round(volume),
      }))
  }, [sessions, selectedExercise])

  const muscleVolume = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const prevWeekAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const recentSessions = sessions.filter((s) => new Date(s.date) >= weekAgo)
    const prevSessions = sessions.filter((s) => new Date(s.date) >= prevWeekAgo && new Date(s.date) < weekAgo)

    const muscles = ['Petto', 'Schiena', 'Gambe', 'Spalle', 'Braccia'] as const
    const MUSCLE_MAP: Record<string, string[]> = {
      'Petto': ['petto'],
      'Schiena': ['schiena'],
      'Gambe': ['gambe', 'glutei'],
      'Spalle': ['spalle'],
      'Braccia': ['bicipiti', 'tricipiti'],
    }

    return muscles.map((muscle) => {
      const groups = MUSCLE_MAP[muscle]

      const recentCount = recentSessions.flatMap((s) => {
        if (!s.muscleGroups.some((mg) => groups.includes(mg))) return []
        return s.exercises.flatMap((e) => e.sets.filter((st) => st.completed))
      }).length
      const prevCount = prevSessions.flatMap((s) => {
        if (!s.muscleGroups.some((mg) => groups.includes(mg))) return []
        return s.exercises.flatMap((e) => e.sets.filter((st) => st.completed))
      }).length

      return { muscle, count: recentCount, prev: prevCount, delta: recentCount - prevCount }
    })
  }, [sessions])

  const maxVolume = Math.max(...muscleVolume.map((m) => m.count), 1)
  const hasHighVolume = muscleVolume.some((m) => m.delta > 4)
  const highVolumeMuscle = muscleVolume.find((m) => m.delta > 4)

  const adherence = sessions.length > 0
    ? Math.round((sessions.filter((s) => {
        const d = new Date(s.date)
        const weekAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
        return d >= weekAgo
      }).length / 16) * 100)
    : 0

  const handleAdd = () => {
    addProgressEntry({
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
      chest: form.chest ? Number(form.chest) : undefined,
      waist: form.waist ? Number(form.waist) : undefined,
      hips: form.hips ? Number(form.hips) : undefined,
      notes: form.notes || undefined,
    })
    setForm({ date: todayStr(), weight: '', bodyFat: '', chest: '', waist: '', hips: '', notes: '' })
    setShowForm(false)
  }

  const weightData = [...progressLog]
    .filter((p) => p.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({ date: p.date.slice(5), peso: p.weight }))

  const NumField = ({ label, field, unit }: { label: string; field: keyof typeof form; unit: string }) => (
    <div>
      <label className="k" style={{ display: 'block', marginBottom: 4 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number"
          step="0.1"
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder="—"
          className="input"
          style={{ flex: 1 }}
        />
        <span style={{ color: 'var(--muted)', fontSize: 13, width: 28 }}>{unit}</span>
      </div>
    </div>
  )

  const chartStyle = { background: 'var(--bg)', border: '1px solid var(--divider)', borderRadius: 0, color: 'var(--text)', fontSize: 11 }

  return (
    <div style={{ paddingBottom: 26 }}>
      {/* Header */}
      <div style={{ padding: '58px 20px 14px', borderBottom: '2px solid rgba(32,30,29,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Progressi</h1>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Peso, misure e composizione corporea</div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-primary"
        >
          <Plus size={15} />
          Aggiungi
        </button>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Weight chart */}
        {weightData.length > 1 && (
          <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
            <span className="k" style={{ display: 'block', marginBottom: 12 }}>Andamento peso</span>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(32,30,29,0.15)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={chartStyle} />
                <Line type="monotone" dataKey="peso" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Exercise progression */}
        {exerciseNames.length > 0 && (
          <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Dumbbell size={14} style={{ color: 'var(--muted)' }} />
              <span className="k">Progressione esercizi</span>
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                style={{ width: '100%', appearance: 'none', border: '1px solid var(--divider)', padding: '8px 32px 8px 10px', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'Archivo, system-ui' }}
              >
                <option value="">Seleziona esercizio...</option>
                {exerciseNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            </div>

            {selectedExercise && exerciseProgressData.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                <div>
                  <div className="k" style={{ marginBottom: 8 }}>Peso massimo (kg)</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={exerciseProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(32,30,29,0.15)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={chartStyle} />
                      <Line type="monotone" dataKey="Peso max" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="k" style={{ marginBottom: 8 }}>Volume totale (kg×rip)</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={exerciseProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(32,30,29,0.15)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#605d5d', fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={chartStyle} />
                      <Line type="monotone" dataKey="Volume" stroke="var(--text)" strokeWidth={2} dot={{ fill: 'var(--text)', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {selectedExercise && exerciseProgressData.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>Nessun dato completato per questo esercizio</div>
            )}
          </div>
        )}

        {/* Volume settimanale per muscolo */}
        <div style={{ border: '1px solid var(--divider)', background: 'var(--surface)' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--divider)' }}>
            <span className="k">Volume settimanale per muscolo · serie</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            {muscleVolume.map(({ muscle, count, delta }) => (
              <div key={muscle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--divider)' }}>
                <span className="k" style={{ width: 60 }}>{muscle}</span>
                <div style={{ flex: 1, height: 16, background: 'var(--neutral-300)' }}>
                  <div style={{ width: `${Math.round((count / maxVolume) * 100)}%`, height: 16, background: count > 20 ? 'var(--accent)' : 'var(--text)' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 12, width: 52, textAlign: 'right' }}>
                  {count} {delta > 0 ? `+${delta}` : delta < 0 ? `-${Math.abs(delta)}` : '--'}
                </span>
              </div>
            ))}
          </div>
          {hasHighVolume && (
            <div style={{ margin: '0 16px 14px', border: '2px solid var(--accent)', background: 'var(--accent-light)', padding: '13px 15px' }}>
              <div className="k" style={{ color: 'var(--accent-dark)' }}>Volume molto alto — {highVolumeMuscle?.muscle}</div>
              <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 6 }}>
                +{highVolumeMuscle?.delta} serie sulla settimana scorsa. Monitora la qualita delle serie o taglia una serie.
              </div>
            </div>
          )}
        </div>

        {/* Sessioni + Aderenza */}
        <div style={{ display: 'flex', border: '1px solid var(--divider)', borderTop: '2px solid var(--divider)' }}>
          <div style={{ flex: 1, padding: '14px 20px', borderRight: '2px solid var(--divider)' }}>
            <div className="k">Sessioni · mesociclo</div>
            <div style={{ fontWeight: 800, fontSize: 26, lineHeight: 1.1, marginTop: 5 }}>{sessions.length}</div>
          </div>
          <div style={{ flex: 1, padding: '14px 20px' }}>
            <div className="k">Aderenza</div>
            <div style={{ fontWeight: 800, fontSize: 26, lineHeight: 1.1, marginTop: 5, color: 'var(--accent-dark)' }}>{Math.min(99, adherence)}%</div>
          </div>
        </div>

        {/* Storico sessioni */}
        <div style={{ padding: '0 0 8px' }}>
          <a href="/history" className="btn btn-secondary btn-block" style={{ minHeight: 48, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--divider)' }}>
            Storico sessioni
          </a>
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Nuova misurazione</div>
            <div>
              <label className="k" style={{ display: 'block', marginBottom: 4 }}>Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <NumField label="Peso" field="weight" unit="kg" />
              <NumField label="Massa grassa" field="bodyFat" unit="%" />
              <NumField label="Petto" field="chest" unit="cm" />
              <NumField label="Vita" field="waist" unit="cm" />
              <NumField label="Fianchi" field="hips" unit="cm" />
            </div>
            <div>
              <label className="k" style={{ display: 'block', marginBottom: 4 }}>Note</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Come ti senti? Foto scattata?"
                className="input"
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1, minHeight: 44 }}>
                Annulla
              </button>
              <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1, minHeight: 44 }}>
                Salva
              </button>
            </div>
          </div>
        )}

        {/* Log */}
        {progressLog.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--muted)', gap: 12 }}>
            <TrendingUp size={48} strokeWidth={1} />
            <div style={{ fontSize: 13 }}>Nessuna misurazione</div>
            <div style={{ fontSize: 12 }}>Inizia tracciando il tuo peso oggi</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {progressLog.map((entry) => (
              <div key={entry.id} style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{formatDate(entry.date)}</div>
                  <button onClick={() => deleteProgressEntry(entry.id)} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Peso', value: entry.weight ? `${entry.weight}kg` : '—' },
                    { label: 'Body fat', value: entry.bodyFat ? `${entry.bodyFat}%` : '—' },
                    { label: 'Vita', value: entry.waist ? `${entry.waist}cm` : '—' },
                    { label: 'Petto', value: entry.chest ? `${entry.chest}cm` : '—' },
                    { label: 'Fianchi', value: entry.hips ? `${entry.hips}cm` : '—' },
                  ].map((m) => (
                    <div key={m.label} style={{ textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--divider)', padding: '8px 4px' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent)' }}>{m.value}</div>
                      <div className="k" style={{ marginTop: 3 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {entry.notes && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>{entry.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
