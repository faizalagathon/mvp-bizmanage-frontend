import { NavLink, BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { Home, FilePlus2, History, Users, ListChecks, Settings, Plus, FileText, FileSpreadsheet, HandCoins, FileSignature, UserPlus2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BuatDokumen from '@/pages/BuatDokumen'
import Riwayat from '@/pages/Riwayat'
import Klien from '@/pages/Klien'
import DaftarItem from '@/pages/DaftarItem'
import Pengaturan from '@/pages/Pengaturan'
import DetailDokumen from '@/pages/DetailDokumen'
import './App.css'

function Sidebar() {
  const items = [
    { to: '/', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/buat', icon: <FilePlus2 size={18} />, label: 'Buat Dokumen' },
    { to: '/riwayat', icon: <History size={18} />, label: 'Riwayat' },
    { to: '/klien', icon: <Users size={18} />, label: 'Klien' },
    { to: '/item', icon: <ListChecks size={18} />, label: 'Daftar Item' },
    { to: '/pengaturan', icon: <Settings size={18} />, label: 'Pengaturan' },
  ]
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-white">
      <div className="h-14 px-4 flex items-center border-b font-semibold">BizForm</div>
      <nav className="p-2 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-medium' : 'text-gray-700'}`
            }
          >
            {it.icon}
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function usePageTitle() {
  const { pathname } = useLocation()
  const map: Record<string, string> = {
    '/': 'Dashboard',
    '/buat': 'Buat Dokumen',
    '/riwayat': 'Riwayat',
    '/klien': 'Klien',
    '/item': 'Daftar Item',
    '/pengaturan': 'Pengaturan',
  }
  return map[pathname] ?? 'BizForm'
}

function Header() {
  const title = usePageTitle()
  return (
    <header className="h-14 border-b bg-white px-6 flex items-center justify-between">
      <div>
        <div className="text-lg font-semibold">{title}</div>
        {title === 'Dashboard' && (
          <div className="text-sm text-muted-foreground">Selamat datang kembali! Kelola dokumen bisnis Anda dengan mudah.</div>
        )}
      </div>
      <Button className="gap-2"><Plus size={16} />Buat Dokumen</Button>
    </header>
  )
}

function MetricCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-xs font-medium text-gray-500 tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold">{value}</div>
        {sub && <div className="text-xs text-green-600 mt-1">{sub}</div>}
      </CardContent>
    </Card>
  )
}

function QuickAction({ color, title, desc, icon, to }: { color: string; title: string; desc: string; icon: React.ReactNode; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-md border p-4 hover:bg-gray-50 cursor-pointer">
      <div className={`h-10 w-10 rounded-md grid place-content-center text-white ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-medium leading-none">{title}</div>
        <div className="text-sm text-gray-500 truncate">{desc}</div>
      </div>
    </Link>
  )
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-base font-semibold">{title}</div>
      {action}
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Total Dokumen" value="248" />
        <MetricCard title="Bulan Ini" value="42" sub="+12% dari bulan lalu" />
        <MetricCard title="Pending" value="8" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <SectionHeader title="Aksi Cepat" />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <QuickAction to='/buat' color="bg-blue-600" title="Invoice" desc="Buat tagihan untuk klien" icon={<FileText size={18} />} />
          <QuickAction to='/buat' color="bg-purple-600" title="BAST" desc="Berita acara serah terima" icon={<FileSpreadsheet size={18} />} />
          <QuickAction to='/buat' color="bg-green-600" title="Penawaran" desc="Buat proposal penawaran" icon={<FileSignature size={18} />} />
          <QuickAction to='/buat' color="bg-orange-500" title="Kwitansi" desc="Tanda terima pembayaran" icon={<HandCoins size={18} />} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <SectionHeader title="Dokumen Terbaru" action={<Button variant="ghost" size="sm">Lihat Semua</Button>} />
          </CardHeader>
          <CardContent className="space-y-3">
            {[{ id: 'INV-2024-001', client: 'PT Maju Jaya', amount: 'Rp 15.000.000', status: 'Paid' as const }, { id: 'QUO-2024-001', client: 'CV Sukses Mandiri', amount: 'Rp 8.500.000', status: 'Pending' as const }].map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {doc.id}
                    <Badge variant="secondary" className="text-[10px]">{doc.id.startsWith('INV') ? 'Invoice' : 'Quotation'}</Badge>
                  </div>
                  <div className="text-xs text-gray-500">{doc.client}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold whitespace-nowrap">{doc.amount}</div>
                  {doc.status === 'Paid' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Paid</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <SectionHeader title="Klien Terbaru" action={<Button variant="ghost" size="sm">Lihat Semua</Button>} />
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="grid place-items-center py-12 text-center">
              <div className="mb-3 rounded-full bg-gray-100 p-3 text-gray-500">
                <UserPlus2 size={20} />
              </div>
              <div className="mb-2">Belum ada klien</div>
              <Button size="sm" variant="default">Tambah Klien</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/buat" element={<BuatDokumen />} />
            <Route path="/riwayat" element={<Riwayat />} />
            <Route path="/detail/:id" element={<DetailDokumen />} />
            <Route path="/klien" element={<Klien />} />
            <Route path="/item" element={<DaftarItem />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
