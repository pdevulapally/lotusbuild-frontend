import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

export type WindowFrame = {
  x: number
  y: number
  width: number
  height: number
}

type Props = {
  title: string
  frame: WindowFrame
  zIndex: number
  scale: number
  actions?: ReactNode
  onFocus: () => void
  onMove: (x: number, y: number) => void
  children: ReactNode
}

function DemoWindow({
  title,
  frame,
  zIndex,
  scale,
  actions,
  onFocus,
  onMove,
  children,
}: Props) {
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ px: number; py: number; x: number; y: number } | null>(
    null,
  )

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { px: e.clientX, py: e.clientY, x: frame.x, y: frame.y }
    setDragging(true)
    onFocus()
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current
    if (!s) return
    onMove(s.x + (e.clientX - s.px) / scale, s.y + (e.clientY - s.py) / scale)
  }

  const endDrag = () => {
    start.current = null
    setDragging(false)
  }

  return (
    <div
      className={dragging ? 'demo-window is-dragging' : 'demo-window'}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        zIndex,
      }}
      onPointerDownCapture={onFocus}
    >
      <div
        className="demo-titlebar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="demo-lights" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="demo-title">{title}</div>
        <div className="demo-titlebar-actions">{actions}</div>
      </div>
      <div className="demo-window-body">{children}</div>
    </div>
  )
}

export default DemoWindow
