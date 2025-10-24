--- 2025-10-24 START ---
# api 정리 예정

# Survey 추가
개발 예정
최상단 page.tsx에 해당 메뉴 추가 했음
(추후 별개로 정리 예정)
Ipad로 survey
평가 이미 완료시 재평가 불가
BE로 DeviceID 송신
(Ipad DeviceID 확인 여부.... 안되면 ip나 Mac주소)
특정 url로 분기



--- 2025-10-24 END ---
--- 2025-10-23 START ---

일단, 기존 소스의 경우 dashboard, single-presenter로 분기하며,
해당 파트에 stt등이 구현 되어 있으므로 그대로 두었습니다.

금일 2025-10-23 최종 v0 본을 기준으로 작업중에 있으며,
BE가 아직 작업되지 않은 것으로 가정하고,
local에서 서버를 실행해서 대체 합니다.
(취향에 따라 postman과 같은것 사용 해도 무관합니다.)

금일 최종 v0 본은 post-presentaion, ranking으로 분기 합니다.

api 관련 파일 : api.ts

port : 3001

실행방법 : 
(1) cd server 
(2) npm i express 
(3) node server.js 

시간 관계상 api 모드 부분 처리는 힘들어서 남은 부분은 내일부터 진행 하겠습니다.

--- 2025-10-23 END ---
