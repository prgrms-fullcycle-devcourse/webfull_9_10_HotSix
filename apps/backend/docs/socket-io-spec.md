# Socket.IO Specification

프론트엔드 개발자가 현재 백엔드 구현에 맞춰 바로 연동할 수 있도록 정리한 실시간 이벤트 명세입니다.

## Overview

- 프로토콜: `Socket.IO`
- Namespace: `/`
- 기본 경로: `/socket.io`
- 개발 서버 주소: `http://localhost:3000`
- 인증: 현재 소켓 연결 시 별도 인증 토큰 없음
- 역할 배정:
  - 현재 게임 상태가 `waiting` 이면 접속자는 `player`
  - 현재 게임 상태가 `in_progress` 이면 접속자는 `spectator`

## Connection Flow

소켓 연결 직후 서버는 아래 순서로 이벤트를 보냅니다.

1. `battle:welcome`
2. `battle:join` 또는 `battle:spectate`
3. `battle:state`
4. 현재 상태가 `waiting` 이면 `battle:waiting`

즉 프론트엔드는 연결 직후 최소 `battle:welcome`, `battle:join`, `battle:spectate`, `battle:state`, `battle:waiting` 을 구독하는 것을 권장합니다.

## Client To Server

### `battle:ready`

준비 상태를 서버에 알립니다.

```json
{
  "nickname": "테스트유저"
}
```

서버 응답:

- 본인에게 `battle:ready-confirmed`
- 다른 클라이언트에게 `battle:player-ready`

## Server To Client

### `battle:welcome`

연결 성공 후 가장 먼저 내려오는 이벤트입니다.

```json
{
  "message": "Keyboard Warrior Battle Royale server connected",
  "assignedRole": "player"
}
```

필드:

- `message`: 서버 연결 안내 문구
- `assignedRole`: `player` 또는 `spectator`

### `battle:join`

현재 접속자가 플레이어로 배정되었을 때 내려옵니다.

```json
{
  "assignedRole": "player",
  "state": {
    "gameId": "019699d4-4f96-79b6-a942-9dc0b67d8ed1",
    "prompt": {
      "id": 2,
      "slug": "city-before-rain-750",
      "title": "비 오기 전 도시",
      "content": "비가 내리기 전의 도시는 늘 조금 다른 목소리를 낸다....",
      "contentLength": 750
    },
    "phase": "waiting",
    "minPlayers": 4,
    "playerCount": 1,
    "spectatorCount": 0,
    "waitingEndsAt": "2026-05-04T02:15:00.000Z",
    "gameStartedAt": null,
    "gameEndedAt": null
  },
  "waiting": {
    "gameId": "019699d4-4f96-79b6-a942-9dc0b67d8ed1",
    "phase": "waiting",
    "prompt": {
      "id": 2,
      "title": "비 오기 전 도시",
      "contentLength": 750
    },
    "remainingSeconds": 900,
    "waitingEndsAt": "2026-05-04T02:15:00.000Z",
    "minPlayers": 4,
    "playerCount": 1,
    "spectatorCount": 0
  }
}
```

### `battle:spectate`

현재 접속자가 관전자로 배정되었을 때 내려옵니다.

payload 구조는 `battle:join` 과 같고 `assignedRole` 만 `spectator` 입니다.

### `battle:state`

현재 게임의 전체 상태 스냅샷입니다.

```json
{
  "gameId": "019699d4-4f96-79b6-a942-9dc0b67d8ed1",
  "prompt": {
    "id": 2,
    "slug": "city-before-rain-750",
    "title": "비 오기 전 도시",
    "content": "비가 내리기 전의 도시는 늘 조금 다른 목소리를 낸다....",
    "contentLength": 750
  },
  "phase": "waiting",
  "minPlayers": 4,
  "playerCount": 1,
  "spectatorCount": 0,
  "waitingEndsAt": "2026-05-04T02:15:00.000Z",
  "gameStartedAt": null,
  "gameEndedAt": null
}
```

필드:

- `gameId`: 현재 라운드 ID
- `prompt`: 현재 라운드에 배정된 글 전체 정보
- `phase`: `waiting`, `in_progress`, `finished`
- `minPlayers`: 시작 최소 인원
- `playerCount`: 현재 플레이어 수
- `spectatorCount`: 현재 관전자 수
- `waitingEndsAt`: 대기 종료 시각
- `gameStartedAt`: 게임 시작 시각
- `gameEndedAt`: 게임 종료 시각

주의:

- 현재 구현에서는 `battle:state` 에 `prompt.content` 전체가 포함됩니다.
- 즉 프론트는 연결 직후에도 실제 타이핑 원문을 받을 수 있습니다.
- `battle:waiting`, `battle:countdown` 에는 전체 본문이 아니라 메타 정보만 포함됩니다.

