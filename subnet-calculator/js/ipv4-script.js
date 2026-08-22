/* =====================================================
 * IPv4 子网计算逻辑
 * 依赖：common-script.js（window.SubnetTool）
 * ===================================================== */
(() => {
  'use strict';

  const { toast, t, registerI18n, onLangChange, createBitMask } = window.SubnetTool;
  const $ = (id) => document.getElementById(id);

  /* ---------- 页面文案（中英文） ---------- */
  registerI18n({
    v4PanelParams:   { zh: 'IPv4 参数配置', en: 'IPv4 Parameters' },
    v4IpLabel:       { zh: 'IP 地址', en: 'IP Address' },
    v4OctetAria:     { zh: 'IP 地址第 {n} 段', en: 'IP octet {n}' },
    v4MaskLabel:     { zh: '子网掩码 / CIDR', en: 'Subnet Mask / CIDR' },
    v4MaskGridAria:  { zh: '子网掩码位图', en: 'Subnet mask bit map' },
    v4Invalid:       { zh: '请输入正确的 IPv4 地址（每段为 0 - 255 的数字）', en: 'Enter a valid IPv4 address (each octet 0-255)' },

    v4ResNetwork:    { zh: '网络地址', en: 'Network Address' },
    v4ResBroadcast:  { zh: '广播地址', en: 'Broadcast Address' },
    v4ResFirst:      { zh: '起始可用 IP', en: 'First Host' },
    v4ResLast:       { zh: '结束可用 IP', en: 'Last Host' },
    v4ResMask:       { zh: '子网掩码', en: 'Subnet Mask' },
    v4ResWildcard:   { zh: '反掩码', en: 'Wildcard Mask' },
    v4ResUsable:     { zh: '可用主机数', en: 'Usable Hosts' },
    v4ResClass:      { zh: 'IP 分类', en: 'IP Class' },

    v4ClassA:        { zh: 'A 类', en: 'Class A' },
    v4ClassB:        { zh: 'B 类', en: 'Class B' },
    v4ClassC:        { zh: 'C 类', en: 'Class C' },
    v4ClassD:        { zh: 'D 类（组播）', en: 'Class D (Multicast)' },
    v4ClassE:        { zh: 'E 类（科研保留）', en: 'Class E (Reserved)' },
    v4ClassLoopback: { zh: '环回地址（Loopback）', en: 'Loopback' },
    v4ClassReserved: { zh: '保留地址', en: 'Reserved' },
  });

  /* ---------- 数值转换工具 ---------- */
  const ip2int = ([a, b, c, d]) => ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
  const int2ip = (n) => [n >>> 24, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
  const cidrToMask = (bits) => (bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0);

  /* ---------- IP 地址分类（返回字典 key） ---------- */
  const classify = (firstOctet) => {
    if (firstOctet === 0) return 'v4ClassReserved';
    if (firstOctet === 127) return 'v4ClassLoopback';
    if (firstOctet <= 126) return 'v4ClassA';
    if (firstOctet <= 191) return 'v4ClassB';
    if (firstOctet <= 223) return 'v4ClassC';
    if (firstOctet <= 239) return 'v4ClassD';
    return 'v4ClassE';
  };

  /* ---------- DOM 引用 ---------- */
  const octetInputs = [...document.querySelectorAll('#ipv4-octets .octet-input')];
  const RESULT_IDS = {
    network: 'v4-network',
    broadcast: 'v4-broadcast',
    first: 'v4-first',
    last: 'v4-last',
    mask: 'v4-mask',
    wildcard: 'v4-wildcard',
    usable: 'v4-usable',
    ipClass: 'v4-class',
  };
  const resultEls = Object.fromEntries(Object.entries(RESULT_IDS).map(([k, id]) => [k, $(id)]));

  const setResult = (field, text) => { resultEls[field].textContent = text; };
  const resetResults = () => {
    for (const field of Object.keys(resultEls)) setResult(field, '-');
  };

  /* ---------- 子网掩码位图（4 行 8 列 = 32 位） ---------- */
  const maskBits = createBitMask($('mask-bits'), {
    total: 32,
    columns: 8,
    value: 24,
    bitLabel: (n) => t('bitAria', { n }),
    // 行尾显示该八位组的掩码十进制值
    rowValue: (setBits) => String((0xff << (8 - setBits)) & 0xff),
    onChange: () => calculate(false),
  });

  /* ---------- 分段 IP 输入辅助 ---------- */
  const octetValues = () => octetInputs.map(({ value }) => value);
  const isValidOctet = (value) => /^\d{1,3}$/.test(value) && Number(value) <= 255;
  const isComplete = () => octetInputs.every(({ value }) => value !== '');

  function focusOctet(index) {
    const next = octetInputs.at(index);
    if (!next) return false;
    next.focus();
    next.select();
    return true;
  }

  function setIp(ip) {
    const parts = ip.split('.');
    octetInputs.forEach((input, i) => { input.value = parts[i] ?? ''; });
    calculate(false);
  }

  function renderOctetAria() {
    octetInputs.forEach((input, i) => input.setAttribute('aria-label', t('v4OctetAria', { n: i + 1 })));
  }

  let invalidToastShown = false; // 无效提示仅在“由有效转为无效”时弹出一次，避免连续输入时刷屏

  /* ---------- 核心计算（输入变化时自动触发） ---------- */
  function calculate(showError = true) {
    const bits = maskBits.value;

    const values = octetValues();
    const hasInvalid = values.some((v) => v !== '' && !isValidOctet(v));

    octetInputs.forEach((input, i) =>
      input.classList.toggle('invalid', values[i] !== '' && !isValidOctet(values[i])));

    if (!isComplete() || hasInvalid) {
      resetResults();
      if (hasInvalid) {
        if (showError && !invalidToastShown) {
          toast(t('v4Invalid'), 'error');
          invalidToastShown = true;
        }
      } else {
        invalidToastShown = false;
      }
      return;
    }
    invalidToastShown = false;

    const ipInt = ip2int(values.map(Number));
    const maskInt = cidrToMask(bits);
    const wildcardInt = ~maskInt >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    let firstHost = networkInt + 1;
    let lastHost = broadcastInt - 1;
    let usableCount;
    if (bits <= 30) {
      usableCount = 2 ** (32 - bits) - 2;
    } else if (bits === 31) {
      usableCount = 2; // /31 的两个地址均可用（RFC 3021）
      firstHost = networkInt;
      lastHost = broadcastInt;
    } else {
      usableCount = 1; // /32 单主机
      firstHost = lastHost = networkInt;
    }

    setResult('network', int2ip(networkInt));
    setResult('broadcast', int2ip(broadcastInt));
    setResult('first', int2ip(firstHost));
    setResult('last', int2ip(lastHost));
    setResult('mask', int2ip(maskInt));
    setResult('wildcard', int2ip(wildcardInt));
    setResult('usable', usableCount.toLocaleString());
    setResult('ipClass', t(classify(Number(values[0]))));
  }

  /* ---------- 事件绑定 ---------- */
  let lastAutoAdvance = 0;

  octetInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 3); // 只保留数字，最多 3 位
      if (input.value.length === 3 && isValidOctet(input.value)) {
        lastAutoAdvance = Date.now(); // 记录自动跳转时刻，用于忽略紧随其后的 "." 键
        focusOctet(index + 1);
      }
      calculate();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === '.') {
        e.preventDefault();
        // “满 3 位自动跳转”后紧接的 "." 不再跳段，避免输入 192.168 时连跳两段
        if (Date.now() - lastAutoAdvance > 120) focusOctet(index + 1);
      } else if (e.key === 'ArrowRight' && input.selectionStart === input.value.length) {
        if (focusOctet(index + 1)) e.preventDefault();
      } else if (e.key === 'ArrowLeft' && input.selectionEnd === 0) {
        if (focusOctet(index - 1)) e.preventDefault();
      } else if (e.key === 'Backspace' && input.value === '') {
        e.preventDefault();
        focusOctet(index - 1);
      }
    });

    input.addEventListener('focus', () => input.select());

    // 支持直接粘贴完整 IPv4 地址，自动分配到 4 段
    input.addEventListener('paste', (e) => {
      const text = e.clipboardData?.getData('text').trim() ?? '';
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(text)) {
        e.preventDefault();
        setIp(text);
      }
    });
  });

  $('ipv4-clear-btn').addEventListener('click', () => {
    octetInputs.forEach((input) => {
      input.value = '';
      input.classList.remove('invalid');
    });
    invalidToastShown = false;
    resetResults();
    focusOctet(0);
  });

  // 语言切换：更新位图 aria 文案并重算计算结果文案
  onLangChange(() => {
    maskBits.refresh();
    renderOctetAria();
    calculate(false);
  });

  renderOctetAria();
})();
