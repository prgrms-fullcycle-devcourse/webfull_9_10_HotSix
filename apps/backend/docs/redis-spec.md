# Redis Key-Value Specification

현재 백엔드 구현에서 실제로 사용하는 Redis 키 구조를 정리한 문서입니다.

## Overview

- Redis URL: `REDIS_URL`
- 클라이언트: `ioredis`
- 기본 목적:
  - 현재 배틀 게임 상태 저장
  - 단일 타이머 실행 락 관리
  - 로비 플레이어 집합 저장

## Key Summary

| Key Prefix / Pattern | Key 이름 | Data Type | Value 구조 / 설명 | TTL (만료 시간) | 비고 |
| --- | --- | --- | --- | --- | --- |
| `battle:current-game-id` | `battle:current-game-id` | `String` | 현재 진행 기준이 되는 `gameId` 문자열 | 없음 | 현재 활성 게임 포인터 |
| `battle:game:{gameId}:state` | `battle:game:{gameId}:state` | `String(JSON)` | `CurrentGameState` 전체 JSON 문자열 | 없음 | 게임 상태 스냅샷 |
| `battle:timer-lock` | `battle:timer-lock` | `String` | 타이머 실행권을 나타내는 `lockToken` 문자열 | `1초` | 중복 타이머 실행 방지용 분산 락 |
| `lobby:players` | `lobby:players` | `Set` | 로비에 입장한 플레이어 `userId` 집합 | 없음 | 현재는 퇴장 정리가 없음 |

## Value Reference

### `battle:current-game-id`

```text
"01969f5d-dc6d-7b11-b9df-7d8e9a2d10fa"
```

### `battle:game:{gameId}:state`

```json
{
  "gameId": "01969f5d-dc6d-7b11-b9df-7d8e9a2d10fa",
  "prompt": {
    "id": 2,
    "slug": "city-before-rain-750",
    "title": "비 오기 전 도시",
    "content": "string",
    "contentLength": 750,
    "language": "ko"
  },
  "phase": "waiting",
  "minPlayers": 4,
  "playerCount": 2,
  "spectatorCount": 0,
  "waitingStartedAt": "2026-05-04T12:00:00.000Z",
  "waitingEndsAt": "2026-05-04T12:15:00.000Z",
  "gameStartedAt": null,
  "gameEndedAt": null,
  "createdAt": "2026-05-04T12:00:00.000Z",
  "updatedAt": "2026-05-04T12:00:00.000Z"
}
```

설명:

- `phase`:
  - `waiting`
  - `in_progress`
  - `finished`
- `prompt`:
  - 대기 중에는 Socket 응답에서 `content` 가 숨겨질 수 있지만 Redis 원본 상태에는 전체 문자열이 들어갑니다.

### `battle:timer-lock`

```text
"01969f5d-dc80-7a4b-b6b3-3b4c91a80f1b"
```

설명:

- 타이머 tick 처리 시 서버 인스턴스 하나만 실행권을 가지도록 사용하는 락 값입니다.
- TTL 만료 후 다음 tick 에 다시 획득합니다.

### `lobby:players`

```text
["user-1", "user-2", "user-3"]
```

설명:

- `SADD` 기반 집합입니다.
- 현재는 `join` 시 추가만 하고, `leave` 제거 로직은 아직 없습니다.

## Current Usage Notes

1. `battle:current-game-id` 와 `battle:game:{gameId}:state` 는 항상 같이 사용됩니다.
2. 대기 타이머는 `battle:timer-lock` 을 먼저 획득한 인스턴스만 실행합니다.
3. 게임 시작 조건은 Redis 상태의 `playerCount >= minPlayers` 입니다.
4. 대기 시간이 끝났는데 인원이 4명 미만이면 같은 `gameId` 상태에서 `waitingStartedAt`, `waitingEndsAt`, `updatedAt` 만 갱신해 15분 대기를 다시 시작합니다.
