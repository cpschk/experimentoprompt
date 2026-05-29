import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">pod-ia-platform</h1>
          <Link
            href="/login"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Comenzar
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Tu idea, impresa.
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Describe tu idea. Nuestra IA la convierte en un diseño único.
            Elige tu producto favorito y te lo enviamos a casa.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                1
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Describe</h3>
              <p className="mt-2 text-sm text-gray-500">
                Escribe tu idea. Desde un logo minimalista hasta un diseño abstracto.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-600">
                2
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Genera</h3>
              <p className="mt-2 text-sm text-gray-500">
                La IA crea un diseño personalizado para tu producto elegido.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600">
                3
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Recibe</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aprobación, pago, y lo recibes en la puerta de tu casa.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/login"
              className="rounded-lg bg-gray-900 px-8 py-3 text-base font-medium text-white transition hover:bg-gray-700"
            >
              Crear mi diseño
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} pod-ia-platform
      </footer>
    </div>
  )
}
