-- Migración completa: esquema inicial + user_id nullable + RLS para guests
-- Ejecutar TODO en el SQL Editor de Supabase

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla users (se sincroniza con Supabase Auth para usuarios que hacen login)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla designs (user_id nullable para flujo guest)
CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('t-shirt', 'hoodie', 'mug', 'phone-case', 'poster')),
  product_variant_id TEXT,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'paid', 'ordered', 'shipped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla orders (user_id nullable para flujo guest)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  printify_order_id TEXT,
  shipping_address JSONB,
  total_paid DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_designs_user ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_designs_id ON designs(id);

-- 6. Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para users (solo usuarios autenticados)
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Políticas para designs
-- Usuarios autenticados: solo ven sus propios diseños
DROP POLICY IF EXISTS "Users can read own designs" ON designs;
CREATE POLICY "Users can read own designs" ON designs
  FOR SELECT USING (auth.uid() = user_id);

-- Anon/guest pueden leer diseños por ID (necesario para confirmación post-pago)
DROP POLICY IF EXISTS "Anyone can read designs by id" ON designs;
CREATE POLICY "Anyone can read designs by id" ON designs
  FOR SELECT USING (true);

-- Usuarios autenticados pueden insertar sus diseños
DROP POLICY IF EXISTS "Users can insert own designs" ON designs;
CREATE POLICY "Users can insert own designs" ON designs
  FOR INSERT WITH CHECK (true);

-- 9. Políticas para orders
-- Usuarios autenticados: solo ven sus propias órdenes
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Anon/guest pueden leer órdenes (para ver estado después de comprar)
DROP POLICY IF EXISTS "Anyone can read orders by id" ON orders;
CREATE POLICY "Anyone can read orders by id" ON orders
  FOR SELECT USING (true);

-- Service role inserta órdenes (desde webhook)
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- 10. Trigger: auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 11. Storage bucket (ejecutar después desde Dashboard)
-- Ve a Storage → New bucket → name: "designs", public
-- Luego agrega esta política:
-- CREATE POLICY "Anyone can read designs" ON storage.objects
--   FOR SELECT USING (bucket_id = 'designs');
-- CREATE POLICY "Anyone can upload designs" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'designs');
