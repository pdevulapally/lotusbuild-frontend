import Hero from '../components/Hero.tsx'
import Navbar from '../components/Navbar.tsx'
import GalaxyBackground from '../components/GalaxyBackground.tsx'
import AgentDesktop from '../components/AgentDesktop.tsx'
import ProductSurfaces from '../components/ProductSurfaces.tsx'
import ClosingCTA from '../components/ClosingCTA.tsx'
import Footer from '../components/Footer.tsx'

function Home() {
  return (
    <div className="landing-page">
      <Navbar />
      <GalaxyBackground />
      <Hero />
      <AgentDesktop />
      <ProductSurfaces />
      <ClosingCTA />
      <Footer />
    </div>
  )
}

export default Home
