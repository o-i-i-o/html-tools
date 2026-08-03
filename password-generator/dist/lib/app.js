/**
 * 随机密码生成工具
 * 
 * 纯原生 JS 实现
 * 支持批量生成密码，使用 CSPRNG 缓冲区优化
 * 内置 zh/en 双语 
 * 
 */


const LANG_ZH = 'zh';
const LANG_EN = 'en';

const dict = {
  // 页面标题与章节
  title:            { zh: '随机密码生成',         en: 'Random Password Generator' },
  pageTitle:        { zh: '随机密码生成 - 在线工具', en: 'Password Generator - Online Tool' },
  config:           { zh: '配置选项',             en: 'Configuration' },
  lengthLabel:      { zh: '密码长度',             en: 'Password Length' },
  lengthHint:       { zh: '最多 128 位',          en: 'Max 128' },
  countLabel:       { zh: '生成数量',             en: 'Generate Count' },
  countHint:        { zh: '最多 50 条',           en: 'Max 50' },
  passwordLabel:    { zh: '密码',                 en: 'Passwords' },

  // 复选框
  digits:           { zh: '数字',                 en: 'Digits' },
  lowerCase:        { zh: '小写字母',             en: 'Lowercase' },
  upperCase:        { zh: '大写字符',             en: 'Uppercase' },
  specialChar:      { zh: '特殊字符',             en: 'Special Chars' },
  excludeConfuse:   { zh: '排除混淆字符(1lI、0oO)', en: 'Exclude ambiguous (1lI, 0oO)' },

  // placeholder
  otherCharPlaceholder: { zh: '输入自定义字符',   en: 'Custom characters' },

  // 按钮
  copyAll:          { zh: '全部复制',             en: 'Copy All' },
  refresh:          { zh: '刷新',                 en: 'Refresh' },
  copy:             { zh: '复制',                 en: 'Copy' },

  // Toast 消息
  copiedNth:        { zh: '已复制第 {n} 条',      en: 'Copied #{n}' },
  copiedAll:        { zh: '已复制全部 {n} 条',    en: 'Copied all {n} passwords' },
  copyFailed:       { zh: '复制失败',             en: 'Copy failed' },
  noCharSet:        { zh: '请至少勾选一个字符集',  en: 'Please select at least one character set' },
  cryptoUnavailable:{ zh: '当前环境不支持安全随机数，请使用 HTTPS 访问', en: 'Secure RNG unavailable. Please use HTTPS.' },

  // 密码安全知识
  safetyTitle:      { zh: '密码安全知识',         en: 'Password Safety Tips' },
  safety1: {
    zh: '1、给自己的用户名设置足够长度的密码，最好使用大小写混合和特殊符号，不要为了贪图好记而使用纯数字密码',
    en: '1. Use a sufficiently long password with mixed case and special symbols. Avoid pure numeric passwords for the sake of memorability.',
  },
  safety2: {
    zh: '2、不要使用与自己相关的资料作为个人密码，如自己或家人的生日、电话号码、身份证号码、门牌号、姓名简写',
    en: '2. Never use personal information as passwords, such as birthdays, phone numbers, ID numbers, addresses, or name abbreviations.',
  },
  safety3: {
    zh: '3、不用单词做密码，如果要用，可以在后面加复数s或者符号，这样可以减小被字典猜出的机会',
    en: '3. Avoid dictionary words as passwords. If you must, append plural forms or symbols to reduce the chance of dictionary attacks.',
  },
  safety4: {
    zh: '4、不要所有平台只用一个密码，要经常更换，特别是遇到可疑情况的时候',
    en: '4. Never reuse the same password across platforms. Change passwords frequently, especially after suspicious activity.',
  },
};

/** 当前语言 */
let lang;
try {
  lang = localStorage.getItem('lang') || LANG_ZH;
} catch (e) {
  // localStorage 在 file:// 或隐私模式下可能不可用
  lang = LANG_ZH;
}

/**
 * 翻译：取当前语言的文案，支持 {key} 插值
 * 使用函数式 replace 避免 params[k] 中 $ 字符引发的二次替换问题，
 * 同时通过正则 g 标志确保替换所有出现的占位符
 */
