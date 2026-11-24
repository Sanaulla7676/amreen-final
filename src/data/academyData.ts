export interface CourseModule {
  slug: string;
  index: string;
  mediaClass: string;
  kicker: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  detailParagraph: string;
  image: string;
  imageAlt: string;
  themes: string[];
}

export interface StudioFrame {
  src: string;
  alt: string;
  caption: string;
}

export interface BlogArticle {
  number: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  keywords: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export const ACADEMY_INFO = {
  name: "Amreen's Academy",
  fullName: "Amreens Academy & Makeover Studio",
  tagline: '40-Day Skin, Hair & Makeup Education',
  phoneDisplay: '+91 81234 10118',
  phoneHref: 'tel:8123410118',
  whatsappUrl: 'https://wa.me/918123410118',
  instagramUrl: 'https://www.instagram.com/amreenkhanum60/',
  instagramHandle: '@amreenkhanum60',
  address:
    '#23, Bharath Nagar, Ashwath Nagar, 2nd Stage, Thanisandra Main Road, Bengaluru, Karnataka 560077',
  shortLocation: 'Thanisandra · Bengaluru',
  mapsSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=Amreens%20academy%20%26%20makeover%20studio&query_place_id=ChIJb3bteaUXrjsRIJOmc2EQrmY',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=Amreens%20academy%20%26%20makeover%20studio%2C%20Thanisandra%2C%20Bengaluru&output=embed',
  emblemUrl:
    'https://d2ol7oe51mr4n9.cloudfront.net/user_35mtirXTBJzeOp1GtU8b1ixSM0D/47e2bad0-2454-4058-b00b-014327f8c1ff.png',
  programFee: '₹30,000',
  programDays: 40,
  instalmentsNote: '3 instalments available',
};

export const COURSE_MODULES: CourseModule[] = [
  {
    slug: 'skin-aesthetics',
    index: '01',
    mediaClass: 'course-art-skin',
    kicker: 'PRIMARY FOCUS · SKIN CARE',
    title: 'Skin & Aesthetics',
    shortTitle: 'Skin & Aesthetics',
    tagline: 'Core salon training in skin analysis, facials, clean-ups, and hygiene.',
    description:
      'One of our core salon pillars inside the 40-day course — hands-on skin care and client treatment training covering:',
    detailParagraph:
      'Skin & Aesthetics is a central focus of the single 40-day integrated course, preparing you for real salon skin services, consultations, facials, and treatment-room hygiene.',
    image:
      'https://d2ol7oe51mr4n9.cloudfront.net/user_35mtirXTBJzeOp1GtU8b1ixSM0D/87688a93-3698-4056-b3c7-c6e9ba6c54eb.png',
    imageAlt: 'Skin and Aesthetics facial treatment training at Amreen’s Academy',
    themes: [
      'Skin types, analysis & client consultation',
      'Clean-ups, facials & soothing treatment routines',
      'Salon product selection & tool safety',
      'Sanitation & treatment-room hygiene',
    ],
  },
  {
    slug: 'hair-styling',
    index: '02',
    mediaClass: 'course-art-hair',
    kicker: 'PRIMARY FOCUS · HAIR SERVICES',
    title: 'Hair Styling & Services',
    shortTitle: 'Hair Styling',
    tagline: 'Core salon training in hair care, cutting prep, heat styling, and finishing.',
    description:
      'Built around high-demand salon hair services inside the same 40-day course, giving you practical confidence in:',
    detailParagraph:
      'Hair Styling & Services forms the second core pillar of the 40-day course — covering salon-ready hair preparation, sectioning, setting, and festive/bridal hairdos.',
    image:
      'https://d2ol7oe51mr4n9.cloudfront.net/user_35mtirXTBJzeOp1GtU8b1ixSM0D/33db9394-c833-4435-8c5a-aa5a554d343f.png',
    imageAlt: 'Hair styling training with an academy stylist working on a client',
    themes: [
      'Scalp care, washing & hair preparation',
      'Clean sectioning, structure & blow-dry control',
      'Everyday, party & floral updo styling',
      'Thermal tools & long-hold salon finishing',
    ],
  },
  {
    slug: 'professional-makeup',
    index: '03',
    mediaClass: 'course-art-makeup',
    kicker: 'INCLUDED MODULE · MAKEUP',
    title: 'Professional Makeup Artistry',
    shortTitle: 'Makeup Artistry',
    tagline: 'Included inside your 40-day course — skin prep to complete client looks.',
    description:
      'Included at no extra fee inside the 40-day program so you can offer full makeover services alongside skin & hair:',
    detailParagraph:
      'Learn how proper skin preparation pairs with clean base blending, undertone matching, and occasion-ready looks as part of the unified 40-day curriculum.',
    image:
      'https://d2ol7oe51mr4n9.cloudfront.net/user_35mtirXTBJzeOp1GtU8b1ixSM0D/5b87d071-a24b-44d8-b622-36c1be2d1576.png',
    imageAlt: 'Professional Makeup Artistry training with an academy makeup artist working on a client',
    themes: [
      'Skin preparation and base clarity',
      'Undertone & product selection',
      'Seamless blending & eye definition',
      'Daytime, party & studio makeup looks',
    ],
  },
  {
    slug: 'bridal-artistry',
    index: '04',
    mediaClass: 'course-art-bridal',
    kicker: 'INCLUDED MODULE · BRIDAL',
    title: 'Bridal Artistry',
    shortTitle: 'Bridal Artistry',
    tagline: 'Coordinate bridal hair, glowing skin prep, and occasion makeup seamlessly.',
    description:
      'Tie together your skin prep, hairstyling, and makeup skills for high-value bridal bookings inside the same 40 days:',
    detailParagraph:
      'Bridal Artistry completes the 40-day program by showing you how to plan pre-bridal skin care, bridal hairstyles, draping coordination, and long-wear event finishing.',
    image:
      'https://d2ol7oe51mr4n9.cloudfront.net/user_35mtirXTBJzeOp1GtU8b1ixSM0D/24f460b6-18cc-4d31-9490-ac461749bb91.png',
    imageAlt: 'Bridal artistry look with makeup and jewellery details',
    themes: [
      'Pre-bridal skin prep & look planning',
      'Longevity for lighting & long ceremonies',
      'Bridal hair, flowers & jewellery coordination',
      'Complete client presentation',
    ],
  },
];

export const WHY_CHOOSE_PILLARS = [
  {
    number: '01',
    title: '100% Hands-on Salon Practice',
    description:
      'Practise Skin Care, Hair Styling, Makeup & Bridal workflows directly on studio setups with trainer feedback.',
  },
  {
    number: '02',
    title: 'One Course. Everything Included.',
    description:
      'No hidden upsells: Skin & Aesthetics, Hair Services, Makeup & Bridal are all taught together in 40 days.',
  },
  {
    number: '03',
    title: 'Skin & Hair First Foundation',
    description:
      'Because salons run daily on skin and hair services, we build deep practical mastery in both alongside makeup.',
  },
  {
    number: '04',
    title: 'Hygiene & Client Care Standards',
    description:
      'Learn proper product awareness, tool sanitization, skin consultation, and real client service discipline.',
  },
  {
    number: '05',
    title: 'Online Verifiable Certificate',
    description:
      'Receive an official Amreen’s Academy certificate on completion that salons can verify online anytime.',
  },
  {
    number: '06',
    title: 'Flexible 3-Instalment Fee',
    description:
      'Total fee is ₹30,000 with 3 easy instalments of ₹10,000, making career-ready training accessible.',
  },
];

export const STUDENT_MOMENTS: StudioFrame[] = [
  {
    src: '/assets/academy-frames/certificate-03.jpg',
    alt: 'Students celebrating at a certificate presentation',
    caption: 'Graduation certificate day',
  },
  {
    src: '/assets/academy-frames/certificate-06.jpg',
    alt: 'Graduate holding her Amreen Academy certificate with mentor Amreen',
    caption: 'Certified salon graduates',
  },
  {
    src: '/assets/academy-frames/certificate-01.jpg',
    alt: 'Batch of beauty students showcasing their official academy certificates',
    caption: '40-day batch milestones',
  },
  {
    src: '/assets/academy-frames/classroom-08.jpg',
    alt: 'Students seated together during an academy learning briefing',
    caption: 'Guided studio sessions',
  },
];

export const STUDIO_FRAMES_REEL: StudioFrame[] = [
  ...Array.from({ length: 8 }, (_, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    return {
      src: `/assets/academy-frames/certificate-${num}.jpg`,
      alt: `Certificate presentation frame ${idx + 1}`,
      caption: `Certificate celebration ${num}`,
    };
  }),
  ...['02', '03', '05', '06', '07', '08', '09', '10'].map((num, idx) => ({
    src: `/assets/academy-frames/classroom-${num}.jpg`,
    alt: `Classroom training frame ${idx + 1}`,
    caption: `Studio practice ${num}`,
  })),
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: 'default-1',
    studentName: 'Ayesha Siddiqui',
    batchLabel: '40-Day Skin & Hair Batch · AA-2026-0001',
    focusArea: 'Skin & Hair Services',
    quote:
      'Joining the single 40-day course gave me daily hands-on practice in facials, hair setting, and bridal prep. I felt ready to take salon clients right after certification.',
    rating: 5,
    published: true,
  },
  {
    id: 'default-2',
    studentName: 'Ruksar Banu',
    batchLabel: 'Thanisandra Graduate',
    focusArea: 'Skin Care & Makeup',
    quote:
      'Everything was taught step-by-step in small batches with personal guidance from Amreen ma’am, and paying ₹30,000 in 3 instalments made it very easy for my family.',
    rating: 5,
    published: true,
  },
  {
    id: 'default-3',
    studentName: 'Fathima Z.',
    batchLabel: 'Verified Beauty Graduate',
    focusArea: 'Hair Styling & Bridal',
    quote:
      'Warm studio environment right on Thanisandra Main Road. Learning skin prep together with hair styling made my bridal finishing so much cleaner.',
    rating: 5,
    published: true,
  },
];

