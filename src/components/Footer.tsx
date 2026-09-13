import markUrl from '../assets/lotusbuild-mark.png'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img
            src={markUrl}
            width="24"
            height="24"
            alt=""
            className="footer-mark"
          />
          <span className="footer-logo">LotusBuild</span>
        </div>

        <nav className="footer-nav">
          <a
            href="https://github.com/pdevulapally/lotusbuild-frontend"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="#" className="footer-link">
            Docs
          </a>
          <a href="#" className="footer-link">
            Contact
          </a>
        </nav>

        <div className="footer-copy">
          <span>&copy; {new Date().getFullYear()} LotusBuild</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
