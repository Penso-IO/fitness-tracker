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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(32,30,29,0.6)' }}>
      <div
        style={{ width: '100%', maxWidth: 512, background: 'var(--bg)', borderTop: '2px solid var(--divider)', display: 'flex', flexDirection: 'column', maxHeight: '92dvh' }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, flexShrink: 0 }}>
          <div style={{ height: 4, width: 40, background: 'var(--neutral-300)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--divider)', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            {initial ? 'Modifica scheda' : 'Nuova scheda'}
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name */}
          <div>
            <label className="k" style={{ display: 'block', marginBottom: 4 }}>Nome scheda *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Petto e Bicipiti"
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="k" style={{ display: 'block', marginBottom: 4 }}>Descrizione</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Es. Focus ipertrofia, esercizi composti..."
              className="input"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="k" style={{ display: 'block', marginBottom: 4 }}>Durata stimata (minuti)</label>
            <input
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 60)}
              className="input"
              style={{ width: 120 }}
            />
          </div>

          {/* Muscle groups */}
          <div>
            <label className="k" style={{ display: 'block', marginBottom: 8 }}>Gruppi muscolari</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  style={{
                    border: '1px solid var(--divider)', padding: '5px 10px',
                    fontFamily: 'Archivo, system-ui', fontWeight: 800, fontSize: 10,
                    letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                    background: muscleGroups.includes(m) ? 'var(--accent)' : 'transparent',
                    color: muscleGroups.includes(m) ? 'var(--bg)' : 'var(--muted)',
                    borderColor: muscleGroups.includes(m) ? 'var(--accent)' : 'var(--divider)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <label className="k" style={{ display: 'block', marginBottom: 8 }}>
              Esercizi ({exercises.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  style={{ border: '1px solid var(--divider)', background: 'var(--surface)', overflow: 'hidden' }}
                >
                  {/* Exercise header row */}
                  <button
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setExpandedIdx(expandedIdx === idx ? -1 : idx)}
                  >
                    <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 800, width: 16, flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <span
                      style={{ flex: 1, fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: ex.name ? 'var(--text)' : 'var(--muted)' }}
                    >
                      {ex.name || 'Nuovo esercizio'}
                    </span>
                    <span className="k" style={{ flexShrink: 0 }}>
                      {ex.defaultSets}×{ex.defaultReps}
                    </span>
                    {expandedIdx === idx ? (
                      <ChevronUp size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    )}
                  </button>

                  {/* Expanded form */}
                  {expandedIdx === idx && (
                    <div style={{ padding: '12px', borderTop: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {/* Name */}
                      <input
                        value={ex.name}
                        onChange={(e) => updateEx(idx, 'name', e.target.value)}
                        placeholder="Nome esercizio *"
                        className="input"
                        style={{ background: 'var(--bg)' }}
                      />

                      {/* Serie / Rip / Recupero */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div>
                          <label className="k" style={{ display: 'block', marginBottom: 4 }}>Serie</label>
                          <input
                            type="number"
                            min={1}
                            value={ex.defaultSets}
                            onChange={(e) => updateEx(idx, 'defaultSets', parseInt(e.target.value) || 1)}
                            className="input"
                            style={{ textAlign: 'center', background: 'var(--bg)' }}
                          />
                        </div>
                        <div>
                          <label className="k" style={{ display: 'block', marginBottom: 4 }}>Ripetizioni</label>
                          <input
                            value={ex.defaultReps}
                            onChange={(e) => updateEx(idx, 'defaultReps', e.target.value)}
                            placeholder="8-10"
                            className="input"
                            style={{ textAlign: 'center', background: 'var(--bg)' }}
                          />
                        </div>
                        <div>
                          <label className="k" style={{ display: 'block', marginBottom: 4 }}>Rec. (s)</label>
                          <input
                            type="number"
                            min={0}
                            value={ex.restSeconds}
                            onChange={(e) => updateEx(idx, 'restSeconds', parseInt(e.target.value) || 0)}
                            className="input"
                            style={{ textAlign: 'center', background: 'var(--bg)' }}
                          />
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <label className="k" style={{ display: 'block', marginBottom: 4 }}>
                          Come eseguire — tecnica e forma corretta
                        </label>
                        <textarea
                          value={ex.instructions ?? ''}
                          onChange={(e) => updateEx(idx, 'instructions', e.target.value)}
                          placeholder="Posizione di partenza, traiettoria del movimento, punti chiave, errori da evitare..."
                          rows={3}
                          style={{ width: '100%', border: '1px solid var(--divider)', padding: '6px 10px', fontSize: 13, color: 'var(--text)', background: 'var(--bg)', fontFamily: 'Archivo, system-ui', resize: 'none', outline: 'none' }}
                        />
                      </div>

                      {/* Tips / pesi */}
                      <div>
                        <label className="k" style={{ display: 'block', marginBottom: 4 }}>
                          Note / Pesi (opzionale)
                        </label>
                        <input
                          value={ex.tips ?? ''}
                          onChange={(e) => updateEx(idx, 'tips', e.target.value)}
                          placeholder="Es. 40kg × 8 poi dropset 30kg × 5"
                          className="input"
                          style={{ background: 'var(--bg)' }}
                        />
                      </div>

                      {/* Remove */}
                      {exercises.length > 1 && (
                        <button
                          onClick={() => removeExercise(idx)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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
              style={{ marginTop: 8, width: '100%', border: '1px dashed var(--divider)', padding: '12px 0', fontSize: 12, color: 'var(--muted)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Archivo, system-ui', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              <Plus size={13} />
              Aggiungi esercizio
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--divider)', flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={!name.trim() || validExercises.length === 0}
            className="btn btn-primary btn-block"
            style={{ minHeight: 50, fontSize: 15 }}
          >
            {initial ? 'Salva modifiche' : 'Crea scheda'}
          </button>
        </div>
      </div>
    </div>
  )
}
