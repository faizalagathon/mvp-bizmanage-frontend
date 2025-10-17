export type Client = {
  id: string
  name: string
  address?: string
}

export type LineItem = {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export type DocumentType = 'invoice' | 'quotation' | 'bast' | 'receipt'

export type BizDocument = {
  id: string
  type: DocumentType
  clientId: string
  date: string
  dueDate?: string
  items: LineItem[]
  discount?: number
  vat?: number
  notes?: string
  total: number
}
