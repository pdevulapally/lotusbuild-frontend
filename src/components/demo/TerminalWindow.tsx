import { useEffect, useState } from 'react'
import { terminal } from '../../content/demo.ts'

function TerminalWindow() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let i = 0
    const tick = () => {
      i += 1
      setCount(i)
      if (i < terminal.lines.length) {
        timer = window.setTimeout(tick, 380 + Math.random() * 420)
      }
    }
    let timer = window.setTimeout(tick, 600)
    return () => window.clearTimeout(timer)
  }, [])

  const finished = count >= terminal.lines.length

  return (
    <div className="demo-terminal">
      <div className="demo-terminal-line is-prompt">
        <span className="demo-terminal-prompt">{terminal.prompt}</span> npm run
        build
      </div>
      {terminal.lines.slice(0, count).map((line) => (
        <div key={line.text} className={`demo-terminal-line tone-${line.tone}`}>
          {line.text}
        </div>
      ))}
      {finished && (
        <div className="demo-terminal-line is-prompt">
          <span className="demo-terminal-prompt">{terminal.prompt}</span>
          <span className="demo-caret" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

export default TerminalWindow
