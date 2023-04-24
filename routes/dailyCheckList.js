import {Client} from "@notionhq/client";
import {getUserUuid} from './personalData.js';
import {dailyCheck} from './dailyCheckListData.js';
import schedule from 'node-schedule';
// notion 객체생성
const notion = new Client({auth: process.env.NOTION_KEY})
// data insert할 database 지정
const databaseId = process.env.NOTION_DATABASE_ID
// scheduleJob 설정을 위한 재귀식 규칙 설정
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [1,2,3,4,5];
rule.hour = 8;
rule.minute = 0;
rule.tz = 'Asia/Seoul'

schedule.scheduleJob(rule, function() {
    
    // 데이터베이스에 데이터 입력
    for(let i = 0; i < dailyCheck.module.length; i++) {
        addToDatabase(databaseId, false, dailyCheck.module[i], dailyCheck.checkList[i], dailyCheck.ppl[i], dailyCheck.basisForConfirm[i], dailyCheck.startTime[i]);
    }
});
// batch 생성을 위한 schedule 정의
async function addToDatabase(databaseId, status, module, checkList, ppl, basisForConfirm, startTime) {

    try {
        const response = await notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            // properties 정의 시 'Database 속성명' : {type, type별 파라미터 정의해줘야함} ** 데이터베이스 속성명 불일치 시 오류 발생
            properties: {
                '': {
                    type: 'checkbox',
                    checkbox: status
                },
                '업무구분': {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: module
                            }
                        }
                    ]
                },
                '점검 항목': {
                    type: 'title',
                    title: [
                        {
                            type: 'text',
                            text: {
                                content: checkList
                            }
                        }
                    ]
                },
                '이름': {
                    type: 'people',
                    people: [
                        {id: getUserUuid(ppl)}
                    ]
                },
                '확인근거': {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: basisForConfirm
                            }
                        }
                    ]
                },
                '시작 시간(24h)': {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: startTime
                            }
                        }
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