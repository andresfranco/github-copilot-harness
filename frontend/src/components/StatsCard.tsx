interface StatsCardProps {
  label: string
  count: number
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'orange'
}

const colorMap: Record<NonNullable<StatsCardProps['color']>, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
}

export function StatsCard({ label, count, color = 'gray' }: StatsCardProps) {
  const classes = colorMap[color]

  return (
    <div className={`rounded-lg border p-4 ${classes}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-3xl font-bold">{count}</p>
    </div>
  )
}