function t(key, params) {
  const entry = dict[key];
  if (!entry) return key;
  let text = entry[lang] || entry[LANG_ZH] || key;
  if (params) {
    Object.keys(params).forEach(k => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), () => params[k]);
    });
  }
  return text;
}

// ============================================================
// 工具函数
// ============================================================

function setStyles(element, styles) {
  Object.keys(styles).forEach(key => {
    element.style[key] = styles[key];
  });
}

function getToastStyle(type) {
  const styles = {
    success: { color: '#67c23a', backgroundColor: '#f0f9eb', border: '1px solid #c2e7b0' },
    warning: { color: '#e6a23c', backgroundColor: '#fdf6ec', border: '1px solid #f5dab1' },
    danger:  { color: '#f56c6c', backgroundColor: '#fef0f0', border: '1px solid #fbc4c4' },
    info:    { color: '#409eff', backgroundColor: '#ecf5ff', border: '1px solid #b3d8ff' },
  };
  return styles[type] || styles.info;
}

/**
 * 防抖：高频输入时只在停止输入后触发一次，避免批量生成密码导致卡顿
 */
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ============================================================
// Toast 消息提示系统
// ============================================================

let toastLocked = false;

function showToast(type, message) {
  if (toastLocked) return;
  // 锁定时长与显示时长对齐，避免连续触发时 toast 堆叠
  toastLocked = true;
  setTimeout(() => { toastLocked = false; }, 1500);

  const toastEl = document.createElement('div');
  // aria-live 让屏幕阅读器朗读 toast 内容
  toastEl.setAttribute('role', 'status');
  toastEl.setAttribute('aria-live', 'polite');
  setStyles(toastEl, {
    boxSizing: 'border-box', position: 'fixed', top: '0', left: '50%',
    zIndex: 9999, padding: '12px 20px', width: '308px', minHeight: '40px',
    fontSize: '14px', textAlign: 'left', borderRadius: '4px',
    transition: '0.5s', transform: 'translate(-50%, 0)', opacity: '0',
    ...getToastStyle(type),
  });

  toastEl.innerText = message;
  document.body.appendChild(toastEl);

  setTimeout(() => {
    setStyles(toastEl, { transform: 'translate(-50%, 80%)', opacity: '1' });
  });
  setTimeout(() => {
    setStyles(toastEl, { transform: 'translate(-50%, 0)', opacity: '0' });
  }, 1500);
  setTimeout(() => {
    if (toastEl.parentNode) document.body.removeChild(toastEl);
  }, 2000);
}

// ============================================================
// 剪贴板复制
// ============================================================

/**
 * 复制到剪贴板，返回 Promise<boolean>，true 表示复制成功
 */
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  return new Promise(resolve => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    resolve(ok);
  });
}

// ============================================================
// 字符集定义
// ============================================================

const CHAR_SETS = {
  digits: '0123456789',
  lower:  'abcdefghijklmnopqrstuvwxyz',
  upper:  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
};

const CONFUSE_CHARS = ['0', '1', 'l', 'I', 'o', 'O'];

function filterConfuseChars(charSet) {
  return charSet.split('').filter(ch => !CONFUSE_CHARS.includes(ch)).join('');
}

// 模块加载时预计算过滤后的字符集，避免每次生成密码都重复过滤
const CHAR_SETS_FILTERED = {
  digits: filterConfuseChars(CHAR_SETS.digits),
  lower:  filterConfuseChars(CHAR_SETS.lower),
  upper:  filterConfuseChars(CHAR_SETS.upper),
};

/**
 * 对自定义字符进行去重，避免重复字符在池中占比过高破坏随机性
 */
function dedupChars(str) {
  return Array.from(new Set(str.split(''))).join('');
}

// ============================================================
// 缓冲式 CSPRNG
// ============================================================

const RandomBuffer = {
  pool: null,
  index: 0,
  size: 4096,

  /** 检测当前环境是否支持 CSPRNG */
  isAvailable() {
    return typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function';
  },

  refill() {
    if (!this.isAvailable()) {
      // 抛错给上层调用方处理，绝不退化为 Math.random() 以保证密码安全性
      throw new Error('crypto.getRandomValues is not available');
    }
    this.pool = new Uint32Array(this.size);
    crypto.getRandomValues(this.pool);
    this.index = 0;
  },

  next() {
    // 懒加载：首次或耗尽时才 refill，避免顶层立即调用导致脚本崩溃
    if (!this.pool || this.index >= this.pool.length) {
      this.refill();
    }
    return this.pool[this.index++];
  },
};

function secureRandomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  let value;
  do {
    value = RandomBuffer.next();
  } while (value >= limit);
  return value % max;
}

// ============================================================
// 密码生成核心逻辑
// ============================================================

// 单条密码长度上限：避免一次性生成超长字符串导致卡顿与内存压力
const MAX_LENGTH = 128;

function randomCharFrom(str) {
  return str.charAt(secureRandomInt(str.length));
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateOnePassword(options) {
  const {
    includeNum, includeLowerCase, includeUpperCase,
    includeOtherChar, withoutConfuseChar, otherChar, length,
  } = options;

  // 防御性二次校验：即使调用方绕过 UI 直接调用，也强制不超过 MAX_LENGTH，
  // 避免一次循环中拼接超长字符串拖慢渲染
  const safeLength = Math.max(1, Math.min(length, MAX_LENGTH));

  // 收集所有勾选的字符集（已应用混淆字符过滤、自定义字符已去重 + 过滤）
  const sets = [];
  if (includeNum) {
    sets.push(withoutConfuseChar ? CHAR_SETS_FILTERED.digits : CHAR_SETS.digits);
  }
  if (includeLowerCase) {
    sets.push(withoutConfuseChar ? CHAR_SETS_FILTERED.lower : CHAR_SETS.lower);
  }
  if (includeUpperCase) {
    sets.push(withoutConfuseChar ? CHAR_SETS_FILTERED.upper : CHAR_SETS.upper);
  }
  if (includeOtherChar && otherChar) {
    let customChars = dedupChars(otherChar);
    if (withoutConfuseChar) customChars = filterConfuseChars(customChars);
    if (customChars) sets.push(customChars);
  }

  const validSets = sets.filter(Boolean);
  if (!validSets.length) return '';

  // 保证字符数量不超过 safeLength，否则 slice 会随机丢弃部分保证字符，
  // -无法保证每类至少出现一次
  const guaranteeCount = Math.min(validSets.length, safeLength);

  // 随机洗牌字符集顺序，避免保证字符总来自前几个集合
  const shuffledSets = shuffleArray(validSets.slice());

  let pool = '';
  let guaranteedChars = '';
  for (let i = 0; i < shuffledSets.length; i++) {
    pool += shuffledSets[i];
    if (i < guaranteeCount) {
      guaranteedChars += randomCharFrom(shuffledSets[i]);
    }
  }

  const poolArray = pool.split('');
  let password = guaranteedChars;

  while (password.length < safeLength) {
    password += poolArray[secureRandomInt(poolArray.length)];
  }

  const chars = password.split('');
  shuffleArray(chars);
  return chars.slice(0, safeLength).join('');
}

function generatePasswords(options, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generateOnePassword(options));
  }
  return results;
}

// ============================================================
// DOM 交互绑定
// ============================================================

