import { site } from '../config/site.js';
import './BlessingBanner.css';

export default function BlessingBanner() {
  return (
    <section className="blessing container" aria-labelledby="blessing-title">
      <div className="blessing__panel">
        <h2 className="blessing__title" id="blessing-title">
          {site.banner.title}
        </h2>
        <p className="blessing__text">{site.banner.text}</p>
        {site.mainSiteUrl && (
          <a className="btn btn--gold blessing__action" href={site.mainSiteUrl}>
            Visit Our Website
          </a>
        )}
      </div>
    </section>
  );
}
