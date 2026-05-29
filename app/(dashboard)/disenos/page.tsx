import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DisenosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <img
                src={design.image_url}
                alt={design.prompt}
                className="aspect-square w-full object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-900 line-clamp-2">
                  {design.prompt}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {design.product_type}
                  </span>
                  <span className={`text-xs font-medium ${
                    design.status === 'generated' ? 'text-yellow-600' :
                    design.status === 'paid' ? 'text-blue-600' :
                    design.status === 'ordered' ? 'text-purple-600' :
                    'text-green-600'
                  }`}>
                    {design.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
