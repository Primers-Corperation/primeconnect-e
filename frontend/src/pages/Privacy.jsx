import React from 'react';
import { Link } from 'react-router-dom';

const H = ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 700, margin: '28px 0 8px' }}>{children}</h2>;

export function Privacy() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--pc-text)' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--pc-text-muted)', margin: '4px 0 0' }}>Effective 10 November 2026 · PrimeConnect (primeconnect.primersgroup.ng)</p>

      <p style={{ marginTop: 20 }}>PrimeConnect is run by Primers Group, Abuja, Nigeria, the data controller. This policy explains what we collect and your rights under the Nigeria Data Protection Act 2023 (NDPA). Questions: primerscorperation@gmail.com, subject “Privacy”.</p>

      <H>What we collect</H>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Your account:</strong> name, email, an encrypted (hashed) password, and a password-reset code (stored only as a hash) when you ask for one.</li>
        <li><strong>Continue with Primers ID:</strong> if you sign in or connect with Primers ID (id.primersgroup.ng), Primers ID confirms your name and verified email and gives us an account number for linking. We never receive your Primers ID password.</li>
        <li><strong>Numbers and messages:</strong> the virtual numbers you rent, the service you rent them for, their status and cost, and the verification codes those numbers receive, so we can show them to you.</li>
        <li><strong>Wallet and payments:</strong> top-ups, charges, balances and transaction history. Card details go straight to Paystack; we never see or store them.</li>
        <li><strong>Withdrawals:</strong> the bank, account number and account name you withdraw to, and the transfer references.</li>
        <li><strong>Support:</strong> messages you send us.</li>
      </ul>

      <H>Why, and our lawful basis</H>
      <ul style={{ paddingLeft: 20 }}>
        <li>Providing numbers, codes, your wallet and withdrawals: contract with you.</li>
        <li>Keeping financial records: legal obligation.</li>
        <li>Security, fraud and abuse prevention: legitimate interest.</li>
      </ul>
      <p>We don&apos;t sell personal data or use it for advertising.</p>

      <H>Who we share it with</H>
      <p>Service providers who run PrimeConnect for us: our virtual number provider (to rent numbers and receive codes), Paystack (payments and transfers), Vercel and Render (hosting), MongoDB Atlas (database), our email provider, and Primers ID if you use it. They act on our instructions or, for payments, under their own regulated terms. Some store data outside Nigeria, under the transfer safeguards the NDPA allows. We disclose data if the law requires it.</p>

      <H>How long we keep it</H>
      <p>Account data is kept while your account is open. Received codes are kept with the rental for up to 90 days. Payment, wallet and withdrawal records are kept for six years, as Nigerian financial and tax law requires. When you ask us to delete your account, we delete or anonymise everything else within 30 days.</p>

      <H>Your rights</H>
      <p>You can ask to access, correct, download or delete your data, object to processing, or withdraw consent, by emailing primerscorperation@gmail.com from your account&apos;s address. We reply within 30 days. You can also complain to the Nigeria Data Protection Commission (ndpc.gov.ng).</p>

      <H>Security</H>
      <p>We use encryption in transit, hashed passwords, hashed reset codes and limited staff access. If a breach is likely to put your rights at risk, we notify the NDPC within 72 hours and tell you without undue delay.</p>

      <H>Acceptable use and children</H>
      <p>Don&apos;t use PrimeConnect numbers for fraud or to break other services&apos; rules. PrimeConnect isn&apos;t for anyone under 18.</p>

      <p style={{ marginTop: 32 }}><Link to="/" style={{ color: 'var(--pc-text)', fontWeight: 600 }}>Back to PrimeConnect</Link></p>
    </div>
  );
}

export default Privacy;
