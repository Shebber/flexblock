'use client';
import { useState } from 'react';

export default function ShippingForm({ onChange }) {
  const [form, setForm] = useState({
    fullName: '',
    street: '',
    city: '',
    zip: '',
    country: '',
  });

  function updateField(key, value) {
    const updated = { ...form, [key]: value };
    setForm(updated);
    onChange(updated);
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>3) Shipping Address</h3>
      <p className="sub" style={{ marginBottom: 16 }}>
        Your Flexblock will be shipped securely and tracked.
      </p>

      <div className="form-grid">
        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
        />

        <input
          placeholder="Street & Number"
          value={form.street}
          onChange={(e) => updateField('street', e.target.value)}
        />

        <div className="row" style={{ gap: 10 }}>
          <input
            placeholder="ZIP"
            style={{ width: 120 }}
            value={form.zip}
            onChange={(e) => updateField('zip', e.target.value)}
          />
          <input
            placeholder="City"
            style={{ flex: 1 }}
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
          />
        </div>

        <input
          placeholder="Country"
          value={form.country}
          onChange={(e) => updateField('country', e.target.value)}
        />
      </div>
    </div>
  );
}