export const INSTAGRAM_REELS = [
  {
    id: 'Dfug-TKSKzl',
    date: '14 Nov 2026',
    title: 'Instagram Reel by Amreen, 14 Nov 2026',
    poster: '/assets/videos/video-01-preview.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/Dfug-TKSKzl/',
    embedUrl: 'https://www.instagram.com/reel/Dfug-TKSKzl/embed/',
  },
  {
    id: 'DftyC_7yDX4',
    date: '14 Nov 2026',
    title: 'Instagram Reel by Amreen, 14 Nov 2026',
    poster: '/assets/videos/certificate-poster.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/DftyC_7yDX4/',
    embedUrl: 'https://www.instagram.com/reel/DftyC_7yDX4/embed/',
  },
  {
    id: 'DfrbBDeSn0C',
    date: '13 Nov 2026',
    title: 'Instagram Reel by Amreen, 13 Nov 2026',
    poster: '/assets/videos/classroom-poster.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/DfrbBDeSn0C/',
    embedUrl: 'https://www.instagram.com/reel/DfrbBDeSn0C/embed/',
  },
  {
    id: 'Dfp1GYazrM3',
    date: '12 Nov 2026',
    title: 'Instagram Reel by Amreen, 12 Nov 2026',
    poster: '/assets/videos/video-02-preview.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/Dfp1GYazrM3/',
    embedUrl: 'https://www.instagram.com/reel/Dfp1GYazrM3/embed/',
  },
  {
    id: 'DfnHp2fSJzE',
    date: '11 Nov 2026',
    title: 'Instagram Reel by Amreen, 11 Nov 2026',
    poster: '/assets/academy-frames/certificate-01.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/DfnHp2fSJzE/',
    embedUrl: 'https://www.instagram.com/reel/DfnHp2fSJzE/embed/',
  },
  {
    id: 'DfmtpI1S5w-',
    date: '11 Nov 2026',
    title: 'Instagram Reel by Amreen, 11 Nov 2026',
    poster: '/assets/academy-frames/classroom-01.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/DfmtpI1S5w-/',
    embedUrl: 'https://www.instagram.com/reel/DfmtpI1S5w-/embed/',
  },
  {
    id: 'DfmsAc5yFhn',
    date: '11 Nov 2026',
    title: 'Instagram Reel by Amreen, 11 Nov 2026',
    poster: '/assets/academy-frames/certificate-02.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/DfmsAc5yFhn/',
    embedUrl: 'https://www.instagram.com/reel/DfmsAc5yFhn/embed/',
  },
  {
    id: 'DfmgPhqyMxi',
    date: '11 Nov 2026',
    title: 'Instagram Reel by Amreen, 11 Nov 2026',
    poster: '/assets/academy-frames/classroom-02.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/DfmgPhqyMxi/',
    embedUrl: 'https://www.instagram.com/reel/DfmgPhqyMxi/embed/',
  },
  {
    id: 'DfmUBMky2gW',
    date: '11 Nov 2026',
    title: 'Instagram Reel by Amreen, 11 Nov 2026',
    poster: '/assets/academy-frames/certificate-04.jpg',
    url: 'https://www.instagram.com/amreenkhanum60/reel/DfmUBMky2gW/',
    embedUrl: 'https://www.instagram.com/reel/DfmUBMky2gW/embed/',
  },
];

