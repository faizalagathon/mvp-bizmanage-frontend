import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SETTINGS_KEY = 'bm_settings'

type Settings = { primary: string; dark: boolean; fontInter: boolean }

export default function Pengaturan() {
  const [primary, setPrimary] = useState('#3B82F6')
  const [dark, setDark] = useState(false)
  const [fontInter, setFontInter] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Settings
      setPrimary(s.primary)
      setDark(s.dark)
      setFontInter(s.fontInter)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', primary)
    document.documentElement.classList.toggle('dark', dark)
    if (fontInter) applyInter()
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ primary, dark, fontInter }))
  }, [primary, dark, fontInter])

  function applyInter() {
    const id = 'inter-font'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      document.head.appendChild(link)
    }
    document.documentElement.style.fontFamily = 'Inter, system-ui, sans-serif'
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tampilan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Warna Primer</label>
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">Mode Gelap</label>
            <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm">Gunakan Font Inter</label>
            <input type="checkbox" checked={fontInter} onChange={(e) => setFontInter(e.target.checked)} />
          </div>
          <Button onClick={applyInter}>Muat Font Sekarang</Button>
        </CardContent>
      </Card>
    </div>
  )
}
