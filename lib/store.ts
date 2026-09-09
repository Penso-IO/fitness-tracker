'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WorkoutSession, NutritionEntry, ProgressEntry, WorkoutTemplate, BookTip } from '@/types'
import { DEFAULT_WORKOUTS } from './workouts'
import { generateId, todayStr } from './utils'

export const NUTRITION_TARGETS = {
  calories: 2400,
  protein: 180,
  carbs: 250,
  fat: 70,
  water: 2.5,
}

const INITIAL_BOOK_TIPS: BookTip[] = [
  // Eric Helms - Training Pyramid
  { id: 'bt1', book: 'Training Pyramid — Eric Helms', category: 'training', tip: 'Progressive overload è la chiave. Aumenta il carico del 2.5-5% quando completi tutte le serie nei rep target.' },
  { id: 'bt2', book: 'Training Pyramid — Eric Helms', category: 'training', tip: 'Lascia 1-2 rip in serbatoio (RIR = Reps In Reserve). Allenarsi sempre al cedimento aumenta il rischio infortuni senza benefici extra di ipertrofia.' },
  { id: 'bt3', book: 'Training Pyramid — Eric Helms', category: 'training', tip: 'Gamma rep per ipertrofia: 6-15 rip per serie. Varia la gamma nel mesociclo per stimolare adattamenti diversi.' },
  { id: 'bt4', book: 'Training Pyramid — Eric Helms', category: 'training', tip: 'Recupero ottimale: 2-3 min per esercizi composti, 60-90 sec per isolamenti. Recupero breve riduce la qualità del lavoro.' },
  { id: 'bt5', book: 'Training Pyramid — Eric Helms', category: 'recovery', tip: 'Deload ogni 4-6 settimane: riduci il volume del 40-50% per 1 settimana. Il superamento avviene durante il recupero, non l\'allenamento.' },
  // Eric Helms - Nutrition Pyramid
  { id: 'bt6', book: 'Nutrition Pyramid — Eric Helms', category: 'nutrition', tip: 'Proteine: 1.6-2.2g per kg di peso corporeo. Questa è la priorità assoluta nella dieta per chi si allena con i pesi.' },
  { id: 'bt7', book: 'Nutrition Pyramid — Eric Helms', category: 'nutrition', tip: 'Surplus calorico per la massa: +200-400 kcal sopra il mantenimento. Minimizza l\'accumulo di grasso mantenendo la crescita muscolare.' },
  { id: 'bt8', book: 'Nutrition Pyramid — Eric Helms', category: 'nutrition', tip: 'Distribuisci 4-5 pasti con almeno 25-40g di proteine ciascuno per massimizzare la sintesi proteica muscolare nel corso della giornata.' },
  { id: 'bt9', book: 'Nutrition Pyramid — Eric Helms', category: 'nutrition', tip: 'Pre-workout: carboidrati + un po\' di proteine 1-2 ore prima. Post-workout: proteine entro 2 ore. Il timing conta ma non è critico come la quantità totale.' },
  // Amerigo Brunetti
  { id: 'bt10', book: 'Programmare l\'Ipertrofia — Brunetti', category: 'training', tip: 'Tre meccanismi di ipertrofia: tensione meccanica (il più importante), danno muscolare e stress metabolico. Priorità ai movimenti con alto carico.' },
  { id: 'bt11', book: 'Programmare l\'Ipertrofia — Brunetti', category: 'training', tip: 'Volume progressivo per mesociclo: aumenta 1-2 serie per muscolo ogni settimana. Fermati quando la qualità dell\'esecuzione cala significativamente.' },
  { id: 'bt12', book: 'Programmare l\'Ipertrofia — Brunetti', category: 'training', tip: 'SRA (Stimulus-Recovery-Adaptation): aspetta 48-72 ore prima di riallenare lo stesso gruppo muscolare. Allenare troppo frequentemente impedisce l\'adattamento.' },
  { id: 'bt13', book: 'Programmare l\'Ipertrofia — Brunetti', category: 'recovery', tip: 'Sonno: 7-9 ore per notte. Il GH (ormone della crescita) viene rilasciato principalmente durante il sonno profondo. Priorità assoluta.' },
]

interface AppState {
  // Workout templates (default + from books)
  workoutTemplates: WorkoutTemplate[]
  addWorkoutTemplate: (template: WorkoutTemplate) => void
  removeWorkoutTemplate: (id: string) => void

