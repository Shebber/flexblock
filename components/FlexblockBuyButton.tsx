"use client";

import { useState } from "react";
import { useAccount, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther, parseGwei } from "viem";
import { base } from "wagmi/chains";

export function FlexblockBuyButton({ amountEth, orderId, onSuccess }) {
  const { address, isConnected, chain } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();

  const [pending, setPending] = useState(false);

  const RECIPIENT = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS;
  const BASE_CHAIN_ID = base.id; // 8453

  async function sendPayment() {
    //
    // 1. Basic Checks
    //
    if (!isConnected) {
      alert("Please connect your wallet.");
      return;
    }

    if (!RECIPIENT) {
      alert("Missing RECIPIENT wallet address.");
      return;
    }

    if (!amountEth || amountEth <= 0) {
      alert("Invalid payment amount.");
      return;
    }

    //
    // 2. Auto-Switch auf Base (falls User auf der falschen Chain ist)
    //
    try {
      if (chain?.id !== BASE_CHAIN_ID) {
        await switchChainAsync({ chainId: BASE_CHAIN_ID });
      }
    } catch (err) {
      console.error("❌ Chain switch failed:", err);
      alert("Please switch to Base network.");
      return;
    }

    setPending(true);

    try {
      //
      // 3. ETH-Zahlung auf Base senden (mit Fee Cap)
      //
      const txHash = await sendTransactionAsync({
        to: RECIPIENT,
        value: parseEther(String(amountEth)),

        //
        // ⭐ FEE SAFE MODE
        // Auf Base sind die Gaspreise lächerlich niedrig (0.01–0.1 gwei normal).
        // Wir setzen harte Obergrenzen, damit NIE astronomische Fees auftreten.
        //
        maxFeePerGas: parseGwei("1"),        // Safe Cap
        maxPriorityFeePerGas: parseGwei("0.01"),
      });

      //
      // 4. Production Callback (Order speichern)
      //
      if (onSuccess) {
        await onSuccess({ txHash, orderId });
      }

      //
      // 5. Weiterleitung
      //
      window.location.href = `/success?order=${orderId}`;

    } catch (err) {
      console.error("❌ Payment failed:", err);
      
      let msg = err?.shortMessage || err?.message || "Unknown error";

      // MetaMask typisch: "User rejected"
      if (msg.includes("User rejected")) {
        msg = "Payment cancelled.";
      }

      alert("Payment failed: " + msg);
    }

    setPending(false);
  }

  return (
    <button
      disabled={!isConnected || pending}
      onClick={sendPayment}
      className="btn-gradient"
      style={{ width: "100%", padding: "14px", fontSize: "18px" }}
    >
      {pending ? "Processing…" : `Pay ${amountEth} ETH`}
    </button>
  );
}
