'use client'
import { useStore } from '@/lib/store'
import { todayStr } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function getMesoWeek(sessions: any[]) {
  // Approximate meso week from session count (every 4 sessions = 1 week)
  const count = sessions.length
  const week = Math.min(5, Math.floor(count / 4) + 1)
  return { week, total: 5 }
}

function getLastWorkoutHoursAgo(sessions: any[]): number | null {
  if (sessions.length === 0) return null
  const last = new Date(sessions[0].date + 'T00:00:00')
  const now = new Date()
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60))
}

const BOOK_PROGRAMS = [
  { name: 'Upper/Lower 4gg', source: 'Helms' },
  { name: 'PPL+ 4gg', source: 'Brunetti' },
]

const DAYS_OF_WEEK = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

export default function Dashboard() {
  const router = useRouter()
  const sessions = useStore((s) => s.sessions)
  const bookTips = useStore((s) => s.bookTips)
  const activeSession = useStore((s) => s.activeSession)
  const workoutTemplates = useStore((s) => s.workoutTemplates)
  const customWorkouts = useStore((s) => s.customWorkouts)
  const startSession = useStore((s) => s.startSession)

  const allTemplates = [...customWorkouts, ...workoutTemplates]
  const { week, total } = getMesoWeek(sessions)
  const hoursAgo = getLastWorkoutHoursAgo(sessions)
  const today = new Date()
  const dayName = DAYS_OF_WEEK[today.getDay()]
  const deloadIn = total - week

  const tip = bookTips.length > 0 ? bookTips[Math.floor(Math.random() * bookTips.length)] : null

  const lastMuscleGroup = sessions[0]?.muscleGroups?.[0]
  const showSRA = hoursAgo !== null && hoursAgo < 48 && lastMuscleGroup

  const handleStart = (template: any) => {
    startSession(template, todayStr())
    router.push('/workout/active')
  }

  return (
    <div style={{ paddingBottom: 26 }}>
      {/* Header */}
      <div style={{ padding: '58px 20px 14px', borderBottom: '2px solid rgba(32,30,29,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span className="k">Mesociclo · {total} settimane</span>
          <span className="k" style={{ color: 'var(--accent-dark)' }}>Settimana {week}/{total}</span>
        </div>
        <h2 style={{ fontSize: 30, margin: '8px 0 2px' }}>{dayName}</h2>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          {deloadIn > 0 ? `Deload tra ${deloadIn} settimane` : 'Settimana di deload'}
        </div>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 8,
              background: i < week ? 'var(--accent)' : 'var(--neutral-300)',
              outline: i === week - 1 ? '2px solid var(--text)' : 'none',
              outlineOffset: -2,
            }} />
          ))}
        </div>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <Link href="/workout/active" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ margin: '16px 20px', border: '2px solid var(--accent)', background: 'var(--accent-light)', padding: '13px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="k" style={{ color: 'var(--accent-dark)' }}>Sessione in corso</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 5 }}>{activeSession.templateName}</div>
            </div>
            <div className="k" style={{ color: 'var(--accent)' }}>Riprendi →</div>
          </div>
        </Link>
      )}

      {/* SRA Warning */}
      {showSRA && (
        <div style={{ margin: '16px 20px 0', border: '2px solid var(--accent)', background: 'var(--accent-light)', padding: '13px 15px' }}>
          <div className="k" style={{ color: 'var(--accent-dark)' }}>SRA · recupero</div>
          <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 6 }}>
            Hai allenato <strong>{lastMuscleGroup}</strong> {hoursAgo}h fa. Helms consiglia 48–72h — valuta un gruppo muscolare diverso oggi.
          </div>
        </div>
      )}

      {/* Le tue schede */}
      <div style={{ padding: '16px 20px 8px' }}>
        <span className="k">Le tue schede</span>
      </div>
      {allTemplates.length === 0 ? (
        <div style={{ padding: '20px', borderTop: '1px solid var(--divider)', color: 'var(--muted)', fontSize: 13 }}>
          Nessuna scheda — vai su Esercizi per crearne una
        </div>
      ) : (
        allTemplates.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--divider)', borderBottom: i === allTemplates.length - 1 ? '1px solid var(--divider)' : 'none', alignItems: 'center', background: i === 0 ? 'var(--neutral-200)' : 'transparent' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{t.name}</div>
              <div className="k" style={{ marginTop: 5 }}>{t.exercises.length} esercizi · ~{t.estimatedMinutes} min</div>
            </div>
            {i === 0 && <span className="tag tag-accent">Consigliata</span>}
          </div>
        ))
      )}

      {/* Book programs */}
      <div style={{ padding: '16px 20px 6px' }}><span className="k">Programmi dai libri</span></div>
      <div style={{ display: 'flex', gap: 10, padding: '0 20px 14px' }}>
        {BOOK_PROGRAMS.map((p) => (
          <div key={p.name} style={{ flex: 1, border: '1px solid var(--divider)', padding: '11px 12px' }}>
            <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.25 }}>{p.name}</div>
            <div className="k" style={{ marginTop: 5 }}>{p.source}</div>
          </div>
        ))}
      </div>

      {/* Book tip */}
      {tip && (
        <div style={{ margin: '0 20px 18px', background: 'var(--text)', color: 'var(--bg)', padding: '14px 16px' }}>
          <div className="k" style={{ color: 'rgba(243,242,242,0.55)' }}>Tip · settimana {week} · volume</div>
          <div style={{ fontSize: 13, lineHeight: 1.45, marginTop: 7 }}>"{tip.tip}"</div>
          <div className="k" style={{ marginTop: 9, color: 'rgba(243,242,242,0.4)' }}>{tip.book}</div>
        </div>
      )}

      {/* CTA */}
      {!activeSession && allTemplates.length > 0 && (
        <div style={{ padding: '0 20px' }}>
          <button onClick={() => handleStart(allTemplates[0])} className="btn btn-primary btn-block" style={{ minHeight: 50, fontSize: 16 }}>
            Avvia {allTemplates[0].name}
          </button>
        </div>
      )}
      {!activeSession && allTemplates.length === 0 && (
        <div style={{ padding: '0 20px' }}>
          <Link href="/workout" className="btn btn-primary btn-block" style={{ minHeight: 50, fontSize: 16 }}>
            Vai agli Esercizi →
          </Link>
        </div>
      )}
    </div>
  )
}
