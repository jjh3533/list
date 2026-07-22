import CargoClientPage from './CargoClientPage';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || process.env.NOTION_KEY,
});

// 2자리 국가 코드가 들어올 경우를 대비한 맵핑 (풀네임일 경우 그대로 출력)
const COUNTRY_MAP: Record<string, string> = {
  KR: 'South Korea',
  DE: 'Germany',
  US: 'United States',
  GB: 'England',
  UK: 'England',
  FR: 'France',
  JP: 'Japan',
  CN: 'China',
  NL: 'Netherlands',
  SE: 'Sweden',
  CH: 'Switzerland',
  IT: 'Italy',
  ES: 'Spain',
  AT: 'Austria',
  BE: 'Belgium',
  DK: 'Denmark',
  FI: 'Finland',
  NO: 'Norway',
  CA: 'Canada',
  AU: 'Australia',
  SG: 'Singapore',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  TH: 'Thailand',
  VN: 'Vietnam',
};

// 어절의 첫 글자만 대문자로 변환해주는 헬퍼 함수 (e.g. "united states" -> "United States")
function toTitleCase(str: string): string {
  if (!str) return 'Global';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function getAgencies() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return [];

  try {
    let results: any[] = [];
    let hasMore = true;
    let nextCursor: string | null = null;

    // 전체 데이터를 가져오는 안전한 Loop
    while (hasMore) {
      const queryParams: any = {
        database_id: databaseId.replace(/-/g, ''),
        page_size: 100,
      };

      if (nextCursor) {
        queryParams.start_cursor = nextCursor;
      }

      const response: any = await notion.databases.query(queryParams);

      results = [...results, ...response.results];
      hasMore = response.has_more;
      nextCursor = response.next_cursor;
    }

    return results
      .map((page: any) => {
        const props = page.properties;
        if (!props) return null;

        // 1. Name/Agency 추출
        const nameTitle = props.Agency?.title || props.Name?.title || [];
        const name = nameTitle[0]?.plain_text || 'Untitled';

        // 2. URL 추출 및 @ 인스타그램 처리
        let rawUrl = (
          props.URL?.url ||
          props.URL?.rich_text?.[0]?.plain_text ||
          ''
        ).trim();

        let url = rawUrl;
        if (rawUrl.startsWith('@')) {
          const handle = rawUrl.replace('@', '');
          url = `https://instagram.com/${handle}`;
        }

        // 3. Category 추출
        let category: string[] = [];
        if (props.Category?.multi_select) {
          category = props.Category.multi_select.map((c: any) => c.name);
        } else if (props.Category?.select?.name) {
          category = [props.Category.select.name];
        }

        // 4. Location 추출 (2자리 코드는 매핑, 풀네임은 Title Case 변환)
        let rawLocation = '';
        if (props.Location?.multi_select?.length > 0) {
          rawLocation = props.Location.multi_select[0].name;
        } else if (props.Location?.select?.name) {
          rawLocation = props.Location.select.name;
        } else if (props.Location?.rich_text?.[0]?.plain_text) {
          rawLocation = props.Location.rich_text[0].plain_text;
        }

        rawLocation = rawLocation.trim();
        const upperCode = rawLocation.toUpperCase();

        // 2자리 코드면 COUNTRY_MAP에서 찾고, 풀네임이면 첫 글자만 대문자로 변환
        const location =
          COUNTRY_MAP[upperCode] || toTitleCase(rawLocation) || 'Global';

        // 5. Recommendation (추천) 체크박스 추출
        let recommendation = false;
        const recKey = Object.keys(props).find(
          (key) => key.trim().toLowerCase() === 'recommendation'
        );

        if (recKey && props[recKey]) {
          const prop = props[recKey];
          if (prop.type === 'checkbox') {
            recommendation = prop.checkbox ?? false;
          } else if (prop.type === 'formula') {
            recommendation = prop.formula?.boolean ?? false;
          }
        } else {
          const fallbackKey = Object.keys(props).find(
            (key) => props[key]?.type === 'checkbox'
          );
          if (fallbackKey) {
            recommendation = props[fallbackKey].checkbox ?? false;
          }
        }

        return {
          id: page.id,
          name,
          url,
          category,
          location,
          recommendation,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Notion fetch error:', error);
    return [];
  }
}

// 실시간 반영을 위한 캐시 무효화 (0초)
export const revalidate = 0;

export default async function Page() {
  const agencies = await getAgencies();
  return <CargoClientPage initialAgencies={agencies} />;
}