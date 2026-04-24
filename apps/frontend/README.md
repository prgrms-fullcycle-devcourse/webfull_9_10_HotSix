# Frontend

`키보드 워리어 배틀로얄` 프론트엔드 애플리케이션 문서입니다.

## 프로젝트 개요

사용자가 실시간으로 게임에 참여하고, 대기실부터 플레이 화면까지 매끄럽게 이용할 수 있는 웹 프론트엔드를 구현합니다.

## 기술 스택

### 공통

- Package Manager: `pnpm`
- Language: `TypeScript`

### 프론트엔드

- React
- Tailwind CSS
- React Query
- Zustand
- Vite

## 현재 구조

```text
apps/frontend
├── src
│   ├── stores
│   │   └── useBattleStore.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 아키텍처 방향

- `React Query`: 서버 상태 관리
- `Zustand`: 클라이언트 상태 관리
- `Tailwind CSS`: UI 스타일링
- `Vite`: 개발 서버 및 번들링

## 실행 방법

```bash
pnpm --filter @keyboard-warrior/frontend dev
pnpm --filter @keyboard-warrior/frontend build
```

## 환경 변수

## 상태 관리 전략

## 서버 통신 방식

## 스타일 가이드

## 라우팅 구조

## 테스트

## 배포

## 작업 규칙
