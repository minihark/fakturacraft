# Fakt 📜🇸🇪

**Tidlös, taktil fakturastudio med inbyggd Swish QR-kod, SIE4-bokföring och ROT/RUT för svenska konsulter, formgivare och enskilda firmor.**

Live App: [https://fakt.apps.harkco.se](https://fakt.apps.harkco.se) *(tidigare fakturacraft)*

---

## Filosofi: Appen ÄR dokumentet

Inga generiska mörka SaaS-paneler eller färgglada dashboard-leksaker. **Fakt** är utformad som ett vackert tryckt arkivdokument på ett skrivbord:
- **Varm papperston & djupt trycksvärta** (`#F7F5F0` papper, `#1A1A1A` bläck, dämpad svensk marinblå accent `#2C4A6E`).
- **Linjerade inmatningsfält** i stället för klumpiga rundade formulärlådor.
- **Tabellsiffror (`tabular-nums`)** och korrekt svensk talformatering med tusentalsavgränsare och kommatecken (`12 450,00 kr`).

---

## Funktioner

- **⚡ Live A4-dokument**: Se exakt hur din faktura ser ut i samma sekund som du redigerar.
- **📁 Lokalt Fakturaarkiv**: Skapa, duplicera, hantera och växla mellan flera fakturor lokalt i din webbläsare. Markera status som *Utkast*, *Skickad* eller *Betald*.
- **📱 Inbyggd Swish QR-kod**: Genererar automatiskt scanningsbara QR-koder enligt Getswish-standarden (mottagarnummer, SEK-belopp och OCR förifyllt).
- **🇪🇺 EU Reverse Charge**: 0% moms med automatiskt infogad lagstadgad Skatteverket/EU-paragraf (*Artikel 196 Momsdirektivet*) samt formatkontroll för EU VAT-nummer.
- **🔨 ROT & RUT Arbete/Material Split**:
  - Full överensstämmelse med Skatteverkets regler: skattereduktion tillämpas enbart på arbetskostnad (30% ROT / 50% RUT).
  - Materialrader faktureras med full 25% moms utan avdrag.
- **🛡️ Svensk regelefterlevnad**:
  - Innehar F-skattsedel
  - Automatisk Luhn Modul-10 OCR-beräkning från fakturanummer med läsbarhetsgruppering (`1024 28`)
  - Bankgiro, Plusgiro, Bankkonto (Clearing/Konto), IBAN/BIC & dröjsmålsränta
- **📂 SIE4-Bokföringsexport**: Balanserat `.si`-verifikat med BAS 2026-kontoplan (1510, 1513, 3001, 3045, 2611, 3740).
- **🖨️ Vektor-utskrift & PDF**: Optimerad A4-utskriftsstil utan webbläsargrafik eller marginalartefakter.
- **🔒 100% Klient-integritet**: All data sparas lokalt via `localStorage`. Inga kunduppgifter eller intäkter lämnar någonsin din enhet.
- **💎 Fakt Pro (99 kr engångsköp / livstidslicens)**:
  - 100% vattenstämpelfritt (ingen 'Skapad med Fakt'-märkning).
  - Obegränsad SIE4-export.
  - Egen företagslogotyp.
  - Noll prenumerationer.

---

## Utveckling & Körning

```bash
# Installera beroenden
npm install

# Starta lokal utvecklingsserver
npm run dev

# Bygg produktionspaket
npm run build

# Starta produktionsserver på port 3000
npm start
```

---

*Harkco Software Studio — Craft, Utility & Independence.*
