'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { WorkoutTemplate } from '@/types'
import { todayStr } from '@/lib/utils'
import { Clock, Plus, Pencil, Trash2, Lock, ChevronDown, ChevronUp, Dumbbell, Calendar } from 'lucide-react'
import CustomWorkoutEditor from '@/components/CustomWorkoutEditor'
import ExerciseInfoModal from '@/components/ExerciseInfoModal'

function TemplateCard({
  template,
  onStart,
  onEdit,
  onDelete,
  disabled,
  onExerciseDemo,
}: {
  template: WorkoutTemplate
  onStart: () => void
  onEdit?: () => void
  onDelete?: () => void
  disabled: boolean
  onExerciseDemo: (name: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isCustom = !!onEdit

  return (
    <div style={{ border: '1px solid var(--divider)', background: 'var(--surface)' }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '14px 20px' }}>
        <button
          onClick={onStart}
          disabled={disabled}
          style={{ flex: 1, textAlign: 'left', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', background: 'none', border: 'none', padding: 0, minWidth: 0 }}
        >
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{template.name}</div>
          {template.description && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{template.description}</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {template.muscleGroups.map((m) => (
              <span key={m} className="tag tag-neutral">{m}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: 12 }}>
            <Clock size={12} />
            <span>~{template.estimatedMinutes} min</span>
            <span style={{ margin: '0 2px' }}>·</span>
            <span>{template.exercises.length} esercizi</span>
          </div>
        </button>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {isCustom ? (
            <>
              <button onClick={onEdit} style={{ padding: 8, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }} title="Modifica">
                <Pencil size={14} />
              </button>
              <button onClick={onDelete} style={{ padding: 8, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }} title="Elimina">
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <button onClick={onStart} disabled={disabled} style={{ padding: 8, color: 'var(--muted)', background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
              <ChevronDown size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Toggle exercise list */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', borderTop: '1px solid var(--divider)', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', color: 'var(--muted)', background: 'none', cursor: 'pointer' }}
      >
        <span className="k">Vedi esercizi</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {/* Exercise list */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--divider)' }}>
          {template.exercises.map((ex, idx) => (
            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: idx < template.exercises.length - 1 ? '1px solid var(--divider)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
                <div className="k" style={{ marginTop: 3 }}>
                  {ex.defaultSets}×{ex.defaultReps}
                  {ex.restSeconds > 0 && ` · ${ex.restSeconds}s rec.`}
                </div>
                {ex.tips && <div style={{ color: 'var(--accent-dark)', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.tips}</div>}
              </div>
              <button
                onClick={() => onExerciseDemo(ex.name)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--divider)', padding: '4px 8px', fontSize: 11, color: 'var(--muted)', background: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                <Dumbbell size={11} />
                Demo
              </button>
            </div>
          ))}

          {/* Start from expanded view */}
          <div style={{ padding: '12px 20px' }}>
            <button
              onClick={onStart}
              disabled={disabled}
              className="btn btn-primary btn-block"
              style={{ opacity: disabled ? 0.4 : 1 }}
            >
              Inizia sessione →
            </button>
          </div>
        </div>
      )}
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
  const [demoExercise, setDemoExercise] = useState<string | null>(null)

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
    <div style={{ paddingBottom: 26 }}>
      {/* Header */}
      <div style={{ padding: '58px 20px 14px', borderBottom: '2px solid rgba(32,30,29,0.4)' }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Scegli scheda</h1>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Seleziona o crea il tuo allenamento di oggi</div>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <div style={{ margin: '16px 20px', border: '2px solid var(--accent)', background: 'var(--accent-light)', padding: '13px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="k" style={{ color: 'var(--accent-dark)' }}>Sessione in corso</div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>{activeSession.templateName}</div>
          </div>
          <button
            onClick={() => router.push('/workout/active')}
            className="btn btn-primary"
          >
            Riprendi
          </button>
        </div>
      )}

      {/* Date picker */}
      <div style={{ margin: '16px 20px', border: '1px solid var(--divider)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Calendar size={14} style={{ color: 'var(--muted)' }} />
          <span className="k">Data sessione</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input"
        />
      </div>

      {/* Le mie schede */}
      <div style={{ padding: '0 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span className="k">Le mie schede</span>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{customWorkouts.length}/5 schede</div>
          </div>
          {customWorkouts.length < 5 && (
            <button
              onClick={openCreate}
              className="btn btn-secondary"
              style={{ fontSize: 12 }}
            >
              <Plus size={13} />
              Nuova
            </button>
          )}
        </div>

        {customWorkouts.length === 0 ? (
          <button
            onClick={openCreate}
            style={{ width: '100%', border: '1px dashed var(--divider)', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--muted)', background: 'none', cursor: 'pointer' }}
          >
            <Plus size={22} />
            <span style={{ fontSize: 13 }}>Crea la tua prima scheda personalizzata</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customWorkouts.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onStart={() => handleStart(t)}
                onEdit={() => openEdit(t)}
                onDelete={() => removeCustomWorkout(t.id)}
                disabled={!!activeSession}
                onExerciseDemo={setDemoExercise}
              />
            ))}
          </div>
        )}
      </div>

      {/* Libreria */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span className="k">Libreria allenamenti</span>
          <Lock size={10} style={{ color: 'var(--muted)' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Schede predefinite — sola lettura</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {libraryTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onStart={() => handleStart(t)}
              disabled={!!activeSession}
              onExerciseDemo={setDemoExercise}
            />
          ))}
        </div>
      </div>

      {/* Custom Workout Editor */}
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

      {/* Exercise Demo modal (wger.de API) */}
      {demoExercise && (
        <ExerciseInfoModal exerciseName={demoExercise} onClose={() => setDemoExercise(null)} />
      )}
    </div>
  )
}
