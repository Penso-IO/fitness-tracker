'use client'
import { useStore } from '@/lib/store'
import { formatDate, formatDuration, getMuscleEmoji, todayStr } from '@/lib/utils'
import { Dumbbell, Flame, Droplets, TrendingUp, ChevronRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export default function Dashboard() {
  const sessions = useStore((s) => s.sessions)
  const nutritionLog = useStore((s) => s.nutritionLog)
  const progressLog = useStore((s) => s.progressLog)
  const bookTips = useStore((s) => s.bookTips)
  const activeSession = useStore((s) => s.activeSession)

  const today = todayStr()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlySessions = sessions.filter((s) => {
    const d = new Date(s.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const todayNutrition = nutritionLog.find((n) => n.date === today)
  const lastWeight = progressLog[0]?.weight

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
  const byDay = weekDays.map((label, i) => ({
    label,
    count: monthlySessions.filter((s) => {
      const d = new Date(s.date)
      return (d.getDay() === 0 ? 6 : d.getDay() - 1) === i
    }).length,
  }))

  const tip = bookTips.length > 0 ? bookTips[Math.floor(Math.random() * bookTips.length)] : null

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div>
        <p className="text-slate-500 text-sm">{formatDate(today)}</p>
        <h1 className="text-2xl font-bold text-white mt-1">FitTracker 💪</h1>
      </div>

      {/* Active session banner */}
      {activeSession && (
        <Link href="/workout/active">
          <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
              <div>
                <p className="text-green-400 font-semibold text-sm">Sessione in corso</p>
                <p className="text-white font-bold">{activeSession.templateName}</p>
              </div>
            </div>
            <ChevronRight className="text-green-400" size={20} />
          </div>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Dumbbell size={18} className="text-indigo-400" />} label="Questo mese" value={`${monthlySessions.length}`} sub="sessioni" color="indigo" />
        <StatCard icon={<Flame size={18} className="text-orange-400" />} label="Oggi" value={todayNutrition ? `${todayNutrition.calories}` : '—'} sub="kcal" color="orange" />
        <StatCard icon={<TrendingUp size={18} className="text-green-400" />} label="Peso" value={lastWeight ? `${lastWeight}` : '—'} sub="kg" color="green" />
      </div>

      {/* Monthly chart */}
      {monthlySessions.length > 0 && (
        <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">Sessioni per giorno della settimana</h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={byDay} barSize={20}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e2e8f0' }} cursor={{ fill: '#1e1e2e' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byDay.map((entry, i) => (
                  <Cell key={i} fill={entry.count > 0 ? '#6366f1' : '#1e1e2e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400">Ultime sessioni</h2>
            <Link href="/history" className="text-xs text-indigo-400">Vedi tutte</Link>
          </div>
          {sessions.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getMuscleEmoji(s.muscleGroups[0])}</span>
                <div>
                  <p className="text-white text-sm font-medium">{s.templateName}</p>
                  <p className="text-slate-500 text-xs">{formatDate(s.date)}</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">{s.durationMinutes ? formatDuration(s.durationMinutes) : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Today nutrition */}
      {todayNutrition && (
        <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">Nutrizione oggi</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Kcal', value: todayNutrition.calories, color: 'text-orange-400' },
              { label: 'Proteine', value: `${todayNutrition.protein}g`, color: 'text-blue-400' },
              { label: 'Carbo', value: `${todayNutrition.carbs}g`, color: 'text-yellow-400' },
              { label: 'Grassi', value: `${todayNutrition.fat}g`, color: 'text-pink-400' },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                <p className="text-slate-500 text-xs">{m.label}</p>
              </div>
            ))}
          </div>
          {todayNutrition.water > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-400">
              <Droplets size={14} />
              <span>{todayNutrition.water}L acqua</span>
            </div>
          )}
        </div>
      )}

      {/* Book tip */}
      {tip && (
        <div className="rounded-2xl bg-[#111118] border border-[#1e1e2e] p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-indigo-400" />
            <span className="text-xs text-indigo-400 font-medium">{tip.book}</span>
          </div>
          <p className="text-slate-300 text-sm italic">"{tip.tip}"</p>
        </div>
      )}

      {/* CTA */}
      {!activeSession && (
        <Link href="/workout">
          <div className="rounded-2xl bg-indigo-600 p-4 flex items-center justify-between hover:bg-indigo-500 transition-colors">
            <div>
              <p className="text-white font-bold text-lg">Inizia allenamento</p>
              <p className="text-indigo-200 text-sm">Scegli la scheda di oggi</p>
            </div>
            <Dumbbell size={28} className="text-white" />
          </div>
        </Link>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: 'indigo' | 'orange' | 'green'
}) {
  const bg = { indigo: 'bg-indigo-500/10 border-indigo-500/20', orange: 'bg-orange-500/10 border-orange-500/20', green: 'bg-green-500/10 border-green-500/20' }
  return (
    <div className={`rounded-2xl border p-3 ${bg[color]}`}>
      <div className="flex items-center gap-1 mb-2">{icon}<span className="text-xs text-slate-500">{label}</span></div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}
