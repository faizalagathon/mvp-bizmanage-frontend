import { useState } from 'react'
import { storage } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function DaftarItem() {
  const [items, setItems] = useState(storage.getItemTemplates())
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)

  function add() {
    if (!name.trim()) return
    const next = [{ id: crypto.randomUUID(), name, unitPrice: price }, ...items]
    setItems(next)
    storage.saveItemTemplates(next)
    setName(''); setPrice(0)
  }

  function remove(id: string) {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    storage.saveItemTemplates(next)
  }

  function copyToClipboard(it: { name: string; unitPrice: number }) {
    navigator.clipboard.writeText(JSON.stringify(it))
    alert('Template disalin. Tempel di form menggunakan tombol "Tambah Item" manual lalu edit sesuai kebutuhan.')
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Template Item</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <Input placeholder="Nama item" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" placeholder="Harga satuan" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
          <Button onClick={add}>Simpan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Template</CardTitle>
        </CardHeader>
        <CardContent className="divide-y rounded border">
          {items.length === 0 && <div className="p-3 text-sm text-muted-foreground">Belum ada template.</div>}
          {items.map(i => (
            <div key={i.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-muted-foreground">{i.unitPrice.toLocaleString('id-ID')}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(i)}>Salin</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(i.id)}>Hapus</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
