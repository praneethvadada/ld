import './Notice.css';

/** Inline message under the search form: `warn` for a number that was not found, `error` for failures. */
export default function Notice({ tone = 'warn', icon, title, children }) {
  return (
    <div className={`notice notice--${tone}`} role="alert">
      <span className="notice__icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="notice__title">{title}</p>
        <p className="notice__text">{children}</p>
      </div>
    </div>
  );
}
