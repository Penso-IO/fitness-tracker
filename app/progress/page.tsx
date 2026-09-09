'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { formatDate, todayStr } from '@/lib/utils'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ProgressPage() {
  const progressLog = useStore((s) => s.progressLog)
  const addProgressEntry = useStore((s) => s.addProgressEntry)
  const deleteProgressEntry = useStore((s) => s.deleteProgressEntry)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: todayStr(), weight: '', bodyFat: '', chest: '', waist: '', hips: '', notes: '' })

  const handleAdd = () => {
    addProgressEntry({
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
      chest: form.chest ? Number(form.chest) : undefined,
      waist: form.waist ? Number(form.waist) : undefined,
      hips: form.hips ? Number(form.hips) : undefined,
      notes: form.notes || undefined,
    })
    setForm({ date: todayStr(), weight: '', bodyFat: '', chest: '', waist: '', hips: '', notes: '' })
    setShowForm(false)
  }

  const weightData = [...progressLog]
    .filter((p) => p.weight)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({ date: p.date.slice(5), peso: p.weight }))

  const NumField = ({ label, field, unit }: { label: string; field: keyof typeof form; unit: string }) => (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder="—"
          className="flex-1 rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
        />
        <span className="text-slate-500 text-sm w-8">{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Progressi</h1>
          <p className="text-slate-500 text-sm mt-1">Peso, misure e composizione corporea</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus size={16} />
          Aggiungi
        </button>
      </div>

      {/* Weight chart */}
      {weightData.length > 1 && (
        <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">Andamento peso</h2>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="peso" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4 space-y-4">
          <h2 className="text-white font-semibold">Nuova misurazione</h2>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Peso" field="weight" unit="kg" />
            <NumField label="Massa grassa" field="bodyFat" unit="%" />
            <NumField label="Petto" field="chest" unit="cm" />
            <NumField label="Vita" field="waist" unit="cm" />
            <NumField label="Fianchi" field="hips" unit="cm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Note</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Come ti senti? Foto scattata?"
              className="w-full rounded-xl bg-[#0a0a0f] border border-[#2d2d3a] px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-[#2d2d3a] py-3 text-slate-400 text-sm">
              Annulla
            </button>
            <button onClick={handleAdd} className="flex-1 rounded-xl bg-indigo-600 py-3 text-white font-medium text-sm hover:bg-indigo-500 transition-colors">
              Salva
            </button>
          </div>
        </div>
      )}

      {/* Log */}
      {progressLog.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-3">
          <TrendingUp size={48} strokeWidth={1} />
          <p className="text-sm">Nessuna misurazione</p>
          <p className="text-xs">Inizia tracciando il tuo peso oggi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {progressLog.map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold">{formatDate(entry.date)}</p>
                <button onClick={() => deleteProgressEntry(entry.id)} className="text-slate-600 hover:text-red-400 p-1 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Peso', value: entry.weight ? `${entry.weight}kg` : '—', color: 'text-indigo-400' },
                  { label: 'Body fat', value: entry.bodyFat ? `${entry.bodyFat}%` : '—', color: 'text-orange-400' },
                  { label: 'Vita', value: entry.waist ? `${entry.waist}cm` : '—', color: 'text-pink-400' },
                  { label: 'Petto', value: entry.chest ? `${entry.chest}cm` : '—', color: 'text-blue-400' },
                  { label: 'Fianchi', value: entry.hips ? `${entry.hips}cm` : '—', color: 'text-green-400' },
                ].map((m) => (
                  <div key={m.label} className="text-center rounded-xl bg-[#0a0a0f] py-2">
                    <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-slate-600 text-xs">{m.label}</p>
                  </div>
                ))}
              </div>
              {entry.notes && <p className="text-slate-500 text-xs mt-2">{entry.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
