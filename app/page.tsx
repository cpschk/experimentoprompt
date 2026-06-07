import Link from 'next/link'

const PRODUCTS = [
  { emoji: '👕', name: 'Camisetas', desc: 'Premium unisex 100% algodón' },
  { emoji: '🧥', name: 'Hoodies', desc: 'Con capucha, unisex premium' },
  { emoji: '☕', name: 'Tazas', desc: 'Cerámica 11oz, apta microondas' },
  { emoji: '📱', name: 'Fundas', desc: 'Silicone para iPhone/Samsung' },
  { emoji: '🖼️', name: 'Pósters', desc: 'Papel mate premium 40x50cm' },
]

const GALLERY = [
  { emoji: '🌊', label: 'Minimalista', desc: 'Diseños simples y elegantes' },
  { emoji: '🎨', label: 'Abstracto', desc: 'Arte moderno y colorido' },
  { emoji: '🐉', label: 'Geek', desc: 'Cultura pop y fantasía' },
  { emoji: '🌿', label: 'Naturaleza', desc: 'Montañas, plantas y animales' },
  { emoji: '✍️', label: 'Tipográfico', desc: 'Frases y lettering' },
  { emoji: '🔥', label: 'Bold', desc: 'Alto contraste, impacto visual' },
]

const STATS = [
  { value: '$0.99', label: 'Por diseño' },
  { value: '5', label: 'Productos' },
  { value: '~15s', label: 'Generación' },
  { value: '60%', label: 'Markup' },
]

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            POD<span className="text-gray-400"> IA</span>
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <a href="#como-funciona" className="text-sm text-gray-500 transition hover:text-gray-900">Cómo funciona</a>
            <a href="#productos" className="text-sm text-gray-500 transition hover:text-gray-900">Productos</a>
            <a href="#estilos" className="text-sm text-gray-500 transition hover:text-gray-900">Estilos</a>
          </nav>
          <Link
            href="/generar"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-700"
          >
            Crear diseño
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white px-4 py-24 sm:py-36">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-50 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-gray-100 to-transparent opacity-50 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-block rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm">
              🔥 Diseño por IA + Print-on-Demand
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Tu idea,{' '}
              <span className="bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400 bg-clip-text text-transparent">
                impresa.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-500">
              Describí tu idea. Nuestra IA la convierte en un diseño único.
              Elegí tu producto favorito y lo recibís en la puerta de tu casa.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/generar"
                className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-8 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-gray-700 sm:w-auto"
              >
                Crear mi diseño — $0.99
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3.5 text-base font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 sm:w-auto"
              >
                Cómo funciona
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              $0.99 por generar. Si comprás el producto, se descuenta del total.
            </p>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-gray-100 bg-white">
          <div className="mx-auto flex max-w-4xl divide-x divide-gray-100">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-1 flex-col items-center py-6">
                <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{s.value}</span>
                <span className="mt-1 text-xs text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Cómo funciona
              </h3>
              <p className="mt-3 text-gray-500">
                Tres pasos simples para tener tu diseño personalizado en casa.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  n: '1', color: 'from-blue-500 to-blue-600', icon: '✍️',
                  title: 'Describí',
                  body: 'Escribí tu idea. ¿Un logo minimalista? ¿Arte abstracto? ¿Una frase? La IA interpreta lo que imaginás.',
                },
                {
                  n: '2', color: 'from-green-500 to-green-600', icon: '🤖',
                  title: 'Generá',
                  body: 'Pagá $0.99 y la IA crea un diseño único para tu producto elegido. Lo ves al instante.',
                },
                {
                  n: '3', color: 'from-purple-500 to-purple-600', icon: '📦',
                  title: 'Recibí',
                  body: '¿Te gusta? Compralo impreso en el producto que elegiste. Lo producimos y enviamos a tu casa.',
                },
              ].map((step) => (
                <div key={step.n} className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-sm ${step.color}`}>
                    {step.icon}
                  </div>
                  <div className={`mt-6 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${step.color}`}>
                    {step.n}
                  </div>
                  <h4 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-gray-500">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Productos */}
        <section id="productos" className="bg-gray-50 px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Productos disponibles
              </h3>
              <p className="mt-3 text-gray-500">
                Elegí el producto que más te guste para tu diseño.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {PRODUCTS.map((p) => (
                <Link
                  key={p.name}
                  href="/generar"
                  className="group rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="text-4xl transition-transform group-hover:scale-110 inline-block">{p.emoji}</span>
                  <h4 className="mt-3 font-semibold text-gray-900">{p.name}</h4>
                  <p className="mt-1 text-xs text-gray-400">{p.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Galería de estilos */}
        <section id="estilos" className="px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h3 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ideas para tu diseño
              </h3>
              <p className="mt-3 text-gray-500">
                Desde minimalista hasta bold. La IA se adapta a tu estilo.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {GALLERY.map((g) => (
                <Link
                  key={g.label}
                  href="/generar"
                  className="group rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="text-3xl transition-transform group-hover:scale-110 inline-block">{g.emoji}</span>
                  <h4 className="mt-3 text-sm font-semibold text-gray-900">{g.label}</h4>
                  <p className="mt-1 text-xs text-gray-400">{g.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="relative overflow-hidden bg-gray-900 px-4 py-24 sm:py-32">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-30" />
          </div>
          <div className="relative mx-auto max-w-3xl text-center">
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Listo para crear tu diseño único
            </h3>
            <p className="mt-4 text-lg text-gray-400">
              Por $0.99. Sin suscripciones. Sin compromiso.
            </p>
            <Link
              href="/generar"
              className="mt-8 inline-flex items-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 shadow-sm transition hover:bg-gray-100"
            >
              Crear mi diseño
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: 'Diseño personalizado por IA',
              description: 'Describe tu idea. La IA genera un diseño único. Lo imprimimos y enviamos.',
              offers: {
                '@type': 'Offer',
                price: '0.99',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-10 text-center text-sm text-gray-400">
        <p className="font-medium text-gray-600">&copy; {new Date().getFullYear()} POD IA</p>
        <p className="mt-1">Diseño por IA · Impreso por Printify · Pagos seguros por Stripe</p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <a href="#como-funciona" className="transition hover:text-gray-600">Cómo funciona</a>
          <a href="#productos" className="transition hover:text-gray-600">Productos</a>
          <a href="#estilos" className="transition hover:text-gray-600">Estilos</a>
        </div>
      </footer>
    </div>
  )
}
