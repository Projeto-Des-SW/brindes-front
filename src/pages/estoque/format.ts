export const formatBRL = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const formatInt = (value: number) => {
  return value.toLocaleString('pt-BR')
}

export const formatISODateToBR = (iso: string) => {
  // Espera "YYYY-MM-DDTHH:mm:ss" (LocalDateTime do backend) e retorna "DD/MM/YYYY"
  if (!iso) return ''
  const [date] = iso.split('T')
  const [y, m, d] = date.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}
