import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { DesignStatus } from '@/types'

const STATUS_LABELS: Record<DesignStatus, string> = {
  generated: 'Listo',
  paid: 'Comprado',
  ordered: 'En producción',
  shipped: 'Enviado',
}

const STATUS_COLORS: Record<DesignStatus, string> = {
  generated: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  paid: 'bg-blue-100 text-blue-800 ring-blue-200',
  ordered: 'bg-purple-100 text-purple-800 ring-purple-200',
  shipped: 'bg-green-100 text-green-800 ring-green-200',
}

const PRODUCT_LABELS: Record<string, string> = {
  't-shirt': 'Camiseta',
  hoodie: 'Hoodie',
  mug: 'Taza',
  'phone-case': 'Funda',
  poster: 'Póster',
}

export default async function DisenosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500">Iniciá sesión para ver tus diseños.</p>
      </div>
    )
  }

  const { data: designs } = await supabase
    .from('designs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mis diseños</h1>
          <p className="mt-1 text-gray-500">
            {designs?.length
              ? `Tenés ${designs.length} diseño${designs.length === 1 ? '' : 's'} generado${designs.length === 1 ? '' : 's'}`
              : 'Tus diseños generados aparecen acá.'}
          </p>
        </div>
        <Link
          href="/generar"
          className="hidden rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 sm:inline-block"
        >
          Nuevo diseño
        </Link>
      </div>

      {!designs || designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-medium text-gray-500">Aún no generaste ningún diseño</p>
          <p className="mt-1 text-sm text-gray-400">
            Describí tu idea y la IA la convierte en un diseño único.
          </p>
          <Link
            href="/generar"
            className="mt-6 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Crear mi primer diseño
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <div
              key={design.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={design.image_url}
                  alt={design.prompt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    STATUS_COLORS[design.status as DesignStatus] || 'bg-gray-100 text-gray-600 ring-gray-200'
                  }`}
                >
                  {STATUS_LABELS[design.status as DesignStatus] || design.status}
                </span>

                {/* Quick action overlay on hover */}
                {design.status === 'generated' && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <form action={`/api/buy-design/${design.id}`} method="POST">
                      <button
                        type="submit"
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-100"
                      >
                        Comprar
                      </button>
                    </form>
                    <a
                      href={`/api/download-design/${design.id}`}
                      className="rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-white"
                    >
                      Descargar
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {PRODUCT_LABELS[design.product_type] || design.product_type}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {design.prompt}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {new Date(design.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>

                  {design.status !== 'generated' && (
                    <a
                      href={`/api/download-design/${design.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
