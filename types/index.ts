export type MuscleGroup =
  | 'petto'
  | 'schiena'
  | 'spalle'
  | 'bicipiti'
  | 'tricipiti'
  | 'gambe'
  | 'glutei'
  | 'core'
  | 'cardio'

export interface Exercise {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  defaultSets: number
  defaultReps: string // e.g. "8-10"
  restSeconds: number
  tips?: string
  instructions?: string // step-by-step form cues
  fromBook?: string
}

export interface WorkoutTemplate {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  exercises: Exercise[]
  estimatedMinutes: number
  description?: string
  isCustom?: boolean
}

export interface PerformedSet {
  setNumber: number
  reps: number
  weight: number
  completed: boolean
}

export interface PerformedExercise {
  exerciseId: string
  exerciseName: string
  sets: PerformedSet[]
  notes?: string
}

export interface WorkoutSession {
  id: string
  templateId: string
  templateName: string
  muscleGroups: MuscleGroup[]
  date: string
  startTime: string
  endTime?: string
  durationMinutes?: number
  exercises: PerformedExercise[]
  notes?: string
}

export interface NutritionEntry {
  id: string
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
  notes?: string
}

export interface ProgressEntry {
  id: string
  date: string
  weight?: number
  bodyFat?: number
  chest?: number
  waist?: number
  hips?: number
  notes?: string
}

export interface BookTip {
  id: string
  book: string
  category: 'nutrition' | 'training' | 'recovery'
  tip: string
}
