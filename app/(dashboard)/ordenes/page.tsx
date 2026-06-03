import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En producción',
  shipped: 'Enviado',
  delivered: 'Entregado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
}

export default async function OrdenesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Inicia sesión para ver tus órdenes.</div>
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, designs(image_url, prompt, product_type)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Órdenes</h2>
        <p className="mt-1 text-sm text-gray-500">Estado de tus pedidos.</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-lg text-gray-500">No tienes órdenes todavía</p>
          <p className="mt-1 text-sm text-gray-400">
            Genera un diseño y cómpralo para verlo aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order & { designs: { image_url: string; prompt: string; product_type: string } | null }) => (
            <div
              key={order.id}
              className="flex items-start gap-4 rounded-lg border border-gray-200 p-4"
            >
              {order.designs?.image_url && (
                <Image
                  src={order.designs.image_url}
                  alt={order.designs.prompt}
                  width={96}
                  height={96}
                  className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
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
                    className={`inline-flex flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                  {order.printify_order_id && (
                    <span>ID Printify: {order.printify_order_id}</span>
                  )}
                  {order.tracking_number && (
                    <span>Tracking: {order.tracking_number}</span>
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
                    className="mt-2 inline-block text-xs font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600"
                  >
                    Rastrear pedido
                  </a>
                )}
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
