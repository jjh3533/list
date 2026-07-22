'use client';

import { useState, useMemo } from 'react';

// 노션에서 받아올 데이터 타입 정의
interface Agency {
  id: string;
  name: string;
  url: string;
  category: string[];
  location: string;
}

export default function AgencyDirectory({ agencies }: { agencies: Agency[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. 노션 데이터에서 전체 카테고리 및 국가(Location) 목록 추출
  const categories = useMemo(() => {
    const all = agencies.flatMap((a) => a.category || []);
    return ['All', ...Array.from(new Set(all))];
  }, [agencies]);

  const locations = useMemo(() => {
    const all = agencies.map((a) => a.location).filter(Boolean);
    return ['All', ...Array.from(new Set(all))];
  }, [agencies]);

  // 2. 선택된 필터 및 검색어에 따라 에이전시 목록 필터링
  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => {
      const matchCategory =
        selectedCategory === 'All' || agency.category?.includes(selectedCategory);
      const matchLocation =
        selectedLocation === 'All' || agency.location === selectedLocation;
      const matchSearch =
        agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agency.url.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchLocation && matchSearch;
    });
  }, [agencies, selectedCategory, selectedLocation, searchQuery]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      {/* 헤더 영역 */}
      <header className="max-w-7xl mx-auto mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">A-LIST Agency Directory</h1>
        <p className="text-gray-400">건축, 인테리어, 전시, 그래픽 등 검증된 협력 에이전시 파트너 풀입니다.</p>
      </header>

      {/* 필터 및 검색바 영역 */}
      <section className="max-w-7xl mx-auto mb-8 space-y-4">
        {/* 검색창 */}
        <input
          type="text"
          placeholder="에이전시, 키워드 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 p-3 rounded-lg bg-[#1a1a1a] border border-gray-800 text-sm focus:outline-none focus:border-gray-500"
        />

        {/* 카테고리 필터 버튼 */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-semibold mr-2">CATEGORY:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 국가(Location) 필터 버튼 */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 font-semibold mr-2">LOCATION:</span>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedLocation === loc
                  ? 'bg-emerald-500 text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </section>

      {/* 카드 리스트 영역 (사진 없이 미니멀한 텍스트 카드 디자인) */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgencies.map((item) => (
          <a
            key={item.id}
            href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 bg-[#141414] border border-gray-800/80 rounded-xl hover:border-gray-600 transition group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold group-hover:text-emerald-400 transition">
                {item.name}
              </h3>
              {item.location && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                  {item.location}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate mb-4">{item.url}</p>
            
            {/* 카테고리 태그 */}
            <div className="flex flex-wrap gap-1.5">
              {item.category?.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-[#222] text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}