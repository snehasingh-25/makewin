import { useState, useEffect } from "react";
import axios from "../api";
import { useToast } from "../context/ToastContext";
import { FiPhone, FiMail, FiMapPin, FiCalendar, FiArrowRight } from "react-icons/fi";

const PHONE = "+91 91661 66190";
const PHONE_RAW = "919166166190";
const EMAIL = "makewinglobal@gmail.com";
const WHATSAPP_BOOK = `https://wa.me/${PHONE_RAW}?text=${encodeURIComponent("Hi! I'd like to book a consultation with Makewin.")}`;
const MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.0!2d74.64!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sMakewin+Global+Pvt+Ltd+Bhilwara!5e0!3m2!1sen!2sin!4v1000000000000";
const MAPS_DIRECTIONS = "https://maps.google.com/?q=Plot+No+13+Near+Lotus+Ply+School+Banni+Park+Colony+Bhilwara+Rajasthan+311001";

const PROJECT_TYPES = [
  "Modular Kitchen",
  "Wardrobe",
  "Living Room",
  "TV Unit",
  "Other",
];

const CARDS = [
  {
    icon: FiPhone,
    label: "Call Us",
    primary: PHONE,
    secondary: "Mon–Sat, 10:00 AM – 7:00 PM",
    href: `tel:${PHONE_RAW}`,
  },
  {
    icon: FiMail,
    label: "Email Us",
    primary: EMAIL,
    secondary: "We reply within 24 hours",
    href: `mailto:${EMAIL}`,
  },
  {
    icon: FiMapPin,
    label: "Visit Us",
    primary: "Banni Park Colony, Bhilwara",
    secondary: "Rajasthan — 311001",
    href: MAPS_DIRECTIONS,
  },
  {
    icon: FiCalendar,
    label: "Book Appointment",
    primary: "Schedule a personalised",
    secondary: "consultation with our team.",
    href: WHATSAPP_BOOK,
    cta: "Book Now →",
    isExternal: true,
  },
];

