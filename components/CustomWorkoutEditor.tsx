'use client'
import { useState } from 'react'
import { WorkoutTemplate, Exercise, MuscleGroup } from '@/types'
import { generateId } from '@/lib/utils'
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'petto', 'schiena', 'spalle', 'bicipiti', 'tricipiti', 'gambe', 'glutei', 'core', 'cardio',
]

interface Props {
  initial?: WorkoutTemplate
  onSave: (template: WorkoutTemplate) => void
  onClose: () => void
}

const newExercise = (): Exercise => ({
  id: generateId(),
  name: '',
  muscleGroups: [],
  defaultSets: 3,
  defaultReps: '8-10',
  restSeconds: 90,
  tips: '',
  instructions: '',
})

export default function CustomWorkoutEditor({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [estimatedMinutes, setEstimatedMinutes] = useState(initial?.estimatedMinutes ?? 60)
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(initial?.muscleGroups ?? [])
  const [exercises, setExercises] = useState<Exercise[]>(
    initial?.exercises.length ? initial.exercises : [newExercise()]
  )
  const [expandedIdx, setExpandedIdx] = useState<number>(0)

  const toggleMuscle = (m: MuscleGroup) =>
    setMuscleGroups((prev) => (prev.includes(m) ? prev.filter((g) => g !== m) : [...prev, m]))

  const addExercise = () => {
    const idx = exercises.length
    setExercises((prev) => [...prev, newExercise()])
    setExpandedIdx(idx)
  }

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx))
    setExpandedIdx(-1)
  }

  const updateEx = (idx: number, field: keyof Exercise, value: unknown) =>
    setExercises((prev) => prev.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)))

  const validExercises = exercises.filter((e) => e.name.trim())

  const handleSave = () => {
    if (!name.trim() || validExercises.length === 0) return
    onSave({
      id: initial?.id ?? generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      estimatedMinutes,
      muscleGroups,
      exercises: validExercises,
      isCustom: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-t-3xl bg-[#111118] border-t border-x border-[#1e1e2e] flex flex-col"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 flex-shrink-0">
          <div className="h-1 w-10 rounded-full bg-[#2d2d3a]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e] flex-shrink-0">
          <h2 className="text-white font-bold text-base">
            {initial ? 'Modifica scheda' : 'Nuova scheda'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nome scheda *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Petto e Bicipiti"
              className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Descrizione</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Es. Focus ipertrofia, esercizi composti..."
              className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Durata stimata (minuti)</label>
            <input
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 60)}
              className="w-32 rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Muscle groups */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Gruppi muscolari</label>
            <div className="flex flex-wrap gap-2">
              {ALL_MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    muscleGroups.includes(m)
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-[#0a0a0f] border-[#2d2d3a] text-slate-500 hover:border-[#3d3d4a]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">
              Esercizi ({exercises.length})
            </label>
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] overflow-hidden"
                >
                  {/* Exercise header row */}
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
                    onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                  >
                    <span className="text-slate-600 text-xs font-mono w-4 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      className={`flex-1 text-sm font-medium truncate ${
                        ex.name ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {ex.name || 'Nuovo esercizio'}
                    </span>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                      {ex.defaultSets}×{ex.defaultReps}
                    </span>
                    {expandedIdx === idx ? (
                      <ChevronUp size={14} className="text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded form */}
                  {expandedIdx === idx && (
                    <div className="px-3 pb-3 space-y-3 border-t border-[#1e1e2e] pt-3">
                      {/* Name */}
                      <input
                        value={ex.name}
                        onChange={(e) => updateEx(idx, 'name', e.target.value)}
                        placeholder="Nome esercizio *"
                        className="w-full rounded-xl bg-[#111118] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                      />

                      {/* Serie / Rip / Recupero */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-slate-600 block mb-1">Serie</label>
                          <input
                            type="number"
                            min={1}
                            value={ex.defaultSets}
                            onChange={(e) =>
                              updateEx(idx, 'defaultSets', parseInt(e.target.value) || 1)
                            }
                            className="w-full rounded-xl bg-[#111118] border border-[#2d2d3a] px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 block mb-1">Ripetizioni</label>
                          <input
                            value={ex.defaultReps}
                            onChange={(e) => updateEx(idx, 'defaultReps', e.target.value)}
                            placeholder="8-10"
                            className="w-full rounded-xl bg-[#111118] border border-[#2d2d3a] px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 block mb-1">Rec. (s)</label>
                          <input
                            type="number"
                            min={0}
                            value={ex.restSeconds}
                            onChange={(e) =>
                              updateEx(idx, 'restSeconds', parseInt(e.target.value) || 0)
                            }
                            className="w-full rounded-xl bg-[#111118] border border-[#2d2d3a] px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Come eseguire — tecnica e forma corretta
                        </label>
                        <textarea
                          value={ex.instructions ?? ''}
                          onChange={(e) => updateEx(idx, 'instructions', e.target.value)}
                          placeholder="Posizione di partenza, traiettoria del movimento, punti chiave, errori da evitare..."
                          rows={3}
                          className="w-full rounded-xl bg-[#111118] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>

                      {/* Tips / pesi */}
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Note / Pesi (opzionale)
                        </label>
                        <input
                          value={ex.tips ?? ''}
                          onChange={(e) => updateEx(idx, 'tips', e.target.value)}
                          placeholder="Es. 40kg × 8 poi dropset 30kg × 5"
                          className="w-full rounded-xl bg-[#111118] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Remove */}
                      {exercises.length > 1 && (
                        <button
                          onClick={() => removeExercise(idx)}
                          className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={12} />
                          Rimuovi esercizio
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add exercise */}
            <button
              onClick={addExercise}
              className="mt-2 w-full rounded-xl border border-dashed border-[#2d2d3a] py-3 text-sm text-slate-500 hover:text-indigo-400 hover:border-indigo-500/40 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={14} />
              Aggiungi esercizio
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[#1e1e2e] flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={!name.trim() || validExercises.length === 0}
            className="w-full rounded-2xl bg-indigo-600 py-3.5 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
          >
            {initial ? 'Salva modifiche' : 'Crea scheda'}
          </button>
        </div>
      </div>
    </div>
  )
}
