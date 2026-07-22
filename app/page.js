import { getAgencies } from '@/lib/notion';
import AgencyGrid from '@/components/AgencyGrid';

// 60초/3600초 등 주기로 노션 API 자동 갱신 (ISR)
export const revalidate = 60; 

export default async function HomePage() {
  const agencies = await getAgencies();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-12 md:px-16">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 border-b border-neutral-800 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
              Internal Partner Database
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-1">
              A-LIST Agency Directory
            </h1>
          </div>
          <div className="text-right hidden sm:block">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
              Total {agencies.length} Agencies
            </span>
          </div>
        </div>
        <p className="text-neutral-400 mt-4 text-sm md:text-base max-w-2xl">
          건축, 인테리어, 전시, 그래픽 등 검증된 협력 에이전시 파트너 풀입니다.
        </p>
      </header>

      {/* Interactive Agency Grid & Filter */}
      <section className="max-w-7xl mx-auto">
        <AgencyGrid initialAgencies={agencies} />
      </section>
    </main>
  );
}