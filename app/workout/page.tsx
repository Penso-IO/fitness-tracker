'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { WorkoutTemplate } from '@/types'
import { getMuscleColor, getMuscleEmoji, todayStr } from '@/lib/utils'
import { Clock, ChevronRight, Calendar } from 'lucide-react'

export default function WorkoutPage() {
  const router = useRouter()
  const workoutTemplates = useStore((s) => s.workoutTemplates)
  const startSession = useStore((s) => s.startSession)
  const activeSession = useStore((s) => s.activeSession)
  const [selectedDate, setSelectedDate] = useState(todayStr())

  const handleStart = (template: WorkoutTemplate) => {
    startSession(template, selectedDate)
    router.push('/workout/active')
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Scegli scheda</h1>
        <p className="text-slate-500 text-sm mt-1">Seleziona il tipo di allenamento di oggi</p>
      </div>

      {/* Active session warning */}
      {activeSession && (
        <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-4 flex items-center justify-between">
          <div>
            <p className="text-green-400 font-semibold text-sm">Sessione in corso</p>
            <p className="text-white font-bold">{activeSession.templateName}</p>
          </div>
          <button
            onClick={() => router.push('/workout/active')}
            className="rounded-xl bg-green-500 px-3 py-2 text-sm font-medium text-white"
          >
            Riprendi
          </button>
        </div>
      )}

      {/* Date picker */}
      <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-indigo-400" />
          <span className="text-sm text-slate-400 font-medium">Data sessione</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Workout list */}
      <div className="space-y-3">
        {workoutTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleStart(template)}
            disabled={!!activeSession}
            className="w-full rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4 text-left hover:border-indigo-500/50 hover:bg-[#111118] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{getMuscleEmoji(template.muscleGroups[0])}</span>
                  <h3 className="text-white font-semibold">{template.name}</h3>
                </div>
                {template.description && (
                  <p className="text-slate-500 text-xs mb-3">{template.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {template.muscleGroups.map((m) => (
                    <span key={m} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getMuscleColor(m)}`}>
                      {m}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <Clock size={12} />
                  <span>~{template.estimatedMinutes} min</span>
                  <span className="mx-1">·</span>
                  <span>{template.exercises.length} esercizi</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-600 ml-3 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
