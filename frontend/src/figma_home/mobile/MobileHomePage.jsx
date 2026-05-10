import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Car, Bike } from 'lucide-react';
import { Clock, ArrowRight } from '@phosphor-icons/react';
import MobileHeader from './MobileHeader';
import MobileMenu from './MobileMenu';
import { CAR_BRANDS, MODELS_BY_BRAND } from '../../data/cars';

const API = process.env.REACT_APP_BACKEND_URL || '';

/**
 * MobileHomePage — mobile version of the BIBI Cars homepage matching the
 * Figma mobile design at the 360px breakpoint. Renders below 768px.
 *
 * Sections (per Figma "Home page" mobile mock):
 *  1. Header (logo + phones + hamburger)
 *  2. Hero (FROM AUCTION TO KEYS / IN YOUR HANDS) + KPI
 *  3. Search/filter form (Brand · Model · Year · Find a car)
 *  4. Application steps 1–5
 *  5. How to buy a turnkey car (USA/Korea brand grid)
 *  6. We have perfect service
 *  7. Why you pay less — and get more
 *  8. Before & after
 *  9. Our clients say (reviews)
 * 10. Want to drive your dream car? CTA
 * 11. FAQ
 * 12. Footer (viber community, contacts, socials)
 */

const FALLBACK_PHONES = ['+359 875 313 158', '+359 897 884 804'];

const FALLBACK_HERO = {
  eyebrow: 'america | Korea',
  title_line1: 'From auction',
  title_line2: 'to keys',
  title_line3: 'in your hands',
  kpi1: '/ Over 5,000 cars',
  kpi2: '/ Real-time bids',
  kpi3: '/ 500+ happy clients',
};

const FALLBACK_FAQ = [
  { question: 'How to choose and buy a car from America?' },
  { question: 'Where do you ship to?' },
  { question: 'How long will it take for my order to arrive?' },
  { question: 'How do I change or cancel my order?' },
  { question: 'How can I track my order?' },
];

const FALLBACK_REVIEWS = [
  { name: 'Georgi', rating: 5, text: 'Loved the approach — clear, transparent, no surprises. The car matched my budget and they were always in touch.' },
  { name: 'Dimitar', rating: 5, text: 'Bought a car from auction — they really know their stuff. Great value for money.' },
];

const fmtLang = (val, lang = 'en') => {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || val.bg || '';
};

