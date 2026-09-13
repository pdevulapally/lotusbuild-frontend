import markUrl from '../assets/lotusbuild-mark.png'
import './Footer.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <a href="/" className="footer-brand">
            <img
              src={markUrl}
              width="24"
              height="24"
              alt=""
              className="footer-mark"
            />
            <span>LotusBuild</span>
          </a>
          <p className="footer-tagline">AI software builder.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <span className="footer-nav-label">Navigate</span>
          <a href="#how">Process</a>
          <a href="#workspace">Workspace</a>
          <a
            href="https://github.com/pdevulapally/lotusbuild-frontend"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>

      <div className="footer-base">
        <p>&copy; {year} LotusBuild</p>
      </div>
    </footer>
  )
}

export default Footer
