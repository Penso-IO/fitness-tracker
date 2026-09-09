'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import Timer from '@/components/Timer'
import { Check, X, ChevronDown, ChevronUp, Lightbulb, BookOpen, StopCircle, Dumbbell, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExerciseInfo } from '@/app/api/exercise/route'

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
  const [exerciseData, setExerciseData] = useState<ExerciseInfo | null>(null)
  const [exerciseLoading, setExerciseLoading] = useState(false)

  const openExerciseModal = useCallback(async (name: string) => {
    setExerciseModal(name)
    setExerciseData(null)
    setExerciseLoading(true)
    try {
      const res = await fetch(`/api/exercise?name=${encodeURIComponent(name)}`)
      const data: ExerciseInfo | null = await res.json()
      setExerciseData(data)
    } catch {
      setExerciseData(null)
    } finally {
      setExerciseLoading(false)
    }
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
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{activeSession.templateName}</h1>
          <p className="text-slate-500 text-sm">{activeSession.date}</p>
        </div>
        <button onClick={() => setConfirming(true)} className="rounded-xl border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10">
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{completedSets}/{totalSets} serie completate</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#1e1e2e]">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timer — always visible */}
      <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-3 flex items-center gap-3">
        <div className="flex-1">
          <Timer
            key={timerKey}
            defaultSeconds={timerRestSeconds}
            autoStart={timerRunning}
            className="py-0"
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {activeSession.exercises.map((ex, ei) => {
          const tplEx = template?.exercises.find((e) => e.id === ex.exerciseId)
          const allDone = ex.sets.every((s) => s.completed)
          const isExpanded = expandedExercise === ei

          return (
            <div
              key={ex.exerciseId}
              className={cn(
                'rounded-2xl border transition-all',
                allDone ? 'bg-green-500/5 border-green-500/20' : 'bg-[#111118] border-[#1e1e2e]'
              )}
            >
              {/* Exercise header */}
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpandedExercise(isExpanded ? -1 : ei)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {allDone && <Check size={18} className="text-green-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className={cn('font-semibold', allDone ? 'text-green-400' : 'text-white')}>
                      {ex.exerciseName}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} serie
                      {tplEx && ` · ${tplEx.defaultReps} rip · ${tplEx.restSeconds}s recupero`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {/* Exercise info button (wger.de API) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); openExerciseModal(ex.exerciseName) }}
                    className="flex items-center gap-1 rounded-lg border border-[#2d2d3a] px-2 py-1 text-xs text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors"
                  >
                    <Dumbbell size={11} />
                    Demo
                  </button>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>

              {/* Sets */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 border-t border-[#1e1e2e] pt-3">
                  {/* Tip */}
                  {tplEx?.tips && (
                    <div className="flex gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 mb-2">
                      <Lightbulb size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                      <p className="text-indigo-300 text-xs">{tplEx.tips}</p>
                    </div>
                  )}
                  {/* Instructions */}
                  {tplEx?.instructions && (
                    <div className="flex gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 mb-3">
                      <BookOpen size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-emerald-300 text-xs leading-relaxed">{tplEx.instructions}</p>
                    </div>
                  )}

                  {ex.sets.map((set, si) => (
                    <div
                      key={si}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-2 py-2',
                        set.completed ? 'bg-green-500/10' : 'bg-[#0a0a0f]'
                      )}
                    >
                      {/* Set number */}
                      <span className="w-5 text-slate-500 text-sm font-mono flex-shrink-0">{si + 1}</span>

                      {/* Weight with +/- */}
                      <div className="flex items-center gap-1 flex-1">
                        <button
                          onClick={() => updateExerciseSet(ei, si, 'weight', Math.max(0, (set.weight || 0) - 2.5))}
                          className="h-8 w-8 rounded-lg bg-[#1e1e2e] text-slate-400 hover:text-white hover:bg-[#2d2d3a] flex items-center justify-center flex-shrink-0 text-lg font-bold"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={set.weight || ''}
                          placeholder="0"
                          onChange={(e) => updateExerciseSet(ei, si, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-12 rounded-lg bg-[#1e1e2e] border border-[#2d2d3a] px-1 py-1.5 text-center text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => updateExerciseSet(ei, si, 'weight', (set.weight || 0) + 2.5)}
                          className="h-8 w-8 rounded-lg bg-[#1e1e2e] text-slate-400 hover:text-white hover:bg-[#2d2d3a] flex items-center justify-center flex-shrink-0 text-lg font-bold"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-600">kg</span>
                      </div>

                      {/* Reps */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <input
                          type="number"
                          value={set.reps || ''}
                          placeholder="0"
                          onChange={(e) => updateExerciseSet(ei, si, 'reps', parseInt(e.target.value) || 0)}
                          className="w-12 rounded-lg bg-[#1e1e2e] border border-[#2d2d3a] px-1 py-1.5 text-center text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-xs text-slate-600">rip</span>
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
                        className={cn(
                          'h-9 w-9 flex items-center justify-center rounded-lg transition-all flex-shrink-0',
                          set.completed
                            ? 'bg-green-500 text-white'
                            : 'border border-[#2d2d3a] text-slate-500 hover:border-indigo-500 hover:text-indigo-400'
                        )}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Notes */}
      <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
        <p className="text-xs text-slate-400 mb-2">Note sessione</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Come ti sei sentito? Cosa migliorare..."
          rows={3}
          className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
        />
      </div>

      {/* Finish */}
      <button
        onClick={handleFinish}
        className="w-full rounded-2xl bg-indigo-600 py-4 text-white font-bold text-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
      >
        <StopCircle size={22} />
        Termina sessione
      </button>

      {/* Exercise Info Modal (wger.de) */}
      {exerciseModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setExerciseModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl bg-[#111118] border-t border-x border-[#1e1e2e] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="h-1 w-10 rounded-full bg-[#2d2d3a]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e] flex-shrink-0">
              <h3 className="text-white font-bold text-base truncate pr-4">{exerciseModal}</h3>
              <button onClick={() => setExerciseModal(null)} className="text-slate-500 hover:text-white p-1 flex-shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {exerciseLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={28} className="text-indigo-400 animate-spin" />
                  <p className="text-slate-500 text-sm">Caricamento dati esercizio...</p>
                </div>
              )}
              {!exerciseLoading && exerciseData && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {exerciseData.category && (
                      <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400">
                        {exerciseData.category}
                      </span>
                    )}
                    {exerciseData.muscles.map((m) => (
                      <span key={m} className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs text-orange-400">
                        {m}
                      </span>
                    ))}
                    {exerciseData.musclesSecondary.map((m) => (
                      <span key={m} className="rounded-full bg-[#1e1e2e] border border-[#2d2d3a] px-3 py-1 text-xs text-slate-400">
                        {m}
                      </span>
                    ))}
                  </div>
                  {exerciseData.images.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {exerciseData.images.slice(0, 3).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={exerciseData.name}
                          className="h-44 w-auto rounded-xl flex-shrink-0 bg-white object-contain"
                        />
                      ))}
                    </div>
                  )}
                  {exerciseData.description && (
                    <div className="rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] p-3">
                      <p className="text-slate-400 text-sm leading-relaxed">{exerciseData.description}</p>
                    </div>
                  )}
                  {exerciseData.equipment.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500">Attrezzatura:</span>
                      {exerciseData.equipment.map((eq) => (
                        <span key={eq} className="rounded-lg bg-[#1e1e2e] border border-[#2d2d3a] px-2 py-1 text-xs text-slate-400">
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              {!exerciseLoading && !exerciseData && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-600">
                  <Dumbbell size={40} strokeWidth={1} />
                  <p className="text-sm">Nessuna demo disponibile per questo esercizio</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm cancel modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-8">
          <div className="w-full max-w-lg rounded-2xl bg-[#111118] border border-[#1e1e2e] p-6 space-y-4">
            <h3 className="text-white font-bold text-lg">Abbandona sessione?</h3>
            <p className="text-slate-400 text-sm">I dati non salvati andranno persi.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl border border-[#2d2d3a] py-3 text-white font-medium"
              >
                Annulla
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-xl bg-red-500/20 border border-red-500/30 py-3 text-red-400 font-medium"
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