export default function MobileHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [filterBrand, setFilterBrand] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [reviewIdx, setReviewIdx] = useState(0);
  const [beforeAfterIdx, setBeforeAfterIdx] = useState(0);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/api/site-info`)
      .then((r) => {
        if (!cancelled) setSiteInfo(r.data || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived
  const phones = siteInfo?.header?.phones || siteInfo?.footer?.contacts?.phones || FALLBACK_PHONES;
  const addresses = siteInfo?.footer?.contacts?.addresses || [
    'Bulgaria, Sofia, Dragalevtsi, Vitosha Blvd. No. 230',
    'Bulgaria, Sofia, Bulgaria Blvd., No. 81',
  ];
  const socials = siteInfo?.footer?.socials || {};
  const langKey = (lang || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
  const hero = siteInfo?.hero || {};
  const heroEyebrow = fmtLang(hero[`eyebrow_${langKey}`] || hero.eyebrow, langKey) || FALLBACK_HERO.eyebrow;
  const heroL1 = fmtLang(hero[`title_line1_${langKey}`] || hero.title_line1, langKey) || FALLBACK_HERO.title_line1;
  const heroL2 = fmtLang(hero[`title_line2_${langKey}`] || hero.title_line2, langKey) || FALLBACK_HERO.title_line2;
  const heroL3 = fmtLang(hero[`title_line3_${langKey}`] || hero.title_line3, langKey) || FALLBACK_HERO.title_line3;
  const heroImageUrl = hero.image_url || '/mobile/image-103@2x.png';
  const kpi1 = fmtLang(hero[`kpi1_${langKey}`] || hero.kpi1, langKey) || FALLBACK_HERO.kpi1;
  const kpi2 = fmtLang(hero[`kpi2_${langKey}`] || hero.kpi2, langKey) || FALLBACK_HERO.kpi2;
  const kpi3 = fmtLang(hero[`kpi3_${langKey}`] || hero.kpi3, langKey) || FALLBACK_HERO.kpi3;

  // FAQ
  const faqEnabled = siteInfo?.faq?.enabled !== false;
  const faqItems = (siteInfo?.faq?.items || []).filter((i) => i?.enabled !== false);
  const faqList = faqItems.length
    ? faqItems.map((it, i) => ({
        id: it.id || `faq-${i}`,
        question: fmtLang(it[`question_${langKey}`] || it.question, langKey),
        answer: fmtLang(it[`answer_${langKey}`] || it.answer, langKey),
      }))
    : FALLBACK_FAQ.map((f, i) => ({ id: `f-${i}`, question: f.question, answer: '' }));

  // Reviews
  const reviewsEnabled = siteInfo?.reviews?.enabled !== false;
  const reviewItems = (siteInfo?.reviews?.items || []).filter((r) => r?.enabled !== false);
  const reviews = reviewItems.length
    ? reviewItems.map((r) => ({
        name: r.name,
        rating: r.rating || 5,
        text: fmtLang(r[`text_${langKey}`] || r.text, langKey),
        image_url: r.image_url || '',
      }))
    : FALLBACK_REVIEWS;

  // Before & after
  const baEnabled = siteInfo?.before_after?.enabled !== false;
  const baItems = (siteInfo?.before_after?.items || []).filter((i) => i?.enabled !== false);

  const googleRating = siteInfo?.reviews?.google_rating ?? 4.9;
  const googleReviewsCount = siteInfo?.reviews?.google_reviews_count ?? 31;

  const viberCommunity = siteInfo?.footer?.viber_community || {};
  const viberLabel = fmtLang(viberCommunity[`label_${langKey}`] || viberCommunity.label, langKey) || 'Join our group and get the hottest offers';
  const viberUrl = viberCommunity.url || 'viber://chat?number=%2B359875313158';

  // Helpers
  const onFindCar = () => {
    const params = new URLSearchParams();
    if (filterBrand) params.set('make', filterBrand);
    if (filterModel) params.set('model', filterModel);
    if (yearFrom) params.set('year_from', yearFrom);
    if (yearTo) params.set('year_to', yearTo);
    window.location.href = `/catalog${params.toString() ? `?${params}` : ''}`;
  };

  return (
    <div
      className="bg-black text-white min-h-screen"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      <MobileHeader phones={phones} onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        phones={phones}
        addresses={addresses}
        socials={socials}
        lang={lang}
        onLangChange={setLang}
      />

      {/* ═════════ HERO ═════════ */}
      <section className="relative pt-6 overflow-hidden">
        {/* AMERICA | KOREA — 119×12 H Medium 12px, centered */}
        <div
          className="text-white text-center uppercase mx-auto"
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '12px',
            letterSpacing: '0.18em',
            width: 'fit-content',
            height: 12,
          }}
        >
          {heroEyebrow}
        </div>

        {/* Title block — three centered lines (40 / 32 / 40 px) */}
        <div className="mt-3 text-center">
          <div
            className="uppercase text-[#FEAE00]"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: '40px',
              letterSpacing: '0',
            }}
          >
            {heroL1}
          </div>
          <div
            className="uppercase text-white"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 32,
              lineHeight: '32px',
              marginTop: 4,
              letterSpacing: '0',
            }}
          >
            {heroL2}
          </div>
          <div
            className="uppercase text-[#FEAE00]"
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              lineHeight: '40px',
              marginTop: 4,
              letterSpacing: '0',
            }}
          >
            {heroL3}
          </div>
        </div>

        {/* KPIs — 3 chips per row, exact Figma sizes 93×13, H Semibold 11px,
            text is sentence-case (NOT uppercase), middle one is centered. */}
        <div
          className="mt-6 px-4"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            alignItems: 'center',
            justifyItems: 'center',
            gap: 8,
          }}
        >
          {[
            { val: kpi1, align: 'flex-start' },
            { val: kpi2, align: 'center' },
            { val: kpi3, align: 'flex-end' },
          ].map((k, i) => (
            <div
              key={i}
              className="text-white whitespace-nowrap"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                lineHeight: '13px',
                letterSpacing: 0,
                textTransform: 'none',
                width: '100%',
                textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
              }}
            >
              {k.val}
            </div>
          ))}
        </div>

        {/* Hero image — FULL WIDTH within the viewport (no horizontal padding). */}
        <div className="mt-7 w-full" style={{ lineHeight: 0, overflow: 'hidden' }}>
          <img
            src={heroImageUrl}
            alt=""
            style={{
              width: '100%',
              maxWidth: '100%',
              aspectRatio: '361 / 326',
              objectFit: 'cover',
              display: 'block',
              border: 0,
              outline: 0,
              clipPath: 'inset(0 0 5px 0)',
              marginBottom: -5,
              backgroundColor: '#000',
            }}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/mobile/image-103@2x.png';
            }}
          />
        </div>
      </section>

      {/* ═════════ CAR SEARCH / FILTER ═════════ */}
      {/* Per Figma: section box is 360 × 621 — title + 4 fields + button +
         vertical breathing room top/bottom so the card never overlaps the
         hero image above. Brand is a real dropdown (click → searchable list);
         Model is disabled until a brand is picked; Year From/To are
         year selects with sane ranges. */}
      <MobileCarSearch
        filterBrand={filterBrand}
        setFilterBrand={setFilterBrand}
        filterModel={filterModel}
        setFilterModel={setFilterModel}
        yearFrom={yearFrom}
        setYearFrom={setYearFrom}
        yearTo={yearTo}
        setYearTo={setYearTo}
        onFindCar={onFindCar}
      />

      {/* ═════════ SEARCH FOR CARS FROM AMERICA AND KOREA ═════════ */}
      <MobileSearchFromAmericaKorea />
      {/* ═════════ END ═════════ */}

      {/* ═════════ TOP VEHICLES DEALS — placeholder (next iteration) ═════════ */}
      {/* The duplicate "How to buy a turnkey car / USA / Korea" block was
         removed: its functionality is already covered by the
         <MobileSearchFromAmericaKorea /> block above. The next block to
         implement here is "Top vehicles deals of the week". */}

      {/* ═════════ TOP VEHICLES DEALS OF THE WEEK ═════════ */}
      <MobileTopVehicleDeals />

      {/* ═════════ CALCULATE A CAR YOURSELF ═════════ */}
      <MobileCalculateCar />

      {/* ═════════ HOW WE WORK ═════════ */}
      <MobileHowWeWork />

      {/* ═════════ HOW TO BUY A TURNKEY CAR — replaces Before & After ═════════ */}
      <MobileHowToBuyTurnkey />

      {/* ═════════ OUR CLIENTS SAY ═════════ */}
      {reviewsEnabled ? (
        <section className="px-4 pb-12">
          <div className="text-[12px] uppercase tracking-[0.2em] text-[#FEAE00] mb-3">[ reviews ]</div>
          <h2 className="text-[28px] leading-[32px] font-bold uppercase text-white">our clients say</h2>
          <p className="text-[14px] text-white/75 mt-2 mb-5">
            Satisfied clients<br />
            <span className="text-[#FEAE00]">are our priority</span>
          </p>

          <div className="bg-[#0e0e0e] border border-[#1c1c1c] rounded-md p-5">
            {/* Google rating header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-[28px] font-bold text-white tabular-nums">{Number(googleRating).toFixed(1)}</div>
              <div className="flex items-center text-[#FEAE00]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} aria-hidden>★</span>
                ))}
              </div>
              <div className="text-[12px] text-white/60">{googleReviewsCount} Google reviews</div>
            </div>

            {/* Active review */}
            <div className="text-[13px] leading-[20px] text-white/85 italic">
              "{reviews[reviewIdx]?.text || ''}"
            </div>
            <div className="mt-3 text-[14px] font-bold text-[#FEAE00]">
              — {reviews[reviewIdx]?.name || ''}
            </div>
          </div>

          {/* Pager */}
          {reviews.length > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Prev review"
                onClick={() => setReviewIdx((v) => (v - 1 + reviews.length) % reviews.length)}
                className="w-9 h-9 rounded-full border border-[#555452] flex items-center justify-center text-white hover:text-[#FEAE00] hover:border-[#FEAE00]"
              >
                ←
              </button>
              <div className="text-[12px] tabular-nums text-white/70">
                {String(reviewIdx + 1).padStart(2, '0')}/{String(reviews.length).padStart(2, '0')}
              </div>
              <button
                type="button"
                aria-label="Next review"
                onClick={() => setReviewIdx((v) => (v + 1) % reviews.length)}
                className="w-9 h-9 rounded-full border border-[#555452] flex items-center justify-center text-white hover:text-[#FEAE00] hover:border-[#FEAE00]"
              >
                →
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ═════════ DREAM CAR CTA ═════════ */}
      <section className="px-4 pb-12">
        <div className="relative rounded-md overflow-hidden bg-[#0e0e0e] border border-[#1c1c1c]">
          <img
            src="/mobile/young-woman-with-salesman-carshowroom-1@2x.png"
            alt=""
            className="w-full h-auto block opacity-80"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="relative z-10 p-6">
            <img src="/mobile/BiBi-logo-02-1.svg" alt="BIBI" className="h-7 mb-4" />
            <h2 className="text-[24px] leading-[28px] font-bold uppercase text-white">
              Want to drive<br />
              <span className="text-[#FEAE00]">your dream car?</span>
            </h2>
          </div>
        </div>
        <a
          href="/contacts"
          className="mt-5 block w-full text-center h-12 leading-[48px] bg-[#FEAE00] text-black font-bold uppercase tracking-[0.2em] text-[13px] rounded hover:brightness-110 transition"
        >
          CONTACT US
        </a>
      </section>

      {/* ═════════ FAQ ═════════ */}
      {faqEnabled ? (
        <section className="px-4 pb-12">
          <div className="text-[12px] uppercase tracking-[0.2em] text-[#FEAE00] mb-3">[ faq ]</div>
          <h2 className="text-[28px] leading-[32px] font-bold uppercase text-white mb-5">FAQ</h2>

          <div className="flex flex-col">
            {faqList.map((it, i) => {
              const isOpen = openFaq === it.id;
              return (
                <div key={it.id} className="border-b border-[#1c1c1c]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : it.id)}
                    className="w-full flex items-start justify-between gap-3 py-4 text-left"
                    data-testid={`mobile-faq-toggle-${i}`}
                  >
                    <span className="text-[14px] leading-[20px] text-white pr-2">
                      <span className="text-[#FEAE00] mr-1">{i + 1}/</span>
                      {it.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full border border-[#FEAE00] text-[#FEAE00] flex items-center justify-center text-[16px] transition-transform ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  {isOpen && it.answer ? (
                    <div
                      className="pb-4 pr-9 text-[13px] leading-[20px] text-white/80 [&_p]:my-2 [&_ol]:list-decimal [&_ol]:ml-5 [&_ul]:list-disc [&_ul]:ml-5"
                      dangerouslySetInnerHTML={{ __html: it.answer }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ═════════ FOOTER ═════════ */}
      <footer className="bg-[#0a0a0a] border-t border-[#1c1c1c] px-4 pt-8 pb-10">
        {/* Viber community */}
        {viberCommunity?.enabled !== false ? (
          <a
            href={viberUrl}
            className="flex items-center justify-between gap-3 bg-[#0e0e0e] border border-[#1c1c1c] rounded-md p-4 mb-6 hover:border-[#FEAE00] transition-colors"
          >
            <span className="text-[13px] leading-[19px] text-white">{viberLabel}</span>
            <span className="w-10 h-10 rounded-full bg-[#7360F2]/20 flex items-center justify-center text-white text-[20px]" aria-hidden>
              📞
            </span>
          </a>
        ) : null}

        <div className="mb-6">
          <img src="/mobile/BiBi-logo-02-1.svg" alt="BIBI Cars" className="h-8 mb-4" />
          <div className="flex flex-col gap-1 text-[#FEAE00] text-[14px] font-bold">
            {phones.map((p, i) => (
              <a key={i} href={`tel:${p.replace(/\s+/g, '')}`} className="hover:opacity-80">
                {p}
              </a>
            ))}
          </div>
          {siteInfo?.footer?.contacts?.email ? (
            <a
              href={`mailto:${siteInfo.footer.contacts.email}`}
              className="block mt-2 text-[13px] text-white/80 underline hover:text-[#FEAE00]"
            >
              {siteInfo.footer.contacts.email}
            </a>
          ) : null}
        </div>

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-[#8A8A8A] mb-2">Our Address:</div>
          <div className="text-[13px] leading-[19px] text-white">
            {addresses.map((a, i) => (
              <div key={i}>{a}</div>
            ))}
          </div>
        </div>

        {siteInfo?.footer?.contacts?.working_hours ? (
          <div className="mb-6">
            <div className="text-[11px] uppercase tracking-wider text-[#8A8A8A] mb-1">Working hours:</div>
            <div className="text-[13px] text-white">{siteInfo.footer.contacts.working_hours}</div>
          </div>
        ) : null}

        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-[#8A8A8A] mb-2">social media:</div>
          <div className="flex items-center gap-3">
            {socials?.instagram?.enabled !== false ? (
              <a
                href={socials?.instagram?.url || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-[#555452] flex items-center justify-center hover:border-[#FEAE00] hover:text-[#FEAE00] text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
            ) : null}
            {socials?.facebook?.enabled !== false ? (
              <a
                href={socials?.facebook?.url || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-[#555452] flex items-center justify-center hover:border-[#FEAE00] hover:text-[#FEAE00] text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M14 8.5h2v-3h-2.2c-1.7 0-3 1.3-3 3V11H9v3h1.8v6.5h3V14H16l.4-3H13.8V9c0-.3.1-.5.4-.5z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            ) : null}
            {socials?.telegram?.enabled !== false ? (
              <a
                href={socials?.telegram?.url || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 rounded-full border border-[#555452] flex items-center justify-center hover:border-[#FEAE00] hover:text-[#FEAE00] text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M21 4L3 11l5 1.6L18 7l-7.5 7v4l3-3 4.6 3.4L21 4z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#1c1c1c] pt-4 text-[11px] text-white/40">
          © {new Date().getFullYear()} BIBI Cars
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Reusable mobile field component                                         */
/* Typography (per Figma):                                                  */
/*   • label       → Helvetica Medium 14px                                  */
/*   • input value → Helvetica Regular 14px                                 */
/*   • chevron 12×12 right-aligned (dropdown-style affordance)              */
/* ─────────────────────────────────────────────────────────────────────── */

function Field({ label, value, onChange, placeholder, type = 'text', inputMode, maxLength }) {
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  return (
    <label className="block">
      <span
        className="block"
        style={{
          fontFamily: FONT,
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '18px',
          color: '#fff',
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      <div className="relative">
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          className="w-full bg-transparent border border-[#555452] rounded text-white focus:outline-none focus:border-[#FEAE00]"
          style={{
            height: 45,
            paddingLeft: 16,
            paddingRight: 36,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 400, // H Regular for the value/placeholder
            letterSpacing: 0,
          }}
        />
        <span
          aria-hidden
          className="absolute pointer-events-none text-white/80"
          style={{ right: 14, top: '50%', transform: 'translateY(-50%)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 4l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </label>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* MobileSearchFromAmericaKorea                                            */
/* 1‑to‑1 port of the Figma mobile mock for the "Search for cars from      */
/* America and Korea / Most popular brands" block.                         */
/*                                                                         */
/* Layout:                                                                  */
/*   • Outer section uses GRAY (#1d1d1b) background — same as desktop      */
/*     catalog-header — so the inner BLACK card visibly separates.         */
/*   • No horizontal padding on the section: the heading is full-width,    */
/*     center-aligned, and spans across the screen (not a narrow column).  */
/*                                                                         */
/* Typography (Mazzard H — exact weights requested):                       */
/*   • "Search for cars / from America and Korea" → H Bold 24px, #FEAE00   */
/*   • "Most Popular Brands"                       → H Regular 14px, #fff  */
/*   • "Other Brands +"                            → H Medium 14px, #FEAE00*/
/*                                                                         */
/* Brand grid:                                                              */
/*   • 3 columns × N rows, 1px #1c1c1c dividers between every cell         */
/*     (top + left on the wrapper, bottom + right on each cell — same      */
/*     trick as desktop so internal lines never duplicate).                */
/*   • Featured 6 use the original Figma pngwing assets in /mobile/.       */
/*   • Additional brands (expanded) use /figma/brands/<slug>.webp.         */
/*                                                                         */
/* "Other brands +" toggle:                                                 */
/*   • Click reveals 6 more brands per click (same logic as desktop        */
/*     BrandLogos1).                                                       */
/*   • When the full list is visible the label switches to "Hide brands −".*/
/* ─────────────────────────────────────────────────────────────────────── */

const MOBILE_FEATURED_BRANDS = [
  { slug: 'audi',    name: 'Audi',    src: '/mobile/pngwing-com-4-1@2x.png' },
  { slug: 'bmw',     name: 'BMW',     src: '/mobile/pngwing-com-3-1@2x.png' },
  { slug: 'jeep',    name: 'Jeep',    src: '/mobile/pngwing-com-5-1@2x.png' },
  { slug: 'toyota',  name: 'Toyota',  src: '/mobile/pngwing-com-1-1@2x.png' },
  { slug: 'ford',    name: 'Ford',    src: '/mobile/pngwing-com-6-2@2x.png' },
  { slug: 'hyundai', name: 'Hyundai', src: '/mobile/pngwing-com-1@2x.png' },
];

const MOBILE_EXTRA_BRANDS = [
  'acura','alfa-romeo','aston-martin','bentley','buick','cadillac',
  'chevrolet','chrysler','dodge','ferrari','fiat','genesis','gmc',
  'honda','hummer','infiniti','international','isuzu','jaguar','kia',
  'lamborghini','land-rover','lexus','lincoln','lotus','maserati',
  'mazda','mercedes','mg','mini','mitsubishi','nissan','polestar',
  'pontiac','porsche','ram','rolls-royce','saab','smart','subaru',
  'suzuki','tesla','volkswagen','volvo','yamaha',
].map((slug) => ({
  slug,
  name: slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' '),
  src: `/figma/brands/${slug}.webp`,
}));

const MOBILE_ALL_BRANDS = [...MOBILE_FEATURED_BRANDS, ...MOBILE_EXTRA_BRANDS];
const MOBILE_PAGE = 6;

function MobileSearchFromAmericaKorea() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  const [visible, setVisible] = useState(MOBILE_PAGE);
  const total = MOBILE_ALL_BRANDS.length;
  const showMore = visible < total;
  const expanded = visible > MOBILE_PAGE;

  const handleMore = () => setVisible((v) => Math.min(total, v + MOBILE_PAGE));
  const handleHide = () => setVisible(MOBILE_PAGE);

  return (
    <section
      data-testid="mobile-search-from-america-korea"
      style={{
        backgroundColor: '#1d1d1b',
        padding: '40px 20px 48px',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* Title — full‑width, centered, both lines amber */}
      <h2
        style={{
          margin: '0 0 28px 0',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          lineHeight: '100%',
          letterSpacing: 0,
          textTransform: 'uppercase',
          color: '#FEAE00',
          width: '100%',
        }}
      >
        Search for cars
        <br />
        from America and Korea
      </h2>

      {/* Black card */}
      <div
        style={{
          backgroundColor: '#000',
          border: '1px solid #1c1c1c',
          borderRadius: 6,
          padding: '26px 16px 24px',
        }}
      >
        {/* Subtitle — H Regular 14 */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '99.9%',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: 22,
          }}
        >
          Most popular brands
        </div>

        {/* Brand grid (3 cols, dividers via outer top+left and per-cell bottom+right) */}
        <div
          className="grid grid-cols-3"
          style={{
            borderTop: '1px solid #1c1c1c',
            borderLeft: '1px solid #1c1c1c',
          }}
        >
          {MOBILE_ALL_BRANDS.slice(0, visible).map((b) => (
            <a
              key={b.slug}
              href={`/catalog?make=${encodeURIComponent(b.slug)}`}
              data-testid={`mobile-brand-${b.slug}`}
              className="flex items-center justify-center"
              aria-label={b.name}
              style={{
                height: 78,
                borderRight: '1px solid #1c1c1c',
                borderBottom: '1px solid #1c1c1c',
                padding: 10,
                boxSizing: 'border-box',
              }}
            >
              <img
                src={b.src}
                alt={b.name}
                style={{
                  maxHeight: 44,
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = 'inline';
                  }
                }}
              />
              <span
                style={{
                  display: 'none',
                  fontFamily: FONT,
                  fontSize: 12,
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                {b.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Other brands + / Hide brands − */}
      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
        {showMore ? (
          <button
            type="button"
            onClick={handleMore}
            data-testid="mobile-other-brands"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '99.9%',
              color: '#FEAE00',
              textTransform: 'uppercase',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Other brands +
          </button>
        ) : expanded ? (
          <button
            type="button"
            onClick={handleHide}
            data-testid="mobile-hide-brands"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '99.9%',
              color: '#FEAE00',
              textTransform: 'uppercase',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Hide brands −
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* MobileTopVehicleDeals                                                   */
/* 1‑to‑1 port of the Figma mobile mock — "Top vehicles deals of the week" */
/*                                                                         */
/* Section structure (top→bottom):                                          */
/*   1. Title (2 lines)         — "TOP VEHICLES DEALS" / "OF THE WEEK"     */
/*                                Mazzard H Bold 24, orange + white        */
/*   2. Subtitle (3 lines)      — Mazzard H Medium 16, 258×57              */
/*   3. Vehicle-type filter     — 4 icons (car/moto/truck/van), 294×24,    */
/*                                horizontal hairline above & below         */
/*   4. Price-range tabs        — 10-15K · 15-25K · 30-50K · PROPOSALS-46  */
/*                                Mazzard H Regular 12                     */
/*   5. Vehicle card            — image 336.5×… with "Trading date" strip, */
/*                                yellow timer chip, compare/favorite      */
/*                                round buttons, model title, purchase     */
/*                                price box, mileage/engine/drive grid,    */
/*                                estimated final cost, MORE DETAILS CTA   */
/*   6. Pager                   — ‹ 01/47 ›  (130×24)                      */
/*   7. MORE VEHICLES +         — Mazzard H Medium 14, 127×17, underlined  */
/* ─────────────────────────────────────────────────────────────────────── */

const TOP_DEALS_CARS = [
  {
    id: 1,
    name: '2025 Lucid Motors Air Pure',
    img: '/mobile/image-15@2x.png',
    tradingDate: '34.13.2027',
    timer: '1 d: 4h: 35m',
    purchasePrice: '20 000-30 000 EURO',
    mileage: '65 900 KM',
    engine: '4.6L / Patrol',
    drive: 'All-wheel',
    finalCost: '50 000 - 70 000 EURO',
  },
  {
    id: 2,
    name: '2024 BMW M5 Competition',
    img: '/mobile/image-93@2x.png',
    tradingDate: '12.04.2027',
    timer: '0 d: 12h: 02m',
    purchasePrice: '45 000-55 000 EURO',
    mileage: '12 400 KM',
    engine: '4.4L V8 Bi-Turbo',
    drive: 'All-wheel',
    finalCost: '78 000 - 92 000 EURO',
  },
  {
    id: 3,
    name: '2023 Mercedes-AMG GT 63',
    img: '/mobile/image-74@2x.png',
    tradingDate: '08.05.2027',
    timer: '2 d: 6h: 11m',
    purchasePrice: '60 000-72 000 EURO',
    mileage: '8 100 KM',
    engine: '4.0L V8 Bi-Turbo',
    drive: 'All-wheel',
    finalCost: '110 000 - 130 000 EURO',
  },
  {
    id: 4,
    name: '2024 Tesla Model S Plaid',
    img: '/mobile/image-76@2x.png',
    tradingDate: '21.06.2027',
    timer: '0 d: 4h: 50m',
    purchasePrice: '55 000-65 000 EURO',
    mileage: '4 200 KM',
    engine: 'Triple-Motor EV',
    drive: 'All-wheel',
    finalCost: '95 000 - 115 000 EURO',
  },
];

const VEHICLE_TYPES = [
  { id: 'car',   kind: 'lucide',  Icon: Car,  label: 'Cars' },
  { id: 'moto',  kind: 'lucide',  Icon: Bike, label: 'Motorbikes' },
  { id: 'truck', kind: 'mask',    src: '/figma/ph_truck.svg', label: 'Trucks' },
  { id: 'van',   kind: 'mask',    src: '/figma/ep_van.svg',   label: 'Vans' },
];

const PRICE_TABS = ['10-15K', '15-25K', '30-50K'];

function MobileTopVehicleDeals() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  const [vehicleType, setVehicleType] = useState('car');
  const [priceTab, setPriceTab] = useState('10-15K');
  const [idx, setIdx] = useState(0);
  const [favorited, setFavorited] = useState({});
  const [compared, setCompared] = useState({});

  // Real card list — pager and counter follow it 1:1.
  const visible = TOP_DEALS_CARS;
  const total = visible.length;
  const safeIdx = total ? ((idx % total) + total) % total : 0;
  const current = visible[safeIdx];
  const proposals = total; // "Proposals - N" mirrors the real number of offers
  const counter = `${String(safeIdx + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  const goPrev = () => setIdx((v) => (total ? (v - 1 + total) % total : 0));
  const goNext = () => setIdx((v) => (total ? (v + 1) % total : 0));

  // Touch-swipe handlers (real horizontal pagination)
  const touchRef = useRef({ x: 0, y: 0, active: false });
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, active: true };
  };
  const onTouchEnd = (e) => {
    if (!touchRef.current.active) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    touchRef.current.active = false;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext(); else goPrev();
    }
  };

  if (!total) return null;

  return (
    <section
      data-testid="mobile-top-vehicles-deals"
      style={{
        backgroundColor: '#000',
        padding: '40px 20px 48px',
        fontFamily: FONT,
        color: '#fff',
      }}
    >
      {/* 1 — Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '100%',
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: '#FEAE00', display: 'block' }}>Top vehicles deals</span>
          <span style={{ color: '#FFFFFF', display: 'block', marginTop: 4 }}>of the week</span>
        </h2>
      </div>

      {/* 2 — Subtitle (Mazzard H Medium 16, 258×57) */}
      <div
        style={{
          textAlign: 'center',
          margin: '0 auto 28px',
          width: 258,
          maxWidth: '100%',
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 16,
          lineHeight: '20px',
          textTransform: 'uppercase',
          letterSpacing: 0,
        }}
      >
        <span style={{ color: '#FEAE00' }}>Thousands of listings.</span>
        <br />
        <span style={{ color: '#FFFFFF' }}>Only the best make the cut.</span>
        <br />
        <span style={{ color: '#FFFFFF' }}>Updated weekly</span>
      </div>

      {/* 3 — Vehicle-type filter row (294×24) — same icons as web (lucide-react) */}
      <div
        style={{
          borderTop: '1px solid #2a2a28',
          borderBottom: '1px solid #2a2a28',
          padding: '14px 0',
          marginBottom: 18,
        }}
      >
        <div
          role="tablist"
          aria-label="Vehicle type"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 294,
            margin: '0 auto',
            height: 24,
          }}
        >
          {VEHICLE_TYPES.map((v) => {
            const active = vehicleType === v.id;
            const color = active ? '#FEAE00' : '#FFFFFF';
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={v.label}
                onClick={() => setVehicleType(v.id)}
                data-testid={`mobile-deals-type-${v.id}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  width: 32,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                  transition: 'color 150ms ease',
                }}
              >
                {v.kind === 'lucide' ? (
                  <v.Icon size={22} strokeWidth={1.6} />
                ) : (
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 22,
                      height: 22,
                      backgroundColor: color,
                      WebkitMaskImage: `url(${v.src})`,
                      maskImage: `url(${v.src})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      transition: 'background-color 150ms ease',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 — Price-range tabs + proposals counter (181×12 / 83×12) */}
      <div
        role="tablist"
        aria-label="Price range"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 18,
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: '12px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'nowrap' }}>
          {PRICE_TABS.map((t) => {
            const active = priceTab === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPriceTab(t)}
                data-testid={`mobile-deals-price-${t}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: FONT,
                  fontWeight: active ? 500 : 400,
                  fontSize: 12,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: active ? '#FEAE00' : '#FFFFFF',
                  whiteSpace: 'nowrap',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <span style={{ color: '#FFFFFF', whiteSpace: 'nowrap' }}>Proposals - {proposals}</span>
      </div>

      {/* 5 — Vehicle card (with real touch swipe) */}
      <article
        data-testid={`mobile-deal-${current.id}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          backgroundColor: '#1d1d1b',
          borderRadius: 8,
          overflow: 'hidden',
          padding: 12,
          width: '100%',
          maxWidth: 336.5,
          margin: '0 auto',
          touchAction: 'pan-y',
        }}
      >
        {/* Image with overlays */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '312 / 220',
            overflow: 'hidden',
            borderRadius: 6,
            backgroundColor: '#0a0a0a',
          }}
        >
          <img
            src={current.img}
            alt={current.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = '/mobile/image-15@2x.png'; }}
          />

          {/* Trading date chip — aligned LEFT, parallel to the timer chip below.
              Both chips share the same `left: 12px` and width 160px, so they
              line up geometrically (one at top, one at bottom of the image). */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 160,
              height: 20,
              padding: '0 8px',
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              color: '#0B0B0B',
              whiteSpace: 'nowrap',
            }}
          >
            Trading date - {current.tradingDate}
          </div>

          {/* Timer chip — same `left: 12` as trading date for vertical parity */}
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              width: 160,
              height: 24,
              padding: '0 8px',
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: '#FEAE00CC',
              color: '#000',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              borderRadius: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <Clock size={12} weight="regular" color="#000" />
            {current.timer}
          </div>

          {/* Round action buttons (bottom-right) — exact Figma SVGs.
              The SVGs themselves include the 24×24 white outline ring + a
              16×16 inner glyph, so the button has NO additional border. */}
          <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', gap: 8, alignItems: 'center', height: 24 }}>
            <button
              type="button"
              aria-label="Compare"
              onClick={() => setCompared((s) => ({ ...s, [current.id]: !s[current.id] }))}
              data-testid={`mobile-deal-compare-${current.id}`}
              style={{
                width: 24,
                height: 24,
                padding: 0,
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: compared[current.id] ? 1 : 0.95,
                filter: compared[current.id]
                  ? 'drop-shadow(0 0 4px rgba(254,174,0,0.9))'
                  : 'none',
              }}
            >
              <img src="/figma/Frame-1707479176.svg" alt="" width={24} height={24} style={{ display: 'block' }} />
            </button>
            <button
              type="button"
              aria-label="Favorite"
              onClick={() => setFavorited((s) => ({ ...s, [current.id]: !s[current.id] }))}
              data-testid={`mobile-deal-favorite-${current.id}`}
              style={{
                width: 24,
                height: 24,
                padding: 0,
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: favorited[current.id] ? 1 : 0.95,
                filter: favorited[current.id]
                  ? 'drop-shadow(0 0 4px rgba(254,174,0,0.9))'
                  : 'none',
              }}
            >
              <img src="/figma/Frame-1707479182.svg" alt="" width={24} height={24} style={{ display: 'block' }} />
            </button>
          </div>
        </div>

        {/* Title — Mazzard H Bold 14 (per Figma spec) */}
        <h3
          style={{
            margin: '16px 0 14px',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '18px',
            color: '#FFFFFF',
          }}
        >
          {current.name}
        </h3>

        {/* Spec block — Purchase price box (left) + spec rows (right).
            Typography per Figma:
              • "Purchase price" label    → H Medium 12px, white
              • Price value (orange)      → H Bold 12px
              • Spec keys (Mileage etc.)  → H Medium 12px, white
              • Spec values               → H Bold 12px, orange */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div
            style={{
              flex: '1 1 0',
              backgroundColor: '#000',
              borderRadius: 4,
              padding: '12px 14px',
              minHeight: 88,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 12,
                lineHeight: '14px',
                color: '#FFFFFF',
                marginBottom: 6,
              }}
            >
              Purchase price
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 12,
                lineHeight: '16px',
                color: '#FEAE00',
              }}
            >
              {current.purchasePrice}
            </div>
          </div>

          <dl
            style={{
              flex: '1 1 0',
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '6px 12px',
              alignContent: 'center',
              fontFamily: FONT,
              fontSize: 12,
              lineHeight: '14px',
            }}
          >
            <dt style={{ color: '#FFFFFF', fontWeight: 500 }}>Mileage</dt>
            <dd style={{ margin: 0, color: '#FEAE00', fontWeight: 700, textAlign: 'right' }}>{current.mileage}</dd>
            <dt style={{ color: '#FFFFFF', fontWeight: 500 }}>Engine</dt>
            <dd style={{ margin: 0, color: '#FEAE00', fontWeight: 700, textAlign: 'right' }}>{current.engine}</dd>
            <dt style={{ color: '#FFFFFF', fontWeight: 500 }}>Drive</dt>
            <dd style={{ margin: 0, color: '#FEAE00', fontWeight: 700, textAlign: 'right' }}>{current.drive}</dd>
          </dl>
        </div>

        {/* Estimated final cost + MORE DETAILS button (162 × 45, H Medium 12px) */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 14 }}>
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 12, lineHeight: '14px', color: '#949494' }}>
              Estimated final
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 12, lineHeight: '14px', color: '#949494' }}>
              cost to Bulgaria:
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 12, lineHeight: '16px', color: '#FEAE00', marginTop: 6 }}>
              {current.finalCost}
            </div>
          </div>
          <button
            type="button"
            data-testid={`mobile-deal-more-${current.id}`}
            onClick={() => { window.location.href = '/contacts'; }}
            style={{
              flex: '0 0 auto',
              width: 162,
              height: 45,
              padding: '0 16px',
              border: 'none',
              borderRadius: 4,
              background: '#FEAE00',
              color: '#000',
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '14px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            More details
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </article>

      {/* 6 — Pager (130×24) — counter follows real card count 1:1 */}
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          height: 24,
        }}
      >
        <button
          type="button"
          aria-label="Previous"
          onClick={goPrev}
          data-testid="mobile-deals-prev"
          disabled={total <= 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: '1.5px solid #FEAE00',
            background: 'transparent',
            color: '#FEAE00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: total <= 1 ? 'default' : 'pointer',
            opacity: total <= 1 ? 0.4 : 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 14,
            color: '#FFFFFF',
            tabSize: 2,
            minWidth: 56,
            textAlign: 'center',
          }}
        >
          {counter}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={goNext}
          data-testid="mobile-deals-next"
          disabled={total <= 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            border: '1.5px solid #FEAE00',
            background: '#FEAE00',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: total <= 1 ? 'default' : 'pointer',
            opacity: total <= 1 ? 0.4 : 1,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 7 — MORE VEHICLES + (Mazzard H Medium 14) */}
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}>
        <a
          href="/catalog"
          data-testid="mobile-deals-more-vehicles"
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '17px',
            letterSpacing: '0.04em',
            color: '#FEAE00',
            textTransform: 'uppercase',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          More vehicles +
        </a>
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileCarSearch                                                         */
/* Real dropdown filter (mirrors the web HeroFilter behaviour):            */
/*   • Brand:  click → searchable list of CAR_BRANDS.                      */
/*   • Model:  DISABLED until brand is picked, then lists models for it.   */
/*   • Year From / Year To: native <select> 1990 → currentYear+1.          */
/*   • Section sized 360 × 621 (Figma): card never overlaps hero above.    */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileCarSearch({
  filterBrand, setFilterBrand,
  filterModel, setFilterModel,
  yearFrom, setYearFrom,
  yearTo, setYearTo,
  onFindCar,
}) {
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const [openWhich, setOpenWhich] = useState(null);
  const [brandQuery, setBrandQuery] = useState('');
  const rootRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const YEARS = useMemo(() => {
    const out = [];
    for (let y = currentYear + 1; y >= 1990; y--) out.push(String(y));
    return out;
  }, [currentYear]);

  const brandOptions = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    const list = q ? CAR_BRANDS.filter((b) => b.toLowerCase().includes(q)) : CAR_BRANDS;
    return ['Any Brand', ...list];
  }, [brandQuery]);

  const modelOptions = useMemo(() => {
    if (!filterBrand) return [];
    return ['Any model', ...(MODELS_BY_BRAND[filterBrand] || [])];
  }, [filterBrand]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpenWhich(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, []);

  const pickBrand = (b) => {
    setFilterBrand(b === 'Any Brand' ? '' : b);
    setFilterModel('');
    setOpenWhich(null);
    setBrandQuery('');
  };
  const pickModel = (m) => {
    setFilterModel(m === 'Any model' ? '' : m);
    setOpenWhich(null);
  };

  const fieldStyleBase = {
    width: '100%',
    height: 48,
    background: '#000',
    border: '1px solid #2a2a28',
    borderRadius: 6,
    color: '#fff',
    fontFamily: FONT,
    fontSize: 14,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  return (
    <section
      ref={rootRef}
      data-testid="mobile-car-search"
      className="flex justify-center"
      style={{ minHeight: 621, paddingTop: 56, paddingBottom: 56, boxSizing: 'border-box' }}
    >
      <div style={{ width: 328, maxWidth: '100%' }}>
        <h3
          className="text-center uppercase"
          style={{
            color: '#FEAE00',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '28px',
            letterSpacing: '0.04em',
            marginBottom: 28,
          }}
        >
          Car Search
        </h3>

        {/* BRAND */}
        <label style={{ display: 'block', color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Brand
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button
            type="button"
            data-testid="mobile-brand-trigger"
            onClick={() => setOpenWhich(openWhich === 'brand' ? null : 'brand')}
            style={{ ...fieldStyleBase, borderColor: openWhich === 'brand' ? '#FEAE00' : '#2a2a28' }}
          >
            <span style={{ color: filterBrand ? '#fff' : '#7a7a78' }}>{filterBrand || 'All brands'}</span>
            <Caret open={openWhich === 'brand'} />
          </button>

          {openWhich === 'brand' && (
            <div
              data-testid="mobile-brand-panel"
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#0a0a0a', border: '1px solid #FEAE00', borderRadius: 6,
                zIndex: 60, maxHeight: 280, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #2a2a28' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="#7a7a78" strokeWidth="1.6" />
                  <path d="M20 20l-3.5-3.5" stroke="#7a7a78" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  data-testid="mobile-brand-search"
                  type="text"
                  autoFocus
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="Search brand..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: FONT, fontSize: 14 }}
                />
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 230 }}>
                {brandOptions.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => pickBrand(b)}
                    data-testid={`mobile-brand-option-${b}`}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#fff', fontFamily: FONT, fontSize: 14, cursor: 'pointer' }}
                  >
                    {b}
                  </button>
                ))}
                {brandOptions.length === 1 && (
                  <div style={{ padding: '12px 16px', color: '#7a7a78', fontFamily: FONT, fontSize: 13 }}>No brands found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODEL (locked until brand selected) */}
        <label style={{ display: 'block', color: filterBrand ? '#fff' : '#5a5a58', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          Model
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button
            type="button"
            data-testid="mobile-model-trigger"
            disabled={!filterBrand}
            onClick={() => filterBrand && setOpenWhich(openWhich === 'model' ? null : 'model')}
            style={{
              ...fieldStyleBase,
              cursor: filterBrand ? 'pointer' : 'not-allowed',
              opacity: filterBrand ? 1 : 0.5,
              borderColor: openWhich === 'model' ? '#FEAE00' : '#2a2a28',
            }}
          >
            <span style={{ color: filterModel ? '#fff' : '#7a7a78' }}>{filterModel || 'All models'}</span>
            <Caret open={openWhich === 'model'} />
          </button>

          {openWhich === 'model' && filterBrand && (
            <div
              data-testid="mobile-model-panel"
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#0a0a0a', border: '1px solid #FEAE00', borderRadius: 6,
                zIndex: 60, maxHeight: 260, overflowY: 'auto',
              }}
            >
              {modelOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => pickModel(m)}
                  data-testid={`mobile-model-option-${m}`}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', color: '#fff', fontFamily: FONT, fontSize: 14, cursor: 'pointer' }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* YEAR FROM */}
        <label style={{ display: 'block', color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Year</label>
        <YearSelect value={yearFrom} onChange={setYearFrom} placeholder="From" years={YEARS} testid="mobile-year-from" />

        {/* YEAR TO */}
        <label style={{ display: 'block', color: '#fff', fontFamily: FONT, fontSize: 14, fontWeight: 500, marginBottom: 8, marginTop: 16 }}>Year</label>
        <YearSelect value={yearTo} onChange={setYearTo} placeholder="To" years={YEARS} testid="mobile-year-to" />

        {/* FIND A CAR */}
        <button
          type="button"
          onClick={onFindCar}
          data-testid="mobile-find-car"
          style={{
            display: 'block', width: '100%', height: 45, marginTop: 28,
            background: '#FEAE00', color: '#000', border: 'none', borderRadius: 4,
            fontFamily: FONT, fontWeight: 600, fontSize: 14, letterSpacing: '0.06em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Find a car
        </button>
      </div>
    </section>
  );
}

function Caret({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
         style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
      <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function YearSelect({ value, onChange, placeholder, years, testid }) {
  const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  return (
    <div style={{ position: 'relative' }}>
      <select
        data-testid={testid}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: 48, background: '#000', border: '1px solid #2a2a28',
          borderRadius: 6, color: value ? '#fff' : '#7a7a78',
          fontFamily: FONT, fontSize: 14, padding: '0 36px 0 14px',
          appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <option value="">{placeholder}</option>
        {years.map((y) => (<option key={y} value={y}>{y}</option>))}
      </select>
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <Caret open={false} />
      </span>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileCalculateCar — "Calculate a car yourself / with a price guarantee" */
/*                                                                         */
/* Layout (1-to-1 with Figma mobile mock):                                  */
/*   • Outer frame: solid #FEAE00 background, rounded card.                */
/*   • Inner card:  #000 with image at top (Ford F-150, ratio 334.92/188). */
/*   • Title:       "Calculate a car yourself" (orange) +                  */
/*                  "with a price guarantee" (white), Mazzard H Bold 24px. */
/*   • Subtitle:    "From the USA and Korea", H Medium 14px, white.        */
/*   • VIN input:   294 wide, "Search by VIN or lot number", H Medium 14.  */
/*   • CALCULATE:   #FEAE00 button, Helvetica Now Display 14, black text.  */
/*   • ALL CATALOG +: orange underlined link, H Medium 14.                 */
/* ─────────────────────────────────────────────────────────────────────── */
function MobileCalculateCar() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  const FONT_BTN = "'Helvetica Now Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const [vin, setVin] = useState('');

  const submit = (e) => {
    e?.preventDefault?.();
    const q = vin.trim();
    if (q) {
      window.location.href = `/calculator?vin=${encodeURIComponent(q)}`;
    } else {
      window.location.href = '/calculator';
    }
  };

  return (
    <section
      data-testid="mobile-calculate-car"
      style={{
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        background: '#000',
        width: '100%',
      }}
    >
      {/* ── Yellow outer frame — FULL VIEWPORT WIDTH (no black side margins)
       *
       *   Padding: 13 px (left) | 13 px (right) | 55 px (top) | 55 px (bottom)
       *
       *   Inside (top → bottom):
       *     • Image            full inner width × aspect 335 / 188
       *     • Black card       full inner width, content below:
       *         – 39 px top padding to title
       *         – Title (2 lines) Mazzard H Bold 24 px (yellow + white)
       *         – 19 px gap to subtitle
       *         – Subtitle "From the USA and Korea" 14 px white
       *         – flex spacer (lots of black breathing room)
       *         – Search input 317 × 40 (centered, icon 24×24, font 14)
       *         – 42 px gap
       *         – CALCULATE button 294 × 45 (centered, yellow CTA)
       *         – flex spacer
       *         – ALL CATALOG + (centered, underlined yellow)
       *         – 30 px bottom padding
       * ──────────────────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#FEAE00',
          width: '100%',
          boxSizing: 'border-box',
          padding: '55px 13px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Hero image — full inner width, aspect 335 / 188 */}
        <div
          style={{
            width: '100%',
            aspectRatio: '335 / 188',
            overflow: 'hidden',
            lineHeight: 0,
            flexShrink: 0,
          }}
        >
          <img
            src="/mobile/image-93@2x.png"
            alt="Ford pickup ready for delivery"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
            loading="lazy"
          />
        </div>

        {/* Black inner card — full inner width, holds all calculator content */}
        <div
          style={{
            backgroundColor: '#000',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 409,
          }}
        >
          {/* Title block — 39 px top padding, 30 px sides */}
          <div
            style={{
              padding: '39px 30px 0',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 24,
                lineHeight: '28px',
                letterSpacing: '-0.005em',
              }}
            >
              <span style={{ color: '#FEAE00', display: 'block' }}>
                Calculate a car yourself
              </span>
              <span
                style={{
                  color: '#FFFFFF',
                  display: 'block',
                  marginTop: 4,
                }}
              >
                with a price guarantee
              </span>
            </h2>

            {/* Subtitle — 19 px gap from title */}
            <p
              style={{
                margin: '19px 0 0',
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '18px',
                color: '#FFFFFF',
              }}
            >
              From the USA and Korea
            </p>
          </div>

          {/* spacer — lots of black breathing room above the form */}
          <div style={{ flex: 1, minHeight: 60 }} />

          {/* Search input — 317 × 40, centered */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: 317,
              height: 40,
              padding: '0 12px',
              background: 'transparent',
              border: '1px solid #3a3a36',
              borderRadius: 6,
              boxSizing: 'border-box',
              flexShrink: 0,
              maxWidth: 'calc(100% - 18px)',
            }}
          >
            {/* Icon — exact 24 × 24 */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="7" stroke="#9a9a96" strokeWidth="1.7" />
              <path
                d="M20 20l-3.5-3.5"
                stroke="#9a9a96"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <input
              data-testid="mobile-calc-vin"
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(e)}
              placeholder="Search by VIN or lot number"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                /* Helvetica Now Display Regular 14 px (placeholder spec) */
                fontFamily: FONT_BTN,
                fontWeight: 400,
                fontSize: 14,
                lineHeight: '21px',
                minWidth: 0,
              }}
            />
          </div>

          {/* 42 px gap between input and CALCULATE button */}
          <div style={{ height: 42, flexShrink: 0 }} />

          {/* CALCULATE button — 294 × 45, centered yellow CTA */}
          <button
            type="button"
            onClick={submit}
            data-testid="mobile-calc-submit"
            style={{
              display: 'block',
              width: 294,
              height: 45,
              maxWidth: 'calc(100% - 41px)',
              background: '#FEAE00',
              color: '#000',
              border: 'none',
              borderRadius: 6,
              fontFamily: FONT_BTN,
              fontWeight: 600,
              fontSize: 14,
              lineHeight: '18px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Calculate
          </button>

          {/* spacer — pushes ALL CATALOG towards the bottom */}
          <div style={{ flex: 1, minHeight: 60 }} />

          {/* ALL CATALOG + — centered, 30 px bottom padding */}
          <div
            style={{
              padding: '0 0 30px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            <a
              href="/catalog"
              data-testid="mobile-calc-all-catalog"
              style={{
                fontFamily: FONT,
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '18px',
                color: '#FEAE00',
                textTransform: 'uppercase',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
                textDecorationThickness: '1px',
                letterSpacing: '0.06em',
              }}
            >
              All catalog +
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ─────────────────────────────────────────────────────────────────────── */
/* MobileHowWeWork — "HOW WE WORK / WE WORK FOR EACH CLIENT" mobile section
 *
 * Geometry (per Figma DevMode):
 *   • 62 px  top padding (gap from end of Calculator block)
 *   • 63.5 px side padding around the centered title block
 *   • 24 px  gap between "HOW WE WORK" (24 px) and "WE WORK FOR EACH CLIENT
 *            / DEPENDING ON THE BUDGET" (16 px) sub-title
 *   • 17 px  side padding around cards
 *   • 17 px  vertical gap between cards
 *   • 43 px  bottom padding (gap to next section)
 *
 * Cards (3 plans, stacked vertically on mobile):
 *   1. Standard               328 × 279  black bg, yellow border
 *   2. Turnkey [popular]      327 × 274  yellow bg, black text
 *   3. Sourcing + Delivery
 *      + Support              335 × 283  black bg, yellow border, gray desc
 *
 * Description text in cards 2 & 3 uses the gray color #555452.
 * ─────────────────────────────────────────────────────────────────────── */
function MobileHowWeWork() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";
  // Helvetica Now / New Display — corporate body font for cards.
  // Local face is not bundled, so we fall back to Helvetica Neue / Helvetica /
  // Arial which match the metrics closely on iOS/macOS/Android.
  const HELV =
    "'Helvetica Now Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  const PLANS = [
    {
      key: 'standard',
      num: 1,
      tag: 'Standard',
      desc: 'Sourcing, inspection, bidding, purchase,\nand delivery to Bulgaria.',
      accent: 'From there, you handle\neverything yourself.',
      popular: false,
      yellow: false,
    },
    {
      key: 'turnkey',
      num: 2,
      tag: 'Turnkey',
      desc:
        'Full-service with zero involvement\nrequired: sourcing, inspection,\npurchase, delivery, adaptation,\ntechnical inspection, and registration.',
      accent: 'You simply pick up\na ready-to-drive car.',
      popular: true,
      yellow: true,
    },
    {
      key: 'sourcing',
      num: 3,
      tag: 'Sourcing + Delivery\n+ Support',
      desc: 'Sourcing, inspection, purchase, and\ndelivery.',
      accent:
        'You handle registration - we\nconnect you with trusted service\npartners.',
      popular: false,
      yellow: false,
    },
  ];

  return (
    <section
      data-testid="mobile-how-we-work"
      style={{
        padding: '62px 0 0',
        background: '#000',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* ── Title block — 63.5 px side padding, centered ─────────────── */}
      <div
        style={{
          padding: '0 63.5px',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: '28px',
            color: '#FEAE00',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          How we work
        </h2>

        <p
          style={{
            margin: '24px 0 0',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ color: '#FEAE00', display: 'block' }}>
            We work for each client
          </span>
          <span style={{ color: '#FFFFFF', display: 'block', marginTop: 2 }}>
            depending on the budget
          </span>
        </p>
      </div>

      {/* ── Cards — 17 px sides, 17 px gap between (symmetric), 91 px gap from sub-title ─ */}
      <div
        style={{
          marginTop: 91,
          padding: '0 17px',
          display: 'flex',
          flexDirection: 'column',
          gap: 17,
          boxSizing: 'border-box',
        }}
      >
        {PLANS.map((p) => {
          const bg = p.yellow ? '#FEAE00' : '#0E0E0E';
          const border = p.yellow ? 'none' : '1px solid #FEAE00';
          const numColor = p.yellow ? 'rgba(0,0,0,0.55)' : '#FEAE00';
          const titleColor = p.yellow ? '#000000' : '#FEAE00';
          const descColor = p.yellow
            ? '#000000'
            : p.key === 'sourcing'
              ? '#FFFFFF'
              : '#FFFFFF';
          const accentColor = p.yellow ? '#000000' : '#FEAE00';

          return (
            <div
              key={p.key}
              data-testid={`mobile-plan-card-${p.key}`}
              style={{
                background: bg,
                border,
                borderRadius: 0,
                padding: '24px 24px 26px',
                position: 'relative',
                boxSizing: 'border-box',
                fontFamily: FONT,
                /* leather-like noise on dark cards (subtle) */
                backgroundImage: p.yellow
                  ? undefined
                  : 'radial-gradient(circle at 30% 0%, rgba(254,174,0,0.04), transparent 50%)',
              }}
            >
              {/* Top row: [N] number + optional [popular] pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      width: 39,
                      height: 25,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: numColor,
                      fontFamily: FONT,
                      lineHeight: 1,
                      flexShrink: 0,
                      letterSpacing: 0,
                    }}
                  >
                    <span style={{ fontWeight: 400, fontSize: 25, lineHeight: 1 }}>[</span>
                    <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1 }}>{p.num}</span>
                    <span style={{ fontWeight: 400, fontSize: 25, lineHeight: 1 }}>]</span>
                  </span>
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 24,
                      lineHeight: '28px',
                      color: titleColor,
                      whiteSpace: 'pre-line',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {p.tag}
                  </h3>
                </div>

                {p.popular && (
                  <span
                    style={{
                      width: 64,
                      height: 32,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(0,0,0,0.85)',
                      borderRadius: 16,
                      color: '#000000',
                      fontFamily: FONT,
                      fontWeight: 500,
                      fontSize: 12,
                      lineHeight: '14px',
                      textTransform: 'lowercase',
                      letterSpacing: '0.02em',
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    popular
                  </span>
                )}
              </div>

              {/* Description (Helvetica Now/New Display Regular 18) */}
              <p
                style={{
                  margin: '0 0 22px',
                  fontFamily: HELV,
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: '24px',
                  color: descColor,
                  whiteSpace: 'pre-line',
                }}
              >
                {p.desc}
              </p>

              {/* Accent highlight (Helvetica Now/New Display Bold 18) */}
              <p
                style={{
                  margin: 0,
                  fontFamily: HELV,
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: '24px',
                  color: accentColor,
                  whiteSpace: 'pre-line',
                }}
              >
                {p.accent}
              </p>
            </div>
          );
        })}

        {/* ── "Have a question? / Contact us" card ───────────────────────
         * Black bg, yellow border, large rounded corners.
         * Centered: title + sub + two phone numbers (yellow).
         * ──────────────────────────────────────────────────────────── */}
        {/* ── "Have a question? / Contact us" card ───────────────────────
         * Rounded corners (8 px) — the ONLY card with rounding.
         * Spec (Figma DevMode):
         *   • borderRadius 8
         *   • padding: 35 top | 97 sides | 42 bottom
         *   • Have a question?  → Mazzard H Bold 16  (white)
         *   • 22 px gap
         *   • Contact us        → Mazzard H Bold 16  (white)
         *   • 11 px gap
         *   • Phone #1          → Mazzard H Bold 16  (yellow)
         *   • 8 px gap
         *   • Phone #2          → Mazzard H Bold 16  (yellow)
         * ──────────────────────────────────────────────────────────── */}
        <div
          data-testid="mobile-have-a-question"
          style={{
            marginTop: 57, /* 17 (gap) + 57 = 74 px from end of last plan card */
            marginBottom: 43, /* bottom padding to next section */
            background: '#000000',
            border: '1px solid #FEAE00',
            borderRadius: 8,
            padding: '35px 97px 42px',
            textAlign: 'center',
            fontFamily: FONT,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            Have a question?
          </div>

          <div
            style={{
              marginTop: 22,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            Contact us
          </div>

          <a
            href="tel:+359875313158"
            style={{
              marginTop: 11,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FEAE00',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            +359 875 313 158
          </a>

          <a
            href="tel:+359897884804"
            style={{
              marginTop: 8,
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '20px',
              color: '#FEAE00',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            +359 897 884 804
          </a>
        </div>
      </div>
    </section>
  );
}


/* ─────────────────────────────────────────────────────────────────────── */
/* MobileHowToBuyTurnkey — "How to buy a turnkey car" mobile adaptation
 * of the desktop section (`figma_home/components/turnkey-banner1.jsx`).
 * Uses the SAME assets as the web version:
 *   • /figma/image-57@2x.webp  — aerial road background
 *   • /figma/image-65@2x.webp  — Copart logo (94 × 40)
 *   • /figma/image-71@2x.webp  — CARFAX logo (93 × 17)
 *   • /figma/image-73@2x.webp  — IAA logo (51 × 29)
 *   • /figma/image-76@2x.webp  — Manheim logo (118 × 29)
 *   • /figma/image-81@2x.webp  — Encar logo (73 × 24)
 *   • /figma/basil-viber-outline.svg — Viber icon (42 × 42)
 *
 * Mobile geometry (per Figma DevMode @ 368 × 1256):
 *   • 28 px  top padding
 *   • 82 px  side padding around the title (Mazzard H Bold 32)
 *   • Title "How to buy / a turnkey car"
 *   • Aerial photo of a car driving down the road shows through the bg
 *   • "from"          — Mazzard H Bold 14, yellow
 *   • "USA/Korea"     — Mazzard H Bold 32, white
 *   • Auction logos: 2 rows centred on the road
 *   • 5 numbered steps (block 328 × 276):
 *       — yellow numerals "1/" — Mazzard H ExtraBold 20
 *       — white step text      — Mazzard H Bold 20
 *       — 40 px left, 13 px gap, 18 px between items
 *   • "Pick up the car" CTA — 294 × 45, Mazzard H Medium 14, 34/33 pads
 *   • "Join our group and get the hottest offers" — Bold 16, 57/55 pads
 *   • Viber icon 42 × 42, 16 px after caption
 *   • 39 px bottom padding
 * ─────────────────────────────────────────────────────────────────────── */
function MobileHowToBuyTurnkey() {
  const FONT = "'Mazzard', 'Mazzard H', system-ui, -apple-system, sans-serif";

  const STEPS = [
    'We send an application',
    'We discuss the details',
    'We look for a car',
    'We buy and deliver to a\nEuropean port',
    'We clear customs and\ndeliver the car to Bulgaria',
  ];

  // Figma DevMode geometry (card 368 × 1256):
  //   • Title padding-top                = 28
  //   • Title side padding (left/right)  = 82
  //   • Title font-size                  = 32
  //   • USA/Korea: top=412, left=94, width=180 (right edge = 87 from card edge)
  //   • Steps inter-item gap             = 18
  //   • "Join our group" caption — comes AFTER steps
  //   • Viber icon gap from caption      = 16
  //   • "Pick up the car" button gap from caption/icon block = 53
  //   • Pick up the car BUTTON absolute top from card start  = 1023
  //   • Bottom padding                   = 39
  return (
    <section
      data-testid="mobile-how-to-buy-turnkey"
      style={{
        position: 'relative',
        background: '#0A0A0A',
        padding: '28px 0 39px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
        // Total card height per Figma = 1262 px:
        //   button top 1023 + 45 + 53 (gap) + 44 (2-line caption) + 16 (gap)
        //   + 42 (viber) + 39 (bottom padding) = 1262
        minHeight: 1262,
      }}
    >
      {/* ── Aerial road photo as full-bleed background ───────────────── */}
      <img
        src="/figma/image-57@2x.webp"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          height: '100%',
          width: 'auto',
          minWidth: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {/* Top fade so the title remains legible on light asphalt */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          background:
            'linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.55) 60%, rgba(10,10,10,0) 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom fade for the CTA / Join card legibility */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 320,
          background:
            'linear-gradient(0deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.65) 55%, rgba(10,10,10,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Content (above bg) ───────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <h2
          style={{
            margin: 0,
            padding: '0 82px',
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: '36px',
            color: '#FEAE00',
            letterSpacing: '-0.005em',
          }}
        >
          How to buy
          <br />a turnkey car
        </h2>

        {/* Spacer where the car photo of the bg image sits.
           Figma: "from"/USA/Korea block is absolutely positioned at top:412
           from section start (rendered as a direct child of the relative
           section — see below). The flow spacer reserves the same vertical
           space so that the auction-logos row stays at its Figma offset. */}
        <div aria-hidden style={{ height: 345 }} />

        {/* ── Auction logos — real SVG assets, exact Figma positioning ─
             Row 1 (Copart 94×40 · IAAI 51×29 · CARFAX 93×17):
               • Copart  → padding-left  35 px from section edge
               • CARFAX  → padding-right 31 px from section edge
               • IAAI    → centred between (159 / 151), vertically centred
                            with Copart (40 px tall row baseline)
             Row 2 (Manheim 118×30 · Encar 74×22), 33 px below row 1:
               • Manheim → padding-left  43 px
               • Encar   → padding-right 60 px
             Vertical position from section start: 493 px (Figma).
          ────────────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 38 }}>
          {/* Row 1 — fixed 40 px height so all three are vertically centred */}
          <div
            style={{
              padding: '0 31px 0 35px',
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <img
              src="/figma/copart-logo.svg"
              alt="Copart"
              width={94}
              height={40}
              style={{ width: 94, height: 40, display: 'block', flexShrink: 0 }}
            />
            <img
              src="/figma/iaai-logo.svg"
              alt="IAA — Insurance Auto Auctions"
              width={51}
              height={29}
              style={{ width: 51, height: 29, display: 'block', flexShrink: 0 }}
            />
            <img
              src="/figma/carfax-logo.svg"
              alt="CARFAX"
              width={93}
              height={17}
              style={{ width: 93, height: 17, display: 'block', flexShrink: 0 }}
            />
          </div>
          {/* Row 2 — 33 px gap from row 1, fixed 30 px height */}
          <div
            style={{
              marginTop: 33,
              padding: '0 60px 0 43px',
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <img
              src="/figma/manheim-logo.svg"
              alt="Manheim"
              width={118}
              height={30}
              style={{ width: 118, height: 30, display: 'block', flexShrink: 0 }}
            />
            <img
              src="/figma/encar-logo.svg"
              alt="Encar"
              width={74}
              height={22}
              style={{ width: 74, height: 22, display: 'block', flexShrink: 0 }}
            />
          </div>
        </div>

        {/* ── Steps block — 328 × 276 (40 left, 18 gap, 13 num↔text) ── */}
        <div
          style={{
            marginTop: 60,
            padding: '0 20px 0 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxSizing: 'border-box',
          }}
        >
          {STEPS.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 13,
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: 20,
                  lineHeight: '24px',
                  color: '#FEAE00',
                  flexShrink: 0,
                  minWidth: 22,
                }}
              >
                {i + 1}/
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: '24px',
                  color: '#FFFFFF',
                  whiteSpace: 'pre-line',
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* ── "Pick up the car" CTA — absolutely positioned per Figma spec
           top: 1023 px from the section/card start (the road background).
           Width 294 = 361 (card content) − 34 (left pad) − 33 (right pad).
           Height 45, Mazzard H Medium 14, uppercase, amber bg,
           border-radius 16 px. ── */}
      <div
        style={{
          position: 'absolute',
          top: 1023,
          left: 34,
          right: 33,
          zIndex: 3,
        }}
      >
        <Link
          to="/calculator"
          data-testid="mobile-pick-up-the-car"
          style={{
            width: '100%',
            height: 45,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FEAE00',
            border: 'none',
            borderRadius: 16,
            color: '#000000',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '17px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          Pick up the car
        </Link>
      </div>

      {/* ── "Join our group" caption — 53 px BELOW the Pick-up-the-car
           button (button top = 1023, height 45 → text top = 1023+45+53 = 1121).
           Absolutely positioned so it sits AFTER the button per Figma. ── */}
      <div
        data-testid="mobile-join-our-group"
        style={{
          position: 'absolute',
          top: 1023 + 45 + 53,
          left: 0,
          right: 0,
          padding: '0 55px 0 57px',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 16,
          lineHeight: '22px',
          color: '#FFFFFF',
          zIndex: 3,
          boxSizing: 'border-box',
        }}
      >
        Join our group and get the hottest offers
      </div>

      {/* ── Viber icon — 42 × 42, exactly 16 px BELOW the caption.
           Caption (2 lines × 22 px = 44 px) → icon top = 1121 + 44 + 16 = 1181.
           After icon (42 px) → bottom of icon at 1181 + 42 = 1223.
           Section bottom = 1223 + 39 (bottom padding) = 1262 (matches Figma). ── */}
      <div
        data-testid="mobile-viber-icon"
        style={{
          position: 'absolute',
          top: 1023 + 45 + 53 + 44 + 16, // 1181
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3,
        }}
      >
        <a
          href="viber://chat?number=%2B359875313158"
          aria-label="Join our Viber group"
          style={{
            width: 42,
            height: 42,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
          }}
        >
          <img
            src="/figma/basil-viber-outline.svg"
            alt=""
            width={42}
            height={42}
            style={{ display: 'block' }}
          />
        </a>
      </div>

      {/* ── "from / USA/Korea" — absolutely positioned per Figma ──
           • USA/Korea text frame: 180 × 38 px.
           • Top:    412 px from card (section) start — where the car image
                      conceptually begins (per Figma DevMode).
           • Left:    94 px from section edge.
           • Right:   87 px (94 + 180 + 87 = 361 px card content width).
           • "from"   Mazzard H Bold 14 px, #FEAE00, centered, sits directly
                      above USA/Korea.
           • "USA/Korea" Mazzard H Bold 32 px, #FFFFFF, centered, 180 × 38.
           Rendered as a DIRECT child of the relative <section>, therefore
           `top` is measured from the section's padding-box top (= card top).
         ─────────────────────────────────────────────────────────── */}
      <div
        data-testid="mobile-from-usa-korea"
        style={{
          position: 'absolute',
          top: 412,
          left: 94,
          width: 180,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '100%',
            marginBottom: 2,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: '17px',
            color: '#FEAE00',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          from
        </div>
        <h3
          style={{
            margin: 0,
            width: 180,
            height: 38,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: '38px',
            color: '#FFFFFF',
            letterSpacing: '-0.005em',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          USA/Korea
        </h3>
      </div>
    </section>
  );
}
