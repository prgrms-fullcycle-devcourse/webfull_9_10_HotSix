# Keyboard Warrior Battle Royale

타이핑 실력으로 경쟁하는 실시간 배틀로얄 웹게임 프로젝트입니다. 이 저장소는 프론트엔드와 백엔드를 함께 관리하는 `pnpm workspace` 기반 모노레포입니다.

## 기술 스택

### 공통

- `TypeScript`
- `pnpm`
- `turbo`

### Frontend

- `React`
- `Vite`
- `Tailwind CSS`
- `Zustand`
- `TanStack Query`
- `socket.io-client`

### Backend

- `NestJS`
- `Socket.IO`
- `Redis`
- `Supabase`

## 저장소 구조

```text
.
├── apps
│   ├── backend
│   │   ├── docs
│   │   └── src
│   │       ├── common
│   │       ├── docs
│   │       ├── modules
│   │       │   ├── auth
│   │       │   ├── battle
│   │       │   ├── game-state
│   │       │   ├── games
│   │       │   ├── health
│   │       │   ├── match
│   │       │   └── users
│   │       └── storage
│   └── frontend
│       └── src
│           ├── api
│           ├── components
│           ├── constants
│           ├── hooks
│           ├── pages
│           ├── router
│           ├── stores
│           ├── types
│           └── utils
├── packages
│   └── shared
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

프론트엔드와 백엔드 각각 `.env.example`을 참고해 `.env` 파일을 생성합니다.

- [apps/frontend/.env.example](/Users/a2485/Documents/webfull_9_10_HotSix/apps/frontend/.env.example:1)
- [apps/backend/.env.example](/Users/a2485/Documents/webfull_9_10_HotSix/apps/backend/.env.example:1)

기본 예시:

```env
# apps/frontend/.env
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

```env
# apps/backend/.env
PORT=3000
REDIS_URL=redis://localhost:6379
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_DAYS=30
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

### 3. 개발 서버 실행

전체 앱을 함께 실행:

```bash
pnpm dev
```

앱별 개별 실행:

```bash
pnpm --filter @keyboard-warrior/frontend dev
pnpm --filter @keyboard-warrior/backend dev
```

## 로컬 접속 주소

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI YAML: `http://localhost:3000/docs/openapi.yaml`
- Requirements: `http://localhost:3000/docs/requirements`
- ERD: `http://localhost:3000/docs/erd`
- Redis Spec: `http://localhost:3000/docs/redis`

## 자주 사용하는 명령어

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm format
```

앱별 명령어:

```bash
pnpm --filter @keyboard-warrior/frontend build
pnpm --filter @keyboard-warrior/frontend lint

pnpm --filter @keyboard-warrior/backend build
pnpm --filter @keyboard-warrior/backend lint
pnpm --filter @keyboard-warrior/backend test
```

## 현재 백엔드 구성

- `auth`: 게스트 로그인, 토큰 재발급, 로그아웃
- `users`: 내 정보 조회/수정, 대시보드 조회
- `match`: 대기방 입장과 현재 유저 목록 조회
- `battle`: 실시간 타이핑 배틀 Socket.IO 게이트웨이
- `games`: 현재 게임, 스코어보드, 관전자, 결과 조회
- `game-state`: 게임 상태 저장/조회 로직
- `storage`: Redis, Supabase 연결 모듈
- `docs`: Swagger UI 및 문서 라우트

## 문서 파일

백엔드 문서 파일은 [apps/backend/docs](/Users/a2485/Documents/webfull_9_10_HotSix/apps/backend/docs) 아래에서 관리합니다.

- `openapi.yaml`
- `requirements.md`
- `erd.md`
- `redis-spec.md`
- `redis-spec.html`
- `supabase-schema.sql`

## 협업 메모

- 도메인 기능은 `apps/backend/src/modules` 아래에 둡니다.
- 공통 코드와 인프라 코드는 `apps/backend/src/common`, `apps/backend/src/storage`, `apps/backend/src/docs`처럼 `modules` 밖으로 분리합니다.
- 프론트/백엔드 공통 타입이 필요하면 `packages/shared`를 사용합니다.
- 빌드 산출물은 수정하지 않고 항상 `src` 기준으로 작업합니다.
