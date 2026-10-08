import { site } from '../config/site.js';
import Garland from './Garland.jsx';
import './Header.css';

function Brand() {
  const content = (
    <>
      <span className="brand__logo">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" width="64" height="64" />
      </span>
      <span className="brand__text">
        <span className="brand__name">{site.brand}</span>
        <span className="brand__tagline" lang="te">
          {site.tagline}
        </span>
      </span>
    </>
  );

  return site.mainSiteUrl ? (
    <a className="brand" href={site.mainSiteUrl}>
      {content}
    </a>
  ) : (
    <div className="brand">{content}</div>
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <Garland />
      <div className="container site-header__bar">
        <Brand />
        <nav className="site-nav" aria-label="Primary">
          <a className="nav-pill nav-pill--active" href="#lucky-draw" aria-current="page">
            Lucky Draw
          </a>
          {site.mainSiteUrl && (
            <a className="btn btn--gold btn--compact" href={site.mainSiteUrl}>
              Visit Website
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
