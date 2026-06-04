import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no configurada')
  }
  return new Stripe(secretKey, { typescript: true })
}

export const getStripeJs = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no configurada')
  }
  return loadStripe(publishableKey)
}
