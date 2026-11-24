import { Link } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext.tsx';

interface PageHeroProps {
  kicker: string;
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
  footerTag?: string;
  showActions?: boolean;
}

export function PageHero({
  kicker,
  title,
  subtitle,
  image,
  imageAlt,
  footerTag = 'BEAUTY • MAKEUP • MEHENDI',
  showActions = true,
}: PageHeroProps) {
  const { openEnquiryModal } = useFirebase();

  return (
    <section className="page-hero" aria-labelledby="page-title">
      <div className="page-hero__glow" />
      <div className="page-hero__copy">
        <p className="page-kicker">
          {kicker}
          <span />
        </p>
        <h1 id="page-title">{title}</h1>
        <p>{subtitle}</p>
        {showActions && (
          <div className="page-hero__actions">
            <button
              type="button"
              onClick={() => openEnquiryModal()}
              className="button button-primary"
            >
              Enquire Now <span>→</span>
            </button>
            <Link className="text-link" to="/courses">
              Explore courses <span>↗</span>
            </Link>
          </div>
        )}
      </div>
      {image && (
        <div className="page-hero__visual">
          <img
            src={image}
            alt={imageAlt || "Amreen's Academy beauty education and training visual"}
            loading="eager"
            fetchPriority="high"
            referrerPolicy="no-referrer"
          />
          <span className="page-hero__visual-ring" />
        </div>
      )}
      <div className="page-hero__footer">
        <span>AMREEN&#39;S ACADEMY</span>
        <span>{footerTag}</span>
      </div>
    </section>
  );
}
