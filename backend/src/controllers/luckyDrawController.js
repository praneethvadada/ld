import { getLuckyDrawResult } from '../services/luckyDrawService.js';
import { normalizePhone } from '../utils/phone.js';

export function checkLuckyDraw(req, res) {
  const phone = normalizePhone(req.body?.phoneNumber);

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PHONE',
      message: 'Please enter a valid 10-digit mobile number.',
    });
  }

  return res.json(getLuckyDrawResult(phone));
}
