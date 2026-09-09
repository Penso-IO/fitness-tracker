'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatDate, formatDuration, getMuscleColor, getMuscleEmoji } from '@/lib/utils'
import { Trash2, Clock, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

export default function HistoryPage() {
  const sessions = useStore((s) => s.sessions)
  const deleteSession = useStore((s) => s.deleteSession)
  const bookTips = useStore((s) => s.bookTips)
  const addBookTip = useStore((s) => s.addBookTip)
  const deleteBookTip = useStore((s) => s.deleteBookTip)

  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'sessions' | 'books'>('sessions')
  const [showTipForm, setShowTipForm] = useState(false)
  const [tipForm, setTipForm] = useState({ book: '', category: 'training' as 'nutrition' | 'training' | 'recovery', tip: '' })

  const handleAddTip = () => {
    if (!tipForm.tip || !tipForm.book) return
    addBookTip(tipForm)
    setTipForm({ book: '', category: 'training', tip: '' })
    setShowTipForm(false)
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Storico</h1>
        <p className="text-slate-500 text-sm mt-1">Cronologia sessioni e consigli dai libri</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-[#111118] border border-[#1e1e2e] p-1">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeTab === 'sessions' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
        >
          Sessioni ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${activeTab === 'books' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
        >
          Libri ({bookTips.length})
        </button>
      </div>

      {/* Sessions */}
      {activeTab === 'sessions' && (
        sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-3">
            <Clock size={48} strokeWidth={1} />
            <p className="text-sm">Nessuna sessione ancora</p>
            <p className="text-xs">Completa il tuo primo allenamento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-2xl bg-[#111118] border border-[#1e1e2e] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMuscleEmoji(session.muscleGroups[0])}</span>
                    <div>
                      <p className="text-white font-semibold">{session.templateName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{formatDate(session.date)}</span>
                        {session.durationMinutes && (
                          <>
                            <span>·</span>
                            <Clock size={10} />
                            <span>{formatDuration(session.durationMinutes)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                      className="text-slate-600 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    {expanded === session.id ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </div>
                </button>

                {expanded === session.id && (
                  <div className="px-4 pb-4 border-t border-[#1e1e2e] pt-3 space-y-3">
                    {/* Muscle tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {session.muscleGroups.map((m) => (
                        <span key={m} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getMuscleColor(m)}`}>{m}</span>
                      ))}
                    </div>

                    {/* Exercises summary */}
                    {session.exercises.map((ex) => {
                      const done = ex.sets.filter((s) => s.completed)
                      const maxWeight = Math.max(...ex.sets.map((s) => s.weight || 0))
                      return (
                        <div key={ex.exerciseId} className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0">
                          <p className="text-slate-300 text-sm">{ex.exerciseName}</p>
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">{done.length}/{ex.sets.length} serie</p>
                            {maxWeight > 0 && <p className="text-slate-500 text-xs">{maxWeight}kg max</p>}
                          </div>
                        </div>
                      )
                    })}

                    {session.notes && (
                      <p className="text-slate-500 text-xs italic border-t border-[#1e1e2e] pt-2">"{session.notes}"</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Book tips */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowTipForm((v) => !v)}
            className="flex items-center gap-2 w-full rounded-xl border border-dashed border-indigo-500/40 py-3 text-indigo-400 text-sm font-medium justify-center hover:bg-indigo-500/5 transition-colors"
          >
            <BookOpen size={16} />
            Aggiungi consiglio dal libro
          </button>

          {showTipForm && (
            <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Titolo libro</label>
                <input
                  type="text"
                  value={tipForm.book}
                  onChange={(e) => setTipForm({ ...tipForm, book: e.target.value })}
                  placeholder="Es. Starting Strength"
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Categoria</label>
                <select
                  value={tipForm.category}
                  onChange={(e) => setTipForm({ ...tipForm, category: e.target.value as 'nutrition' | 'training' | 'recovery' })}
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="training">Allenamento</option>
                  <option value="nutrition">Nutrizione</option>
                  <option value="recovery">Recupero</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Consiglio / citazione</label>
                <textarea
                  value={tipForm.tip}
                  onChange={(e) => setTipForm({ ...tipForm, tip: e.target.value })}
                  placeholder="Incolla qui il consiglio o la frase chiave dal libro..."
                  rows={4}
                  className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowTipForm(false)} className="flex-1 rounded-xl border border-[#2d2d3a] py-3 text-slate-400 text-sm">
                  Annulla
                </button>
                <button onClick={handleAddTip} className="flex-1 rounded-xl bg-indigo-600 py-3 text-white font-medium text-sm">
                  Salva
                </button>
              </div>
            </div>
          )}

          {bookTips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 gap-2">
              <BookOpen size={40} strokeWidth={1} />
              <p className="text-sm">Nessun consiglio ancora</p>
              <p className="text-xs text-center">Aggiungi frasi chiave dai tuoi libri<br />di allenamento e nutrizione</p>
            </div>
          ) : (
            bookTips.map((tip) => (
              <div key={tip.id} className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-indigo-400" />
                    <span className="text-xs text-indigo-400 font-medium">{tip.book}</span>
                    <span className="text-xs text-slate-600 border border-slate-700 rounded-full px-2 py-0.5">{tip.category}</span>
                  </div>
                  <button onClick={() => deleteBookTip(tip.id)} className="text-slate-600 hover:text-red-400 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-slate-300 text-sm italic">"{tip.tip}"</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
