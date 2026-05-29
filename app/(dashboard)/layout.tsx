import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-lg font-bold text-gray-900">pod-ia-platform</h1>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="/generar" className="hover:text-gray-900">Generar</a>
            <a href="/disenos" className="hover:text-gray-900">Mis diseños</a>
            <a href="/ordenes" className="hover:text-gray-900">Órdenes</a>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-red-500 hover:text-red-700">
                Cerrar sesión
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
