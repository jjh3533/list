'use client';

import { useState, useMemo } from 'react';

export interface Agency {
  id: string;
  name: string;
  url: string;
  category: string[];
  location: string;
}

export default function CargoClientPage({
  initialAgencies = [],
}: {
  initialAgencies: Agency[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [hoveredAgencyUrl, setHoveredAgencyUrl] = useState<string | null>(null);

  const categories = useMemo(() => {
    const all = initialAgencies.flatMap((a) => a.category || []);
    return ['ALL', ...Array.from(new Set(all))];
  }, [initialAgencies]);

  const locations = useMemo(() => {
    const all = initialAgencies.map((a) => a.location).filter(Boolean);
    return ['ALL', ...Array.from(new Set(all))];
  }, [initialAgencies]);

  const filteredAgencies = useMemo(() => {
    return initialAgencies.filter((agency) => {
      const matchCat =
        selectedCategory === 'ALL' || agency.category?.includes(selectedCategory);
      const matchLoc =
        selectedLocation === 'ALL' || agency.location === selectedLocation;
      return matchCat && matchLoc;
    });
  }, [initialAgencies, selectedCategory, selectedLocation]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#e5e5e5] font-sans selection:bg-white selection:text-black">
      <div className="max-w-[1600px] mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12">
        
        {/* 메인 리스트 */}
        <main className="flex-1">
          <header className="mb-12 border-b border-neutral-800 pb-8">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-4 text-white">
              A-LIST DIRECTORY
            </h1>
            <p className="text-neutral-400 text-sm max-w-xl font-mono leading-relaxed">
              Archived index of curated agency partners. Hover or click to preview live site.
            </p>
          </header>

          <div className="text-xs font-mono text-neutral-500 mb-4 flex justify-between">
            <span>INDEX ({filteredAgencies.length})</span>
            <span>LOCATION / CITY</span>
          </div>

          <div className="border-t border-neutral-800 divide-y divide-neutral-800/60">
            {filteredAgencies.map((agency) => {
              const targetUrl = agency.url?.startsWith('http')
                ? agency.url
                : `https://${agency.url}`;

              const thumbnailUrl = `https://api.microlink.io/?url=${encodeURIComponent(
                targetUrl
              )}&screenshot=true&meta=false&embed=screenshot.url`;

              return (
                <div
                  key={agency.id}
                  onMouseEnter={() => setHoveredAgencyUrl(thumbnailUrl)}
                  onMouseLeave={() => setHoveredAgencyUrl(null)}
                  className="group relative py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-900/40 px-2 transition-all duration-150"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors inline-flex items-center gap-2"
                    >
                      {agency.name}
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity font-normal">
                        ↗
                      </span>
                    </a>
                    <div className="text-xs font-mono text-neutral-500 truncate mt-0.5">
                      {agency.url}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:justify-center">
                    {agency.category?.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm font-mono text-neutral-400 sm:text-right shrink-0">
                    {agency.location || 'GLOBAL'}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* 필터 사이드바 */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-10 space-y-8 bg-neutral-900/30 p-6 rounded-2xl border border-neutral-800/80 backdrop-blur-sm">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4 font-bold border-b border-neutral-800 pb-2">
                // CATEGORIES
              </h3>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left text-xs font-mono py-1.5 px-3 rounded-lg transition-all flex justify-between items-center ${
                      selectedCategory === cat
                        ? 'bg-white text-black font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4 font-bold border-b border-neutral-800 pb-2">
                // LOCATION
              </h3>
              <div className="flex flex-col gap-1">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`text-left text-xs font-mono py-1.5 px-3 rounded-lg transition-all flex justify-between items-center ${
                      selectedLocation === loc
                        ? 'bg-emerald-400 text-black font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            {(selectedCategory !== 'ALL' || selectedLocation !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedLocation('ALL');
                }}
                className="w-full text-center text-xs font-mono text-neutral-500 hover:text-white underline pt-2 block"
              >
                Reset All Filters ↺
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Live Preview Hover Thumbnail */}
      {hoveredAgencyUrl && (
        <div className="hidden lg:block fixed bottom-8 right-8 w-80 h-52 z-50 rounded-xl overflow-hidden border border-neutral-700 shadow-2xl bg-neutral-900 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hoveredAgencyUrl}
            alt="Live Preview"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}