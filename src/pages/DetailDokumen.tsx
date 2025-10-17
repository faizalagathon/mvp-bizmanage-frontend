import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { storage } from '@/lib/storage'
import type { BizDocument, LineItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function DetailDokumen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = new URLSearchParams(useLocation().search).get('edit') === '1'
  const docs = storage.getDocuments()
  const initial = useMemo(() => docs.find(d => d.id === id), [docs, id])
  const [doc, setDoc] = useState<BizDocument | undefined>(initial)

  if (!doc) return <div className="p-6">Dokumen tidak ditemukan.</div>

  function setItem<K extends keyof LineItem>(idx: number, key: K, val: LineItem[K]) {
    setDoc(prev => {
      if (!prev) return prev
      const items = [...prev.items]
      items[idx] = { ...items[idx], [key]: val }
      return { ...prev, items }
    })
  }

  function save() {
    if (!doc) return
    const updated = docs.map(d => d.id === doc.id ? doc : d)
    storage.saveDocuments(updated)
    alert('Perubahan disimpan')
    navigate('/riwayat')
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail Dokumen #{doc.id.slice(0,6)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold uppercase">{doc.type}</div>
            <div>{doc.date}</div>
          </div>
          <div className="divide-y rounded border">
            {doc.items.map((it, i) => (
              <div key={it.id} className="flex items-center gap-2 px-3 py-2">
                {isEdit ? (
                  <>
                    <Input className="flex-1" value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} />
                    <Input className="w-28" type="number" value={it.quantity} onChange={(e) => setItem(i, 'quantity', Number(e.target.value))} />
                    <Input className="w-36" type="number" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', Number(e.target.value))} />
                  </>
                ) : (
                  <>
                    <div className="flex-1">{it.name}</div>
                    <div className="w-28 text-right">{it.quantity}</div>
                    <div className="w-36 text-right">{(it.unitPrice * it.quantity).toLocaleString('id-ID')}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="pt-2 flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate(-1)}>Kembali</Button>
            {isEdit ? (
              <Button onClick={save}>Simpan</Button>
            ) : (
              <Button onClick={() => navigate(`/detail/${doc.id}?edit=1`)}>Edit</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )}
