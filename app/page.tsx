import CargoClientPage from './CargoClientPage';
import { Client } from '@notionhq/client';

// 1. 노션 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN || process.env.NOTION_KEY,
});

// 2. 노션 데이터베이스에서 데이터 받아오는 함수
async function getAgencies() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return [];

  try {
    const response = await notion.databases.query({
      database_id: databaseId.replace(/-/g, ''),
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        // 노션 열 이름 매핑
        name:
          props.Agency?.title[0]?.plain_text ||
          props.Name?.title[0]?.plain_text ||
          '이름 없음',
        url:
          props.URL?.url ||
          props.URL?.rich_text[0]?.plain_text ||
          '',
        category:
          props.Category?.multi_select?.map((c: any) => c.name) ||
          (props.Category?.select ? [props.Category.select.name] : []),
        location:
          props.Location?.select?.name ||
          props.Location?.rich_text[0]?.plain_text ||
          '',
      };
    });
  } catch (error) {
    console.error('Notion fetch error:', error);
    return [];
  }
}

// 3. 메인 서버 페이지 (Revalidate 설정 포함)
export const revalidate = 60; // 60초마다 데이터 자동 갱신

export default async function Page() {
  const agencies = await getAgencies();
  return <CargoClientPage initialAgencies={agencies} />;
}