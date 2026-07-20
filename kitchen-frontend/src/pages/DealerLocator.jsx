import { useEffect, useMemo, useState } from "react";
import { FiMapPin, FiPhone } from "react-icons/fi";
import axios, { API } from "../api";
import fallbackImage1 from "../assets/hero-kitchen.jpeg";
import fallbackImage2 from "../assets/product-kitchen.jpeg";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function DealerLocator() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [letter, setLetter] = useState(null);
  const [city, setCity] = useState(null);

  useEffect(() => {
    axios.get("/dealers")
      .then((res) => {
        const data = res.data;
        setDealers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dealers:", error);
        setLoading(false);
      });
  }, []);

  // Get unique list of cities sorted alphabetically
  const cities = useMemo(() => {
    const list = dealers.map((d) => d.city);
    return Array.from(new Set(list)).sort();
  }, [dealers]);

  // Filter cities by active A-Z letter
  const filteredCities = useMemo(() => {
    if (!letter) return cities;
    return cities.filter((c) => c.toUpperCase().startsWith(letter));
  }, [cities, letter]);

  // Filter dealers based on active filters
  const list = useMemo(() => {
    if (city) {
      return dealers.filter((d) => d.city === city);
    }
    return dealers.filter((d) => filteredCities.includes(d.city));
  }, [dealers, city, filteredCities]);

  const resolveImage = (path, fallback) => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    return `${API}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream py-16 px-4">
        <style>{`
          @keyframes sk-sweep {
            0%   { background-position: -600px 0; }
            100% { background-position: 600px 0; }
          }
          .sk {
            background: linear-gradient(90deg, oklch(93% .03 340) 25%, oklch(96% .02 340) 50%, oklch(93% .03 340) 75%);
            background-size: 1200px 100%;
            animation: sk-sweep 1.5s ease-in-out infinite;
          }
        `}</style>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-24">
          <div className="sk h-4 w-24 mb-4 rounded" />
          <div className="sk h-10 w-64 mb-12 rounded" />
          <div className="sk h-14 w-full mb-8 rounded" />
          <div className="grid gap-8 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-border/60 bg-cream p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="sk aspect-[4/3] w-full rounded" />
                  <div className="sk aspect-[4/3] w-full rounded" />
                </div>
                <div className="sk h-4 w-16 rounded" />
                <div className="sk h-6 w-48 rounded" />
                <div className="sk h-4 w-64 rounded" />
                <div className="sk h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <section className="pt-40 pb-10 mx-auto max-w-7xl px-6 lg:px-12">
        <p className="text-[11px] tracking-[0.35em] uppercase text-olive-dark">Find us</p>
        <h1 className="font-display text-5xl md:text-6xl mt-4">
          Dealer <span className="font-script italic text-olive-dark">locator</span>
        </h1>
      </section>

      {/* A-Z letter filter */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-wrap gap-1.5 border-y border-border py-5">
          <button
            onClick={() => {
              setLetter(null);
              setCity(null);
            }}
            className={`px-3 py-1 text-[11px] tracking-[0.2em] uppercase transition ${
              !letter ? "bg-olive text-cream" : "hover:text-olive-dark"
            }`}
          >
            All
          </button>
          {alphabet.map((a) => {
            const enabled = cities.some((c) => c.toUpperCase().startsWith(a));
            return (
              <button
                key={a}
                disabled={!enabled}
                onClick={() => {
                  setLetter(a);
                  setCity(null);
                }}
                className={`w-9 h-9 text-[12px] font-semibold tracking-wider transition ${
                  letter === a
                    ? "bg-olive text-cream"
                    : enabled
                    ? "hover:bg-slate-100 text-foreground cursor-pointer"
                    : "text-muted-foreground/35 cursor-not-allowed"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>

        {/* City pills */}
        <div className="flex flex-wrap gap-2 py-6">
          {filteredCities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(city === c ? null : c)}
              className={`px-4 py-1.5 text-xs tracking-[0.15em] uppercase border transition cursor-pointer ${
                city === c ? "bg-olive text-cream border-olive" : "border-border hover:border-olive"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Showroom List Cards */}
      <section className="mx-auto max-w-7xl px-6 lg:px-12 grid gap-8 md:grid-cols-2">
        {list.map((d, i) => (
          <article key={d.id || i} className="border border-border bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden">
            {/* Showroom image grid */}
            <div className="grid grid-cols-2 gap-1.5" style={{ backgroundColor: "var(--border)" }}>
              <img
                src={resolveImage(d.image1, fallbackImage1)}
                alt={`${d.firm} exterior`}
                className="aspect-[4/3] w-full object-cover bg-white"
                loading="lazy"
              />
              <img
                src={resolveImage(d.image2, fallbackImage2)}
                alt={`${d.firm} interior`}
                className="aspect-[4/3] w-full object-cover bg-white"
                loading="lazy"
              />
            </div>
            {/* Showroom details */}
            <div className="p-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-olive-dark font-medium">{d.city}</p>
              <h3 className="font-display text-2xl mt-2 text-ink">{d.firm}</h3>
              
              <div className="mt-4 space-y-2.5">
                <p className="text-sm text-foreground/75 flex items-start gap-2 leading-relaxed">
                  <FiMapPin size={14} className="mt-0.5 text-olive shrink-0" />
                  <span>{d.address}, {d.location}</span>
                </p>
                
                <a
                  href={`tel:${d.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm text-olive hover:text-olive-dark transition font-medium"
                >
                  <FiPhone size={14} className="shrink-0" />
                  <span>{d.phone}</span>
                </a>
              </div>
            </div>
          </article>
        ))}

        {list.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-500 font-medium">No dealers found matching the filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
