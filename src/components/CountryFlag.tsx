import type { ReactElement } from "react";

interface CountryFlagProps {
  code: string;
  className?: string;
}

export default function CountryFlag({ code, className = "h-3 w-4.5" }: CountryFlagProps): ReactElement {
  const c = code.toLowerCase();

  const renderFlag = () => {
    switch (c) {
      case "en":
      case "gb":
      case "uk":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v40H0z" fill="#012169" />
            <path d="M0 0l60 40m0-40L0 40" stroke="#fff" strokeWidth="7" />
            <path d="M0 0l30 20M60 40l-30-20" stroke="#C8102E" strokeWidth="2.4" />
            <path d="M60 0l-30 20M0 40l30-20" stroke="#C8102E" strokeWidth="2.4" />
            <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="11" />
            <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="6.6" />
          </svg>
        );

      case "tr":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v40H0z" fill="#E30A17" />
            <circle cx="21" cy="20" r="10" fill="#fff" />
            <circle cx="23.5" cy="20" r="8" fill="#E30A17" />
            <polygon
              points="28.00,20.00 31.45,18.88 31.45,15.24 33.59,18.18 37.05,17.06 34.91,20.00 37.05,22.94 33.59,21.82 31.45,24.76 31.45,21.12"
              fill="#fff"
            />
          </svg>
        );

      case "es":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v10H0z" fill="#AA151B" />
            <path d="M0 10h60v20H0z" fill="#F1BF00" />
            <path d="M0 30h60v10H0z" fill="#AA151B" />
            <g transform="translate(13, 14) scale(0.7)">
              <path d="M0 2h12v7c0 4-6 7-6 7s-6-3-6-7V2z" fill="#AA151B" stroke="#800" strokeWidth="0.5" />
              <path d="M3 4h6v5H3z" fill="#F1BF00" />
              <path d="M6 0l2 2H4z" fill="#F1BF00" />
            </g>
          </svg>
        );

      case "zh":
      case "cn":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v40H0z" fill="#DE2910" />
            <polygon
              points="10.00,4.00 11.35,8.14 15.71,8.15 12.19,10.71 13.53,14.85 10.00,12.30 6.47,14.85 7.81,10.71 4.29,8.15 8.65,8.14"
              fill="#FFDE00"
            />
            <polygon
              points="18.29,5.03 19.23,3.93 18.49,2.69 19.83,3.25 20.78,2.16 20.66,3.60 21.99,4.18 20.58,4.51 20.45,5.95 19.70,4.71"
              fill="#FFDE00"
            />
            <polygon
              points="22.02,8.28 23.32,7.64 23.12,6.20 24.13,7.24 25.44,6.61 24.76,7.89 25.77,8.93 24.34,8.69 23.66,9.97 23.45,8.54"
              fill="#FFDE00"
            />
            <polygon
              points="22.08,13.45 23.53,13.39 23.93,12.00 24.43,13.36 25.88,13.31 24.74,14.21 25.23,15.57 24.03,14.77 22.88,15.66 23.28,14.26"
              fill="#FFDE00"
            />
            <polygon
              points="18.44,16.75 19.80,17.26 20.71,16.13 20.64,17.58 22.00,18.09 20.60,18.48 20.53,19.93 19.73,18.72 18.33,19.10 19.23,17.96"
              fill="#FFDE00"
            />
          </svg>
        );

      case "ru":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v13.33H0z" fill="#fff" />
            <path d="M0 13.33h60v13.34H0z" fill="#0039A6" />
            <path d="M0 26.67h60v13.33H0z" fill="#D52B1E" />
          </svg>
        );

      case "fil":
      case "ph":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v20H0z" fill="#0038A8" />
            <path d="M0 20h60v20H0z" fill="#CE1126" />
            <polygon points="0,0 34.64,20 0,40" fill="#fff" />
            <circle cx="11" cy="20" r="3.8" fill="#FCD116" />
            <g stroke="#FCD116" strokeWidth="1.2">
              <line x1="11" y1="13.5" x2="11" y2="26.5" />
              <line x1="4.5" y1="20" x2="17.5" y2="20" />
              <line x1="6.4" y1="15.4" x2="15.6" y2="24.6" />
              <line x1="6.4" y1="24.6" x2="15.6" y2="15.4" />
            </g>
            <polygon
              points="5.00,5.00 5.45,6.38 6.90,6.38 5.73,7.24 6.18,8.62 5.00,7.77 3.82,8.62 4.27,7.24 3.10,6.38 4.55,6.38"
              fill="#FCD116"
            />
            <polygon
              points="5.00,31.00 5.45,32.38 6.90,32.38 5.73,33.24 6.18,34.62 5.00,33.77 3.82,34.62 4.27,33.24 3.10,32.38 4.55,32.38"
              fill="#FCD116"
            />
            <polygon
              points="29.00,20.00 27.62,20.45 27.62,21.90 26.76,20.73 25.38,21.18 26.23,20.00 25.38,18.82 26.76,19.27 27.62,18.10 27.62,19.55"
              fill="#FCD116"
            />
          </svg>
        );

      case "id":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v20H0z" fill="#CE1126" />
            <path d="M0 20h60v20H0z" fill="#fff" />
          </svg>
        );

      case "ua":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v20H0z" fill="#0057B7" />
            <path d="M0 20h60v20H0z" fill="#FFD700" />
          </svg>
        );

      case "in":
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v13.33H0z" fill="#FF9933" />
            <path d="M0 13.33h60v13.34H0z" fill="#fff" />
            <path d="M0 26.67h60v13.33H0z" fill="#138808" />
            <circle cx="30" cy="20" r="4.5" fill="none" stroke="#000080" strokeWidth="0.8" />
            <circle cx="30" cy="20" r="1" fill="#000080" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 60 40" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 0h60v40H0z" fill="#94A3B8" />
            <text x="30" y="24" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">
              {c.toUpperCase().slice(0, 2)}
            </text>
          </svg>
        );
    }
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)] ${className}`}
      aria-hidden="true"
    >
      {renderFlag()}
    </span>
  );
}
