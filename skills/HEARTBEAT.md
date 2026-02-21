# HEARTBEAT.md

매 30분마다 아래 항목만 빠르게 체크. 토큰 절약 필수.

## 1. 시스템 헬스
- 크론 체크: `TOKEN=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('/root/.openclaw/identity/device-auth.json','utf8')).tokens.operator.token)}catch(e){}") && openclaw cron list --token "$TOKEN"` → 크론 5개 이상 등록 확인. 빠져있으면 로그 남기고 형에게 알림.
- `/root/clawd/.git` 존재 확인. 없으면 `bash /root/clawd/clawd-memory/scripts/auto-restore.sh`

## 2. HOT-MEMORY 정리
- HOT-MEMORY.md가 500 토큰 초과 시 → 오래된 항목 압축/삭제

## 3. 중요 알림 체크
- warm-memory/inbox.md 또는 inbox-personal.md에 **[NEW]** 이메일 중 긴급 키워드 있으면 형에게 알림
- warm-memory/calendar.md에 30분 내 일정 있으면 알림

## 응답
- 정상: `HEARTBEAT_OK`
- 알림: 내용 직접 전달
- 심야(23:00-08:00 KST) 비긴급 알림 금지
