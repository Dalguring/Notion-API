import {Client} from "@notionhq/client";
import axios from "axios";

// notion 객체생성
const notion = new Client({auth: 'secretKeyXXX'})
// data insert할 database 지정
const databaseId = 'databaseIdXXX'
// 오늘 날짜값 format
let date = new Date();
let offset = date.getTimezoneOffset() * 60000;
let today = new Date(date.getTime() - offset);
// 공휴일 구하는 open api를 통해 공휴일 정보 수신
const getHolidays = {
    url: 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo',
    params: {
        'solYear': today.toISOString().split("-")[0],
        'solMonth': today.toISOString().split("-")[1],
        '_type': 'json',
        'ServiceKey': 'serviceKeyXXX',
        'numOfRows': '15'
    },
};
// 국경일 담을 배열 생성
const nationalHoliday = [];

axios(getHolidays)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
        if(response.data.response.body.items.length === 0);
        else if(response.data.response.body.items.item.locdate === undefined)
            response.data.response.body.items.item.forEach(v => {
                if(response.data.response.body.items.item.isHoliday.equals('Y'))
                    nationalHoliday.push(v.locdate)
            });
        else
            if(response.data.response.body.items.item.isHoliday.equals('Y'))
                nationalHoliday.push(response.data.response.body.items.item.locdate);
    })
    .catch(function (error) {
        console.log(error);
    });

// 공휴일이 아닐 때 -> 주말 여부는 Jenkins에서 체킹
if(nationalHoliday.indexOf(Number(today.toISOString().split("T")[0].replaceAll("-", ""))) == -1) {
    // database 내 데이터 filter
    // -> 상태값이 있는 것(정상 또는 오류) and 날짜가 오늘인 것
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: '상태',
                    select: {
                        is_not_empty : true
                    }
                },
                {
                    property: '날짜',
                    date: {
                        equals: today.toISOString().split("T")[0]
                    }
                }
            ]
        }
    });

    // 결과값 담을 배열 생성
    let responseData = [];
    // filtering 된 데이터를 item 배열에 담음
    const result = response.results.forEach(v => {
        responseData.push({
            "Module" : v.properties.이름.title[0].plain_text,
            "addWho" : v.properties.작성자.created_by.name,
            "isNormal" : v.properties.상태.select.name,
            "date" : today.toISOString().split("T")[0]
        });
    });

    var sendData;

    if(responseData.length === 0) {
        sendData = JSON.stringify({
            "text": "등록된 건수가 없습니다"
            , "chat_id": "#chat_id"
        });
        sendMsg(sendData);
    } else {
        responseData.forEach(data => {
            // 전송 데이터를 json 문자열로 변환
            sendData = JSON.stringify({
                "text": "\[일일업무체크\]\n모듈 : " + data.Module + "\n점검자 : " + data.addWho + "\n상태 : " + data.isNormal + "\n점검일자 : " + data.date
                , "chat_id": "#chat_id"
            });
            sendMsg(sendData);
        });
    }

    // http 비동기 통신 및 메시지 전송
    function sendMsg(sendData) {
        // telegram 전송 관련 설정
        const config = {
            method: 'post',
            url: 'https://api.telegram.org/bot_id/sendMessage',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: sendData
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}