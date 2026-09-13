import markUrl from '../assets/lotusbuild-mark.png'
import './Footer.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-intro"><a href="/" className="footer-brand">
          <img
            src={markUrl}
            width="24"
            height="24"
            alt=""
            className="footer-mark"
          />
          <span>LotusBuild</span>
        </a><p>A workspace for ideas and the work that brings them to life.</p></div>

        <nav className="footer-nav" aria-label="Footer">
          <a href="#product">How it works</a>
          <a href="#workspace-demo">Interactive demo</a>
          <a href="#sessions">Workspace</a>
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
        <a href="#top">Back to top ↑</a>
        <p>&copy; {year} LotusBuild</p>
      </div>
    </footer>
  )
}

export default Footer
