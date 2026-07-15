import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, CheckCircle, Loader2, Send } from 'lucide-react';

const CLINIC = {
  name: 'Atlas Veterinary Hospital',
  address: '3744 Towne Center Drive',
  city: 'La Verne, CA 91750',
  phone: '909-222-6682',
  email: 'info@atlasveterinaryhospital.com',
  mapUrl: 'https://maps.google.com/?q=3744+Towne+Center+Drive,+La+Verne,+CA+91750',
  hours: [
    { day: 'Monday – Thursday', time: '12:00 PM – 10:00 PM' },
    { day: 'Friday', time: 'Closed' },
    { day: 'Saturday', time: '3:00 PM – 10:00 PM' },
    { day: 'Sunday', time: '10:00 AM – 6:00 PM' },
  ],
};

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const up = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) return;
    setStatus('loading');
    try {
      const res = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, firstName: form.firstName }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact &amp; Subscribe | Atlas Veterinary Hospital</title>
        <meta name="description" content="Contact Atlas Veterinary Hospital in La Verne, CA and subscribe for free pet nutrition tips from our veterinary team." />
      </Helmet>

      {/* Header */}
      <div className="bg-teal-600 border-b border-teal-700">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-white">Contact &amp; Subscribe</h1>
          <p className="text-teal-100 mt-2 text-sm">Reach our team or sign up for free pet nutrition tips</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Subscribe form */}
        <div className="bg-teal-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-start gap-3 mb-5">
            <Mail className="w-6 h-6 flex-shrink-0 mt-0.5 opacity-90" />
            <div>
              <h2 className="font-bold text-xl mb-1">Subscribe Free</h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                Join pet owners who receive veterinary nutrition insights, food label tips, and seasonal health updates from our team. No spam, ever.
              </p>
            </div>
          </div>

          {status === 'success' ? (
            <div className="flex items-center gap-3 bg-teal-700 rounded-xl px-5 py-4">
              <CheckCircle className="w-5 h-5 text-teal-200 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm">You're subscribed{form.firstName ? `, ${form.firstName}` : ''}!</div>
                <div className="text-xs text-teal-200 mt-0.5">Check your inbox for a welcome message from Atlas Veterinary.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => up('firstName', e.target.value)}
                  placeholder="First name (optional)"
                  className="sm:w-44 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => up('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-semibold px-5 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm disabled:opacity-70 whitespace-nowrap"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe Free'}
                </button>
              </div>
              {status === 'error' && (
                <p className="text-xs text-red-200">Something went wrong — please try again or call us at {CLINIC.phone}.</p>
              )}
              <p className="text-xs text-teal-200">No spam. Unsubscribe any time.</p>
            </form>
          )}
        </div>

        {/* Contact info + map */}
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Contact details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg">{CLINIC.name}</h2>

            <a
              href={CLINIC.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 group"
            >
              <div className="p-2 bg-teal-50 rounded-lg flex-shrink-0">
                <MapPin className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-teal-600 transition-colors">{CLINIC.address}</div>
                <div className="text-sm text-gray-500">{CLINIC.city}</div>
                <div className="text-xs text-teal-600 mt-0.5 group-hover:underline">Get directions →</div>
              </div>
            </a>

            <a href={`tel:${CLINIC.phone.replace(/-/g, '')}`} className="flex items-center gap-3 group">
              <div className="p-2 bg-teal-50 rounded-lg flex-shrink-0">
                <Phone className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-teal-600 transition-colors">{CLINIC.phone}</div>
                <div className="text-xs text-gray-400">Call or text</div>
              </div>
            </a>

            <a href={`mailto:${CLINIC.email}`} className="flex items-center gap-3 group">
              <div className="p-2 bg-teal-50 rounded-lg flex-shrink-0">
                <Mail className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-teal-600 transition-colors break-all">{CLINIC.email}</div>
                <div className="text-xs text-gray-400">General inquiries</div>
              </div>
            </a>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-gray-900 text-lg">Hours</h2>
            </div>
            <div className="space-y-2">
              {CLINIC.hours.map(h => (
                <div key={h.day} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{h.day}</span>
                  <span className={`font-medium ${h.time === 'Closed' ? 'text-gray-400' : 'text-gray-900'}`}>{h.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                For after-hours emergencies, please contact your nearest 24-hour veterinary emergency clinic.
              </p>
            </div>
          </div>
        </div>

        {/* Embedded Google Map */}
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <iframe
            title="Atlas Veterinary Hospital location"
            src="https://maps.google.com/maps?q=3744+Towne+Center+Drive,+La+Verne,+CA+91750&output=embed"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>

      </div>
    </>
  );
}
