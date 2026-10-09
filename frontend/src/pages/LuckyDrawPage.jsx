import { lazy, Suspense, useState } from 'react';
import heroImage from '../assets/sasya-ganapathi.jpg';
import BlessingBanner from '../components/BlessingBanner.jsx';
import Notice from '../components/Notice.jsx';
import PhoneSearchForm from '../components/PhoneSearchForm.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { site } from '../config/site.js';
import { checkLuckyDraw } from '../services/luckyDrawApi.js';
import { validatePhone } from '../utils/phone.js';
import './LuckyDrawPage.css';

// Only winners need the celebration, so it is downloaded on demand.
const Confetti = lazy(() => import('../components/Confetti.jsx'));

const ERROR_MESSAGES = {
  NETWORK: 'We couldn’t reach the server. Please check your internet connection and try again.',
  TIMEOUT: 'This is taking longer than usual. Please try again.',
  RATE_LIMITED: 'Too many attempts from your network. Please wait a minute and try again.',
  SERVER: 'Something went wrong on our side. Please try again in a moment.',
};

// status: idle | loading | winner | participant | error
const IDLE = { status: 'idle' };

export default function LuckyDrawPage() {
  const [phone, setPhone] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [lookup, setLookup] = useState(IDLE);
  const [focusRequest, setFocusRequest] = useState(0);

  const hasResult = lookup.status === 'winner' || lookup.status === 'participant';

  function handlePhoneChange(value) {
    setPhone(value);
    setFieldError('');
    // A message about the previous number no longer applies once the number changes.
    if (lookup.status === 'error') setLookup(IDLE);
  }

  async function runCheck(number) {
    setLookup({ status: 'loading' });

    try {
      const data = await checkLuckyDraw(number);
      setLookup({ status: data.winner ? 'winner' : 'participant', name: data.name, phone: number });
    } catch (error) {
      if (error.code === 'INVALID_PHONE') {
        setFieldError('Please enter a valid 10-digit mobile number.');
        setLookup(IDLE);
      } else {
        setLookup({ status: 'error', message: ERROR_MESSAGES[error.code] ?? ERROR_MESSAGES.SERVER });
      }
    }
  }

  // Returns false when the number fails validation and no request was made.
  function handleSubmit() {
    const error = validatePhone(phone);
    if (error) {
      setFieldError(error);
      setLookup(IDLE);
      return false;
    }

    runCheck(phone);
    return true;
  }

  function handleReset() {
    setPhone('');
    setFieldError('');
    setLookup(IDLE);
    setFocusRequest((count) => count + 1);
  }

  return (
    <main id="lucky-draw">
      <section className="hero container">
        <div className="hero__content">
          <p className="hero__badge">{site.event.badge}</p>
          <h1 className="hero__title">
            {site.event.titleLines.map((line) => (
              <span key={line}>{line} </span>
            ))}
          </h1>
          <p className="hero__lead">{site.event.intro}</p>

          {hasResult ? (
            <ResultCard
              winner={lookup.status === 'winner'}
              name={lookup.name}
              phone={lookup.phone}
              onReset={handleReset}
            />
          ) : (
            <section className="draw-card" aria-labelledby="draw-card-title">
              <div className="draw-card__head">
                <span className="draw-card__dot" aria-hidden="true" />
                <h2 className="draw-card__title" id="draw-card-title">
                  <span aria-hidden="true">🎉 </span>
                  Check Your Result
                </h2>
              </div>
              <p className="status-pill status-pill--live">Results are live</p>
              <hr className="draw-card__divider" />

              <PhoneSearchForm
                phone={phone}
                onPhoneChange={handlePhoneChange}
                onSubmit={handleSubmit}
                loading={lookup.status === 'loading'}
                error={fieldError}
                focusRequest={focusRequest}
              />

              {lookup.status === 'error' && (
                <Notice tone="error" icon="⚠️" title="We couldn’t check your result">
                  {lookup.message}
                </Notice>
              )}
            </section>
          )}
        </div>

        <figure className="hero__media">
          <img
            src={heroImage}
            alt="The Sasya Ganapathi idol, crafted entirely from living plants"
            width="607"
            height="454"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      <BlessingBanner />

      {lookup.status === 'winner' && (
        <Suspense fallback={null}>
          <Confetti />
        </Suspense>
      )}
    </main>
  );
}
