import { useEffect, useRef } from 'react'
import type { Gpu } from 'vgpu'
import shader from './galaxy.wgsl?raw'

const FRAME_INTERVAL_MS = 1000 / 30

function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestDrawRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const mountedCanvas = canvasRef.current
    if (!mountedCanvas) return
    const canvas = mountedCanvas
    const parent = canvas.parentElement
    if (!parent) return
    const page = parent

    if (!navigator.gpu) {
      canvas.dataset.renderState = 'unsupported'
      console.warn('LotusBuild galaxy background: WebGPU is unavailable.')
      return
    }

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let failed = false
    let gpu: Gpu | undefined
    let animationFrame = 0
    let time = 0
    let lastFrame: number | undefined
    let visible = true
    let pointerInside = false
    let influence = 0
    const pointer = { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 }
    const pointerTarget = { ...pointer }
    let resizeObserver: ResizeObserver | undefined
    let intersectionObserver: IntersectionObserver | undefined

    function stop() {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
      lastFrame = undefined
    }

    function fail(error: unknown) {
      if (disposed || failed) return
      failed = true
      stop()
      canvas.dataset.renderState = 'error'
      console.error('LotusBuild galaxy background failed:', error)
      gpu?.dispose()
    }

    function onMotionChange() {
      pointerInside = false
      influence = 0
      stop()
      requestDrawRef.current?.()
    }

    function onVisibilityChange() {
      if (document.hidden) stop()
      else requestDrawRef.current?.()
    }

    function onPointerMove(event: PointerEvent) {
      if (motionPreference.matches) return
      const bounds = canvas.getBoundingClientRect()
      pointerTarget.x = event.clientX - bounds.left
      pointerTarget.y = event.clientY - bounds.top
      pointerInside = true
    }

    function onPointerLeave() {
      pointerInside = false
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === 'touch') pointerInside = false
    }

    async function start() {
      const { init, surface, draw, frame } = await import('vgpu')
      if (disposed) return
      gpu = await init({ powerPreference: 'low-power', label: 'LotusBuild galaxy' })
      if (disposed) return gpu.dispose()
      const context = gpu
      context.onError(fail)
      void context.gpu.lost.then(info => {
        if (!context.disposed) fail(new Error(`WebGPU device lost: ${info.message}`))
      })

      const target = surface(context, canvas, {
        dpr: [1, 1.5],
        label: 'Galaxy background',
      })
      const styles = getComputedStyle(canvas)
      function colour(token: string) {
        const value = styles.getPropertyValue(token).trim()
        if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Invalid galaxy colour token: ${token}`)
        return [1, 3, 5].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255)
      }
      const initial = { params: {
        resolution: [canvas.clientWidth, canvas.clientHeight],
        pointer: [pointer.x, pointer.y], time, influence,
        background: colour('--space-background'), nebula: colour('--space-nebula'),
        starCool: colour('--space-star-cool'), starWarm: colour('--space-star-warm'),
        starRed: colour('--space-star-red'),
      } }
      const sky = draw(context, {
        shader, vertices: 3, entry: { vertex: 'vs_sky', fragment: 'fs_sky' },
        label: 'Galaxy dust', set: initial,
      })
      const particles = draw(context, {
        shader,
        vertices: 6,
        entry: { vertex: 'vs_stars', fragment: 'fs_stars' },
        blend: 'alpha',
        label: 'Galaxy stars',
        set: initial,
      })
      const blackHoles = draw(context, {
        shader, vertices: 6,
        entry: { vertex: 'vs_black_holes', fragment: 'fs_black_holes' },
        blend: 'alpha', label: 'Black hole accretion disks', set: initial,
      })
      const layers = [sky, particles, blackHoles]
      target.onResize(() => {
        const size = { params: { resolution: [canvas.clientWidth, canvas.clientHeight] } }
        layers.forEach(layer => layer.set(size))
      })
      await Promise.all(layers.map(layer => layer.compile({ colors: [target.format] })))
      if (disposed || failed) return

      function render(timestamp: number) {
        animationFrame = 0
        if (disposed || failed || document.hidden || !visible) return
        const moving = !motionPreference.matches
        const delta = lastFrame === undefined ? 0 : timestamp - lastFrame
        if (moving && lastFrame !== undefined && delta < FRAME_INTERVAL_MS - 1) {
          requestDrawRef.current?.()
          return
        }
        lastFrame = timestamp
        if (moving) {
          time += Math.min(delta, 100) / 1000
          const response = 1 - Math.exp(-delta / 100)
          pointer.x += (pointerTarget.x - pointer.x) * response
          pointer.y += (pointerTarget.y - pointer.y) * response
          influence += ((pointerInside ? 1 : 0) - influence) * (1 - Math.exp(-delta / 180))
        }
        try {
          const values = { params: { time, pointer: [pointer.x, pointer.y], influence } }
          layers.forEach(layer => layer.set(values))
          const instances = Math.max(900, Math.min(6000, Math.round(canvas.clientWidth * canvas.clientHeight / 170)))
          frame(context, current => current.pass(target, pass => {
            pass.draw(sky)
            pass.draw(particles, { instances })
            pass.draw(blackHoles, { instances: 3 })
          }))
          canvas.dataset.renderState = moving ? 'animating' : 'paused'
          if (moving) requestDrawRef.current?.()
          else lastFrame = undefined
        } catch (error) {
          fail(error)
        }
      }

      requestDrawRef.current = () => {
        if (!disposed && !failed && !document.hidden && visible && !animationFrame) {
          animationFrame = requestAnimationFrame(render)
        }
      }
      resizeObserver = new ResizeObserver(() => requestDrawRef.current?.())
      resizeObserver.observe(canvas)
      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) requestDrawRef.current?.()
        else stop()
      })
      intersectionObserver.observe(canvas)
      motionPreference.addEventListener('change', onMotionChange)
      document.addEventListener('visibilitychange', onVisibilityChange)
      page.addEventListener('pointermove', onPointerMove, { passive: true })
      page.addEventListener('pointerleave', onPointerLeave)
      page.addEventListener('pointerup', onPointerUp)
      page.addEventListener('pointercancel', onPointerLeave)
      requestDrawRef.current()
    }

    void start().catch(fail)

    return () => {
      disposed = true
      stop()
      requestDrawRef.current = null
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      motionPreference.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      page.removeEventListener('pointermove', onPointerMove)
      page.removeEventListener('pointerleave', onPointerLeave)
      page.removeEventListener('pointerup', onPointerUp)
      page.removeEventListener('pointercancel', onPointerLeave)
      gpu?.dispose()
    }
  }, [])

  return <canvas className="galaxy-background" ref={canvasRef} aria-hidden="true" data-render-state="loading" />
}

export default GalaxyBackground
