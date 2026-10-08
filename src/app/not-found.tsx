import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container not-found">
      <span className="mono">404 / NXDOMAIN</span>
      <Radio size={50} />
      <h1>
        This address
        <br />
        doesn’t <span className="hero-serif">resolve.</span>
      </h1>
      <p>
        Even good networks have a wrong turn.
        <br />
        Let’s get you back to something useful.
      </p>
      <div className="button-row">
        <Link href="/" className="button">
          Back to the network
          <ArrowUpRight size={17} />
        </Link>
        <Link href="/docs" className="button button-secondary">
          Read the docs
        </Link>
      </div>
    </section>
  );
}