  // Active session
  activeSession: WorkoutSession | null
  startSession: (template: WorkoutTemplate, date: string) => void
  updateExerciseSet: (exerciseIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => void
  toggleSetComplete: (exerciseIdx: number, setIdx: number) => void
  finishSession: (notes?: string) => void
  cancelSession: () => void

  // Session history
  sessions: WorkoutSession[]
  deleteSession: (id: string) => void

  // Nutrition
  nutritionLog: NutritionEntry[]
  addNutritionEntry: (entry: Omit<NutritionEntry, 'id'>) => void
  updateNutritionEntry: (id: string, entry: Partial<NutritionEntry>) => void
  deleteNutritionEntry: (id: string) => void

  // Progress
  progressLog: ProgressEntry[]
  addProgressEntry: (entry: Omit<ProgressEntry, 'id'>) => void
  deleteProgressEntry: (id: string) => void

  // Book tips
  bookTips: BookTip[]
  addBookTip: (tip: Omit<BookTip, 'id'>) => void
  deleteBookTip: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      workoutTemplates: DEFAULT_WORKOUTS,

      addWorkoutTemplate: (template) =>
        set((s) => ({ workoutTemplates: [...s.workoutTemplates, template] })),

      removeWorkoutTemplate: (id) =>
        set((s) => ({ workoutTemplates: s.workoutTemplates.filter((t) => t.id !== id) })),

      activeSession: null,

      startSession: (template, date) => {
        const session: WorkoutSession = {
          id: generateId(),
          templateId: template.id,
          templateName: template.name,
          muscleGroups: template.muscleGroups,
          date,
          startTime: new Date().toISOString(),
          exercises: template.exercises.map((ex) => ({
            exerciseId: ex.id,
            exerciseName: ex.name,
            sets: Array.from({ length: ex.defaultSets }, (_, i) => ({
              setNumber: i + 1,
              reps: 0,
              weight: 0,
              completed: false,
            })),
          })),
        }
        set({ activeSession: session })
      },

      updateExerciseSet: (exerciseIdx, setIdx, field, value) =>
        set((s) => {
          if (!s.activeSession) return s
          const exercises = s.activeSession.exercises.map((ex, ei) =>
            ei !== exerciseIdx
              ? ex
              : {
                  ...ex,
                  sets: ex.sets.map((st, si) =>
                    si !== setIdx ? st : { ...st, [field]: value }
                  ),
                }
          )
          return { activeSession: { ...s.activeSession, exercises } }
        }),

      toggleSetComplete: (exerciseIdx, setIdx) =>
        set((s) => {
          if (!s.activeSession) return s
          const exercises = s.activeSession.exercises.map((ex, ei) =>
            ei !== exerciseIdx
              ? ex
              : {
                  ...ex,
                  sets: ex.sets.map((st, si) =>
                    si !== setIdx ? st : { ...st, completed: !st.completed }
                  ),
                }
          )
          return { activeSession: { ...s.activeSession, exercises } }
        }),

      finishSession: (notes) => {
        const session = get().activeSession
        if (!session) return
        const endTime = new Date().toISOString()
        const start = new Date(session.startTime)
        const end = new Date(endTime)
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)
        const finished: WorkoutSession = { ...session, endTime, durationMinutes, notes }
        set((s) => ({
          sessions: [finished, ...s.sessions],
          activeSession: null,
        }))
      },

      cancelSession: () => set({ activeSession: null }),

      sessions: [],
      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((s) => s.id !== id) })),

      nutritionLog: [],
      addNutritionEntry: (entry) =>
        set((s) => ({ nutritionLog: [{ ...entry, id: generateId() }, ...s.nutritionLog] })),
      updateNutritionEntry: (id, entry) =>
        set((s) => ({
          nutritionLog: s.nutritionLog.map((n) => (n.id === id ? { ...n, ...entry } : n)),
        })),
      deleteNutritionEntry: (id) =>
        set((s) => ({ nutritionLog: s.nutritionLog.filter((n) => n.id !== id) })),

      progressLog: [],
      addProgressEntry: (entry) =>
        set((s) => ({ progressLog: [{ ...entry, id: generateId() }, ...s.progressLog] })),
      deleteProgressEntry: (id) =>
        set((s) => ({ progressLog: s.progressLog.filter((p) => p.id !== id) })),

      bookTips: INITIAL_BOOK_TIPS,
      addBookTip: (tip) =>
        set((s) => ({ bookTips: [{ ...tip, id: generateId() }, ...s.bookTips] })),
      deleteBookTip: (id) =>
        set((s) => ({ bookTips: s.bookTips.filter((t) => t.id !== id) })),
    }),
    { name: 'fitness-tracker-store' }
  )
)
