import { site, telHref } from '../config/site.js';
import Garland from './Garland.jsx';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <Garland />

      <div className="container site-footer__grid">
        <div>
          <p className="footer-brand__name">{site.brand}</p>
          <p className="footer-brand__tagline" lang="te">
            {site.tagline}
          </p>
          <p className="footer-brand__about">
            Nursery · Garden · Landscapers since 1985. Specialized in landscaping works, green-space development
            across India, and our sacred eco-friendly <strong>Sasya Ganapathi</strong> living plant initiative.
          </p>
        </div>

        <div>
          <h2 className="footer-heading">Contact Us</h2>

          <p className="footer-contact">
            <span className="footer-contact__icon" aria-hidden="true">
              📞
            </span>
            <span className="footer-contact__phones">
              {site.contact.phones.map((phone) => (
                <a key={phone} href={telHref(phone)}>
                  {phone}
                </a>
              ))}
            </span>
          </p>
          <p className="footer-contact">
            <span className="footer-contact__icon" aria-hidden="true">
              ✉️
            </span>
            <a className="footer-contact__email" href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>
          </p>

          <div className="footer-branches">
            <h3 className="footer-branches__title">Our Branches</h3>
            {site.branches.map((branch) => (
              <p key={branch.label}>
                <strong>{branch.label}:</strong> {branch.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p className="container">
          © {new Date().getFullYear()} {site.brand}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
