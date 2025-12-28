// pages/faq.js
import Head from "next/head";
import Link from "next/link";
import FaqSection from "../components/FaqSection";

export default function FAQPage() {
  return (
    <>
      <Head>
        <title>FAQ — NFT Flexblock</title>
        <meta
          name="description"
          content="Frequently asked questions about NFT Flexblock: payments, production, verification, mounting, and backplate color selection."
        />
      </Head>

      <main className="legal-page">
        <header className="legal-head">
          <h1 className="legal-title">FAQ</h1>
          <p className="legal-sub">
            Answers to the most common questions about NFT Flexblock.
          </p>
        </header>

        {/* Dein bestehender Component-Block */}
        <FaqSection />

        <div className="legal-back">
          <Link href="/" className="legal-link">
            ← Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
