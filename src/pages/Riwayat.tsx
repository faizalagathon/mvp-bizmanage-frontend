import { storage } from '@/lib/storage'
import type { BizDocument } from '@/types'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

export default function Riwayat() {
  const navigate = useNavigate()
  const docs = storage.getDocuments()
  const grouped = useMemo(() => docs.reduce<Record<string, BizDocument[]>>((acc, d) => {
    const key = d.date
    acc[key] = acc[key] ? [...acc[key], d] : [d]
    return acc
  }, {}), [docs])

  function remove(id: string) {
    const rest = docs.filter(d => d.id !== id)
    storage.saveDocuments(rest)
    location.reload()
  }

  function createInvoiceFromQuotation(q: BizDocument) {
    const next: BizDocument = {
      ...q,
      id: crypto.randomUUID(),
      type: 'invoice',
    }
    storage.saveDocuments([next, ...docs])
    alert('Invoice dibuat dari penawaran')
    navigate('/riwayat')
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(grouped).length === 0 && (
            <div className="text-sm text-muted-foreground">Belum ada dokumen.</div>
          )}
          {Object.entries(grouped).sort(([a],[b]) => a < b ? 1 : -1).map(([date, list]) => (
            <div key={date} className="space-y-2">
              <div className="text-sm font-medium">{date}</div>
              <div className="divide-y rounded border">
                {list.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="font-medium uppercase">{doc.type}</div>
                      <div>#{doc.id.slice(0,6)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.type === 'quotation' && (
                        <Button size="sm" variant="outline" onClick={() => createInvoiceFromQuotation(doc)}>Buat Invoice</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => navigate(`/detail/${doc.id}`)}>Lihat</Button>
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/detail/${doc.id}?edit=1`)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => confirm('Hapus dokumen ini?') && remove(doc.id)}>Hapus</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
