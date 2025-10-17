import type { LineItem } from '@/types'

type Props = {
  company?: { name?: string; address?: string; phone?: string; email?: string; logoUrl?: string }
  client: { name?: string; address?: string }
  meta: { number?: string; date: string; validUntil?: string }
  items: LineItem[]
  totals: { subtotal: number; discount: number; vat: number; total: number }
}

export default function QuotationTemplate({ company, client, meta, items, totals }: Props) {
  return (
    <div className="bg-white text-gray-900 p-8">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          {company?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="logo" className="h-14 w-14 object-contain" />
          ) : (
            <div className="h-14 w-14 rounded bg-gray-200 grid place-content-center font-bold">BF</div>
          )}
          <div>
            <div className="text-xl font-semibold">{company?.name ?? 'Nama Perusahaan'}</div>
            {company?.address && <div className="text-sm text-gray-600">{company.address}</div>}
            {(company?.phone || company?.email) && (
              <div className="text-sm text-gray-600">{company?.phone} {company?.email ? `• ${company.email}` : ''}</div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">PENAWARAN</div>
          {meta.number && <div className="text-sm text-gray-600">No: {meta.number}</div>}
          <div className="text-sm text-gray-600">Tanggal: {meta.date}</div>
          {meta.validUntil && <div className="text-sm text-gray-600">Berlaku s/d: {meta.validUntil}</div>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="border rounded p-3">
          <div className="text-xs font-medium text-gray-500">DIAJUKAN KEPADA</div>
          <div className="font-medium">{client.name ?? '-'}</div>
          {client.address && <div className="text-sm text-gray-600">{client.address}</div>}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded border">
        <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 font-medium">
          <div className="col-span-6">Deskripsi</div>
          <div className="col-span-2 text-right">Jumlah</div>
          <div className="col-span-2 text-right">Harga</div>
          <div className="col-span-2 text-right">Subtotal</div>
        </div>
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-12 px-3 py-2 border-t">
            <div className="col-span-6 truncate">{it.name || '-'}</div>
            <div className="col-span-2 text-right">{it.quantity}</div>
            <div className="col-span-2 text-right">{it.unitPrice.toLocaleString('id-ID')}</div>
            <div className="col-span-2 text-right">{(it.quantity * it.unitPrice).toLocaleString('id-ID')}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="space-y-1 text-sm">
          <div className="font-medium">Syarat & Ketentuan</div>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Harga belum termasuk biaya tambahan di luar kesepakatan.</li>
            <li>Pembayaran sesuai termin yang disepakati.</li>
            <li>Penawaran berlaku hingga tanggal di atas.</li>
          </ul>
        </div>
        <div className="text-sm space-y-1 text-right">
          <div>Subtotal: {totals.subtotal.toLocaleString('id-ID')}</div>
          <div>Diskon: {totals.discount.toLocaleString('id-ID')}</div>
          <div>PPN: {totals.vat.toLocaleString('id-ID')}</div>
          <div className="text-lg font-semibold">Total: {totals.total.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <div className="mt-12 flex items-end justify-between">
        <div />
        <div className="text-center">
          <div className="w-40 border-b h-12" />
          <div className="text-xs text-gray-600 mt-1">Tanda tangan & nama jelas</div>
        </div>
      </div>
    </div>
  )
}

