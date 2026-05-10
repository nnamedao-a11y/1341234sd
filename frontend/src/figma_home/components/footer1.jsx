import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BUTTON1 from "./b-u-t-t-o-n1";
import { useGetInTouch } from "../../components/public/GetInTouchModal";
import { usePolicyModal } from "../../components/public/PolicyModal";
import { useLang } from "../../i18n";
import styles from "./footer1.module.css";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";
const SITE_INFO_CACHE = "__bibi_site_info_promise__";

function fetchSiteInfo() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!window[SITE_INFO_CACHE]) {
    window[SITE_INFO_CACHE] = axios
      .get(`${API_URL}/api/site-info`)
      .then((r) => r.data)
      .catch(() => null);
  }
  return window[SITE_INFO_CACHE];
}

const FOOTER_T = {
  en: {
    phoneLabel: "Phone number:",
    addressLabel: "Address:",
    workingHours: "Working hours",
    viberLabel: "Join our group and get the hottest offers:",
    socialLabel: "Social media:",
    copyright: "All right reserved. BIBI CARS",
    conditions: "Conditions",
    privacy: "Privacy Policy",
    cookies: "Cookies",
    credit: "/ Website design - O.la /",
    cta: "Get in touch",
    menu: { catalog: "CATALOG", calculator: "CALCULATOR", about: "ABOUT US", blog: "BLOG" },
    defaultHours: "Mon - Fri, 10.00 - 19.00",
    evaxCredit: "/ Website made with Eva-X /",
  },
  bg: {
    phoneLabel: "Телефонен номер:",
    addressLabel: "Адрес:",
    workingHours: "Работно време",
    viberLabel: "Присъединете се към нашата група и получете най-горещите оферти:",
    socialLabel: "Социални мрежи:",
    copyright: "Всички права запазени. BIBI CARS",
    conditions: "Общи условия",
    privacy: "Политика за поверителност",
    cookies: "Бисквитки",
    credit: "/ Дизайн на сайта - O.la /",
    cta: "Свържете се с нас",
    menu: { catalog: "КАТАЛОГ", calculator: "КАЛКУЛАТОР", about: "ЗА НАС", blog: "БЛОГ" },
    defaultHours: "Пн - Пт, 10.00 - 19.00",
    evaxCredit: "/ Сайтът е създаден с Eva-X /",
  },
};

