# 프런트엔드 Render.com 배포 가이드

## 1단계: 코드 수정 사항

### ✅ 완료된 수정사항

1. **API URL 환경 변수화** (`UI/src/api/api.js`)
   - 하드코딩된 `http://localhost:3000/api`를 환경 변수로 변경
   - `VITE_API_URL` 환경 변수 사용
   - 로컬 개발 시 기본값 유지

2. **환경 변수 예제 파일 생성** (`UI/.env.example`)
   - 배포 시 참고할 수 있는 예제 파일

---

## 2단계: Render.com에서 Static Site 생성

### 2.1 새 Static Site 생성

1. Render.com 대시보드 접속
2. **"New +"** 버튼 클릭
3. **"Static Site"** 선택

### 2.2 GitHub 저장소 연결

1. GitHub 계정 연결 (처음인 경우)
2. 저장소 선택: `order-app` (또는 실제 저장소 이름)
3. Branch: `main` (또는 `master`)

### 2.3 기본 설정

다음 정보를 입력:

- **Name**: `order-app-ui` (원하는 이름)
- **Root Directory**: `UI` ⚠️ **중요!**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` ⚠️ **중요!** (Vite 기본 빌드 출력 디렉토리)

### 2.4 환경 변수 설정

**"Environment"** 섹션에서 다음 환경 변수 추가:

```
VITE_API_URL=https://your-backend-service.onrender.com/api
```

⚠️ **주의**: `your-backend-service`를 실제 백엔드 서비스 이름으로 변경하세요!

예시:
```
VITE_API_URL=https://order-app-server.onrender.com/api
```

### 2.5 배포 시작

1. **"Create Static Site"** 버튼 클릭
2. 배포 진행 상황 확인 (Events 탭)

---

## 3단계: 배포 확인

### 3.1 배포 상태 확인

- **Events** 탭에서 배포 진행 상황 확인
- **"Live"** 상태가 되면 배포 완료

### 3.2 프런트엔드 접속 테스트

1. 배포된 프런트엔드 URL 접속 (예: `https://order-app-ui.onrender.com`)
2. 브라우저 개발자 도구(F12) → Console 탭 확인
3. 네트워크 오류가 없는지 확인

### 3.3 기능 테스트

- [ ] 메뉴 목록이 정상 표시되는지 확인
- [ ] 장바구니에 메뉴 추가가 작동하는지 확인
- [ ] 주문하기가 작동하는지 확인
- [ ] 관리자 화면이 정상 작동하는지 확인

---

## 문제 해결

### 빌드 오류

**증상**: Build Command 실행 실패

**해결 방법**:
1. **Root Directory**가 `UI`로 설정되어 있는지 확인
2. **Build Command**가 `npm install && npm run build`인지 확인
3. **Logs** 탭에서 상세 오류 메시지 확인

### API 연결 오류

**증상**: 프런트엔드에서 백엔드 API 호출 실패

**해결 방법**:
1. **환경 변수 확인**: `VITE_API_URL`이 올바른 백엔드 URL인지 확인
   - 백엔드 URL 형식: `https://your-backend-service.onrender.com/api`
   - `http://`가 아닌 `https://` 사용
   - `/api`로 끝나는지 확인

2. **CORS 오류인 경우**:
   - 백엔드 서버의 CORS 설정 확인
   - 프런트엔드 도메인이 허용되어 있는지 확인

3. **브라우저 콘솔 확인**:
   - F12 → Console 탭에서 오류 메시지 확인
   - Network 탭에서 API 요청 상태 확인

### 빈 화면 표시

**증상**: 페이지는 로드되지만 내용이 비어있음

**해결 방법**:
1. 브라우저 콘솔에서 JavaScript 오류 확인
2. Network 탭에서 API 요청이 실패하는지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

---

## 환경 변수 참고

### Vite 환경 변수 규칙

- Vite는 `VITE_` 접두사가 있는 환경 변수만 클라이언트에 노출
- 빌드 시점에 환경 변수가 코드에 삽입됨
- 배포 후 환경 변수 변경 시 재배포 필요

### 환경별 설정 예시

**로컬 개발**:
```
VITE_API_URL=http://localhost:3000/api
```

**Render.com 프로덕션**:
```
VITE_API_URL=https://order-app-server.onrender.com/api
```

---

## 추가 최적화 (선택사항)

### 1. 커스텀 도메인 설정

Render.com에서 커스텀 도메인을 설정할 수 있습니다:
1. Static Site 설정 → **"Custom Domains"** 섹션
2. 도메인 추가 및 DNS 설정

### 2. 환경 변수 관리

프로덕션과 개발 환경을 분리하려면:
- 개발: `.env.development`
- 프로덕션: Render.com 환경 변수 설정

---

## 배포 후 체크리스트

- [ ] 프런트엔드 URL이 정상 접속됨
- [ ] 메뉴 목록이 정상 표시됨
- [ ] 장바구니 기능이 정상 작동함
- [ ] 주문 생성이 정상 작동함
- [ ] 관리자 화면이 정상 작동함
- [ ] 브라우저 콘솔에 오류가 없음
- [ ] API 호출이 정상 작동함

---

## 참고 사항

- **Free Tier 제한**: Render.com Free tier는 15분간 비활성 시 서비스가 sleep 상태가 됩니다
- **빌드 시간**: 첫 빌드는 보통 2-5분 정도 소요됩니다
- **환경 변수 변경**: 환경 변수를 변경한 후에는 재배포가 필요합니다