export default function Contact() {
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    projectType: "",
    message: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Contact — Makewin";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Contact Makewin Kitchen Studio. Call, email or book a consultation for your modular kitchen project."
      );
    }
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to the Privacy Policy to continue.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/contact", {
        name: form.name,
        email: form.email,
        message: form.message,
        phone: form.phone,
        projectType: form.projectType,
      });
      setSent(true);
      toast.success("Message sent successfully. We'll be in touch shortly.");
    } catch {
      toast.error("Error sending message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">

      {/* ══════════════════════════════════════════════════════
          HERO — Split layout
      ══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] min-h-[520px]">
        {/* Left: editorial text */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-20 lg:py-28">
          <p
            className="text-xs tracking-[0.3em] uppercase font-medium mb-6"
            style={{ color: "oklch(55% .02 340)" }}
          >
            Let&apos;s Create Something Beautiful
          </p>

          <h1
            className="font-display leading-[0.95]"
            style={{
              fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
              color: "var(--olive)",
            }}
          >
            Contact Us
          </h1>

          <div
            className="w-10 h-px my-6"
            style={{ backgroundColor: "var(--olive)" }}
          />

          <p
            className="text-sm leading-relaxed mb-6 max-w-[42ch]"
            style={{ color: "oklch(45% .02 340)" }}
          >
            We&apos;d love to hear about your project. Reach out to our design
            team and let&apos;s bring your dream space to life.
          </p>

          <p
            className="font-script text-2xl"
            style={{ color: "var(--olive)" }}
          >
            We&apos;re here to help
          </p>
        </div>

        {/* Right: kitchen image */}
        <div className="relative hidden lg:block">
          <img
            src="/contact-kitchen.png"
            alt="Makewin Kitchen Studio"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 lg:hidden"
            style={{ backgroundColor: "var(--primary)" }}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4 CONTACT CARDS
      ══════════════════════════════════════════════════════ */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        {CARDS.map(({ icon: Icon, label, primary, secondary, href, cta, isExternal }) => (
          <a
            key={label}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="group flex flex-col items-center text-center px-6 py-10 border-r border-b transition-colors hover:bg-[oklch(96%_0.01_90)]"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="w-11 h-11 rounded-full border flex items-center justify-center mb-5 transition-colors group-hover:border-[var(--olive)]"
              style={{ borderColor: "var(--border)" }}
            >
              <Icon
                size={17}
                strokeWidth={1.4}
                style={{ color: "var(--olive)" }}
              />
            </div>

            <p
              className="text-[10px] tracking-[0.25em] uppercase font-medium mb-2"
              style={{ color: "oklch(55% .02 340)" }}
            >
              {label}
            </p>

            <p
              className="font-semibold text-sm leading-snug"
              style={{ color: "var(--olive)" }}
            >
              {primary}
            </p>

            <p
              className="text-xs mt-1 leading-snug"
              style={{ color: "oklch(55% .02 340)" }}
            >
              {secondary}
            </p>

            {cta && (
              <span
                className="mt-3 text-xs font-semibold tracking-wide flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: "var(--olive)" }}
              >
                {cta}
              </span>
            )}
          </a>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════
          MAIN GRID — Form (left) + Our Studio (right)
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* ── LEFT: Form ─────────────────────────────────── */}
          <div>
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-medium mb-3"
              style={{ color: "oklch(55% .02 340)" }}
            >
              Send Us a Message
            </p>
            <div
              className="w-8 h-px mb-8"
              style={{ backgroundColor: "var(--olive)" }}
            />

            {sent ? (
              <div className="py-12">
                <p
                  className="font-display text-3xl leading-snug mb-3"
                  style={{ color: "var(--olive)" }}
                >
                  Thank you.
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(55% .02 340)" }}
                >
                  We&apos;ll be in touch shortly to discuss your project.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-0">
                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <input
                    name="name"
                    required
                    maxLength={80}
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={submitting}
                    className="border-b bg-transparent py-3.5 text-sm outline-none transition-colors placeholder:text-[oklch(65%_.02_340)]"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--olive)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--olive)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <input
                    name="phone"
                    type="tel"
                    maxLength={20}
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={submitting}
                    className="border-b bg-transparent py-3.5 text-sm outline-none transition-colors placeholder:text-[oklch(65%_.02_340)] mt-0"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--olive)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--olive)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                </div>

                {/* Row 2: Email + Project Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mt-1">
                  <input
                    name="email"
                    required
                    type="email"
                    maxLength={120}
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    disabled={submitting}
                    className="border-b bg-transparent py-3.5 text-sm outline-none transition-colors placeholder:text-[oklch(65%_.02_340)]"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--olive)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--olive)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  />
                  <select
                    name="projectType"
                    value={form.projectType}
                    onChange={handleChange}
                    disabled={submitting}
                    className="border-b bg-transparent py-3.5 text-sm outline-none transition-colors appearance-none cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      color: form.projectType
                        ? "var(--olive)"
                        : "oklch(65% .02 340)",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--olive)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--border)")
                    }
                  >
                    <option value="" disabled>
                      Project Type
                    </option>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t} style={{ color: "var(--olive)", backgroundColor: "var(--cream)" }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Textarea */}
                <textarea
                  name="message"
                  required
                  maxLength={1000}
                  rows={4}
                  placeholder="Tell us about your project..."
                  value={form.message}
                  onChange={handleChange}
                  disabled={submitting}
                  className="border-b bg-transparent py-3.5 text-sm outline-none resize-none transition-colors placeholder:text-[oklch(65%_.02_340)] mt-1"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--olive)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--olive)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border)")
                  }
                />

                {/* Checkbox */}
                <label className="flex items-center gap-3 mt-6 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 accent-[var(--olive)] cursor-pointer"
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(55% .02 340)" }}
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="underline hover:text-[var(--olive)] transition-colors"
                      style={{ color: "var(--olive)" }}
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full py-4 flex items-center justify-center gap-2 font-semibold text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--olive)",
                    color: "#fff",
                  }}
                >
                  {submitting ? "Sending..." : (
                    <>
                      Send Message <FiArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── RIGHT: Our Studio ──────────────────────────── */}
          <div>
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-medium mb-3"
              style={{ color: "oklch(55% .02 340)" }}
            >
              Our Studio
            </p>
            <div
              className="w-8 h-px mb-8"
              style={{ backgroundColor: "var(--olive)" }}
            />

            {/* Map */}
            <div className="overflow-hidden rounded-lg w-full h-52 bg-[oklch(88%_0.02_90)]">
              <iframe
                title="Makewin Studio Location"
                src={MAPS_EMBED}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(20%) contrast(0.95)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Studio image + info */}
            <div className="mt-4 grid grid-cols-[1fr_1fr] gap-4 items-start">
              <div className="overflow-hidden rounded-lg">
                <img
                  src="/contact-kitchen.png"
                  alt="Makewin Studio Interior"
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col justify-between h-40 py-1">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(45% .02 340)" }}
                >
                  Step into our studio and experience the finest in design and
                  craftsmanship.
                </p>
                <a
                  href={MAPS_DIRECTIONS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all duration-200"
                  style={{ color: "var(--olive)" }}
                >
                  Get Directions <FiArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER — dark background
      ══════════════════════════════════════════════════════ */}
      <section
        className="px-6 sm:px-10 lg:px-16 py-20 lg:py-24"
        style={{ backgroundColor: "oklch(0.18 0.04 100)" }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-medium mb-5"
              style={{ color: "oklch(70% .02 80)" }}
            >
              Have a project in mind?
            </p>
            <h2
              className="font-display leading-[1.0]"
              style={{
                fontSize: "clamp(2.5rem, 4.5vw, 4rem)",
                color: "oklch(0.97 0.012 90)",
              }}
            >
              Let&apos;s design spaces<br />that inspire.
            </h2>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-8 lg:items-start">
            <p
              className="text-sm leading-relaxed max-w-[45ch]"
              style={{ color: "oklch(70% .02 80)" }}
            >
              Our team is ready to bring your vision to life with thoughtful
              design and meticulous attention to detail.
            </p>
            <a
              href={WHATSAPP_BOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 border text-sm font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-[oklch(0.97_0.012_90)] group"
              style={{
                borderColor: "oklch(0.97 0.012 90)",
                color: "oklch(0.97 0.012 90)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--olive)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "oklch(0.97 0.012 90)";
              }}
            >
              Enquire Now <FiArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
