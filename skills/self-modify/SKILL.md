---
name: self-modify
description: Safely modify agent memory, personality, skills, and cron schedules. All changes are validated, backed up, and logged.
---

# Self-Modify

## When to Self-Modify
- 오너의 새로운 선호/습관을 발견했을 때 → HOT-MEMORY.md 업데이트
- 의미있는 대화 후 활성 컨텍스트 변경 → HOT-MEMORY.md 업데이트
- 새 주제에 대한 지식 축적 → warm-memory에 저장
- 오너가 성격/행동 변경 요청 → CLAUDE.md 업데이트
- 반복 작업 발견 → 새 스킬 생성
- 비효율적인 크론 발견 → 크론 수정

## Commands
```bash
# 파일 수정 (안전하게)
node /root/clawd/skills/self-modify/scripts/modify.js --file HOT-MEMORY.md --content "new content"

# 변경 이력 조회
node /root/clawd/skills/self-modify/scripts/changelog.js [--last 10]

# 이전 버전으로 복원
node /root/clawd/skills/self-modify/scripts/rollback.js --file HOT-MEMORY.md [--version 2]

# 새 스킬 생성
node /root/clawd/skills/self-modify/scripts/create-skill.js --name my-skill --description "..." --skill-md "content"

# 스킬 비활성화
node /root/clawd/skills/self-modify/scripts/deprecate-skill.js --name my-skill [--restore]

# 크론 수정
node /root/clawd/skills/self-modify/scripts/modify-cron.js --name auto-study --every "12h" --message "new prompt"
```

## Rules
- prompt-guard 파일 절대 수정 금지
- openclaw.json, credentials 수정 금지
- HOT-MEMORY.md는 500 토큰 이하 유지
- 모든 수정에 이유 기록 필수
