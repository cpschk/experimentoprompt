interface CardProps {
  children: React.ReactNode
  className?: string
  selected?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', selected = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white p-6 shadow-sm transition ${
        selected ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200 hover:border-gray-400'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
