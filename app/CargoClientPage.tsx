'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredAgencyUrl, setHoveredAgencyUrl] = useState<string | null>(null);

  // 헤더 상태 관리 (스크롤에 따른 높이 변화)
  const [headerHeight, setHeaderHeight] = useState<number>(120);
  const [barStyle, setBarStyle] = useState<React.CSSProperties>({});

  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);

  // 스크롤 및 리사이즈 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      // 100px 이상 스크롤 시 높이 80px로 축소
      const newHeight = window.scrollY > 100 ? 80 : 120;
      setHeaderHeight(newHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateBarPosition);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateBarPosition);
    };
  }, [headerHeight]);

  // 상단 Accent Bar 위치 및 너비 업데이트
  const updateBarPosition = () => {
    const header = headerRef.current;
    const logo = logoRef.current;

    if (header && logo) {
      const headerRect = header.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const extraWidth = headerHeight === 80 ? 75 : 0;

      setBarStyle({
        left: logoRect.left - headerRect.left,
        width: logoRect.width + extraWidth,
        height: '10px',
        background: '#0c9f5a',
        position: 'absolute',
        top: 0,
        transition: 'all 0.3s ease',
      });
    }
  };

  useEffect(() => {
    updateBarPosition();
  }, [headerHeight]);

  const categories = useMemo(() => {
    const all = initialAgencies.flatMap((a) => a.category || []);
    return ['ALL', ...Array.from(new Set(all))];
  }, [initialAgencies]);

  const locations = useMemo(() => {
    const all = initialAgencies.map((a) => a.location).filter(Boolean);
    return ['ALL', ...Array.from(new Set(all))];
  }, [initialAgencies]);

  const filteredAgencies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialAgencies.filter((agency) => {
      const matchCat =
        selectedCategory === 'ALL' || agency.category?.includes(selectedCategory);
      const matchLoc =
        selectedLocation === 'ALL' || agency.location === selectedLocation;

      const matchSearch =
        !query ||
        agency.name.toLowerCase().includes(query) ||
        agency.url.toLowerCase().includes(query) ||
        agency.location.toLowerCase().includes(query) ||
        agency.category?.some((cat) => cat.toLowerCase().includes(query));

      return matchCat && matchLoc && matchSearch;
    });
  }, [initialAgencies, selectedCategory, selectedLocation, searchQuery]);

  // 로고 애니메이션 변환 스타일
  const jeonTransform =
    headerHeight === 80
      ? 'translateY(-36px) translateX(75px)'
      : 'translateY(0) translateX(0)';

  return (
    <div className="min-h-screen bg-[#1e202d] text-[#e5e5e5] font-sans selection:bg-white selection:text-black">
      
      {/* 고정 동적 헤더 (Fixed Header) */}
      <header
        ref={headerRef}
        style={{ height: `${headerHeight}px` }}
        className="fixed top-0 left-0 right-0 bg-black px-10 flex flex-col justify-between items-start z-[1000] transition-[height] duration-300 ease-in-out border-b border-[#202d32]"
      >
        {/* 상단 슬라이딩 포인트 바 */}
        <div className="w-full h-[10px] absolute top-0 left-0 right-0">
          <div style={barStyle} />
        </div>

        {/* 로고 영역 */}
        <div className="flex items-center w-full py-5">
          <a
            ref={logoRef}
            href="https://jayjeon.com"
            target="_blank"
            rel="noreferrer"
            className="brand-name text-white text-[36px] font-semibold tracking-normal flex flex-col leading-none cursor-pointer"
          >
            <span className="block">
              JA<span className="-ml-[2px]">Y</span>
            </span>
            <span
              style={{ transform: jeonTransform }}
              className="block tracking-[1px] transition-transform duration-300 ease-in-out"
            >
              JEON
            </span>
          </a>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="pt-[140px] max-w-[1600px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        <main className="flex-1">
          <header className="mb-8 border-b border-[#202d32] pb-8">
            <h1 className="font-title font-black text-7xl sm:text-9xl tracking-[0em] mb-4 text-[#0c9f5a]">
              Agency Directory
            </h1>
            <p className="font-title font-medium text-neutral-400 text-2xl tracking-[0em] max-w-2xl leading-relaxed">
              Archived index of curated agency partners.
            </p>
          </header>

          {/* 검색창 */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 font-mono text-sm">
              🔍
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agency name, category, location, or URL..."
              className="w-full pl-11 pr-10 py-3.5 bg-[#202d32]/40 border border-[#202d32] rounded-xl text-white placeholder:text-neutral-500 font-mono text-sm focus:outline-none focus:border-[#0c9f5a] focus:ring-1 focus:ring-[#0c9f5a] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white font-mono text-xs"
              >
                ✕ CLEAR
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-neutral-500 mb-4 flex justify-between">
            <span>INDEX ({filteredAgencies.length})</span>
            <span>LOCATION</span>
          </div>

          <div className="border-t border-[#202d32] divide-y divide-[#202d32]/60">
            {filteredAgencies.length > 0 ? (
              filteredAgencies.map((agency) => {
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
                    className="group relative py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#202d32]/40 px-2 transition-all duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-title font-medium text-2xl tracking-[0em] text-white group-hover:text-[#0c9f5a] transition-colors inline-flex items-center gap-2"
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
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202d32] text-neutral-300"
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
              })
            ) : (
              <div className="py-12 text-center text-neutral-500 font-mono text-sm">
                No agencies found matching your search query.
              </div>
            )}
          </div>
        </main>

        <aside className="w-full lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-36 space-y-8 bg-[#202d32]/30 p-6 rounded-2xl border border-[#202d32]/80 backdrop-blur-sm">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4 font-bold border-b border-[#202d32] pb-2">
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
                        : 'text-neutral-400 hover:text-white hover:bg-[#202d32]/50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4 font-bold border-b border-[#202d32] pb-2">
                // LOCATION
              </h3>
              <div className="flex flex-col gap-1">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`text-left text-xs font-mono py-1.5 px-3 rounded-lg transition-all flex justify-between items-center ${
                      selectedLocation === loc
                        ? 'bg-[#0c9f5a] text-white font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-[#202d32]/50'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <span className="text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            {(selectedCategory !== 'ALL' ||
              selectedLocation !== 'ALL' ||
              searchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedLocation('ALL');
                  setSearchQuery('');
                }}
                className="w-full text-center text-xs font-mono text-neutral-500 hover:text-white underline pt-2 block"
              >
                Reset All Filters ↺
              </button>
            )}
          </div>
        </aside>
      </div>

      {hoveredAgencyUrl && (
        <div className="hidden lg:block fixed bottom-8 right-8 w-80 h-52 z-50 rounded-xl overflow-hidden border border-neutral-700 shadow-2xl bg-[#202d32] pointer-events-none">
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