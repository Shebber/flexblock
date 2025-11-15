# Flexblock Shop (ApeChain Prototype)

Web3-Prototyp für **WalletConnect + Ownership-Check + native Zahlung** auf **ApeChain**.
- Frontend: Next.js + wagmi + viem
- Zahlung: native Chain Currency (APE) -> sendTransaction an feste Empfängeradresse
- Ownership-Check: serverseitig via `ownerOf(tokenId)` auf ERC-721
- Deployment: Vercel (serverless)

> **Hinweis (wichtig):** Auf ApeChain ist das **native Gas-/Zahlungsmittel APE**, nicht ETH. 
> Wenn du „ETH“ akzeptieren willst, geht das als **ERC‑20 WETH** (separater Token-Transfer) – das ist *optional* und nicht Teil dieses Minimal-Prototyps.
> Für schnelle Tests empfehlen wir native APE-Zahlung.

## Quick Start
1. ZIP entpacken, Ordner öffnen
2. `cp .env.local.example .env.local` und Variablen anpassen (Wallet-Adresse, RPC, etc.)
3. `npm install`
4. `npm run dev`
5. Browser: http://localhost:3000

## Deploy (Vercel)
- Neues Projekt anlegen, Repo/ZIP importieren
- `.env` Variablen im Vercel Dashboard setzen (gleiche Keys wie in `.env.local.example`)
- Deploy

## Vertrauen/Transparenz (Empfohlen im UI)
- Im Footer Impressum/Adresse + ENS/Chain-Badge
- Anzeigen: Empfängeradresse, Explorer-Link des Payment-Hash
- Optional: Order-Thread in Discord & öffentlich sichtbares Log

## Ordnerstruktur
```
pages/
  index.js            # Landing + Connect + Auswahl
  api/checkOwner.js   # serverseitiger Owner-Check (ERC-721)
  api/logOrder.js     # Minimal-Logging (Konsole)
components/
  WalletConnectButton.js
  PayButton.js
public/
  logo.svg (platzhalter)
```

## Ownership Check
- Serverseitig (Vercel Function)
- Liest `ALLOWED_COLLECTIONS` (optional)
- Prüft `ownerOf(tokenId)` gegen verbundene Wallet

## Zahlung
- `useSendTransaction` (wagmi) sendet **native APE** an `NEXT_PUBLIC_RECIPIENT_ADDRESS`
- Betrag in APE wird im UI eingegeben (z. B. 0.05)

## Sicherheit
- Keine privaten Schlüssel im Frontend
- RPC-URL kommt aus Server-Umgebung
- Für Produktion: Ratenbegrenzung, Signatur/Nonce & echte Datenbank (z. B. Supabase) ergänzen

## Optional später
- WETH (ERC‑20) Payments
- NFT Receipt / Proof-of-Purchase
- Escrow Contract
```solidity
receive() external payable {} // für native APE
```
