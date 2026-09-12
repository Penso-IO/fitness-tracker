'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, Dumbbell, Loader2 } from 'lucide-react'
import type { ExerciseInfo } from '@/app/api/exercise/route'

interface Props {
  exerciseName: string
  onClose: () => void
}

export default function ExerciseInfoModal({ exerciseName, onClose }: Props) {
  const [data, setData] = useState<ExerciseInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/exercise?name=${encodeURIComponent(exerciseName)}`)
      const json: ExerciseInfo | null = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [exerciseName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(32,30,29,0.55)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 512, background: 'var(--bg)', borderTop: '2px solid var(--divider)', display: 'flex', flexDirection: 'column', maxHeight: '85dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ height: 4, width: 40, background: 'var(--neutral-300)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--divider)', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 16 }}>{exerciseName}</div>
          <button onClick={onClose} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 12 }}>
              <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} className="animate-spin" />
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Caricamento dati esercizio...</div>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.category && (
                  <span className="tag tag-accent">{data.category}</span>
                )}
                {data.muscles.map((m) => (
                  <span key={m} className="tag" style={{ background: 'var(--neutral-200)', color: 'var(--neutral-800)', border: '1px solid var(--divider)' }}>
                    {m}
                  </span>
                ))}
                {data.musclesSecondary.map((m) => (
                  <span key={m} className="tag tag-neutral">
                    {m} (sec.)
                  </span>
                ))}
              </div>

              {/* Images / animation */}
              {data.images.length > 0 && (
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {data.images.slice(0, 3).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={data.name}
                      style={{ height: 176, width: 'auto', flexShrink: 0, background: 'white', objectFit: 'contain', border: '1px solid var(--divider)' }}
                    />
                  ))}
                </div>
              )}

              {/* Description */}
              {data.description && (
                <div style={{ border: '1px solid var(--divider)', padding: '12px 14px', background: 'var(--surface)' }}>
                  <div style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.55 }}>{data.description}</div>
                </div>
              )}

              {/* Equipment */}
              {data.equipment.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="k">Attrezzatura:</span>
                  {data.equipment.map((eq) => (
                    <span key={eq} className="tag tag-neutral">{eq}</span>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !data && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 12, color: 'var(--muted)' }}>
              <Dumbbell size={40} strokeWidth={1} />
              <div style={{ fontSize: 13 }}>Nessuna demo disponibile per questo esercizio</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
