import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function getMuscleEmoji(muscle: string): string {
  const map: Record<string, string> = {
    petto: '💪',
    schiena: '🔙',
    spalle: '🏔️',
    bicipiti: '💪',
    tricipiti: '💪',
    gambe: '🦵',
    glutei: '🍑',
    core: '🎯',
    cardio: '❤️',
  }
  return map[muscle] ?? '🏋️'
}

export function getMuscleColor(muscle: string): string {
  const map: Record<string, string> = {
    petto: 'bg-red-500/20 text-red-400 border-red-500/30',
    schiena: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    spalle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    bicipiti: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    tricipiti: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    gambe: 'bg-green-500/20 text-green-400 border-green-500/30',
    glutei: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    core: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    cardio: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  }
  return map[muscle] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