export const TEACHING_METHOD = [
  {
    step: '01',
    title: 'Learn the skin & hair science',
    description:
      'Begin with skin types, scalp condition, tool sanitation, and why each product step matters before touching a client.',
  },
  {
    step: '02',
    title: 'Watch live salon demonstrations',
    description: 'Observe sequence, sectioning, hand pressure, and finish in real studio lighting.',
  },
  {
    step: '03',
    title: 'Build speed through guided practice',
    description: 'Repeat skin, hair, and makeup routines daily until you work cleanly and confidently.',
  },
];

export const ENROLMENT_CHECKLIST = [
  {
    title: '1 Single 40-Day Curriculum',
    description: 'Skin & Aesthetics, Hair Services, Makeup Artistry & Bridal Finishing are all included in one unified batch.',
  },
  {
    title: 'Check Class Format & Practice',
    description: 'Ask about morning/afternoon batch timings, trainer ratio, and daily hands-on sessions.',
  },
  {
    title: 'Understand Fees & Certification',
    description: 'Full course fee is ₹30,000 (3 instalments of ₹10,000), ending with an online-verifiable certificate.',
  },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    number: '01',
    category: 'Skin Care',
    title: 'Why skin analysis comes before every salon service',
    summary: 'How understanding oily, dry, sensitive, and combination skin prevents reactions and improves glow.',
    content:
      'A great beauty professional starts with skin assessment, proper cleansing, steam/exfoliation control, and calm hygiene. Whether doing a facial or prepping a bride for base makeup, healthy skin always drives the final result.',
    keywords: 'Skin Analysis · Clean-Ups · Hygiene',
  },
  {
    number: '02',
    category: 'Hair Services',
    title: 'Sectioning & heat control for long-lasting hair styling',
    summary: 'Why section geometry, pin anchor direction, and heat protectant determine salon hold.',
    content:
      'Clean sectioning and internal support are the secret behind hairstyles that stay neat for 10+ hours. Plan crown balance and silhouette first, then layer curls, braids, or traditional floral styling cleanly.',
    keywords: 'Sectioning · Silhouette · Hold',
  },
  {
    number: '03',
    category: 'Bridal & Makeup',
    title: 'Coordinating skin prep, hair & bridal makeup smoothly',
    summary: 'How to align undertone, lighting, jewellery weight, and ceremony timings.',
    content:
      'Modern clients book skin, hair, and makeup as one coordinated experience. Preparing skin cleanly, building light breathable layers, and syncing hair framing with bridal jewellery creates camera-ready confidence.',
    keywords: 'Coordination · Thin Layers · Longevity',
  },
];

