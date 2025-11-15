'use client';
import { useState } from 'react';
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

export default function PayButton({ recipient }) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('0.05');

  // ensure chain switching
  const { switchChainAsync } = useSwitchChain();

  const {
    data: hash,
    sendTransactionAsync,
    isPending,
    error,
  } = useSendTransaction();

  async function handlePay() {
    if (!isConnected) return;

    try {
      // 1) force chain: ApeChain (33139)
      await switchChainAsync({ chainId: 33139 });

      // 2) send APE
      await sendTransactionAsync({
        to: recipient,
        value: parseEther(amount),
      });
    } catch (err) {
      console.error("Payment failed:", err);
    }
  }

  return (
    <div className="pay">
      <label>Amount ({process.env.NEXT_PUBLIC_SYMBOL || 'APE'})</label>

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.05"
      />

      <button
        disabled={!isConnected || isPending}
        onClick={handlePay}
      >
        {isPending ? 'Sending…' : `Pay ${amount} ${process.env.NEXT_PUBLIC_SYMBOL || 'APE'}`}
      </button>

      {hash && (
        <p>
          Tx:{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || '#'}tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            {hash}
          </a>
        </p>
      )}

      {error && <p style={{ color: 'salmon' }}>{error.message}</p>}

      <style jsx>{`
        .pay {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }
        input {
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #333;
          background: #0f0f0f;
          color: #fff;
        }
        button {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #333;
          background: #1a1a1a;
          color: #fff;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        a {
          color: #00e5ff;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
