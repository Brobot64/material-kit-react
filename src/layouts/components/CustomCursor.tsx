'use client'

import { useRef, useEffect } from 'react'

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)
  const s = useRef({
    mx: 0, my: 0,   // mouse position
    rx: 0, ry: 0,   // ring position (lerped)
    hovering: false,
    clicking: false,
    visible: false,
  })
  const rafId = useRef<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(hover: none)').matches) {
      return undefined
    }

    document.documentElement.style.cursor = 'none'

    const onMove = (e: MouseEvent) => {
      s.current.mx = e.clientX
      s.current.my = e.clientY
      s.current.visible = true

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`
        dotRef.current.style.opacity = '1'
      }

      const el = e.target as HTMLElement
      s.current.hovering = !!el.closest('a,button,[role="button"],input,textarea,select,[data-hover]')
    }

    const onLeave = () => {
      s.current.visible = false
      if (ringRef.current) ringRef.current.style.opacity = '0'
      if (dotRef.current)  dotRef.current.style.opacity  = '0'
    }

    const onDown = () => { s.current.clicking = true }
    const onUp   = () => { s.current.clicking = false }

    const loop = () => {
      const { mx, my, rx, ry, hovering, clicking, visible } = s.current
      s.current.rx += (mx - rx) * 0.11
      s.current.ry += (my - ry) * 0.11

      if (ringRef.current && visible) {
        const size = clicking ? 18 : hovering ? 54 : 36
        const x = s.current.rx - size / 2
        const y = s.current.ry - size / 2
        ringRef.current.style.transform     = `translate3d(${x}px, ${y}px, 0)`
        ringRef.current.style.width         = `${size}px`
        ringRef.current.style.height        = `${size}px`
        ringRef.current.style.opacity       = '1'
        ringRef.current.style.borderColor   = hovering ? 'rgba(163,230,53,0.75)' : 'rgba(163,230,53,0.4)'
        ringRef.current.style.backgroundColor = hovering ? 'rgba(163,230,53,0.06)' : 'transparent'
      }

      rafId.current = requestAnimationFrame(loop)
    }

    document.addEventListener('mousemove',  onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)
    rafId.current = requestAnimationFrame(loop)

    return () => {
      document.documentElement.style.cursor = ''
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <>
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          pointerEvents: 'none', zIndex: 9999,
          width: '36px', height: '36px', borderRadius: '50%',
          border: '1.5px solid rgba(163,230,53,0.4)',
          opacity: 0,
          transition: 'width 0.15s ease, height 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
          willChange: 'transform',
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          pointerEvents: 'none', zIndex: 9999,
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#a3e635', opacity: 0,
          transition: 'opacity 0.3s',
          willChange: 'transform',
        }}
      />
    </>
  )
}
