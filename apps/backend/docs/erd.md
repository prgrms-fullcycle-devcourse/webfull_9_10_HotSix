# Keyboard Warrior Battle Royale ERD

## ERD Principle


## Source Schema

```text
Table users {
  id uuid [primary key]
  nickname varchar [unique]
  avatar_url string
  created_at now
}

Table user_stats {
  id integer [pk]
  user_id uuid [unique, ref: - users.id]
  total_games integer
  wins integer
  wpm integer
  avg_rank integer
  best_rank integer
  recent_rank integer
  world_rank integer
  accuracy integer
  top_percentile integer
  total_play_count integer
  avg_word_count integer
  recent_word_count integer
  total_word_count integer
  updated_at integer
}

Table refresh_tokens  {
  id integer [primary key]
  user_id uuid [unique, ref: - users.id]
  token hash
  expires_at datetime
  created_at now
}

Table prompts {
  id integer [primary key]
  slug varchar [unique]
  title varchar
  content text
  content_length integer
  is_active boolean
  created_at now
}

Table games {
  id integer [primary key]
  status boolean
  started_at varchar
  ended_at varchar
  total_players varchar
  winner_user_id text
  prompt_id integer [ref: > prompts.id]
}

Table participants {
  id integer [primary key]
  game_id integer [ref: > games.id]
  chat_id integer [ref: > chats.id]
  user_id integer [ref: > users.id]
  final_rank integer
  is_winner boolean
  is_suvived boolean
  life integer
  wpm integer
  accuracy integer
  created_at date
}

Table chats {
  id integer [primary key]
  status boolean
  started_at varchar
  ended_at varchar
  total_players varchar
  winner_user_id text
}
```

## Mermaid ERD

```mermaid
erDiagram
    USERS ||--|| USER_STATS : has
    USERS ||--|| REFRESH_TOKENS : owns
    USERS ||--o{ PARTICIPANTS : plays_as
    PROMPTS ||--o| GAMES : assigned_to
    GAMES ||--o| PARTICIPANTS : has
    CHATS ||--o| PARTICIPANTS : maps_to

    USERS {
      uuid id PK
      varchar nickname UK
      string avatar_url
      now created_at
    }

    USER_STATS {
      int id PK
      uuid user_id UK,FK
      int total_games
      int wins
      int wpm
      int avg_rank
      int best_rank
      int recent_rank
      int world_rank
      int accuracy
      int top_percentile
      int total_play_count
      int avg_word_count
      int recent_word_count
      int total_word_count
      int updated_at
    }

    REFRESH_TOKENS {
      int id PK
      uuid user_id UK,FK
      hash token
      datetime expires_at
      now created_at
    }

    PROMPTS {
      int id PK
      varchar slug UK
      varchar title
      text content
      int content_length
      boolean is_active
      now created_at
    }

    GAMES {
      int id PK
      boolean status
      varchar started_at
      varchar ended_at
      varchar total_players
      text winner_user_id
      int prompt_id FK
    }

    PARTICIPANTS {
      int id PK
      int game_id FK
      int chat_id FK
      int user_id FK
      int final_rank
      boolean is_winner
      boolean is_suvived
      int life
      int wpm
      int accuracy
      date created_at
    }

    CHATS {
      int id PK
      boolean status
      varchar started_at
      varchar ended_at
      varchar total_players
      text winner_user_id
    }
```

## Interpretation Notes

- `users`: 익명 사용자 기본 프로필
- `user_stats`: 대시보드 집계 데이터
- `refresh_tokens`: 재로그인 및 세션 연장용 토큰 저장
- `prompts`: 타이핑 게임에서 사용할 한글 원문 저장
- `games`: 각 배틀 라운드 메타데이터
- `participants`: 사용자별 게임 결과 기록
- `chats`: 현재 스키마상 참가 기록과 연결된 별도 세션 또는 룸 개념으로 해석 가능

## Implementation Notes

- `status`가 `boolean`인 테이블은 현재 문서에서는 원본을 유지합니다. 실제 서비스 코드에서는 `true/false` 값을 `대기/진행/종료` 같은 상태로 매핑해 사용할 수 있습니다.
- `started_at`, `ended_at`, `total_players`, `winner_user_id` 타입도 원본을 유지합니다. 구현 단계에서 필요한 경우 DTO나 서비스 레이어에서 타입 변환을 수행하는 방식이 안전합니다.
- `participants`의 `unique` 제약은 실제 게임 규칙상 다소 강하게 보일 수 있지만, 이번 문서에서는 수정하지 않고 유지합니다. 구현 전 최종 DB 적용 단계에서 팀 합의로 재검토하면 됩니다.
- 멀티 탭 감지, 비활성 사용자 실격, 실시간 진행률 갱신 같은 기능은 우선 DB 스키마 변경 없이 소켓 연결 상태와 Redis 메모리 상태로 처리하는 방향을 권장합니다.
