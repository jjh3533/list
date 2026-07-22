import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// 국가 코드 매핑
const LOCATION_MAP: Record<string, string> = {
  GB: 'ENGLAND',
  UK: 'ENGLAND',
  KR: 'KOREA',
  US: 'USA',
  DE: 'GERMANY',
  FR: 'FRANCE',
  JP: 'JAPAN',
  NL: 'NETHERLANDS',
  SE: 'SWEDEN',
  ES: 'SPAIN',
  IT: 'ITALY',
  CA: 'CANADA',
  CH: 'SWITZERLAND',
  IS: 'ICELAND',
  PL: 'POLAND',
  NO: 'NORWAY',
};

export interface Agency {
  id: string;
  name: string;
  url: string;
  category: string[];
  location: string;
  recommendation: boolean;
}

export async function getAgencies(): Promise<Agency[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    console.error('NOTION_DATABASE_ID environment variable is missing.');
    return [];
  }

  try {
    let results: any[] = [];
    let hasMore = true;
    let nextCursor: string | undefined = undefined;

    // 100개 제한 극복을 위한 Pagination 루프
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: nextCursor,
        page_size: 100,
      });

      results = [...results, ...response.results];
      hasMore = response.has_more;
      nextCursor = response.next_cursor ?? undefined;
    }

    // 데이터 매핑 및 파싱
    return results.map((page) => {
      const props = page.properties;

      // 1. 에이전시 이름 (Name)
      const name =
        props['Name']?.title[0]?.plain_text ||
        props['이름']?.title[0]?.plain_text ||
        'Untitled';

      // 2. URL (URL or Website) - 인스타그램 @핸들 자동 변환 포함
      let rawUrl =
        props['URL']?.url ||
        props['URL']?.rich_text[0]?.plain_text ||
        props['Website']?.url ||
        '';

      let url = rawUrl.trim();
      if (url.startsWith('@')) {
        const handle = url.replace(/^@/, '');
        url = `https://www.instagram.com/${handle}/`;
      } else if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      // 3. 카테고리 (Category)
      let category: string[] = [];
      if (props['Category']?.multi_select) {
        category = props['Category'].multi_select.map((c: any) => c.name);
      } else if (props['Category']?.select) {
        category = [props['Category'].select.name];
      } else if (props['Category']?.rich_text[0]?.plain_text) {
        category = props['Category'].rich_text[0].plain_text
          .split(',')
          .map((c: string) => c.trim())
          .filter(Boolean);
      }

      // 4. 위치 (Location)
      const rawLocation =
        props['Location']?.select?.name ||
        props['Location']?.rich_text[0]?.plain_text ||
        'GLOBAL';
      const locationCode = rawLocation.trim().toUpperCase();
      const location = LOCATION_MAP[locationCode] || rawLocation;

      // 5. Recommendation (대소문자/속성 검색 완전 방어 로직)
      let recommendation = false;

      // 키값을 못 찾을 가능성에 대비해 대소문자 무시 검색
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
        // 만약 키 검색 실패 시 첫 번째 체크박스 속성 가져오기
        const fallbackCheckboxKey = Object.keys(props).find(
          (key) => props[key]?.type === 'checkbox'
        );
        if (fallbackCheckboxKey) {
          recommendation = props[fallbackCheckboxKey].checkbox ?? false;
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
    });
  } catch (error) {
    console.error('Failed to fetch agencies from Notion API:', error);
    return [];
  }
}