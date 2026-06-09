'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Mail, Clock, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Message sent! We&apos;ll get back to you within 2 hours.');
      setName(''); setEmail(''); setPhone(''); setMessage('');
    }, 800);
  };

  return (
    <section id="contact" className="py-24 px-[6vw] bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-14 items-start max-w-7xl mx-auto">
        <div>
          <div className="section-tag">📞 Get In Touch</div>
          <h3 className="font-syne text-3xl font-extrabold text-navy mb-3">
            Contact <span className="text-electric">Us</span>
          </h3>
          <p className="text-slate-500 text-[15px] leading-[1.7] mb-7">
            Have questions? Need help with your order? We&apos;re here seven days a week.
          </p>

          {[
            { icon: Phone, title: 'Call Us', val: '+92 315 8374442' },
            { icon: MessageCircle, title: 'WhatsApp', val: '+92 315 8374442' },
            { icon: Mail, title: 'Email', val: 'orders@flowx.pk' },
            { icon: Clock, title: 'Working Hours', val: 'Mon – Sat: 7AM – 9PM' },
          ].map((c) => (
            <div
              key={c.title}
              className="flex items-start gap-4 mb-5 p-4 bg-soft rounded-2xl border border-light hover:translate-x-1 hover:shadow transition"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-electric/10 to-flowgreen/8 flex items-center justify-center flex-shrink-0">
                <c.icon size={20} className="text-electric" />
              </div>
              <div>
                <div className="font-bold text-sm text-navy mb-0.5">{c.title}</div>
                <div className="text-slate-500 text-[13px]">{c.val}</div>
              </div>
            </div>
          ))}

          <div className="bg-navy rounded-2xl p-5.5 mt-4">
            <h4 className="font-syne font-bold text-white text-[15px] mb-3.5">💳 Payment Details</h4>
            {[
              ['EasyPaisa', '03158374442'],
              ['JazzCash', '03158374442'],
              ['Bank (HBL)', 'PK54HABB0004007902241303'],
              ['COD', 'Available on all orders'],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-center gap-2.5 py-2.5 ${
                  i < 3 ? 'border-b border-white/[0.07]' : ''
                }`}
              >
                <span className="text-xs text-white/50 w-24 flex-shrink-0">{k}</span>
                <span className="text-xs text-white/85 font-medium break-all">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={send}
          className="bg-white rounded-3xl p-10 border border-light shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
        >
          <h3 className="font-syne text-2xl font-extrabold text-navy mb-6">Send Us a Message</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="field-label-light">Name *</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-light"
              />
            </div>
            <div className="mb-4">
              <label className="field-label-light">Email *</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-light"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="field-label-light">Phone</label>
            <input
              type="tel"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="field-light"
            />
          </div>
          <div className="mb-4">
            <label className="field-label-light">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field-light"
            >
              <option>General Inquiry</option>
              <option>Order Issue</option>
              <option>Subscription Help</option>
              <option>Bulk Order Quote</option>
              <option>Vendor Inquiry</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="field-label-light">Message *</label>
            <textarea
              rows={4}
              placeholder="How can we help you?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="field-light resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-br from-electric to-[#1565C0] rounded-2xl text-white font-syne font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Send Message</>}
          </button>
        </form>
      </div>
    </section>
  );
}