const Footer1 = ({ className = "" }) => {
  const { open } = useGetInTouch();
  const { open: openPolicy } = usePolicyModal();
  const { lang } = useLang();
  const T = lang === "bg" ? FOOTER_T.bg : FOOTER_T.en;
  const [siteInfo, setSiteInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchSiteInfo().then((d) => {
      if (!cancelled) setSiteInfo(d);
    });
    return () => { cancelled = true; };
  }, []);

  const phones = useMemo(() => {
    const fromFooter = (siteInfo?.footer?.contacts?.phones || []).filter(Boolean);
    if (fromFooter.length) return fromFooter;
    return ["+359 875 313 158", "+359 897 884 804"];
  }, [siteInfo]);

  const addresses = useMemo(() => {
    const list = (siteInfo?.footer?.contacts?.addresses || []).filter(Boolean);
    if (list.length) return list;
    return [
      "Bulgaria, Sofia, Dragalevtsi, Vitosha Blvd. No. 230",
      "Bulgaria, Sofia, Bulgaria Blvd., No. 81",
    ];
  }, [siteInfo]);

  const workingHours =
    siteInfo?.footer?.contacts?.working_hours || T.defaultHours;

  const viber = siteInfo?.footer?.viber_community || {};
  const showViber = viber.enabled !== false && viber.url;

  // Viber label is admin-managed (per-language) with a sensible i18n fallback.
  const viberLabel = (lang === "bg"
    ? (viber.label_bg || viber.label_en)
    : (viber.label_en || viber.label_bg)) || T.viberLabel;

  // Helper for socials
  const socialUrl = (k) => {
    const raw = siteInfo?.footer?.socials?.[k];
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    if (raw.enabled === false) return "";
    return raw.url || "";
  };

  return (
    <section className={[styles.footer, className].join(" ")}>
      <div className={styles.footerContent}>
        <div className={styles.footerTop}>
          <section className={styles.bibiLogo021Parent}>
            <img
              className={styles.bibiLogo021Icon}
              width={427}
              height={145.9}
              sizes="100vw"
              alt=""
              src="/figma/BiBi-logo-02-1.svg"
            />
            <div className={styles.contactDetails}>
              <div className={styles.contactColumn}>
                <div className={styles.phoneInfo}>
                  <div className={styles.phoneNumber}>{T.phoneLabel}</div>
                  <div className={styles.phoneNumber2}>
                    {phones.map((p, i) => (
                      <span key={p}>
                        <a
                          href={`tel:${p.replace(/\s+/g, "")}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {p}
                        </a>
                        {i < phones.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.buttonWrapper}>
                  <BUTTON1
                    property1="Default"
                    cONTACTUS={T.cta}
                    showBUTTON
                    bUTTONBackgroundColor="#feae00"
                    bUTTONWidth="171px"
                    bUTTONBorder="none"
                    bUTTONAlignSelf="unset"
                    cONTACTUSColor="#000"
                    cONTACTUSTextTransform="unset"
                    onClick={() => open()}
                  />
                </div>
              </div>
            </div>
          </section>
          <section className={styles.servicesLink}>
            <div className={styles.serviceLinks}>
              <div className={styles.footerLinks}>
                <div className={styles.linkColumn}>
                  <div className={styles.footerLinksColumn}>
                    <Link to="/catalog" className={styles.catalog} style={{ color: "inherit", textDecoration: "none" }}>
                      <h3 className={styles.catalog} style={{ margin: 0 }}>{T.menu.catalog}</h3>
                    </Link>
                    <Link to="/calculator" className={styles.catalog} style={{ color: "inherit", textDecoration: "none" }}>
                      <h3 className={styles.catalog} style={{ margin: 0 }}>{T.menu.calculator}</h3>
                    </Link>
                    <Link to="/about" className={styles.catalog} style={{ color: "inherit", textDecoration: "none" }}>
                      <h3 className={styles.catalog} style={{ margin: 0 }}>{T.menu.about}</h3>
                    </Link>
                    <Link to="/blog" className={styles.catalog} style={{ color: "inherit", textDecoration: "none" }}>
                      <h3 className={styles.catalog} style={{ margin: 0 }}>{T.menu.blog}</h3>
                    </Link>
                  </div>
                  <div className={styles.addressDetails}>
                    <div className={styles.addressInfo}>
                      <div className={styles.addressColumn}>
                        <div className={styles.address}>{T.addressLabel}</div>
                      </div>
                      <div className={styles.fullAddress}>
                        <h2 className={styles.bulgariaSofiaDragalevtsi}>
                          {addresses.map((a, i) => (
                            <span key={a}>
                              {a}
                              {i < addresses.length - 1 && <br />}
                            </span>
                          ))}
                        </h2>
                        <div className={styles.workingHoursMon}>
                          {T.workingHours}: {workingHours}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.socialColumn}>
                {showViber && (
                  <div className={styles.socialInfo}>
                    <div className={styles.socialLabel}>
                      <div className={styles.viberLabelText}>{viberLabel}</div>
                      <a href={viber.url} aria-label="Viber community" target="_blank" rel="noreferrer noopener" data-testid="footer-viber-link">
                        <img
                          className={styles.basilviberOutlineIcon}
                          width={45}
                          height={45}
                          sizes="100vw"
                          alt=""
                          src="/figma/basil-viber-outline.svg"
                        />
                      </a>
                    </div>
                  </div>
                )}
                <div className={styles.socialIcons}>
                  <div className={styles.socialMediaLabel}>{T.socialLabel}</div>
                  <div className={styles.mediaIcons}>
                    {socialUrl("instagram") && (
                      <a href={socialUrl("instagram")} target="_blank" rel="noreferrer noopener" aria-label="Instagram" data-testid="footer-social-instagram">
                        <img
                          className={styles.riinstagramLineIcon}
                          loading="lazy"
                          width={32}
                          height={32}
                          sizes="100vw"
                          alt=""
                          src="/figma/ri-instagram-line.svg"
                        />
                      </a>
                    )}
                    {socialUrl("facebook") && (
                      <a href={socialUrl("facebook")} target="_blank" rel="noreferrer noopener" aria-label="Facebook" data-testid="footer-social-facebook">
                        <img
                          className={styles.riinstagramLineIcon}
                          loading="lazy"
                          width={32}
                          height={32}
                          sizes="100vw"
                          alt=""
                          src="/figma/ic-twotone-facebook.svg"
                        />
                      </a>
                    )}
                    {socialUrl("telegram") && (
                      <a href={socialUrl("telegram")} target="_blank" rel="noreferrer noopener" aria-label="Telegram" data-testid="footer-social-telegram">
                        <img
                          className={styles.riinstagramLineIcon}
                          loading="lazy"
                          width={32}
                          height={32}
                          sizes="100vw"
                          alt=""
                          src="/figma/ic-round-telegram.svg"
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className={styles.footerBottom}>
        <div className={styles.copyrightInfo}>
          <img
            className={styles.antDesigncopyrightCircleOuIcon}
            width={18}
            height={18}
            sizes="100vw"
            alt=""
            src="/figma/ant-design-copyright-circle-outlined.svg"
          />
          <div className={styles.allRightReserved}>2026. {T.copyright}</div>
        </div>
        <div className={styles.companyInfo}>
          <div className={styles.vatBg206637283Parent}>
            <div className={styles.conditions}>VAT BG206637283</div>
            <div className={styles.conditions}>ID 206637283</div>
            <div className={styles.pmAutoGroup}>
              PM AUTO GROUP LTD
              <br />
            </div>
            <div className={styles.policyLinks}>
              <button
                type="button"
                className={`${styles.conditions} ${styles.policyLinkBtn}`}
                onClick={() => openPolicy("conditions")}
                data-testid="footer-policy-conditions"
              >
                {T.conditions}
              </button>
              <button
                type="button"
                className={`${styles.conditions} ${styles.policyLinkBtn}`}
                onClick={() => openPolicy("privacy")}
                data-testid="footer-policy-privacy"
              >
                {T.privacy}
              </button>
              <button
                type="button"
                className={`${styles.conditions} ${styles.policyLinkBtn}`}
                onClick={() => openPolicy("cookies")}
                data-testid="footer-policy-cookies"
              >
                {T.cookies}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.websiteCredits}>
          <a
            href="https://www.olhalazarieva.com"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.websiteDesign}
            data-testid="footer-credit-design"
          >
            {T.credit}
          </a>
          <a
            href="https://www.eva-x.cx.com"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.websiteDesign}
            data-testid="footer-credit-evax"
          >
            {T.evaxCredit}
          </a>
        </div>
      </footer>
    </section>
  );
};

export default Footer1;
