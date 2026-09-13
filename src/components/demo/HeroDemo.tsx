import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  inProgress,
  tasks,
  terminal,
  workspace,
  type Message,
} from '../../content/demo.ts'
import DemoWindow, { type WindowFrame } from './DemoWindow.tsx'
import TerminalWindow from './TerminalWindow.tsx'
import WorkspaceWindow, { type SidebarTask } from './WorkspaceWindow.tsx'
import './demo.css'

export const STAGE_WIDTH = 1300
export const STAGE_HEIGHT = 720
const MIN_SCALE = 0.55
const MIN_VISIBLE = 120

type WindowId = 'workspace' | 'terminal'

const INITIAL_FRAMES: Record<WindowId, WindowFrame> = {
  workspace: { x: 70, y: 40, width: 1080, height: 620 },
  terminal: { x: 800, y: 350, width: 460, height: 330 },
}

const INITIAL_ORDER: WindowId[] = ['workspace', 'terminal']

function clamp(frame: WindowFrame, x: number, y: number): WindowFrame {
  return {
    ...frame,
    x: Math.min(Math.max(x, MIN_VISIBLE - frame.width), STAGE_WIDTH - MIN_VISIBLE),
    y: Math.min(Math.max(y, 0), STAGE_HEIGHT - 40),
  }
}

function HeroDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [frames, setFrames] = useState(INITIAL_FRAMES)
  const [order, setOrder] = useState(INITIAL_ORDER)
  const [selectedId, setSelectedId] = useState(tasks[0].id)
  const [buildDone, setBuildDone] = useState(false)
  const [replies, setReplies] = useState<Record<string, Message[]>>({})
  const [runKey, setRunKey] = useState(0)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () =>
      setScale(Math.max(el.clientWidth / STAGE_WIDTH, MIN_SCALE))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(
      () => setBuildDone(true),
      inProgress.durationMs,
    )
    return () => window.clearTimeout(timer)
  }, [runKey])

  const focus = useCallback((id: WindowId) => {
    setOrder((prev) =>
      prev[prev.length - 1] === id
        ? prev
        : [...prev.filter((w) => w !== id), id],
    )
  }, [])

  const move = useCallback((id: WindowId, x: number, y: number) => {
    setFrames((prev) => ({ ...prev, [id]: clamp(prev[id], x, y) }))
  }, [])

  const send = (text: string) => {
    setReplies((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), { role: 'user', text }],
    }))
    window.setTimeout(() => {
      setReplies((prev) => ({
        ...prev,
        [selectedId]: [
          ...(prev[selectedId] ?? []),
          { role: 'assistant', text: workspace.cannedReply },
        ],
      }))
    }, 700)
  }

  const reset = () => {
    setFrames(INITIAL_FRAMES)
    setOrder(INITIAL_ORDER)
    setSelectedId(tasks[0].id)
    setReplies({})
    setBuildDone(false)
    setRunKey((k) => k + 1)
  }

  const sidebarTasks: SidebarTask[] = tasks.map((task, i) =>
    i === 0 && !buildDone
      ? {
          ...task,
          active: true,
          summary: inProgress.summary,
          messages: inProgress.messages,
          pane: inProgress.pane,
        }
      : task,
  )

  const stageHeight = STAGE_HEIGHT * scale

  return (
    <div
      className="demo-stage-frame"
      ref={containerRef}
      style={{ height: stageHeight }}
    >
      <p className="sr-only">
        Interactive demo of the {workspace.title} workspace: a list of agent
        tasks, a conversation, and a live preview or code diff for the
        selected task, next to a build output window. Windows can be dragged.
      </p>
      <div
        className="demo-stage"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
        {order.map((id, i) =>
          id === 'workspace' ? (
            <DemoWindow
              key={id}
              title={workspace.title}
              frame={frames.workspace}
              zIndex={i + 1}
              scale={scale}
              onFocus={() => focus('workspace')}
              onMove={(x, y) => move('workspace', x, y)}
              actions={
                <button
                  type="button"
                  className="demo-titlebar-btn"
                  tabIndex={-1}
                  onClick={reset}
                >
                  {workspace.resetLabel}
                </button>
              }
            >
              <WorkspaceWindow
                tasks={sidebarTasks}
                selectedId={selectedId}
                onSelect={setSelectedId}
                extraMessages={replies[selectedId] ?? []}
                onSend={send}
              />
            </DemoWindow>
          ) : (
            <DemoWindow
              key={id}
              title={terminal.title}
              frame={frames.terminal}
              zIndex={i + 1}
              scale={scale}
              onFocus={() => focus('terminal')}
              onMove={(x, y) => move('terminal', x, y)}
            >
              <TerminalWindow key={runKey} />
            </DemoWindow>
          ),
        )}
      </div>
    </div>
  )
}

export default HeroDemo
