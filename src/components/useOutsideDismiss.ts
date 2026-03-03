import { useEffect, type RefObject } from 'react'

export const useOutsideDismiss = (
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  active: boolean,
) => {
  useEffect(() => {
    if (!active) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (!el) return
      const target = e.target as Node | null
      if (target && el.contains(target)) return
      onDismiss()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active, onDismiss, ref])
}

