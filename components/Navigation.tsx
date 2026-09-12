'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, TrendingUp, Salad, Clock } from 'lucide-react'
import { useStore } from '@/lib/store'

const links = [
  { href: '/', label: 'OGGI', icon: Home },
  { href: '/workout', label: 'ESERCIZI', icon: Dumbbell },
  { href: '/progress', label: 'PROGRESSI', icon: TrendingUp },
  { href: '/nutrition', label: 'NUTRIZIONE', icon: Salad },
  { href: '/history', label: 'STORICO', icon: Clock },
]

export default function Navigation() {
  const pathname = usePathname()
  const activeSession = useStore((s) => s.activeSession)

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, borderTop: '2px solid rgba(32,30,29,0.4)', background: '#f3f2f2', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div style={{ display: 'flex', maxWidth: 512, margin: '0 auto' }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isWorkout = href === '/workout'
          return (
            <Link key={href} href={href} style={{
              flex: 1, minHeight: 52, padding: '9px 0 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: active ? 'var(--accent)' : 'var(--muted)',
              borderRight: '1px solid var(--divider)',
              textDecoration: 'none', position: 'relative',
            }}>
              <div style={{ position: 'relative' }}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {isWorkout && activeSession && (
                  <span style={{ position: 'absolute', right: -4, top: -4, width: 8, height: 8, borderRadius: '50%', background: '#ec3013' }} />
                )}
              </div>
              <span style={{ fontFamily: 'Archivo, system-ui', fontWeight: 800, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
