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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">POD IA</h1>
          <Link
            href="/generar"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Comenzar
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-block rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 mb-6">
              Diseño por IA + Print-on-Demand
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Tu idea,{' '}
              <span className="bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent">
                impresa.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Describe tu idea. Nuestra IA la convierte en un diseño único.
              Elige tu producto favorito — camiseta, hoodie, taza, funda o póster —
              y lo recibes en la puerta de tu casa.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/generar"
                className="rounded-lg bg-gray-900 px-8 py-3 text-base font-medium text-white transition hover:bg-gray-700 shadow-sm"
              >
                Crear mi diseño — $0.99
              </Link>
              <Link
                href="#como-funciona"
                className="rounded-lg border border-gray-300 px-8 py-3 text-base font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cómo funciona
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              $0.99 por generar. Si compras el producto, se descuenta del total.
            </p>
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

            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              {[
                {
                  n: '1', color: 'bg-blue-100 text-blue-600', title: 'Describe',
                  body: 'Escribe tu idea. ¿Un logo minimalista? ¿Arte abstracto? ¿Una frase? La IA interpreta lo que imaginas.',
                },
                {
                  n: '2', color: 'bg-green-100 text-green-600', title: 'Genera',
                  body: 'Paga $0.99 y la IA crea un diseño único para tu producto elegido. Ves el resultado en segundos.',
                },
                {
                  n: '3', color: 'bg-purple-100 text-purple-600', title: 'Recibe',
                  body: '¿Te gusta? Cómpralo impreso en el producto que elegiste. Lo producimos y enviamos a tu casa.',
                },
              ].map((step) => (
                <div key={step.n} className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${step.color}`}>
                    {step.n}
                  </div>
                  <h4 className="mt-6 text-center text-lg font-semibold text-gray-900">{step.title}</h4>
                  <p className="mt-3 text-center text-sm leading-6 text-gray-500">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Productos */}
        <section className="bg-gray-50 px-4 py-20 sm:py-28">
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
                <div key={p.name} className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                  <span className="text-3xl">{p.emoji}</span>
                  <h4 className="mt-3 font-semibold text-gray-900">{p.name}</h4>
                  <p className="mt-1 text-xs text-gray-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Galería de estilos */}
        <section className="px-4 py-20 sm:py-28">
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
                <div key={g.label} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                  <span className="text-3xl">{g.emoji}</span>
                  <h4 className="mt-3 text-sm font-semibold text-gray-900">{g.label}</h4>
                  <p className="mt-1 text-xs text-gray-400">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gray-900 px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Listo para crear tu diseño único
            </h3>
            <p className="mt-4 text-lg text-gray-400">
              Por $0.99. Sin suscripciones. Sin compromiso.
            </p>
            <Link
              href="/generar"
              className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-medium text-gray-900 transition hover:bg-gray-100 shadow-sm"
            >
              Crear mi diseño
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
      <footer className="border-t bg-white py-8 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} POD IA. Todos los derechos reservados.</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <span>Diseño por IA</span>
          <span>Impreso por Printify</span>
          <span>Pagos seguros por Stripe</span>
        </div>
      </footer>
    </div>
  )
}