### `battle:waiting`

대기 상태에서 1초마다 브로드캐스트됩니다.

```json
{
  "gameId": "019699d4-4f96-79b6-a942-9dc0b67d8ed1",
  "phase": "waiting",
  "prompt": {
    "id": 2,
    "title": "비 오기 전 도시",
    "contentLength": 750
  },
  "remainingSeconds": 742,
  "waitingEndsAt": "2026-05-04T02:15:00.000Z",
  "minPlayers": 4,
  "playerCount": 3,
  "spectatorCount": 0
}
```

프론트에서 주로 사용할 필드:

- `remainingSeconds`: 화면 카운트다운 표시
- `playerCount`, `minPlayers`: 시작 조건 표시
- `prompt.title`, `prompt.contentLength`: 대기 화면 정보 표시

### `battle:countdown`

대기 종료 10초 이내에 한 번 내려오는 공지 이벤트입니다.

payload 구조는 `battle:waiting` 과 같습니다.

의도:

- 카운트다운 진입 연출
- 시작 직전 강조 UI

### `battle:started`

게임이 실제 시작될 때 내려옵니다.

payload 구조는 `battle:state` 와 같습니다.

특징:

- `phase` 는 `in_progress`
- `waitingEndsAt` 는 `null`
- `gameStartedAt` 가 채워짐

### `battle:finished`

게임이 종료될 때 내려옵니다.

payload 구조는 `battle:state` 와 같습니다.

특징:

- `phase` 는 `finished`
- `gameEndedAt` 가 채워짐

현재 구현에서는 `battle:finished` 직후 새 waiting 게임이 만들어지고, 이어서 `battle:waiting` 이 다시 내려옵니다.

### `battle:ready-confirmed`

`battle:ready` 에 대한 본인 응답입니다.

```json
{
  "nickname": "테스트유저",
  "status": "queued"
}
```

### `battle:player-ready`

다른 플레이어가 `battle:ready` 를 보냈을 때 받는 브로드캐스트입니다.

```json
{
  "nickname": "다른유저"
}
```

주의:

- 이 이벤트는 `client.broadcast.emit(...)` 으로 전송되기 때문에, 보낸 본인에게는 오지 않습니다.

## Current Game Lifecycle

현재 서버 동작은 아래와 같습니다.

1. 서버 시작 시 현재 게임 상태가 없으면 새 `waiting` 게임 생성
2. waiting 상태에서 매초 `battle:waiting` 브로드캐스트
3. 남은 시간이 10초 이하가 되면 `battle:countdown` 1회 전송
4. 시간이 0초가 되면 `playerCount >= minPlayers` 인지 검사
5. 인원이 4명 이상이면 `battle:started` 전송 후 `in_progress` 전환
6. 인원이 4명 미만이면 게임을 시작하지 않고 `waiting` 15분을 다시 시작
7. 게임 종료 시 `battle:finished` 전송 후 새 waiting 게임 생성

## Frontend Recommendations

- 연결 직후 구독:
  - `battle:welcome`
  - `battle:join`
  - `battle:spectate`
  - `battle:state`
  - `battle:waiting`
  - `battle:countdown`
  - `battle:started`
  - `battle:finished`
  - `battle:ready-confirmed`
  - `battle:player-ready`

- 화면 분기:
  - `battle:join` 수신 시 플레이어 화면
  - `battle:spectate` 수신 시 관전자 화면
  - `battle:state.phase === "waiting"` 이면 대기 UI
  - `battle:state.phase === "in_progress"` 이면 게임 UI

- prompt 사용:
  - 대기 화면에서는 `battle:waiting.prompt.title`, `contentLength` 만 써도 충분
  - 실제 본문 렌더링은 `battle:state.prompt.content` 를 사용

## Example Client

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("battle:welcome", (payload) => {
  console.log("welcome", payload);
});

socket.on("battle:join", (payload) => {
  console.log("join", payload);
});

socket.on("battle:spectate", (payload) => {
  console.log("spectate", payload);
});

socket.on("battle:state", (payload) => {
  console.log("state", payload);
});

socket.on("battle:waiting", (payload) => {
  console.log("waiting", payload.remainingSeconds);
});

socket.on("battle:countdown", (payload) => {
  console.log("countdown", payload.remainingSeconds);
});

socket.on("battle:started", (payload) => {
  console.log("started", payload);
});

socket.on("battle:finished", (payload) => {
  console.log("finished", payload);
});

socket.emit("battle:ready", {
  nickname: "프론트테스트유저",
});
```

## Not Implemented Yet

아래 항목은 프론트가 아직 의존하면 안 됩니다.

- 실제 타이핑 입력 이벤트
- 오타 판정
- 탈락 처리
- 실시간 진행률
- 우승자 판정
- 소켓 인증 토큰 기반 접속 제한
