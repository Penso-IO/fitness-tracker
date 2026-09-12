'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatDate, formatDuration } from '@/lib/utils'
import { Trash2, Clock, ChevronDown, ChevronUp, BookOpen, Plus } from 'lucide-react'

export default function HistoryPage() {
  const sessions = useStore((s) => s.sessions)
  const deleteSession = useStore((s) => s.deleteSession)
  const bookTips = useStore((s) => s.bookTips)
  const addBookTip = useStore((s) => s.addBookTip)
  const deleteBookTip = useStore((s) => s.deleteBookTip)

  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'sessions' | 'books'>('sessions')
  const [showTipForm, setShowTipForm] = useState(false)
  const [tipForm, setTipForm] = useState({ book: '', category: 'training' as 'nutrition' | 'training' | 'recovery', tip: '' })

  const handleAddTip = () => {
    if (!tipForm.tip || !tipForm.book) return
    addBookTip(tipForm)
    setTipForm({ book: '', category: 'training', tip: '' })
    setShowTipForm(false)
  }

  return (
    <div style={{ paddingBottom: 26 }}>
      {/* Header */}
      <div style={{ padding: '58px 20px 14px', borderBottom: '2px solid rgba(32,30,29,0.4)' }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Storico</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Cronologia sessioni e consigli dai libri</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid rgba(32,30,29,0.4)' }}>
        {([['sessions', `Sessioni (${sessions.length})`], ['books', `Libri (${bookTips.length})`]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              flex: 1, padding: '12px 0', fontFamily: 'Archivo, system-ui', fontWeight: 800, fontSize: 11,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'none', border: 'none', borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer',
              color: activeTab === key ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Sessions */}
        {activeTab === 'sessions' && (
          sessions.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--muted)', gap: 12 }}>
              <Clock size={48} strokeWidth={1} />
              <div style={{ fontSize: 13 }}>Nessuna sessione ancora</div>
              <div style={{ fontSize: 12 }}>Completa il tuo primo allenamento</div>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} style={{ border: '1px solid var(--divider)', background: 'var(--surface)', overflow: 'hidden' }}>
                <button
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{session.templateName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span className="k">{formatDate(session.date)}</span>
                      {session.durationMinutes && (
                        <>
                          <span className="k">·</span>
                          <Clock size={9} style={{ color: 'var(--muted)' }} />
                          <span className="k">{formatDuration(session.durationMinutes)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                      style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={15} />
                    </button>
                    {expanded === session.id ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />}
                  </div>
                </button>

                {expanded === session.id && (
                  <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Muscle tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {session.muscleGroups.map((m) => (
                        <span key={m} className="tag tag-neutral">{m}</span>
                      ))}
                    </div>

                    {/* Exercises summary */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {session.exercises.map((ex, i) => {
                        const done = ex.sets.filter((s) => s.completed)
                        const maxWeight = Math.max(...ex.sets.map((s) => s.weight || 0))
                        return (
                          <div key={ex.exerciseId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < session.exercises.length - 1 ? '1px solid var(--divider)' : 'none' }}>
                            <div style={{ fontSize: 13, color: 'var(--text)' }}>{ex.exerciseName}</div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, fontSize: 13 }}>{done.length}/{ex.sets.length} serie</div>
                              {maxWeight > 0 && <div className="k">{maxWeight}kg max</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {session.notes && (
                      <div style={{ color: 'var(--muted)', fontSize: 12, fontStyle: 'italic', borderTop: '1px solid var(--divider)', paddingTop: 8 }}>"{session.notes}"</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )
        )}

        {/* Book tips */}
        {activeTab === 'books' && (
          <>
            <button
              onClick={() => setShowTipForm((v) => !v)}
              style={{ width: '100%', border: '1px dashed var(--divider)', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--muted)', background: 'none', cursor: 'pointer', fontFamily: 'Archivo, system-ui', fontWeight: 800, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              <BookOpen size={14} />
              Aggiungi consiglio dal libro
            </button>

            {showTipForm && (
              <div style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="k" style={{ display: 'block', marginBottom: 4 }}>Titolo libro</label>
                  <input
                    type="text"
                    value={tipForm.book}
                    onChange={(e) => setTipForm({ ...tipForm, book: e.target.value })}
                    placeholder="Es. Starting Strength"
                    className="input"
                  />
                </div>
                <div>
                  <label className="k" style={{ display: 'block', marginBottom: 4 }}>Categoria</label>
                  <select
                    value={tipForm.category}
                    onChange={(e) => setTipForm({ ...tipForm, category: e.target.value as 'nutrition' | 'training' | 'recovery' })}
                    style={{ width: '100%', border: '1px solid var(--divider)', padding: '7px 10px', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'Archivo, system-ui' }}
                  >
                    <option value="training">Allenamento</option>
                    <option value="nutrition">Nutrizione</option>
                    <option value="recovery">Recupero</option>
                  </select>
                </div>
                <div>
                  <label className="k" style={{ display: 'block', marginBottom: 4 }}>Consiglio / citazione</label>
                  <textarea
                    value={tipForm.tip}
                    onChange={(e) => setTipForm({ ...tipForm, tip: e.target.value })}
                    placeholder="Incolla qui il consiglio o la frase chiave dal libro..."
                    rows={4}
                    style={{ width: '100%', border: '1px solid var(--divider)', padding: '6px 10px', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'Archivo, system-ui', resize: 'none', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowTipForm(false)} className="btn btn-secondary" style={{ flex: 1, minHeight: 44 }}>
                    Annulla
                  </button>
                  <button onClick={handleAddTip} className="btn btn-primary" style={{ flex: 1, minHeight: 44 }}>
                    Salva
                  </button>
                </div>
              </div>
            )}

            {bookTips.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 10, color: 'var(--muted)' }}>
                <BookOpen size={40} strokeWidth={1} />
                <div style={{ fontSize: 13 }}>Nessun consiglio ancora</div>
                <div style={{ fontSize: 12, textAlign: 'center' }}>Aggiungi frasi chiave dai tuoi libri<br />di allenamento e nutrizione</div>
              </div>
            ) : (
              bookTips.map((tip) => (
                <div key={tip.id} style={{ border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOpen size={12} style={{ color: 'var(--muted)' }} />
                      <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--text)' }}>{tip.book}</span>
                      <span className="tag tag-neutral">{tip.category}</span>
                    </div>
                    <button onClick={() => deleteBookTip(tip.id)} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontStyle: 'italic' }}>"{tip.tip}"</div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
