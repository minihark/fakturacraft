# FakturaCraft ⚡🇸🇪

**Blixtsnabb, högprecis fakturastudio med inbyggd Swish QR-kod för svenska konsulter, frilansare och enskilda firmor.**

Live App: [https://fakturacraft.apps.harkco.se](https://fakturacraft.apps.harkco.se)

---

## Egenskaper & Funktioner

- **⚡ Direkt live-redigering & förhandsgranskning**: Se exakt hur din A4-faktura ser ut i realtid.
- **📱 Inbyggd Swish QR-kod**: Genererar automatiskt scanningsbara QR-koder enligt Getswish-standarden (mottagarnummer, SEK-belopp och OCR förifyllt).
- **🛡️ Svensk regelbundenhet**:
  - Fullt stöd för "Godkänd för F-skatt"
  - Automatisk Luhn Modul-10 OCR-beräkning från fakturanummer
  - Svensk momsdeklaration (25%, 12%, 6%, 0% / omvänd skattskyldighet)
  - Stöd för ROT- och RUT-avdrag (30% / 50% skattereduktion)
  - Bankgiro, Plusgiro, IBAN/BIC & dröjsmålsränta
- **📂 SIE4-Bokföringsexport**: Ladda ner en balanserad `.si`/`.sie`-fil och importera direkt till **Fortnox**, **Bokio**, **Visma** eller **Wint**.
- **🔒 100% Klient-integritet**: All data sparas lokalt i webbläsaren via `localStorage`. Inga kunduppgifter eller intäkter skickas till externa servrar.
- **💎 Direkt monetisering (Noll annonser)**:
  - Gratisläge för snabba fakturor med diskret vattenstämpel.
  - **FakturaCraft Pro (99 kr engångsköp / livstid)**: Ta bort vattenstämpel, obegränsad SIE4-export, egen företagslogotyp och lokalt kundregister. Inga prenumerationer!

---

## Utveckling & Körning

```bash
# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev

# Bygg produktionspaket
npm run build

# Starta produktionsserver på port 3000
npm start
```

---

*Harkco Software Studio — Craft, Utility & Independence.*
