import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark, GitHubIcon } from "./brand";
import { REPO } from "@/lib/site";
import { Reveal } from "./ui";

export function CallToAction() {
  return <section className="cta-section container"><Reveal className="cta-panel"><div className="cta-decoration" aria-hidden="true"><BrandMark /><div /><div /><div /></div><div className="eyebrow"><span className="small-dot" />THE NETWORK IS YOURS</div><h2>Make room for<br />a better internet<span>.</span></h2><p>Start with your DNS. Build the rest on your terms.</p><div className="button-row"><Link href="/docs" className="button button-dark">Get started<ArrowUpRight size={18} /></Link><a href={REPO} className="button button-ghost-dark" target="_blank" rel="noopener noreferrer"><GitHubIcon />Explore the source<ArrowUpRight size={16} /></a></div></Reveal></section>;
}
