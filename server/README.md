# 커피 주문 앱 - 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
NODE_ENV=development
PORT=3000

# PostgreSQL 데이터베이스 연결 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password
```

**환경 변수 설명:**
- `NODE_ENV`: 실행 환경 (development, production, test)
- `PORT`: 서버 포트 번호
- `DB_*`: PostgreSQL 데이터베이스 연결 정보

**중요:** `DB_PASSWORD`를 실제 PostgreSQL 비밀번호로 변경하세요.

## 데이터베이스 초기화

데이터베이스와 테이블을 자동으로 생성하려면 다음 명령어를 실행하세요:

```bash
npm run init-db
```

이 명령어는 다음 작업을 수행합니다:
- `order_app` 데이터베이스 생성 (없는 경우)
- 필요한 테이블 생성 (menus, options, orders, order_items)
- 초기 메뉴 및 옵션 데이터 삽입
- 자동 업데이트 트리거 설정

**참고:** PostgreSQL 서비스가 실행 중이어야 합니다.

## 실행

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:menuId` - 특정 메뉴 조회
- `PATCH /api/menus/:menuId/stock` - 재고 수정

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:orderId` - 특정 주문 조회
- `PATCH /api/orders/:orderId/status` - 주문 상태 변경

자세한 API 명세는 `docs/PRD.md`를 참고하세요.

