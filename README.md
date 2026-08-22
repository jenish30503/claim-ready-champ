# Warranty Vault

Create a polished, responsive hackathon demo web app called “Warranty Tracker”.

This must be a frontend-only demo. Use sample data stored inside the app. Do not ask me to connect Supabase, a database, login, API, OCR service, email service, or payment.

Build these 7 pages and make every Next/Back/button work:

1. Warranty Vault Dashboard

2. Add Product

3. Product Passport

4. Claim Checkup

5. Missing Evidence Warning

6. Upload Proof

7. Claim Case File

Style:

- Clean modern consumer app.

- Warm white background, dark navy text, teal main buttons.

- Use red only for urgent expiry badges and missing-evidence warnings.

- Make it look good on a laptop for a live demo.

Seed the dashboard with these products:

- Samsung 55-inch QLED TV, value ₹72,990, warranty ends in 18 days, receipt and warranty card available, serial-number photo missing.

- Apple AirPods Pro, value ₹24,900, warranty ends in 142 days, all proof available.

- LG Washing Machine, value ₹38,500, warranty ends in 7 days, receipt available, warranty card and serial-number photo missing.

- Sony WH-1000XM5 Headphones, value ₹29,990, warranty ends in 260 days, all proof available.

Dashboard requirements:

- Heading: “Your Warranty Vault”

- Show total protected value: ₹166,380

- Sort products by nearest warranty expiry.

- Show a red “Expiring soon” badge on the Samsung TV and LG Washing Machine.

- Show a clear “Add product” button.

- Make the Samsung TV card clickable and label it “View passport”.

For the Samsung TV demo path:

- Add Product page: show Invoice/Receipt and Warranty Card as already uploaded sample files. Button: “Extract product details”.

- Product Passport: show Samsung, QLED 55-inch TV, purchase date 9 September 2025, price ₹72,990, warranty end date 8 September 2027. Button: “Save and check claim readiness”.

- Claim Checkup: prefill issue “Display flickering / image issue”, started “3 days ago”, and fault photo/video “Yes”. Button: “Check claim readiness”.

- Missing Evidence Warning: this is the most important page. Show:

  “Your claim is almost ready — 1 item is missing.”

  Checklist:

  ✓ Purchase invoice — Available

  ✓ Warranty card — Available

  ✓ Fault photo/video — Available

  ✕ Product serial-number photo — Missing

  Show this exact highlighted warranty clause:

  “Warranty Requirement 4.2: To process a service claim, the customer must provide a clear photograph of the product serial number label.”

  Explain:

  “Your Samsung TV’s serial-number photo is missing. Add it now to avoid a delayed or rejected claim.”

  Button: “Upload missing proof”.

- Upload Proof: show a mock selected file named “samsung-tv-serial-label.jpg”. Button: “Add to case file”.

- Claim Case File: show title “Your claim case file is ready”, the product, issue, warranty status, all four proof items, the warranty clause, a case-file preview, and a pre-filled email to Samsung Support.

- Include buttons “Download case file PDF”, “Copy claim email”, and “Back to vault”.

- After the proof is added, update the serial-number photo from “Missing” to “Available” on the case-file screen.

- Use success messages after important actions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://claim-ready-champ.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/49903766-49f7-4e41-be46-251970fb8a9e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
