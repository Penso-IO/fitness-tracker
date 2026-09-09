'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerProps {
  defaultSeconds?: number
  autoStart?: boolean
  onComplete?: () => void
  className?: string
}

export default function Timer({ defaultSeconds = 90, autoStart, onComplete, className }: TimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [running, setRunning] = useState(autoStart ?? false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [])

  // When autoStart prop becomes true, start the timer
  useEffect(() => {
    if (autoStart) setRunning(true)
  }, [autoStart])

  // When defaultSeconds changes (e.g. remount via key), reset the timer
  useEffect(() => {
    setSeconds(defaultSeconds)
    setRunning(autoStart ?? false)
    setFinished(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSeconds])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            setFinished(true)
            playBeep()
            onComplete?.()
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, playBeep, onComplete])

  const reset = () => {
    setRunning(false)
    setSeconds(defaultSeconds)
    setFinished(false)
  }

  const toggle = () => {
    setFinished(false)
    setRunning((r) => !r)
  }

  const pct = ((defaultSeconds - seconds) / defaultSeconds) * 100
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Circle */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1e1e2e" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={finished ? '#22c55e' : '#6366f1'}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="flex flex-col items-center">
          {finished ? (
            <Bell size={28} className="text-green-400 animate-bounce" />
          ) : (
            <span className="text-2xl font-bold tabular-nums">
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          )}
          {finished && <span className="text-xs text-green-400 font-medium mt-1">Pronti!</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2d2d3a] text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={toggle}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full font-medium transition-all shadow-lg',
            running
              ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/50'
          )}
        >
          {running ? <Pause size={22} /> : <Play size={22} />}
        </button>
        {/* Preset buttons */}
        {[60, 90, 120].map((s) => (
          <button
            key={s}
            onClick={() => { setSeconds(s); setRunning(false); setFinished(false) }}
            className={cn(
              'rounded-lg px-2 py-1 text-xs font-medium border transition-colors',
              defaultSeconds === s
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                : 'border-[#2d2d3a] text-slate-500 hover:text-slate-300'
            )}
          >
            {s}s
          </button>
        ))}
      </div>
    </div>
  )
}
