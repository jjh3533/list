import CargoClientPage from './CargoClientPage';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || process.env.NOTION_KEY,
});

// 2자리 국가 코드 ➔ 영문 국가명 매핑
const COUNTRY_MAP: Record<string, string> = {
  KR: 'South Korea',
  DE: 'Germany',
  US: 'United States',
  GB: 'England',
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

async function getAgencies() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return [];

  try {
    const response = await notion.databases.query({
      database_id: databaseId.replace(/-/g, ''),
    });

    return response.results
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
          // @username ➔ https://instagram.com/username 변환
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

        // 4. Location 추출 (Multi-select, Select, Text 지원)
        let rawLocation = '';
        if (props.Location?.multi_select?.length > 0) {
          rawLocation = props.Location.multi_select[0].name;
        } else if (props.Location?.select?.name) {
          rawLocation = props.Location.select.name;
        } else if (props.Location?.rich_text?.[0]?.plain_text) {
          rawLocation = props.Location.rich_text[0].plain_text;
        }

        rawLocation = rawLocation.trim().toUpperCase();
        const location = COUNTRY_MAP[rawLocation] || rawLocation || 'Global';

        return {
          id: page.id,
          name,
          url,
          category,
          location,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Notion fetch error:', error);
    return [];
  }
}

export const revalidate = 10;

export default async function Page() {
  const agencies = await getAgencies();
  return <CargoClientPage initialAgencies={agencies} />;
}