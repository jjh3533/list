import CargoClientPage from './CargoClientPage';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN || process.env.NOTION_KEY,
});

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

        // 1. Name/Agency 추출 (안전한 접근)
        const nameTitle = props.Agency?.title || props.Name?.title || [];
        const name = nameTitle[0]?.plain_text || '이름 없음';

        // 2. URL 추출 (URL 타입 및 Text 타입 모두 대응)
        const url =
          props.URL?.url ||
          props.URL?.rich_text?.[0]?.plain_text ||
          '';

        // 3. Category 추출
        let category: string[] = [];
        if (props.Category?.multi_select) {
          category = props.Category.multi_select.map((c: any) => c.name);
        } else if (props.Category?.select?.name) {
          category = [props.Category.select.name];
        }

        // 4. Location 추출
        const location =
          props.Location?.select?.name ||
          props.Location?.rich_text?.[0]?.plain_text ||
          'GLOBAL';

        return {
          id: page.id,
          name,
          url,
          category,
          location,
        };
      })
      .filter(Boolean); // 유효하지 않은 항목 제거
  } catch (error) {
    console.error('Notion fetch error:', error);
    return [];
  }
}

export const revalidate = 10; // 10초마다 노션 데이터 새로고침

export default async function Page() {
  const agencies = await getAgencies();
  return <CargoClientPage initialAgencies={agencies} />;
}