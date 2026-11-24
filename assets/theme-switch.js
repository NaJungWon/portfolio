// [수강생 변경 11-24] 밝은 테마(포트폴리오 페이지 색) ↔ 다크 테마(예전 슬라이드 · 상세 문서 색) 전환
//   - theme/theme.css = 밝은 테마(기본), theme/theme-dark.css = 다크 테마. 둘 다 --t-* 손잡이만 씀(색만 다르고 크기 · 글꼴은 같음 → 슬라이드 배치는 그대로)
//   - project.html · doc.html의 <head>에서 theme-dark.css 링크 바로 뒤에 싣습니다(첫 화면부터 고른 모드로 — 깜빡임 없게)
//   - 고른 모드는 localStorage 'pf-theme'에 남겨 슬라이드 · 상세 문서가 같이 따름. 주소에 ?theme=dark|light를 붙이면 그 모드로 열림(남기지 않음 — 점검용)
//   - 버튼: 슬라이드는 아래 띠(nav.pf-hud), 상세 문서는 머리의 링크 줄(.head-nav)에 붙임.
//     포트폴리오 페이지(index.html)는 오른쪽 위에 버튼이 html로 있고, 다크 색은 index.html의 CSS(:root[data-pf-theme="dark"])가 정함
//   - 바꾼 뒤 PF.applyTheme()을 다시 불러 강조색 토큰(글자용 진하기 · 흰 글자 칠)을 새 바탕에 맞춤
(function () {
  const KEY = 'pf-theme';
  const link = document.getElementById('pf-theme-dark');
  const fromUrl = new URLSearchParams(location.search).get('theme');
  const saved = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  let mode = fromUrl === 'dark' || fromUrl === 'light' ? fromUrl : saved() === 'dark' ? 'dark' : 'light';

  function retint() {                                                  // 강조색 토큰을 지금 바탕에 맞춰 다시 계산(슬라이드 · 상세 문서만)
    if (!link) return;                                                 // 포트폴리오 페이지(index.html)는 자기 CSS 변수로 바뀜 — 테마 파일 · applyTheme을 쓰지 않음
    // common.js의 PF는 맨 위 const라 window.PF가 아님 → typeof로 확인
    if (typeof PF !== 'undefined' && typeof PF.applyTheme === 'function') PF.applyTheme();
  }
  function apply(m) {
    mode = m;
    if (link) link.media = m === 'dark' ? 'all' : 'not all';
    document.documentElement.dataset.pfTheme = m;
    document.querySelectorAll('[data-pf-theme-btn]').forEach(label);
  }
  function label(b) {
    const dark = mode === 'dark';
    b.setAttribute('aria-pressed', String(dark));
    b.title = dark ? '밝은 테마(포트폴리오 색)로 바꾸기' : '다크 테마로 바꾸기';
    const l = b.querySelector('.l'), s = b.querySelector('.s');
    if (l) l.textContent = dark ? '라이트 모드' : '다크 모드';
    if (s) s.textContent = dark ? '라이트' : '다크';
    if (!l && !s) b.textContent = dark ? '☀ 라이트 모드' : '☾ 다크 모드';
  }
  function toggle() {
    apply(mode === 'dark' ? 'light' : 'dark');
    try { localStorage.setItem(KEY, mode); } catch (e) { /* 저장 못 해도 이번 화면은 바뀜 */ }
    retint();
  }
  apply(mode);
  if (link) link.addEventListener('load', retint);                     // 다크 파일이 페이지보다 늦게 도착해도 색 토큰을 다시 맞춤

  function bind(b) {                                                   // 버튼 하나에 한 번만 연결
    if (b.dataset.pfThemeBound) return;
    b.dataset.pfThemeBound = '1';
    b.addEventListener('click', toggle);
    label(b);
  }
  function addButton() {
    const have = document.querySelectorAll('[data-pf-theme-btn]');     // 포트폴리오 페이지는 html에 버튼이 이미 있음(오른쪽 위)
    if (have.length) { have.forEach(bind); return true; }
    const hud = document.querySelector('nav.pf-hud');                  // 슬라이드 아래 띠
    if (hud) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.pfThemeBtn = '';
      b.innerHTML = '<span class="l"></span><span class="s"></span>';
      const view = hud.querySelector('[data-a=view]');
      view ? view.before(b) : hud.appendChild(b);
      bind(b);
      return true;
    }
    const nav = document.querySelector('.doc-head .head-nav');         // 상세 문서 머리 링크 줄
    if (nav) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn';
      b.dataset.pfThemeBtn = '';
      nav.appendChild(b);
      bind(b);
      return true;
    }
    return false;
  }
  function watch() {
    if (addButton()) return;
    const mo = new MutationObserver(() => { if (addButton()) mo.disconnect(); });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch);
})();
