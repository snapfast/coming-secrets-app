import Link from "next/link";

export default function Header() {
  return (
    <div className="text-center mb-12">

      {/* Brand Title */}
      <h1 className="cs-brand-title">
        COMINGS{" "}
        <span className="cs-brand-animated">
          SECRETS
        </span>
      </h1>

      {/* Navigation Links */}
      <div className="cs-nav-container">
        <nav className="cs-nav-list">
          <Link
            href="/"
            className="cs-nav-link"
          >
            Create Secret
          </Link>
          <Link
            href="/profile"
            className="cs-nav-link"
          >
            My Secrets
          </Link>
        </nav>
      </div>

      {/* Brand Subtitle */}
      <p className="cs-brand-subtitle">
        Send time-locked messages that can only be opened on a{" "}
        <span className="cs-brand-accent">
          comings
        </span>{" "}
        date
      </p>
    </div>
  );
}