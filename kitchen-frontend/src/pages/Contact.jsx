import { useState, useEffect } from "react";
import { API } from "../api";
import { useToast } from "../context/ToastContext";
import { FiPhone, FiMessageCircle, FiMail, FiFacebook, FiInstagram, FiYoutube, FiLinkedin } from "react-icons/fi";

const PHONE = "";
const WHATSAPP = "";

export default function Contact() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contact — Makewin";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Call, WhatsApp or email Makewin. Get a catalogue tailored to your pin code.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          phone: ""
        }),
      });

      if (response.ok) {
        setSent(true);
        toast.success("Message sent successfully");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Error sending message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Makewin, I'd like a catalogue.")}`;

  return (
    <div className="min-h-screen bg-cream">
      <section className="pt-40 pb-12 mx-auto max-w-6xl px-6 lg:px-12">
        <p className="text-[11px] tracking-[0.35em] uppercase text-olive-dark">Get in touch</p>
        <h1 className="font-display text-5xl md:text-6xl mt-4">
          Let's <span className="font-script italic text-olive-dark">talk</span>.
        </h1>
        <p className="mt-5 max-w-xl text-foreground/70">Reach us the way you prefer. We respond within one business day.</p>
      </section>

      <section className="mx-auto max-w-6xl px-6 lg:px-12 pb-16 grid gap-4 md:grid-cols-3">
        <a href={`tel:${PHONE}`} className="border border-border p-8 hover:border-olive transition">
          <FiPhone className="text-olive-dark" size={22} strokeWidth={1.3} />
          <p className="mt-5 text-[10px] tracking-[0.3em] uppercase text-olive-dark">Call</p>
          <p className="font-display text-2xl mt-2">{PHONE}</p>
          <span className="text-xs text-muted-foreground tracking-wider mt-2 inline-block">Click to call</span>
        </a>
        <a href={waLink} target="_blank" rel="noreferrer" className="border border-border p-8 hover:border-olive transition bg-olive/5">
          <FiMessageCircle className="text-olive-dark" size={22} strokeWidth={1.3} />
          <p className="mt-5 text-[10px] tracking-[0.3em] uppercase text-olive-dark">WhatsApp Catalogue</p>
          <p className="font-display text-xl mt-2">Hi → Pin Code → Pick Kitchen → Receive PDF</p>
          <span className="text-xs text-muted-foreground mt-2 inline-block">Automated bot — &lt; 30 seconds</span>
        </a>
        <a href="mailto:hello@makewin.in" className="border border-border p-8 hover:border-olive transition">
          <FiMail className="text-olive-dark" size={22} strokeWidth={1.3} />
          <p className="mt-5 text-[10px] tracking-[0.3em] uppercase text-olive-dark">Email</p>
          <p className="font-display text-2xl mt-2">hello@makewin.in</p>
        </a>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-3xl px-6 lg:px-12 pb-20">
        <h2 className="font-display text-3xl mb-6">Send a message</h2>
        {sent ? (
          <p className="text-olive-dark font-display text-xl">Thank you — we'll be in touch shortly.</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-5"
          >
            <input
              required maxLength={80}
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border-b border-border bg-transparent py-3 outline-none focus:border-olive text-sm"
              disabled={submitting}
            />
            <input
              required type="email" maxLength={120}
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border-b border-border bg-transparent py-3 outline-none focus:border-olive text-sm"
              disabled={submitting}
            />
            <textarea
              required maxLength={1000} rows={4}
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="border-b border-border bg-transparent py-3 outline-none focus:border-olive text-sm resize-none"
              disabled={submitting}
            />
            <button 
              type="submit" 
              className="btn-solid-olive self-start mt-2 px-6 py-2.5 bg-olive text-cream rounded-md hover:bg-olive-dark transition disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </section>

      {/* Socials */}
      <section className="mx-auto max-w-6xl px-6 lg:px-12 pb-24 border-t border-border pt-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-olive-dark mb-5">Follow Makewin</p>
        <div className="flex gap-6 text-olive-dark">
          <a href="#" aria-label="Facebook" className="hover:text-olive"><FiFacebook size={22} strokeWidth={1.3} /></a>
          <a href="#" aria-label="Instagram" className="hover:text-olive"><FiInstagram size={22} strokeWidth={1.3} /></a>
          <a href="#" aria-label="YouTube" className="hover:text-olive"><FiYoutube size={22} strokeWidth={1.3} /></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-olive"><FiLinkedin size={22} strokeWidth={1.3} /></a>
        </div>
      </section>
    </div>
  );
}
