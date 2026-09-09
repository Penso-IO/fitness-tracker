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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-[#111118] border-t border-x border-[#1e1e2e] flex flex-col"
        style={{ maxHeight: '85dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="h-1 w-10 rounded-full bg-[#2d2d3a]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e] flex-shrink-0">
          <h3 className="text-white font-bold text-base truncate pr-4">{exerciseName}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={28} className="text-indigo-400 animate-spin" />
              <p className="text-slate-500 text-sm">Caricamento dati esercizio...</p>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {data.category && (
                  <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400">
                    {data.category}
                  </span>
                )}
                {data.muscles.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs text-orange-400"
                  >
                    {m}
                  </span>
                ))}
                {data.musclesSecondary.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-[#1e1e2e] border border-[#2d2d3a] px-3 py-1 text-xs text-slate-400"
                  >
                    {m} (sec.)
                  </span>
                ))}
              </div>

              {/* Images / animation */}
              {data.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {data.images.slice(0, 3).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={data.name}
                      className="h-44 w-auto rounded-xl flex-shrink-0 bg-white object-contain"
                    />
                  ))}
                </div>
              )}

              {/* Description */}
              {data.description && (
                <div className="rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] p-3">
                  <p className="text-slate-400 text-sm leading-relaxed">{data.description}</p>
                </div>
              )}

              {/* Equipment */}
              {data.equipment.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">Attrezzatura:</span>
                  {data.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="rounded-lg bg-[#1e1e2e] border border-[#2d2d3a] px-2 py-1 text-xs text-slate-400"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !data && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-600">
              <Dumbbell size={40} strokeWidth={1} />
              <p className="text-sm">Nessuna demo disponibile per questo esercizio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