(function init() {
  // ---------- 获取 DOM 元素 ----------

  const btnLang            = document.getElementById('btn-lang');

  const textConfig         = document.getElementById('text-config');
  const textLength         = document.getElementById('text-length');
  const textLengthHint     = document.getElementById('text-length-hint');
  const textCount          = document.getElementById('text-count');
  const textCountHint      = document.getElementById('text-count-hint');
  const textPassword       = document.getElementById('text-password');
  const textSafetyTitle    = document.getElementById('text-safety-title');
  const textSafety1        = document.getElementById('text-safety-1');
  const textSafety2        = document.getElementById('text-safety-2');
  const textSafety3        = document.getElementById('text-safety-3');
  const textSafety4        = document.getElementById('text-safety-4');

  const checkboxNum        = document.getElementById('chk-num');
  const checkboxLower      = document.getElementById('chk-lower');
  const checkboxUpper      = document.getElementById('chk-upper');
  const checkboxOther      = document.getElementById('chk-other');
  const checkboxConfuse    = document.getElementById('chk-confuse');

  const inputOtherChar     = document.getElementById('input-other-char');
  const inputLength        = document.getElementById('input-length');
  const inputCount         = document.getElementById('input-count');
  const passwordList       = document.getElementById('password-list');

  const btnCopyAll         = document.getElementById('btn-copy-all');
  const btnRefresh         = document.getElementById('btn-refresh');

  // ---------- 应用状态 ----------

  const MAX_COUNT = 50;

  const state = {
    includeNum: true,
    includeLowerCase: true,
    includeUpperCase: true,
    includeOtherChar: true,
    withoutConfuseChar: false,
    otherChar: '!@#$%^&*',
    length: 8,
    count: 5,
  };

  // ---------- 更新复选框 UI ----------

  function updateCheckboxUI(checkbox, checked) {
    checkbox.classList.toggle('checked', checked);
    checkbox.setAttribute('aria-checked', checked);
  }

  // ---------- 渲染所有静态文本 ----------

  function renderI18n() {
    document.documentElement.lang = lang === LANG_ZH ? 'zh-CN' : 'en';
    document.title = t('pageTitle');

    textConfig.textContent      = t('config');
    textLength.textContent      = t('lengthLabel');
    textLengthHint.textContent  = t('lengthHint');
    textCount.textContent       = t('countLabel');
    textCountHint.textContent   = t('countHint');
    textPassword.textContent    = t('passwordLabel');

    checkboxNum.textContent     = t('digits');
    checkboxLower.textContent   = t('lowerCase');
    checkboxUpper.textContent   = t('upperCase');
    checkboxOther.textContent   = t('specialChar');
    checkboxConfuse.textContent = t('excludeConfuse');

    // 同步 aria-label，方便屏幕阅读器朗读
    checkboxNum.setAttribute('aria-label', t('digits'));
    checkboxLower.setAttribute('aria-label', t('lowerCase'));
    checkboxUpper.setAttribute('aria-label', t('upperCase'));
    checkboxOther.setAttribute('aria-label', t('specialChar'));
    checkboxConfuse.setAttribute('aria-label', t('excludeConfuse'));

    inputOtherChar.placeholder  = t('otherCharPlaceholder');

    btnCopyAll.textContent      = t('copyAll');
    btnRefresh.textContent      = t('refresh');
    btnLang.textContent         = lang === LANG_ZH ? 'EN' : '中文';

    textSafetyTitle.textContent = t('safetyTitle');
    textSafety1.textContent     = t('safety1');
    textSafety2.textContent     = t('safety2');
    textSafety3.textContent     = t('safety3');
    textSafety4.textContent     = t('safety4');

    // 重新渲染密码列表以更新"复制"按钮文字
    if (state._lastPasswords) {
      renderPasswords(state._lastPasswords);
    }
  }

  // ---------- 渲染密码列表 ----------

  function renderPasswords(passwords) {
    state._lastPasswords = passwords;
    passwordList.innerHTML = '';

    passwords.forEach((pwd, i) => {
      const row = document.createElement('div');
      row.className = 'password-row';

      const index = document.createElement('span');
      index.className = 'password-index';
      // CSS 已设置 text-align: right，无需 padStart 填充空格
      // （HTML 会折叠前导空格，padStart 在这里无效）
      index.textContent = String(i + 1);

      const input = document.createElement('input');
      input.type = 'text';
      input.readOnly = true;
      input.value = pwd;
      input.className = 'password-value';

      const btnCopy = document.createElement('button');
      btnCopy.className = 'password-copy';
      btnCopy.textContent = t('copy');
      btnCopy.addEventListener('click', () => {
        copyToClipboard(pwd).then(ok => {
          if (ok) {
            showToast('success', t('copiedNth', { n: i + 1 }));
          } else {
            showToast('danger', t('copyFailed'));
          }
        });
      });

      row.appendChild(index);
      row.appendChild(input);
      row.appendChild(btnCopy);
      passwordList.appendChild(row);
    });
  }

  // ---------- 生成密码 ----------

  function generator() {
    // 字符集为空时给出提示，避免渲染一堆空密码行
    const hasAnySet = state.includeNum || state.includeLowerCase ||
                      state.includeUpperCase ||
                      (state.includeOtherChar && !!state.otherChar);
    if (!hasAnySet) {
      renderPasswords([]);
      showToast('warning', t('noCharSet'));
      return;
    }

    try {
      const passwords = generatePasswords({
        includeNum: state.includeNum,
        includeLowerCase: state.includeLowerCase,
        includeUpperCase: state.includeUpperCase,
        includeOtherChar: state.includeOtherChar,
        withoutConfuseChar: state.withoutConfuseChar,
        otherChar: state.otherChar,
        length: state.length,
      }, state.count);

      renderPasswords(passwords);
    } catch (e) {
      // crypto.getRandomValues 在非 secure context 下可能不可用
      showToast('danger', t('cryptoUnavailable'));
      renderPasswords([]);
    }
  }

  // ---------- 语言切换 ----------

  btnLang.addEventListener('click', () => {
    lang = lang === LANG_ZH ? LANG_EN : LANG_ZH;
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {
      // 隐私模式或 file:// 下可能写入失败，忽略即可
    }
    renderI18n();
  });

  // ---------- 复选框事件 ----------

  function bindCheckbox(checkbox, stateKey, onChange) {
    const toggle = () => {
      state[stateKey] = !state[stateKey];
      updateCheckboxUI(checkbox, state[stateKey]);
      if (onChange) onChange();
      generator();
    };
    checkbox.addEventListener('click', toggle);
    checkbox.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });
  }

  // 勾选/取消"特殊字符"时同步禁用/启用自定义字符输入框
  function syncOtherCharDisabled() {
    inputOtherChar.disabled = !state.includeOtherChar;
  }

  bindCheckbox(checkboxNum,     'includeNum');
  bindCheckbox(checkboxLower,   'includeLowerCase');
  bindCheckbox(checkboxUpper,   'includeUpperCase');
  bindCheckbox(checkboxOther,   'includeOtherChar', syncOtherCharDisabled);
  bindCheckbox(checkboxConfuse, 'withoutConfuseChar');

  // ---------- 输入框事件（防抖避免每次按键都批量生成） ----------

  const debouncedGenerator = debounce(generator, 150);

  inputOtherChar.addEventListener('input', () => {
    state.otherChar = inputOtherChar.value;
    debouncedGenerator();
  });

  inputLength.addEventListener('input', () => {
    const raw = inputLength.value.trim();
    let val = parseInt(raw, 10);
    if (isNaN(val)) {
      // 输入为空或非数字时不强制改写，允许用户中途清空再重新输入，
      // 等 blur 时由 blur 处理器统一回写校正值
      debouncedGenerator();
      return;
    }
    // 超过上限时立即把输入框改写为 MAX_LENGTH，实时看到限制生效
    if (val > MAX_LENGTH) {
      val = MAX_LENGTH;
      inputLength.value = String(val);
    }
    // 下限保护：保证 length >= 1，避免 generator 出现非法长度
    if (val < 1) {
      val = 1;
      inputLength.value = String(val);
    }
    state.length = val;
    debouncedGenerator();
  });
  // 失焦时把校正值回写到输入框，覆盖空值、非数字等异常输入
  inputLength.addEventListener('blur', () => {
    inputLength.value = state.length;
  });

  inputCount.addEventListener('input', () => {
    let val = parseInt(inputCount.value, 10);
    if (isNaN(val)) val = 1;
    val = Math.max(Math.min(val, MAX_COUNT), 1);
    state.count = val;
    debouncedGenerator();
  });
  inputCount.addEventListener('blur', () => {
    inputCount.value = state.count;
  });

  // ---------- 按钮事件 ----------

  btnCopyAll.addEventListener('click', () => {
    const rows = passwordList.querySelectorAll('.password-value');
    const allPasswords = Array.from(rows).map(el => el.value).join('\n');
    // 使用 rows.length 而非 state.count，避免配置变化未刷新时数量不一致
    copyToClipboard(allPasswords).then(ok => {
      if (ok) {
        showToast('success', t('copiedAll', { n: rows.length }));
      } else {
        showToast('danger', t('copyFailed'));
      }
    });
  });

  btnRefresh.addEventListener('click', () => {
    generator();
  });

  // ---------- 初始化 ----------

  renderI18n();
  syncOtherCharDisabled();
  generator();
})();
