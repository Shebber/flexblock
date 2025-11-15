'use client';

export default function BackplateSelector({ selected, onSelect }) {
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Crimson', hex: '#b11226' },
    { name: 'Aqua', hex: '#00e5ff' },
    { name: 'Mint', hex: '#5affc8' },
    { name: 'Gold', hex: '#d3b24d' },
    { name: 'Orange', hex: '#ff9e29' },
    { name: 'Emerald', hex: '#2cdd88' },
    { name: 'Purple', hex: '#8f3fff' },
    { name: 'Blue', hex: '#3485ff' },
    { name: 'Lilac', hex: '#c9afff' },
    { name: 'Rose', hex: '#ff6f91' },
    { name: 'Sky', hex: '#8fd7ff' },
    { name: 'Green', hex: '#1bb34a' },
    { name: 'Sand', hex: '#d8c39f' },
    { name: 'Steel', hex: '#8896a5' },
    { name: 'Graphite', hex: '#1b1c20' },
    { name: 'Solar', hex: '#ffd900' },
    { name: 'Bubblegum', hex: '#ff82c3' },
    { name: 'Cyan', hex: '#00c3ff' }
  ];

  return (
    <section className="backplate-section">
      <h2>Choose your Backplate Color</h2>
      <p className="sub">
        Match your NFT’s palette — 20 curated colors for a unique final look.
      </p>

      <div className="color-grid">
        {colors.map((c) => (
          <div
            key={c.name}
            className={
              'color-swatch ' +
              (selected === c.hex ? 'selected' : '')
            }
            style={{ background: c.hex }}
            onClick={() => onSelect(c.hex)}
            title={c.name}
          >
            <span className="color-label">{c.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
