export const authHeaders = (token: string | null | undefined): Record<string, string> => {
  const h: Record<string, string> = {}
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export const toQueryString = (params: Record<string, string | number | null | undefined>) => {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined) return
    if (typeof v === 'string' && v.trim() === '') return
    usp.set(k, String(v))
  })
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export const parseErrorMessage = async (res: Response) => {
  const contentType = res.headers.get('content-type') ?? ''
  try {
    if (contentType.includes('application/json')) {
      const data = await res.json()
      return data?.message ?? data?.error ?? JSON.stringify(data)
    }
    return await res.text()
  } catch {
    return `Erro HTTP ${res.status}`
  }
}

export const getJsonOrThrow = async <T,>(res: Response): Promise<T> => {
  if (!res.ok) {
    const msg = await parseErrorMessage(res)
    throw new Error(msg || `Erro HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

