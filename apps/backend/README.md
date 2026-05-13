# Backend

`키보드 워리어 배틀로얄` 백엔드 애플리케이션 문서입니다.

## 프로젝트 개요

실시간 게임 세션, 유저 상태, 매칭 및 데이터 저장을 처리하는 서버를 구현합니다.

## 기술 스택

### 공통

- Package Manager: `pnpm`
- Language: `TypeScript`

### 백엔드

- NestJS
- Socket.IO
- Supabase
- Redis

## 현재 구조

```text
apps/backend
├── src
│   ├── modules
│   │   └── app.module.ts
│   ├── realtime
│   │   └── battle.gateway.ts
│   ├── storage
│   │   ├── redis.service.ts
│   │   └── supabase.service.ts
│   └── main.ts
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

## 아키텍처 방향

- `NestJS`: 서버 부트스트랩과 모듈 구조 담당
- `Socket.IO`: 실시간 이벤트 송수신 담당
- `Supabase`: 영속 데이터 저장소 연동 예정
- `Redis`: 룸 상태, 세션, 캐시 데이터 저장 담당

## 실행 방법

```bash
pnpm --filter @keyboard-warrior/backend dev
pnpm --filter @keyboard-warrior/backend build
```

## API 문서

- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs/openapi.json`
- OpenAPI YAML: `http://localhost:3000/docs/openapi.yaml`
- 요구사항 명세: `http://localhost:3000/docs/requirements`
- ERD 문서: `http://localhost:3000/docs/erd`
- Socket.IO 명세: `http://localhost:3000/docs/socket-io`
- Redis 명세: `http://localhost:3000/docs/redis`

Swagger/OpenAPI 스펙은 `openapi.yaml`을 수동으로 수정하지 않고, 컨트롤러와 DTO 코드를 기준으로 애플리케이션 부팅 시 자동 생성합니다.

## 환경 변수

## 아키텍처

## 실시간 이벤트 설계

## 데이터 저장 전략

## Redis 사용 정책

## 예외 처리

## 테스트

## 배포

## 작업 규칙
