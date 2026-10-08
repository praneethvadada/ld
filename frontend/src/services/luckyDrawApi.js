const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const TIMEOUT_MS = 10_000;

/** Failure with a code the page turns into a friendly message: NETWORK, TIMEOUT, RATE_LIMITED, INVALID_PHONE or SERVER. */
export class LuckyDrawError extends Error {
  constructor(code) {
    super(code);
    this.name = 'LuckyDrawError';
    this.code = code;
  }
}

/** Looks up one phone number. Resolves to { found, winner, name? }. */
export async function checkLuckyDraw(phoneNumber) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/lucky-draw/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
      signal: controller.signal,
    });

    if (response.status === 429) throw new LuckyDrawError('RATE_LIMITED');
    if (response.status === 400) throw new LuckyDrawError('INVALID_PHONE');
    if (!response.ok) throw new LuckyDrawError('SERVER');

    const data = await response.json();
    if (!data || data.success !== true || typeof data.found !== 'boolean') {
      throw new LuckyDrawError('SERVER');
    }
    return data;
  } catch (error) {
    if (error instanceof LuckyDrawError) throw error;
    if (error.name === 'AbortError') throw new LuckyDrawError('TIMEOUT');
    // A response that is not JSON means something other than our API answered.
    if (error instanceof SyntaxError) throw new LuckyDrawError('SERVER');
    throw new LuckyDrawError('NETWORK');
  } finally {
    clearTimeout(timer);
  }
}
