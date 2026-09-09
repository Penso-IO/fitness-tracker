'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, Salad, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrizione', icon: Salad },
  { href: '/progress', label: 'Progressi', icon: TrendingUp },
  { href: '/history', label: 'Storico', icon: Clock },
]

export default function Navigation() {
  const pathname = usePathname()
  const activeSession = useStore((s) => s.activeSession)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1e1e2e] bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isWorkout = href === '/workout'
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-all',
                active
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <div className={cn('relative', active && 'scale-110 transition-transform')}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {isWorkout && activeSession && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                )}
              </div>
              <span className={cn('font-medium', active ? 'text-indigo-400' : '')}>{label}</span>
              {active && (
                <span className="absolute -top-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-indigo-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
