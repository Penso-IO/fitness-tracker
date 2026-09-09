'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { WorkoutTemplate } from '@/types'
import { getMuscleColor, getMuscleEmoji, todayStr } from '@/lib/utils'
import { Clock, ChevronRight, Calendar, Plus, Pencil, Trash2, Lock } from 'lucide-react'
import CustomWorkoutEditor from '@/components/CustomWorkoutEditor'

function TemplateCard({
  template,
  onStart,
  onEdit,
  onDelete,
  disabled,
}: {
  template: WorkoutTemplate
  onStart: () => void
  onEdit?: () => void
  onDelete?: () => void
  disabled: boolean
}) {
  const isCustom = !!onEdit

  return (
    <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4 hover:border-indigo-500/20 transition-all">
      <div className="flex items-start gap-2">
        {/* Clickable content area */}
        <button
          onClick={onStart}
          disabled={disabled}
          className="flex-1 text-left disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl flex-shrink-0">{getMuscleEmoji(template.muscleGroups[0])}</span>
            <h3 className="text-white font-semibold truncate">{template.name}</h3>
          </div>
          {template.description && (
            <p className="text-slate-500 text-xs mb-2 line-clamp-2">{template.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {template.muscleGroups.map((m) => (
              <span
                key={m}
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getMuscleColor(m)}`}
              >
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
        </button>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {isCustom ? (
            <>
              <button
                onClick={onEdit}
                className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                title="Modifica"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Elimina"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={onStart}
              disabled={disabled}
              className="p-2 text-slate-600 disabled:opacity-40"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WorkoutPage() {
  const router = useRouter()
  const workoutTemplates = useStore((s) => s.workoutTemplates)
  const customWorkouts = useStore((s) => s.customWorkouts)
  const addCustomWorkout = useStore((s) => s.addCustomWorkout)
  const updateCustomWorkout = useStore((s) => s.updateCustomWorkout)
  const removeCustomWorkout = useStore((s) => s.removeCustomWorkout)
  const startSession = useStore((s) => s.startSession)
  const activeSession = useStore((s) => s.activeSession)

  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | undefined>()

  // Library: default templates not already in custom workouts
  const customIds = new Set(customWorkouts.map((c) => c.id))
  const libraryTemplates = workoutTemplates.filter((t) => !customIds.has(t.id))

  const handleStart = (template: WorkoutTemplate) => {
    startSession(template, selectedDate)
    router.push('/workout/active')
  }

  const openCreate = () => {
    setEditingTemplate(undefined)
    setEditorOpen(true)
  }

  const openEdit = (template: WorkoutTemplate) => {
    setEditingTemplate(template)
    setEditorOpen(true)
  }

  const handleSave = (template: WorkoutTemplate) => {
    if (editingTemplate) {
      updateCustomWorkout(editingTemplate.id, template)
    } else {
      addCustomWorkout(template)
    }
    setEditorOpen(false)
    setEditingTemplate(undefined)
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Scegli scheda</h1>
        <p className="text-slate-500 text-sm mt-1">Seleziona o crea il tuo allenamento di oggi</p>
      </div>

      {/* Active session banner */}
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

      {/* ── Le mie schede ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white font-semibold">Le mie schede</h2>
            <p className="text-slate-600 text-xs mt-0.5">{customWorkouts.length}/5 schede</p>
          </div>
          {customWorkouts.length < 5 && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-600/30 transition-colors"
            >
              <Plus size={13} />
              Nuova
            </button>
          )}
        </div>

        {customWorkouts.length === 0 ? (
          <button
            onClick={openCreate}
            className="w-full rounded-2xl border border-dashed border-[#2d2d3a] py-10 flex flex-col items-center gap-2 text-slate-600 hover:text-indigo-400 hover:border-indigo-500/30 transition-colors"
          >
            <Plus size={22} />
            <span className="text-sm">Crea la tua prima scheda personalizzata</span>
          </button>
        ) : (
          <div className="space-y-3">
            {customWorkouts.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onStart={() => handleStart(t)}
                onEdit={() => openEdit(t)}
                onDelete={() => removeCustomWorkout(t.id)}
                disabled={!!activeSession}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Libreria ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-white font-semibold">Libreria allenamenti</h2>
          <Lock size={12} className="text-slate-600" />
        </div>
        <p className="text-slate-600 text-xs mb-3">Schede predefinite — sola lettura</p>
        <div className="space-y-3">
          {libraryTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onStart={() => handleStart(t)}
              disabled={!!activeSession}
            />
          ))}
        </div>
      </section>

      {/* Custom Workout Editor modal */}
      {editorOpen && (
        <CustomWorkoutEditor
          initial={editingTemplate}
          onSave={handleSave}
          onClose={() => {
            setEditorOpen(false)
            setEditingTemplate(undefined)
          }}
        />
      )}
    </div>
  )
}