export const FAQ_ITEMS: FaqEntry[] = [
  {
    question: "How many courses does Amreen's Academy offer?",
    answer:
      "We offer ONE single integrated 40-day course — focused mainly on practical Skin & Aesthetics and Hair Styling services alongside Professional Makeup & Bridal finishing. You do not have to buy four separate courses.",
  },
  {
    question: 'Does the 40-day course mainly focus on Skin and Hair services?',
    answer:
      'Yes. Because everyday salon work and independent studio careers depend heavily on Skin Care (clean-ups, facials, hygiene) and Hair Services (care, sectioning, styling, finishing), both form the core practical foundation of the 40 days, paired with Makeup and Bridal skills.',
  },
  {
    question: 'What is the total course fee and instalment option?',
    answer:
      'The complete 40-day course fee is ₹30,000 all-inclusive of all four learning areas. Students can pay in 3 flexible instalments of ₹10,000. Confirm batch dates and instalment milestones with our counselor.',
  },
  {
    question: 'Do I get an official certificate after completing the 40 days?',
    answer:
      'Yes. Graduates receive an Amreen’s Academy completion certificate, and employers or salon partners can verify its authenticity anytime on our Verify Certificate page.',
  },
  {
    question: 'Can complete beginners join this 40-day course?',
    answer:
      'Yes. The 40-day curriculum starts from hygiene, tools, skin/hair basics, and demonstration before moving into guided daily hands-on practice.',
  },
  {
    question: 'Where is the studio located and how can I visit before enrolling?',
    answer:
      '#23, Bharath Nagar, Ashwath Nagar, 2nd Stage, Thanisandra Main Road, Bengaluru 560077. Call or WhatsApp +91 81234 10118 or book a studio visit from our Contact page.',
  },
];
