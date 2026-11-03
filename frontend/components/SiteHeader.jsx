import { Link } from "react-router-dom";

// links: [{ label, to?, active? }]  (sin "to" => enlace vacío "#")
export default function SiteHeader({ links }) {
  return (
    <header>
      <div className="logo">ICLUD</div>
      <nav>
        {links.map((l) =>
          l.to ? (
            <Link key={l.label} to={l.to} className={l.active ? "active" : undefined}>
              {l.label}
            </Link>
          ) : (
            <a key={l.label} href="#" className={l.active ? "active" : undefined} onClick={(e) => e.preventDefault()}>
              {l.label}
            </a>
          )
        )}
      </nav>
    </header>
  );
}
