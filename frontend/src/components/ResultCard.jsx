import { useEffect, useRef } from 'react';
import { site, telHref } from '../config/site.js';
import { maskPhone } from '../utils/phone.js';
import Garland from './Garland.jsx';
import './ResultCard.css';

function RegisteredMobile({ phone }) {
  return (
    <p className="result__mobile">
      <span>Mobile</span>
      <strong>{maskPhone(phone)}</strong>
    </p>
  );
}

function WinnerResult({ name, phone, headingRef, onReset }) {
  const claimPhone = site.contact.phones[0];

  return (
    <section className="result result--winner" aria-labelledby="result-title">
      <Garland />
      <span className="result__sparkle result__sparkle--one" aria-hidden="true" />
      <span className="result__sparkle result__sparkle--two" aria-hidden="true" />
      <span className="result__sparkle result__sparkle--three" aria-hidden="true" />

      <div className="result__body">
        <div className="result__medal" aria-hidden="true">
          🏆
        </div>
        <p className="status-pill status-pill--gold">Lucky Draw Winner</p>
        <h2 className="result__title" id="result-title" ref={headingRef} tabIndex={-1}>
          Congratulations, {name}!
        </h2>
        <p className="result__lead">You are one of our Lucky Draw Winners! 🎉</p>

        <RegisteredMobile phone={phone} />
        <p className="result__note">{site.event.winnerNote}</p>

        <div className="result__actions">
          <a className="btn btn--gold" href={telHref(claimPhone)}>
            Call {claimPhone}
          </a>
          <button className="btn btn--outline" type="button" onClick={onReset}>
            Check another number
          </button>
        </div>
      </div>
    </section>
  );
}

function ParticipantResult({ name, phone, headingRef, onReset }) {
  return (
    <section className="result result--participant" aria-labelledby="result-title">
      <div className="result__body">
        <div className="result__medal result__medal--mint" aria-hidden="true">
          🙏
        </div>
        <p className="status-pill status-pill--mint">Registered participant</p>
        <h2 className="result__title" id="result-title" ref={headingRef} tabIndex={-1}>
          Thank you for participating!
        </h2>
        <p className="result__lead">Hi {name}!</p>
        <p className="result__note">
          You participated in the {site.event.name}. Unfortunately, your number was not selected this time. Better
          luck next time! 🙏
        </p>

        <RegisteredMobile phone={phone} />

        <div className="result__actions">
          <button className="btn btn--outline" type="button" onClick={onReset}>
            Check another number
          </button>
        </div>
      </div>
    </section>
  );
}

/** Shown in place of the search form once a registered number has been looked up. */
export default function ResultCard({ winner, name, phone, onReset }) {
  const slotRef = useRef(null);
  const headingRef = useRef(null);

  // Move focus to the result so screen readers announce it, and bring the whole card into view.
  // The scroll targets the wrapper because the card itself is still mid-animation at this point.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    slotRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  const Result = winner ? WinnerResult : ParticipantResult;
  return (
    <div className="result-slot" ref={slotRef}>
      <Result name={name} phone={phone} headingRef={headingRef} onReset={onReset} />
    </div>
  );
}
