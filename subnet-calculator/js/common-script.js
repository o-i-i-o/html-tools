/* =====================================================
 * 子网计算器 公共脚本
 * 提供：中英文 i18n（参照 password-standalone 的实现方式）
 *      / 标签页切换 / 位图掩码编辑器
 * 本文件需在 ipv4-script.js、ipv6-script.js 之前加载
 * ===================================================== */
(() => {
  'use strict';

  /* =====================================================
   * 中英文 i18n
   * dict：{ key: { zh, en } }；页面通过 registerI18n 追加词条
   * t(key, params)：取当前语言文案，支持 {n} 插值
   * ===================================================== */
  const LANG_ZH = 'zh';
  const LANG_EN = 'en';

  let lang;
  try {
    lang = localStorage.getItem('lang') || LANG_ZH;
  } catch {
    // localStorage 在 file:// 或隐私模式下可能不可用
    lang = LANG_ZH;
  }

  const dict = {
    // 页面框架
    pageTitle: { zh: '子网计算器 | IPv4 / IPv6', en: 'Subnet Calculator | IPv4 / IPv6' },
    siteTitle: { zh: '子网计算器', en: 'Subnet Calculator' },
    navAria:   { zh: '协议切换', en: 'Protocol switch' },
    clear:     { zh: '清空', en: 'Clear' },

    // 位图掩码编辑器
    bitAria:  { zh: '第 {n} 位', en: 'Bit {n}' },
  };

  const registerI18n = (entries) => Object.assign(dict, entries);

  // RegExp.escape 为 ES2025 特性，旧环境回退到手动转义
  const escapeRegExp = (s) =>
    (typeof RegExp.escape === 'function' ? RegExp.escape(s) : s.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&'));

  function translate(key, params, langOverride) {
    const entry = dict[key];
    if (!entry) return key;
    let text = entry[langOverride ?? lang] ?? entry[LANG_ZH] ?? key;
    if (params) {
      for (const k of Object.keys(params)) {
        // 函数式 replace 避免 params 值中 $ 字符引发的二次替换问题
        text = text.replace(new RegExp(`\\{${escapeRegExp(k)}\\}`, 'g'), () => String(params[k]));
      }
    }
    return text;
  }

  /** 当前语言文案，支持 {key} 插值 */
  const t = (key, params) => translate(key, params);

  const langListeners = new Set();
  const onLangChange = (fn) => langListeners.add(fn);

  /* ---------- 语言切换按钮 ---------- */
  const btnLang = document.getElementById('btn-lang');
  btnLang.addEventListener('click', () => {
    lang = lang === LANG_ZH ? LANG_EN : LANG_ZH;
    try {
      localStorage.setItem('lang', lang);
    } catch {
      // 隐私模式或 file:// 下可能写入失败，忽略即可
    }
    applyLang();
  });

  /** 统一渲染所有静态文案，并通知页面刷新动态文案（计算结果等） */
  function applyLang() {
    document.documentElement.lang = lang === LANG_ZH ? 'zh-CN' : 'en';
    document.title = t('pageTitle');

    for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
    for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    }
    for (const el of document.querySelectorAll('[data-i18n-aria]')) {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    }

    btnLang.textContent = lang === LANG_ZH ? 'EN' : '中文';
    for (const fn of langListeners) fn();
  }

  /* =====================================================
   * 标签页切换
   * ===================================================== */
  const tabButtons = [...document.querySelectorAll('.tab-btn')];
  const tabPages = new Map(
    [...document.querySelectorAll('.tab-page')].map((page) => [page.dataset.page, page])
  );

  const activateTab = (name) => {
    if (!tabPages.has(name)) return;
    tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === name));
    tabPages.forEach((page, key) => page.classList.toggle('hidden', key !== name));
    try {
      history.replaceState(null, '', `#${name}`);
    } catch {
      /* file:// 等环境下 replaceState 可能被拒绝，忽略即可 */
    }
  };

  tabButtons.forEach((btn) => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
  activateTab(location.hash.slice(1) || tabButtons[0]?.dataset.tab);

  /* =====================================================
   * 位图掩码编辑器
   * 掩码位从最高位开始连续置 1，点击第 n 个图标即将前缀设为 n。
   * 图标显示位序号（1 起），仅选中的前缀边界位高亮。
   * 用法：createBitMask(容器, {
   *   total, columns, value, groupSize = 4, gapAfterRow,
   *   bitLabel(n) -> aria 文案, onChange(bits) })
   * 返回：{ get value / set value / refresh() }
   * ===================================================== */
  const createBitMask = (root, { total, columns, value, groupSize = 4, gapAfterRow, bitLabel, onChange }) => {
    root.classList.add('bit-mask');

    const bitEls = [];

    for (let r = 0; r < total / columns; r++) {
      const row = document.createElement('div');
      row.className = 'bit-row';
      if (r === gapAfterRow) row.classList.add('bit-row--gap-after');
      for (let c = 0; c < columns; c++) {
        const indexFromMsb = r * columns + c;
        const bit = document.createElement('button');
        bit.type = 'button';
        bit.className = 'bit';
        if (c > 0 && c % groupSize === 0) bit.classList.add('bit--group-start');
        bit.addEventListener('click', () => setValue(indexFromMsb + 1, true));
        row.appendChild(bit);
        bitEls.push(bit);
      }
      root.appendChild(row);
    }

    let current = value;

    const render = () => {
      bitEls.forEach((bit, i) => {
        bit.textContent = String(i + 1); // 图标显示位序号，仅选中的边界位高亮
        bit.classList.toggle('on', i === current - 1);
        bit.setAttribute('aria-pressed', String(i === current - 1));
        if (bitLabel) bit.setAttribute('aria-label', bitLabel(i + 1));
      });
    };

    const setValue = (next, notify = false) => {
      const v = Math.max(0, Math.min(total, next));
      if (v === current) return;
      current = v;
      render();
      if (notify) onChange?.(v);
    };
    
    render();
    return {
      get value() { return current; },
      set value(v) { setValue(v); },
      refresh: render, // 语言切换后重建 aria 文案用
    };
  };

  /* ---------- 暴露公共接口 ---------- */
  window.SubnetTool = { t, registerI18n, onLangChange, createBitMask };

  // 三个脚本都执行完毕、DOM 就绪后统一渲染文案并触发页面初始化计算
  document.addEventListener('DOMContentLoaded', () => applyLang());
})();
