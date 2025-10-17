import { useMemo, useState } from 'react'
import { storage } from '@/lib/storage'
import type { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function Klien() {
  const [clients, setClients] = useState<Client[]>(storage.getClients())
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  function add() {
    if (!name.trim()) return
    const next = [{ id: crypto.randomUUID(), name, address }, ...clients]
    setClients(next)
    storage.saveClients(next)
    setName(''); setAddress('')
  }

  function remove(id: string) {
    const next = clients.filter(c => c.id !== id)
    setClients(next)
    storage.saveClients(next)
  }

  const count = useMemo(() => clients.length, [clients])

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Klien</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Input placeholder="Nama perusahaan/klien" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Alamat" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Button onClick={add}>Simpan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Klien ({count})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y rounded border">
          {clients.length === 0 && <div className="p-3 text-sm text-muted-foreground">Belum ada klien.</div>}
          {clients.map(c => (
            <div key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{c.name}</div>
                {c.address && <div className="text-muted-foreground">{c.address}</div>}
              </div>
              <Button variant="destructive" size="sm" onClick={() => confirm('Hapus klien ini?') && remove(c.id)}>Hapus</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
