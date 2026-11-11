# 작은 숲 공방

TypeScript + Vite + Babylon.js로 만든 아늑한 3D 블록 마을 프로토타입입니다. 작은 섬을 산책하며 자유롭게 꾸밀 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## 조작

- WASD/방향키 또는 화면의 방향 버튼으로 산책
- 도구함에서 블록을 고른 후 땅을 클릭하거나 터치해서 놓기
- 블록 윗면을 누르면 위에 쌓기, 옆면을 누르면 옆에 놓기
- 치우기 모드에서 블록을 눌러 제거
- 숫자 1~6으로 블록 선택, E로 모드 전환, 마우스 휠로 확대/축소
- 브라우저 저장소에 자동 저장. 저장하기 버튼으로 즉시 저장

## 구성

- `src/workshop.ts`: 섬, 캐릭터, 블록 배치와 저장, 키보드·터치 조작
- `src/workshop.css`: 데스크톱·태블릿·모바일 화면 UI
- `vite.config.ts`: 정적 웹 배포 설정

이 버전은 로컬 1인용 꾸미기 게임입니다. 저장 내용은 사용 중인 브라우저에만 남습니다. 온라인 계정과 멀티플레이는 아직 없습니다.

## Cloudflare Pages

GitHub 저장소 연결 후 다음 값을 사용합니다.

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

## GitHub Pages

이 저장소의 `main` 브랜치에 push하면 GitHub Actions가 `dist`를 빌드하고 Pages에 배포합니다.

- Workflow: `.github/workflows/deploy-github-pages.yml`
- Vite base: `./`
- 저장소 Settings → Pages → Source는 `GitHub Actions`로 설정합니다.

## 성능

간단한 저폴리 메시와 제한된 내부 해상도를 사용합니다. 실제 태블릿의 FPS와 터치 반응은 실기기에서 확인해야 합니다.
