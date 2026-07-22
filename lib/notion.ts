import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// 국가 코드 매핑
const LOCATION_MAP: Record<string, string> = {
  KR: 'KOREA',
  US: 'USA',
  GB: 'UK',
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

      // 3. 카테고리 (Category) - Multi-select 또는 Rich Text 지원
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
      const location = LOCATION_MAP[locationCode] || locationCode;

      // 5. Recommendation (Checkbox / Formula / Select 지원)
      const recProp =
        props['Recommendation'] ||
        props['Recommended'] ||
        props['추천'];

      let recommendation = false;

      if (recProp) {
        if (recProp.type === 'checkbox') {
          recommendation = recProp.checkbox ?? false;
        } else if (recProp.type === 'formula') {
          recommendation = recProp.formula?.boolean ?? false;
        } else if (recProp.type === 'select') {
          recommendation = !!recProp.select?.name;
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