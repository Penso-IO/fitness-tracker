'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import Timer from '@/components/Timer'
import { Check, X, ChevronDown, ChevronUp, Lightbulb, BookOpen, StopCircle, Dumbbell } from 'lucide-react'
import ExerciseInfoModal from '@/components/ExerciseInfoModal'

export default function ActiveWorkoutPage() {
  const router = useRouter()
  const activeSession = useStore((s) => s.activeSession)
  const finishSession = useStore((s) => s.finishSession)
  const cancelSession = useStore((s) => s.cancelSession)
  const updateExerciseSet = useStore((s) => s.updateExerciseSet)
  const toggleSetComplete = useStore((s) => s.toggleSetComplete)
  const workoutTemplates = useStore((s) => s.workoutTemplates)
  const customWorkouts = useStore((s) => s.customWorkouts)

  const [expandedExercise, setExpandedExercise] = useState<number>(0)
  const [timerKey, setTimerKey] = useState(0)
  const [timerRestSeconds, setTimerRestSeconds] = useState(90)
  const [timerRunning, setTimerRunning] = useState(false)
  const [notes, setNotes] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [exerciseModal, setExerciseModal] = useState<string | null>(null)

  const openExerciseModal = useCallback((name: string) => {
    setExerciseModal(name)
  }, [])

  useEffect(() => {
    if (!activeSession) router.replace('/workout')
  }, [activeSession, router])

  if (!activeSession) return null

  const template = [...customWorkouts, ...workoutTemplates].find(
    (t) => t.id === activeSession.templateId
  )

  const completedSets = activeSession.exercises.flatMap((e) => e.sets).filter((s) => s.completed).length
  const totalSets = activeSession.exercises.flatMap((e) => e.sets).length
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const handleFinish = () => {
    finishSession(notes)
    router.replace('/')
  }

  const handleCancel = () => {
    cancelSession()
    router.replace('/workout')
  }

  return (
    <div style={{ paddingBottom: 26 }}>
      {/* Header */}
      <div style={{ padding: '58px 20px 14px', borderBottom: '2px solid rgba(32,30,29,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 2 }}>{activeSession.templateName}</h1>
          <div className="k">{activeSession.date}</div>
        </div>
        <button
          onClick={() => setConfirming(true)}
          style={{ border: '1px solid var(--divider)', padding: 8, color: 'var(--accent)', background: 'none', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="k">{completedSets}/{totalSets} serie completate</span>
          <span className="k">{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--neutral-300)' }}>
          <div
            style={{ height: 6, background: 'var(--accent)', transition: 'width 0.5s', width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timer — always visible */}
      <div style={{ margin: '0 20px 14px', background: 'var(--text)', color: 'var(--bg)', padding: '15px 17px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Timer
          key={timerKey}
          defaultSeconds={timerRestSeconds}
          autoStart={timerRunning}
        />
      </div>

      {/* Exercises */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px' }}>
        {activeSession.exercises.map((ex, ei) => {
          const tplEx = template?.exercises.find((e) => e.id === ex.exerciseId)
          const allDone = ex.sets.every((s) => s.completed)
          const isExpanded = expandedExercise === ei

          return (
            <div
              key={ex.exerciseId}
              style={{
                border: allDone ? '2px solid var(--accent)' : '1px solid var(--divider)',
                background: allDone ? 'var(--accent-light)' : 'var(--surface)',
              }}
            >
              {/* Exercise header */}
              <button
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setExpandedExercise(isExpanded ? -1 : ei)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  {allDone && <Check size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: allDone ? 'var(--accent-dark)' : 'var(--text)' }}>
                      {ex.exerciseName}
                    </div>
                    <div className="k" style={{ marginTop: 3 }}>
                      {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} serie
                      {tplEx && ` · ${tplEx.defaultReps} rip · ${tplEx.restSeconds}s rec.`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openExerciseModal(ex.exerciseName) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--divider)', padding: '4px 8px', fontSize: 11, color: 'var(--muted)', background: 'none', cursor: 'pointer' }}
                  >
                    <Dumbbell size={11} />
                    Demo
                  </button>
                  {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--muted)' }} />}
                </div>
              </button>

              {/* Sets */}
              {isExpanded && (
                <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--divider)' }}>
                  {/* Tip */}
                  {tplEx?.tips && (
                    <div style={{ display: 'flex', gap: 8, border: '1px solid var(--accent)', background: 'var(--accent-light)', padding: 12, marginBottom: 10 }}>
                      <Lightbulb size={13} style={{ color: 'var(--accent-dark)', flexShrink: 0, marginTop: 1 }} />
                      <div style={{ fontSize: 12, color: 'var(--accent-dark)' }}>{tplEx.tips}</div>
                    </div>
                  )}
                  {/* Instructions */}
                  {tplEx?.instructions && (
                    <div style={{ display: 'flex', gap: 8, border: '1px solid var(--divider)', background: 'var(--surface)', padding: 12, marginBottom: 12 }}>
                      <BookOpen size={13} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }} />
                      <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{tplEx.instructions}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ex.sets.map((set, si) => (
                      <div
                        key={si}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                          background: set.completed ? 'var(--accent-light)' : 'var(--bg)',
                          border: set.completed ? '1px solid var(--accent)' : '1px solid var(--divider)',
                        }}
                      >
                        {/* Set number */}
                        <span style={{ width: 18, color: 'var(--muted)', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{si + 1}</span>

                        {/* Weight with +/- */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                          <button
                            onClick={() => updateExerciseSet(ei, si, 'weight', Math.max(0, (set.weight || 0) - 2.5))}
                            style={{ height: 32, width: 32, background: 'var(--surface)', border: '1px solid var(--divider)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={set.weight || ''}
                            placeholder="0"
                            onChange={(e) => updateExerciseSet(ei, si, 'weight', parseFloat(e.target.value) || 0)}
                            style={{ width: 44, border: '1px solid var(--divider)', padding: '4px 2px', textAlign: 'center', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'Archivo, system-ui' }}
                          />
                          <button
                            onClick={() => updateExerciseSet(ei, si, 'weight', (set.weight || 0) + 2.5)}
                            style={{ height: 32, width: 32, background: 'var(--surface)', border: '1px solid var(--divider)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
                          >
                            +
                          </button>
                          <span className="k">kg</span>
                        </div>

                        {/* Reps */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <input
                            type="number"
                            value={set.reps || ''}
                            placeholder="0"
                            onChange={(e) => updateExerciseSet(ei, si, 'reps', parseInt(e.target.value) || 0)}
                            style={{ width: 44, border: '1px solid var(--divider)', padding: '4px 2px', textAlign: 'center', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'Archivo, system-ui' }}
                          />
                          <span className="k">rip</span>
                        </div>

                        {/* Complete button */}
                        <button
                          onClick={() => {
                            toggleSetComplete(ei, si)
                            if (!set.completed && tplEx) {
                              setTimerRestSeconds(tplEx.restSeconds)
                              setTimerKey((k) => k + 1)
                              setTimerRunning(true)
                            }
                          }}
                          style={{
                            height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                            background: set.completed ? 'var(--accent)' : 'var(--bg)',
                            border: set.completed ? '1px solid var(--accent)' : '1px solid var(--divider)',
                            color: set.completed ? 'var(--bg)' : 'var(--muted)',
                          }}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Notes */}
      <div style={{ margin: '16px 20px', border: '1px solid var(--divider)', padding: '14px 16px', background: 'var(--surface)' }}>
        <div className="k" style={{ marginBottom: 8 }}>Note sessione</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Come ti sei sentito? Cosa migliorare..."
          rows={3}
          style={{ width: '100%', background: 'transparent', fontSize: 13, color: 'var(--text)', border: 'none', resize: 'none', fontFamily: 'Archivo, system-ui', outline: 'none' }}
        />
      </div>

      {/* Finish */}
      <div style={{ padding: '0 20px' }}>
        <button
          onClick={handleFinish}
          className="btn btn-primary btn-block"
          style={{ minHeight: 50, fontSize: 16, gap: 8 }}
        >
          <StopCircle size={20} />
          Termina sessione
        </button>
      </div>

      {/* Exercise Info Modal */}
      {exerciseModal && (
        <ExerciseInfoModal exerciseName={exerciseModal} onClose={() => setExerciseModal(null)} />
      )}

      {/* Confirm cancel modal */}
      {confirming && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '0 16px 32px' }}>
          <div style={{ width: '100%', maxWidth: 512, background: 'var(--bg)', border: '2px solid var(--divider)', padding: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Abbandona sessione?</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>I dati non salvati andranno persi.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirming(false)}
                className="btn btn-secondary"
                style={{ flex: 1, minHeight: 46 }}
              >
                Annulla
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-primary"
                style={{ flex: 1, minHeight: 46 }}
              >
                Abbandona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
