# Keyboard Warrior Battle Royale

핫식스 팀의 `키보드 워리어 배틀로얄` 프로젝트 레포지토리입니다.

## 프로젝트 소개

타이핑 실력으로 배틀로얄을 펼치는 하드코어 웹게임 서비스입니다.

## 프로젝트 목표

- 실시간 입력 경쟁을 기반으로 한 배틀로얄 게임 구현
- 프론트엔드와 백엔드를 분리한 모노레포 구조 운영
- 공통 타입과 도메인 모델을 재사용할 수 있는 확장 가능한 기반 구성

## 기술 스택

### 공통

- Package Manager: `pnpm`
- Language: `TypeScript`

### Frontend

- React
- Tailwind CSS
- React Query
- Zustand
- Vite

### Backend

- NestJS
- Socket.IO
- Supabase
- Redis

## 모노레포 구조

이 저장소는 `pnpm workspace`와 `turbo`를 사용하는 모노레포입니다.

```text
.
├── apps
│   ├── backend        # NestJS + Socket.IO 서버
│   └── frontend       # Vite + React 클라이언트
├── packages
│   └── shared         # 공통 타입/모델 확장 영역
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

### 3. 접속 주소

- Frontend: `http://locahost.5173`
- Backend: `http://localhost:3000`

- `pnpm dev` 실행이 환경에 따라 불안정하면 프론트와 백엔드를 각각 따로 실행해도 됩니다.
```bash
pnpm --filter @keyboard-warrior/frontend dev
pnpm --filter @keyboard-warrior/backend dev
```

## 현재 아키텍처

- `apps/frontend`: Vite 기반 클라이언트 앱
- `apps/backend`: NestJS 기반 실시간 서버 및 Socket.IO 게이트웨이
- `packages/shared`: 프론트/백엔드 공통 타입 및 도메인 모델 관리 영역

## 앱별 구조

### Frontend

```text
apps/frontend
├── src
│   ├── stores
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

### Backend

```text
apps/backend
├── src
│   ├── common
│   │   └── constants
│   ├── modules
│   │   ├── battle
│   │   ├── health
│   │   └── storage
│   ├── app.module.ts
│   └── main.ts
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

## 환경 변수

예시 파일:
- [apps/frontend/.env.example](/Users/a2485/Documents/webfull_9_10_HotSix/apps/frontend/.env.example:1)
- [apps/backend/.env.example](/Users/a2485/Documents/webfull_9_10_HotSix/apps/backend/.env.example:1)

필요하면 각 앱 디렉터리에 `.env` 파일을 만들어 사용합니다.

## 자주 사용하는 명령어

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
```

개별 앱 실행:

```bash
pnpm --filter @keyboard-warrior/frontend dev
pnpm --filter @keyboard-warrior/backend dev
pnpm --filter @keyboard-warrior/frontend build
pnpm --filter @keyboard-warrior/backend build
```

## 협업 메모

- 프론트와 백엔드는 각각 `apps/frontend`, `apps/backend`에서 작업합니다.
- 공통 타입이 필요하면 `packages/shared`에 추가합니다.
- 빌드 결과물인 `dist`는 직접 수정하지 않고, 항상 `src` 기준으로 작업합니다.
- 백엔드는 HTTP `controller`와 실시간 `gateway`를 기능에 따라 함께 사용할 수 있습니다.
