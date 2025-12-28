"use client";

import { useState } from "react";

const faqData = [
  {
    category: "Product & Concept",
    items: [
      {
        q: "What is an NFT Flexblock?",
        a: "An NFT Flexblock is a high-end physical acrylic display, individually minted from an NFT you own. It bridges digital ownership with a tangible design object, preserving full blockchain-based authenticity."
      },
      {
        q: "How does it differ from a standard art print?",
        a: "Unlike mass-produced posters, each NFT Flexblock is a bespoke object linked to a specific on-chain production event. It features gallery-quality materials and a verified connection to your wallet."
      }
    ]
  },
  {
    category: "NFT & Blockchain",
    items: [
      {
        q: "Do I need to own the NFT to order?",
        a: "Yes. We verify on-chain ownership before production begins. Only the current wallet holder can commission a Flexblock for a specific token."
      },
      {
        q: "What is the Flexblock Production Pass?",
        a: "This is a separate NFT minted on ApeChain during manufacturing. It serves as the immutable digital certificate of authenticity for your physical object."
      },
      {
        q: "Which chains are supported?",
       a: "Payment is handled exclusively via ETH on Base for fast and low-cost transactions. After purchase, a Flexblock Production Pass is minted on ApeChain and permanently linked to your order. NFT Flexblock supports EVM-based NFTs from multiple chains, including Ethereum, ApeChain, Base, Optimism, Arbitrum, Polygon, Avalanche, BNB Smart Chain, Blast, Zora, Berachain, Abstract, Somnia and Monad. All steps are fully verifiable on-chain."
      }
    ]
  },
  {
    category: "Production & Design",
    items: [
      {
        q: "What are the dimensions?",
        a: "The standard Flexblock format is 30 × 30 cm (approx. 11.8 × 11.8 inches). The object floats 25mm off the wall when mounted."
      },
      {
        q: "My NFT isn't square. What happens?",
        a: "We use a 'Smart Blur' technique: The artwork is centered and scaled proportionally. The surrounding space is filled with a generated soft blur derived from the artwork's edges, guaranteeing a seamless look."
      },
      {
        q: "What is the function of the backplate?",
        a: "The colored backplate seals the print, houses the NFC chip, and enables the mounting system. Visually, it creates a subtle glow on the wall behind the floating object."
      }
    ]
  },
  {
    category: "Shipping & Verification",
    items: [
      {
        q: "Where do you ship?",
        a: "We ship worldwide. Production typically takes several business days. Tracking is provided via your personal verification page.Please note that for countries outside the EU, customs duties may apply."
      },
      {
        q: "How does NFC verification work?",
        a: "Every Flexblock has an embedded NFC chip. Simply tap your smartphone against the block to open the verification page, which proves the object's authenticity and origin."
      }
    ]
  },
  {
    category: "Support",
    items: [
      {
        q: "Can I cancel my order?",
        a: "Since every NFT Flexblock is a custom-made, one-of-a-kind production triggered by your specific NFT, we cannot accept cancellations once manufacturing has started."
      }
    ]
  }
];

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button 
        className="faq-question" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className="icon">{isOpen ? "−" : "+"}</span>
      </button>
      
      <div 
        className="faq-answer-wrapper" 
        style={{ 
          maxHeight: isOpen ? "200px" : "0px",
          opacity: isOpen ? 1 : 0
        }}
      >
        <div className="faq-answer">
          {answer}
        </div>
      </div>

      <style jsx>{`
        .faq-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          padding: 20px 0;
          color: #e6e9ee;
          font-family: "Barlow Semi Condensed", sans-serif;
          font-size: 18px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: color 0.2s;
        }
        .faq-question:hover {
          color: #5eead4;
        }
        .icon {
          font-size: 24px;
          color: #5eead4;
          margin-left: 15px;
          width: 20px;
          display: flex;
          justify-content: center;
        }
        .faq-answer-wrapper {
          overflow: hidden;
          transition: all 0.3s ease-in-out;
        }
        .faq-answer {
          padding-bottom: 25px;
          color: #9ca3af;
          font-size: 16px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="faq-section">
      <div className="container">
        <h2 className="section-title">FREQUENTLY ASKED QUESTIONS</h2>
        
        <div className="faq-grid">
          {faqData.map((category, index) => (
            <div key={index} className="faq-category">
              <h3>{category.category}</h3>
              <div className="faq-list">
                {category.items.map((item, i) => (
                  <FaqItem key={i} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .faq-section {
          padding: 100px 0;
          background: #0b0d10;
          color: #fff;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .section-title {
          font-family: "Barlow Semi Condensed", sans-serif;
          font-size: 36px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 60px;
          letter-spacing: 1px;
          background: linear-gradient(to right, #fff, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .faq-grid {
          display: grid;
          gap: 50px;
        }
        .faq-category h3 {
          font-family: "Barlow Semi Condensed", sans-serif;
          font-size: 20px;
          color: #5eead4;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          opacity: 0.8;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
        }
        
        @media (max-width: 768px) {
          .section-title { font-size: 28px; }
        }
      `}</style>
    </section>
  );
}