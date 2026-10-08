import { useEffect, useRef } from 'react';
import { toNationalDigits } from '../utils/phone.js';
import './PhoneSearchForm.css';

/**
 * The phone number search. `focusRequest` is a counter: each time it changes
 * (for example after "Check another number") the input takes focus.
 */
export default function PhoneSearchForm({ phone, onPhoneChange, onSubmit, loading, error, focusRequest }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (focusRequest > 0) inputRef.current?.focus();
  }, [focusRequest]);

  function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    // Returns false when the number is invalid, so the visitor can correct it straight away.
    // Otherwise close the on-screen keyboard so the result is not hidden behind it.
    if (onSubmit() === false) inputRef.current?.focus();
    else inputRef.current?.blur();
  }

  return (
    <form className="phone-form" onSubmit={handleSubmit} noValidate>
      <label className="phone-form__label" htmlFor="phone-number">
        Registered mobile number
      </label>

      <div className={`phone-field${error ? ' phone-field--invalid' : ''}`}>
        <span className="phone-field__prefix" aria-hidden="true">
          +91
        </span>
        <input
          ref={inputRef}
          id="phone-number"
          className="phone-field__input"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          enterKeyHint="search"
          placeholder="Enter mobile number"
          value={phone}
          onChange={(event) => onPhoneChange(toNationalDigits(event.target.value))}
          readOnly={loading}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'phone-number-error' : 'phone-number-hint'}
        />
      </div>

      {error && (
        <p className="phone-form__error" id="phone-number-error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn--gold btn--block phone-form__submit" type="submit" aria-disabled={loading}>
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Checking…
          </>
        ) : (
          'Check Result'
        )}
      </button>

      <p className="phone-form__hint" id="phone-number-hint" role="status">
        {loading
          ? 'Checking your lucky draw result…'
          : 'Use the 10-digit number you registered with at the event.'}
      </p>
    </form>
  );
}
