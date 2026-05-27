import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Twitter, Linkedin, Facebook } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <section className="bg-agri-navy py-16 md:py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Contact us</h1>
          <p className="mt-4 text-slate-300 max-w-xl mx-auto">
            Partnerships, demos, or support—we respond within one business day.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Get in touch</h2>
              <div className="space-y-5 mb-8">
                <a href="mailto:hello@agrilink.co.ke" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-agri-emerald/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100">
                    <Mail className="w-5 h-5 text-agri-emerald" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Email</div>
                    <div className="font-semibold text-slate-900">hello@agrilink.co.ke</div>
                  </div>
                </a>
                <a href="tel:+254700123456" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-agri-emerald/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100">
                    <Phone className="w-5 h-5 text-agri-emerald" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Phone</div>
                    <div className="font-semibold text-slate-900">+254 700 123 456</div>
                  </div>
                </a>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-agri-emerald" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Office</div>
                    <div className="font-semibold text-slate-900">Westlands Business Park, Nairobi</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-agri-emerald hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-agri-emerald hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-agri-emerald hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm bg-slate-50">
              <h2 className="text-xl font-display font-bold text-slate-900 mb-6">Send a message</h2>
              {submitted ? (
                <p className="text-agri-emerald font-semibold py-8 text-center">
                  Thank you! We&apos;ll get back to you shortly.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-agri-emerald/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-agri-emerald/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                    <input
                      required
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-agri-emerald/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-agri-emerald/30 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-agri-emerald hover:bg-agri-emerald-dark text-white font-bold rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4" /> Send message
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-12 rounded-2xl overflow-hidden border border-slate-200 shadow-lg h-[360px]">
            <iframe
              title="Agri-Link office location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8082!2d36.807!3d-1.267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d7ab53a1%3A0x1b5a8c3e8e8e8e8e!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
