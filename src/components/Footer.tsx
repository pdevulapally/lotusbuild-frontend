import markUrl from '../assets/lotusbuild-mark.png'
import './Footer.css'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
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

        <nav className="footer-nav" aria-label="Footer">
          <a href="#product">Product</a>
          <a href="#sessions">Sessions</a>
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
        <p>LotusBuild</p>
        <p>&copy; {year} LotusBuild</p>
      </div>
    </footer>
  )
}

export default Footer
