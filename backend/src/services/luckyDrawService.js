import { findParticipantByPhone } from '../models/participants.js';

/** Builds the public result for one normalized phone number. Nothing else about the record is exposed. */
export function getLuckyDrawResult(phone) {
  const participant = findParticipantByPhone(phone);

  if (!participant) return { success: true, found: false, winner: false };

  return {
    success: true,
    found: true,
    winner: participant.isWinner,
    name: participant.name,
  };
}
