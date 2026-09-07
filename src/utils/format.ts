export function formatCount(value: number): string {
  const count = Math.max(0, Math.round(value))

  if (count < 1_000) return String(count)
  if (count < 10_000) return `${(count / 1_000).toFixed(1)} 千`

  return `${(count / 10_000).toFixed(1).replace(/\.0$/, '')} 万`
}

export function getGreeting(hour: number): string {
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}
