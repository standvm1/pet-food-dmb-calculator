import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

// ── Email provider integration ────────────────────────────────────────────────
// Replace the body of `submitToProvider` with your actual provider's API call.
//
// Mailchimp example (requires a server-side proxy — Mailchimp blocks direct
// browser POSTs due to CORS):
//   POST /api/mailchimp-subscribe   { email, firstName }
//
// ConvertKit example (works directly from the browser):
//   POST https://api.convertkit.com/v3/forms/{FORM_ID}/subscribe
//   body: { api_key: 'YOUR_KEY', email, first_name: firstName }
//
// Klaviyo: POST https://a.klaviyo.com/client/subscriptions/
// Drip: POST https://api.getdrip.com/v2/{ACCOUNT_ID}/subscribers
// ─────────────────────────────────────────────────────────────────────────────
async function submitToProvider(email: string, firstName: string): Promise<void> {
  // TODO: Replace with real API call
  console.log('Email capture stub:', { email, firstName });
  await new Promise(r => setTimeout(r, 800)); // Simulate network latency
  // Uncomment when ready:
  // await fetch('/api/subscribe', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, firstName }),
  // });
}

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await submitToProvider(email, firstName);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or call us at 909-222-6682.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="email-capture" className="bg-teal-600 rounded-2xl p-6 sm:p-8 text-white">
      <div className="flex items-start gap-3 mb-5">
        <Mail className="w-6 h-6 flex-shrink-0 mt-0.5 opacity-90" />
        <div>
          <h3 className="font-bold text-lg mb-1">Get Free Pet Nutrition Tips</h3>
          <p className="text-teal-100 text-sm leading-relaxed">
            Join pet owners who receive veterinary nutrition insights, food label tips, and seasonal health updates from our team at Atlas Veterinary Hospital. No spam, ever.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="flex items-center gap-3 bg-teal-700 rounded-xl px-5 py-4">
          <CheckCircle className="w-5 h-5 text-teal-200 flex-shrink-0" />
          <div>
            <div className="text-sm font-bold">You're subscribed{firstName ? `, ${firstName}` : ''}!</div>
            <div className="text-xs text-teal-200 mt-0.5">Check your inbox for a welcome message.</div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name (optional)"
              className="sm:w-40 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-teal-700 font-semibold px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? 'Subscribing…' : 'Subscribe Free'}
            </button>
          </div>
          {error && <p className="text-xs text-red-200">{error}</p>}
        </form>
      )}

      <p className="text-xs text-teal-200 mt-3">
        No spam. Unsubscribe any time. By subscribing you agree to receive email communications from Atlas Veterinary Hospital.
      </p>
    </div>
  );
}
