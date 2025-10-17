import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDocxError(err: unknown): string {
  const e = err as { message?: string; properties?: { errors?: { id?: string; explanation?: string; message?: string; properties?: { tag?: string } }[] } }
  const lines: string[] = []
  if (e?.properties?.errors && Array.isArray(e.properties.errors) && e.properties.errors.length > 0) {
    for (const one of e.properties.errors) {
      const tag = one?.properties?.tag ? ` (tag: ${one.properties.tag})` : ''
      lines.push(`${one?.id ?? 'Error'}${tag}: ${one?.explanation ?? one?.message ?? ''}`)
    }
  }
  if (lines.length === 0) {
    lines.push((e?.message as string) || 'Unknown DOCX error')
  }
  return lines.join('\n')
}
