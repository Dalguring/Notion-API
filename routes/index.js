import {Client} from "@notionhq/client";
import schedule from 'node-schedule';
import {getUserUuid} from './personalData.js';
// notion 객체생성
const notion = new Client({auth: process.env.NOTION_KEY})
// data insert할 database 지정
const databaseId = process.env.NOTION_DATABASE_ID
// 날짜 컬럼에 날짜 데이터 입력을 위한 Date객체
const today = new Date();
// batch 생성을 위한 schedule 정의
const regularExec = schedule.scheduleJob('*/10 * * * * *', () => {
    addToDatabase(databaseId, 'SSM', 'SEONGMIN SEO', true, today);
})
async function addToDatabase(databaseId, username, name, status, date) {

    try {
        const response = await notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            // properties 정의 시 'Database 속성명' : {type, type별 파라미터 정의해줘야함} ** 데이터베이스 속성명 불일치 시 오류 발생
            properties: {
                // ID 속성(title) 정의
                'ID': {
                    type: 'title',
                    title: [
                        {
                            type: 'text',
                            text: {
                                content: username
                            },
                        },
                    ],
                },
                // Name 속성(rich_text) 정의
                'Name': {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: name
                            },
                        }
                    ],
                },
                // Status 속성(status) 정의
                'Status': {
                    type: 'checkbox',
                    checkbox: status
                },
                // Date 속성(date) 정의
                'Date': { // Date is formatted as YYYY-MM-DD or null
                    type: 'date',
                    date: {start: date}
                },
                // People 속성(people)정의
                // people은 List형식으로 정의해야하며 id값의 경우 사용자별 uuid를 지정해줘야 함
                // uuid를 얻기 위해서는 원하는 페이지에서 개발자모드(F12)를 실행한 후 Network탭을 킨 후 페이지 리로드
                // -> 이후 아래 Name중 "getTeams" 내 json 데이터에서 추출 가능하다
                'People': {
                    type: 'people',
                    people: [
                        {id: getUserUuid('서이니')}
                    ]
                }
            }
        });
        // 결과 확인을 위한 log
        console.log(response);
    } catch (error) {
        // 에러 확인을 위한 log
        console.error(error.body);
    }
}