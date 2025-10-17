import type { BizDocument, Client } from '@/types'

const CLIENTS_KEY = 'bm_clients'
const DOCS_KEY = 'bm_documents'
const TEMPLATES_KEY = 'bm_item_templates'
const INVOICE_NO_KEY = 'bm_invoice_no'
const BANKS_KEY = 'bm_banks'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getClients(): Client[] {
    return read<Client[]>(CLIENTS_KEY, [])
  },
  saveClients(clients: Client[]) {
    write(CLIENTS_KEY, clients)
  },
  getDocuments(): BizDocument[] {
    return read<BizDocument[]>(DOCS_KEY, [])
  },
  saveDocuments(docs: BizDocument[]) {
    write(DOCS_KEY, docs)
  },
  getItemTemplates(): { id: string; name: string; unitPrice: number }[] {
    return read(TEMPLATES_KEY, [])
  },
  saveItemTemplates(items: { id: string; name: string; unitPrice: number }[]) {
    write(TEMPLATES_KEY, items)
  },
  getAndIncrementInvoiceNo(start = 13191): number {
    const current = read<number>(INVOICE_NO_KEY, start - 1)
    const next = current + 1
    write(INVOICE_NO_KEY, next)
    return next
  },
  getBanks(): { id: string; bank: string; account: string; name: string }[] {
    return read(BANKS_KEY, [
      { id: 'bri', bank: 'BRI', account: '4149.0100.7689.538', name: 'SAFEI' },
      { id: 'bca', bank: 'BCA', account: '1234.567.890', name: 'SAFEI' },
      { id: 'mandiri', bank: 'Mandiri', account: '987.123.456.789', name: 'SAFEI' },
    ])
  },
  saveBanks(banks: { id: string; bank: string; account: string; name: string }[]) {
    write(BANKS_KEY, banks)
  },
}
