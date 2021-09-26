import { memo } from 'react'
import Map from '../../assets/map.png'
import Header from '../Header/Header'
import Menu from '../Menu/Menu'

function Landing() {
  return (
    <>
      <Header />
      <Menu />
      <main id="Landing">
        <h1>
          Connecting <span className="green">colleges</span> and{' '}
          <span className="green">communities</span> to reduce food waste and
          hunger.
        </h1>
        <img src={Map} alt="Sharing Excess" />
        <p>
          Sharing Excess partners with{' '}
          <span className="green">grocery stores</span>,{' '}
          <span className="green">restaurants</span>, and{' '}
          <span className="green">farmers</span> to deliver food surplus to a
          network of <span className="blue">nonprofits</span>,{' '}
          <span className="blue"></span>
          food banks, and <span className="blue">community organizations</span>.
        </p>
        <iframe
          title="video"
          src="https://www.youtube.com/embed/SmEW3C7tkLc"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <footer>
          Sharing Excess Inc. is a registered Pennsylvania Nonprofit 501(C)(3),
          fiscally sponsored by Federation of Neighborhood Centers. "Sharing
          Excess" is a registered trademark. All rights reserved.
        </footer>
      </main>
    </>
  )
}

export memo(Landing)
