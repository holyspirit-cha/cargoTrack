// server.js (수정된 코드) wls

// 1. 필요한 라이브러리 불러오기
const express = require('express');
const path = require('path');

// 2. 서버 설정
const app = express();
const PORT = 3000;

// 3. 프록시 API 경로 설정
app.get('/api/lookup', async (req, res) => {
  // 'node-fetch' 라이브러리를 동적으로 import 합니다.
  const fetch = (await import('node-fetch')).default;

  // 웹페이지에서 보낸 파라미터(B/L번호, 연도, 인증키, B/L 타입)를 받음
  const { blNo, blYear, apiKey, blType } = req.query;

  // 파라미터가 없으면 에러 반환
  if (!blNo || !blYear || !apiKey || !blType) {
    return res.status(400).send('<error>필수 파라미터(B/L 번호, 연도, B/L 유형)가 누락되었습니다.</error>');
  }

  // 실제 관세청 API URL의 기본 부분을 생성
  let targetUrl = `https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo?crkyCn=${apiKey}&blYy=${blYear}`;

  // B/L 타입에 따라 MBL 또는 HBL 파라미터를 동적으로 추가
  if (blType === 'master') {
    targetUrl += `&mblNo=${encodeURIComponent(blNo)}`;
  } else { // 기본값은 'house'
    targetUrl += `&hblNo=${encodeURIComponent(blNo)}`;
  }

  try {
    // 관세청 API로 대신 요청을 보냄
    const apiResponse = await fetch(targetUrl);
    
    // 관세청에서 받은 응답(XML)을 텍스트로 변환
    const xmlText = await apiResponse.text();
    
    // 받은 XML을 웹페이지로 그대로 전달
    res.type('application/xml');
    res.send(xmlText);

  } catch (error) {
    console.error('프록시 에러:', error);
    res.status(500).send('<error>API 호출 중 서버에서 에러가 발생했습니다.</error>');
  }
});

// 4. 웹페이지(index.html)를 서비스하기 위한 설정
// 이 코드는 server.js와 index.html이 같은 폴더에 있다고 가정합니다.
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// 5. 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('웹 브라우저에서 위 주소로 접속하세요.');
});

