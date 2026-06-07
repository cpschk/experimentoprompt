import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En producción',
  shipped: 'Enviado',
  delivered: 'Entregado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  processing: 'bg-blue-100 text-blue-800 ring-blue-200',
  shipped: 'bg-purple-100 text-purple-800 ring-purple-200',
  delivered: 'bg-green-100 text-green-800 ring-green-200',
}

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const

function StatusTimeline({ current }: { current: string }) {
  const currentIdx = STATUS_STEPS.indexOf(current as typeof STATUS_STEPS[number])

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1 sm:gap-2 flex-1">
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium transition-colors sm:h-7 sm:w-7 ${
              i <= currentIdx
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {i < currentIdx ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span className={`hidden text-[10px] font-medium sm:inline ${i <= currentIdx ? 'text-gray-700' : 'text-gray-300'}`}>
            {STATUS_LABELS[step]}
          </span>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`h-px flex-1 ${i < currentIdx ? 'bg-gray-900' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default async function OrdenesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-gray-500">Iniciá sesión para ver tus órdenes.</p>
      </div>
    )
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, designs(image_url, prompt, product_type)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Órdenes</h1>
        <p className="mt-1 text-gray-500">
          {orders?.length
            ? `Tenés ${orders.length} orden${orders.length === 1 ? '' : 'es'}`
            : 'Estado de tus pedidos.'}
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-24">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <p className="font-medium text-gray-500">No tenés órdenes todavía</p>
          <p className="mt-1 text-sm text-gray-400">
            Generá un diseño y compralo para verlo aquí.
          </p>
          <Link
            href="/generar"
            className="mt-6 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Crear diseño
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order & { designs: { image_url: string; prompt: string; product_type: string } | null }) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {order.designs?.image_url && (
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
                    <Image
                      src={order.designs.image_url}
                      alt={order.designs.prompt}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.designs?.product_type
                          ? PRODUCT_LABELS[order.designs.product_type as keyof typeof PRODUCT_LABELS] || order.designs.product_type
                          : 'Producto'}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
                        {order.designs?.prompt || 'Diseño personalizado'}
                      </p>
                    </div>

                    <span
                      className={`inline-flex flex-shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  {/* Status timeline */}
                  <StatusTimeline current={order.status} />

                  {/* Details */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                    {order.printify_order_id && (
                      <span>ID Printify: <strong className="text-gray-600">{order.printify_order_id}</strong></span>
                    )}
                    {order.tracking_number && (
                      <span>Tracking: <strong className="text-gray-600">{order.tracking_number}</strong></span>
                    )}
                    <span>
                      {new Date(order.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {order.tracking_number && (
                    <a
                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600"
                    >
                      Rastrear pedido
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
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

const PRODUCT_LABELS: Record<string, string> = {
  't-shirt': 'Camiseta',
  hoodie: 'Hoodie',
  mug: 'Taza',
  'phone-case': 'Funda',
  poster: 'Póster',
}
