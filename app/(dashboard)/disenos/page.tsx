import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { DesignStatus } from '@/types'

const STATUS_LABELS: Record<DesignStatus, string> = {
  generated: 'Listo',
  paid: 'Comprado',
  ordered: 'En producción',
  shipped: 'Enviado',
}

const STATUS_COLORS: Record<DesignStatus, string> = {
  generated: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  ordered: 'bg-purple-100 text-purple-800',
  shipped: 'bg-green-100 text-green-800',
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
    return <div className="p-8 text-center text-gray-500">Inicia sesión para ver tus diseños.</div>
  }

  const { data: designs } = await supabase
    .from('designs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mis diseños</h2>
        <p className="mt-1 text-sm text-gray-500">
          Historial de todos tus diseños generados.
        </p>
      </div>

      {!designs || designs.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Aún no has generado ningún diseño.</p>
          <a
            href="/generar"
            className="mt-2 inline-block text-sm font-medium text-gray-900 underline"
          >
            Crear mi primer diseño
          </a>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <div
              key={design.id}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={design.image_url}
                  alt={design.prompt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                <span
                  className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[design.status as DesignStatus] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {STATUS_LABELS[design.status as DesignStatus] || design.status}
                </span>
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

                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-400">
                    {new Date(design.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>

                  <div className="flex gap-2">
                    {design.status === 'generated' && (
                      <form action={`/api/buy-design/${design.id}`} method="POST" className="flex-1">
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-700"
                        >
                          Comprar este diseño
                        </button>
                      </form>
                    )}

                    <a
                      href={`/api/download-design/${design.id}`}
                      className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      title="Descargar imagen"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
