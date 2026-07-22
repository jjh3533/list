'use client';

import { useState } from 'react';
import { Search, ExternalLink, Tag } from 'lucide-react';

export default function AgencyGrid({ initialAgencies }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 카테고리 목록 자동 추출
  const categories = ['All', ...new Set(initialAgencies.map((a) => a.category).filter(Boolean))];

  // 필터링 로직
  const filteredAgencies = initialAgencies.filter((agency) => {
    const matchesCategory = selectedCategory === 'All' || agency.category === selectedCategory;
    const matchesSearch =
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* 필터 & 검색 바 */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 검색창 */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            placeholder="에이전시, 키워드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>

      {/* 카드 갤러리 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <div
            key={agency.id}
            className="group bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* 커버 이미지 */}
              <div className="h-48 bg-neutral-800 relative overflow-hidden">
                <img
                  src={agency.coverImage}
                  alt={agency.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800'; // Fallback 이미지
                  }}
                />
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-semibold tracking-wide text-neutral-200 uppercase">
                  {agency.category}
                </span>
              </div>

              {/* 본문 정보 */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-neutral-100 mb-2 group-hover:text-white">
                  {agency.name}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                  {agency.description || '등록된 상세 설명이 없습니다.'}
                </p>
              </div>
            </div>

            {/* 하단 태그 & 웹사이트 링크 */}
            <div className="px-5 pb-5 pt-0 border-t border-neutral-800/50 mt-auto">
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-1">
                  {agency.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>

                {agency.website && (
                  <a
                    href={agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-white font-medium"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAgencies.length === 0 && (
        <div className="text-center py-20 text-neutral-500 text-sm">
          조건에 부합하는 에이전시가 없습니다.
        </div>
      )}
    </div>
  );
}