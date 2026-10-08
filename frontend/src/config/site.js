// All the wording and contact details shown on the site live here.
export const site = {
  brand: 'Devi Sridevi Enterprises',
  tagline: 'వృక్షో రక్షతి రక్షితః',
  mainSiteUrl: (import.meta.env.VITE_MAIN_SITE_URL || '').trim(),

  event: {
    name: 'Sasya Ganapathi Lucky Draw',
    badge: 'Since 1985 · Sasya Ganapathi (సస్య గణపతి)',
    // Each entry is shown on its own line.
    titleLines: ['Sasya Ganapathi —', 'Lucky Draw Results'],
    intro:
      'Thank you for celebrating Ganesh Chaturthi with us. Enter your registered mobile number to check your lucky draw result.',
    winnerNote: 'To collect your prize, please contact us with this registered mobile number.',
  },

  banner: {
    title: 'Ganapati Bappa Morya',
    text: 'Since 1985, Devi Sridevi Enterprises has served families with sacred, eco-friendly plants. This Ganesh Chaturthi, we gift saplings so every puja leaves the earth greener than it found it.',
  },

  contact: {
    phones: ['+91 92472 42224', '+91 98852 42224'],
    email: 'devisridevienterprises@gmail.com',
  },

  branches: [
    {
      label: 'Branches',
      text: 'Chintamani Temple | Maddilapalem | Autonagar | Chinnagantyada | Duvvada | Rajeev Nagar',
    },
    {
      label: 'Mumbai Branch',
      text: '22A/24, Shop No.1, Ground Floor, Wellington Street, Dhobi Talao, Marine Lines, Mumbai – 400002, M.H',
    },
  ],
};

/** "+91 92472 42224" -> "tel:+919247242224" */
export function telHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
