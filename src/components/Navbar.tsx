import markUrl from '../assets/lotusbuild-mark.png'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar" aria-label="Primary">
      <a className="navbar-brand" href="/" aria-label="LotusBuild home">
        <img src={markUrl} width="32" height="32" alt="" />
        <span>LotusBuild</span>
      </a>
      <a className="navbar-workspace" href="/#workspace-demo" aria-label="Open workspace demo">
        Workspace
      </a>
    </nav>
  )
}

export default Navbar
