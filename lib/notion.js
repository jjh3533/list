import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function getAgencies() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    return response.results.map((page) => {
      const props = page.properties;

      // 노션 DB 컬럼명에 맞춰 속성을 가져옵니다. (필요시 속성명 수정 가능)
      const name = props['이름']?.title[0]?.plain_text || props['Name']?.title[0]?.plain_text || '이름 없음';
      const category = props['카테고리']?.select?.name || props['Category']?.select?.name || '기타';
      const description = props['설명']?.rich_text[0]?.plain_text || props['Description']?.rich_text[0]?.plain_text || '';
      const website = props['웹사이트']?.url || props['Website']?.url || '';
      const tags = props['태그']?.multi_select?.map(t => t.name) || props['Tags']?.multi_select?.map(t => t.name) || [];
      
      // 커버 이미지 혹은 기본 플레이스홀더
      let coverImage = '/placeholder.jpg';
      if (page.cover?.type === 'external') {
        coverImage = page.cover.external.url;
      } else if (page.cover?.type === 'file') {
        coverImage = page.cover.file.url;
      }

      return {
        id: page.id,
        name,
        category,
        description,
        website,
        tags,
        coverImage,
      };
    });
  } catch (error) {
    console.error('Notion API Error:', error);
    return [];
  }
}