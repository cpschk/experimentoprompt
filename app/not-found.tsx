import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-bold text-neutral-200">404</div>
      <h1 className="mb-3 text-2xl font-semibold text-neutral-800">
        Página no encontrada
      </h1>
      <p className="mb-8 max-w-md text-neutral-500">
        La página que buscas no existe o fue movida. Quizás tu diseño esté esperando
        en otra dirección.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
