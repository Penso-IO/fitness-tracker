'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Bell } from 'lucide-react'

interface TimerProps {
  defaultSeconds?: number
  autoStart?: boolean
  onComplete?: () => void
  className?: string
}

export default function Timer({ defaultSeconds = 90, autoStart, onComplete }: TimerProps) {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', color: 'var(--bg)' }}>
      {/* Time display */}
      <div style={{ flex: 1 }}>
        {finished ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={22} style={{ color: 'var(--bg)', opacity: 0.9 }} className="animate-bounce" />
            <span style={{ fontWeight: 800, fontSize: 20 }}>Pronti!</span>
          </div>
        ) : (
          <div style={{ fontWeight: 800, fontSize: 28, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: 'var(--bg)' }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        )}
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(243,242,242,0.2)', marginTop: 8 }}>
          <div
            style={{ height: 3, background: finished ? 'rgba(243,242,242,0.9)' : 'rgba(243,242,242,0.7)', width: `${pct}%`, transition: 'width 1s linear' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={reset}
          style={{ height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(243,242,242,0.3)', color: 'rgba(243,242,242,0.7)', background: 'none', cursor: 'pointer' }}
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={toggle}
          style={{ height: 44, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: running ? 'rgba(243,242,242,0.15)' : 'rgba(243,242,242,0.9)', border: 'none', cursor: 'pointer', color: running ? 'rgba(243,242,242,0.9)' : 'var(--text)' }}
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
        </button>
        {/* Preset buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[60, 90, 120].map((s) => (
            <button
              key={s}
              onClick={() => { setSeconds(s); setRunning(false); setFinished(false) }}
              style={{
                padding: '2px 7px', fontSize: 10, fontFamily: 'Archivo, system-ui', fontWeight: 800,
                letterSpacing: '0.06em', cursor: 'pointer',
                background: defaultSeconds === s ? 'rgba(243,242,242,0.2)' : 'transparent',
                border: '1px solid rgba(243,242,242,0.25)',
                color: defaultSeconds === s ? 'rgba(243,242,242,1)' : 'rgba(243,242,242,0.55)',
              }}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
