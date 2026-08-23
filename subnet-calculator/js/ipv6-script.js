/* =====================================================
 * IPv6 子网计算逻辑
 * 依赖：common-script.js（window.SubnetTool）
 * 输入变化时自动计算，无需点击按钮
 * ===================================================== */
(() => {
  'use strict';

  const { t, registerI18n, onLangChange, createBitMask } = window.SubnetTool;
  const $ = (id) => document.getElementById(id);

  /* ---------- 页面文案（中英文） ---------- */
  registerI18n({
    v6IpLabel:         { zh: 'IPv6 地址', en: 'IPv6 Address' },
    v6IpPlaceholder:   { zh: '例如: 2001::1', en: 'e.g. 2001::1' },
    v6PrefixLabel:     { zh: '前缀长度', en: 'Prefix Length' },
    v6PrefixGridAria:  { zh: '前缀长度位图', en: 'Prefix length bit map' },
    v6ErrFormat:       { zh: '无效的 IPv6 地址格式', en: 'Invalid IPv6 address format' },
    v6ErrDoubleColon:  { zh: 'IPv6 地址中的 :: 只能出现一次', en: ':: may appear only once in an IPv6 address' },

    v6ResFull:         { zh: '展开地址', en: 'Expanded Address' },
    v6ResCompressed:   { zh: '压缩格式', en: 'Compressed' },
    v6ResNetwork:      { zh: '网络前缀', en: 'Network Prefix' },
    v6ResHost:         { zh: '主机标识符', en: 'Host Identifier' },
    v6ResFirst:        { zh: '起始可用地址', en: 'First Address' },
    v6ResLast:         { zh: '结束可用地址', en: 'Last Address' },
    v6ResCount:        { zh: '地址总数', en: 'Total Addresses' },
    v6ResType:         { zh: '地址类型', en: 'Address Type' },
    v6ResDns:          { zh: '反向 DNS 区域', en: 'Reverse DNS' },

    v6TUnspecified: { zh: '未指定地址', en: 'Unspecified' },
    v6TLoopback:    { zh: '环回地址', en: 'Loopback' },
    v6TLinkLocal:   { zh: '链路本地地址', en: 'Link-Local' },
    v6TUla:         { zh: '唯一本地地址', en: 'Unique Local (ULA)' },
    v6TMulticast:   { zh: '组播地址', en: 'Multicast' },
    v6TDoc:         { zh: '示例地址', en: 'Documentation' },
    v6T6to4:        { zh: '6to4 过渡地址', en: '6to4 Transition' },
    v6TIetf:        { zh: '特殊用途地址', en: 'Special (IETF Assignments)' },
    v6TGlobal:      { zh: '全局单播地址', en: 'Global Unicast' },
    v6TV4Mapped:    { zh: 'IPv4 映射地址', en: 'IPv4-mapped' },
    v6TOther:       { zh: '其他类型', en: 'Other' },

    v6CountFmt:     { zh: '2^{n}（{v} 个）', en: '2^{n} ({v} addresses)' },
    v6CountOne:     { zh: '1（单个主机地址）', en: '1 (single host address)' },
  });

  /* ---------- 地址格式转换 ---------- */

  /** 展开为 8 组 4 位十六进制的完整格式；不合法时抛出含字典 key 的 Error */
  const expandIPv6 = (input) => {
    let text = input.trim().toLowerCase();

    // 兼容尾部 IPv4 写法，如 ::ffff:192.168.1.1
    const colon = text.lastIndexOf(':');
    if (colon === -1) throw new Error('v6ErrFormat');
    const tail = text.slice(colon + 1);
    if (tail.includes('.')) {
      const parts = tail.split('.');
      if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) {
        throw new Error('v6ErrFormat');
      }
      const [a, b, c, d] = parts.map(Number);
      text = `${text.slice(0, colon + 1)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
    }

    // :: 只能出现一次
    const sections = text.split('::');
    if (sections.length > 2) throw new Error('v6ErrDoubleColon');

    const left = sections[0] === '' ? [] : sections[0].split(':');
    const right = sections.length === 2 ? (sections[1] === '' ? [] : sections[1].split(':')) : null;

    let groups;
    if (right) {
      const missing = 8 - left.length - right.length;
      if (missing < 1) throw new Error('v6ErrFormat'); // 含 :: 时至少应压缩一组
      groups = [...left, ...Array(missing).fill('0'), ...right];
    } else {
      groups = left;
    }

    if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) {
      throw new Error('v6ErrFormat');
    }
    return groups.map((g) => g.padStart(4, '0')).join(':');
  };

  /** 压缩为最短写法：去前导零，最长（≥2 组）的连续零组替换为 :: */
  const compressIPv6 = (expanded) => {
    const groups = expanded.split(':').map((g) => g.replace(/^0+(?=.)/, ''));
    let bestStart = -1;
    let bestLen = 0;
    let currentStart = -1;
    let currentLen = 0;
    groups.forEach((g, i) => {
      if (g === '0') {
        if (currentLen === 0) currentStart = i;
        currentLen += 1;
        if (currentLen > bestLen) {
          bestLen = currentLen;
          bestStart = currentStart;
        }
      } else {
        currentLen = 0;
      }
    });
    if (bestLen < 2) return groups.join(':');
    return `${groups.slice(0, bestStart).join(':')}::${groups.slice(bestStart + bestLen).join(':')}`;
  };

  /* ---------- BigInt 位运算 ---------- */
  const toBigInt = (expanded) => BigInt('0x' + expanded.replaceAll(':', ''));
  const toExpanded = (value) => value.toString(16).padStart(32, '0').match(/.{4}/g).join(':');

  /* ---------- 地址类型（返回字典 key） ---------- */
  const classifyIPv6 = (ip) => {
    if (ip === 0n) return 'v6TUnspecified';
    if (ip === 1n) return 'v6TLoopback';

    const top16 = Number(ip >> 112n);
    const top32 = ip >> 96n;
    if ((top16 & 0xffc0) === 0xfe80) return 'v6TLinkLocal';
    if ((top16 & 0xfe00) === 0xfc00) return 'v6TUla';
    if ((top16 & 0xff00) === 0xff00) return 'v6TMulticast';
    if (top32 === 0x20010db8n) return 'v6TDoc';
    if (top16 === 0x2002) return 'v6T6to4';
    if (top32 === 0x20010000n) return 'v6TIetf';
    if ((ip >> 32n) === 0xffffn) return 'v6TV4Mapped';
    if ((top16 & 0xe000) === 0x2000) return 'v6TGlobal';
    return 'v6TOther';
  };

  /* ---------- 其他展示项 ---------- */
  const reverseDns = (networkExpanded, prefix) => {
    const nibbles = Math.ceil(prefix / 4); // 反向区域只需覆盖前缀部分
    if (nibbles === 0) return 'ip6.arpa';
    return networkExpanded.replaceAll(':', '')
      .slice(0, nibbles)
      .split('')
      .toReversed() // ES2023：等价于 reverse().join()，但不改变原数组语义
      .join('.') + '.ip6.arpa';
  };

  const formatCount = (prefix) => {
    const hostBits = 128 - prefix;
    if (hostBits === 0) return t('v6CountOne');
    return t('v6CountFmt', { n: hostBits, v: (1n << BigInt(hostBits)).toLocaleString() });
  };

  /* ---------- DOM 引用 ---------- */
  const addressInput = $('ipv6-address');
  const RESULT_KEYS = ['full', 'compressed', 'cidr', 'network', 'host', 'first', 'last', 'count', 'type', 'dns'];
  const resultEls = Object.fromEntries(RESULT_KEYS.map((key) => [key, $('v6-' + key)]));

  const resetResults = () => {
    for (const el of Object.values(resultEls)) el.textContent = '-';
  };

  /* ---------- 地址标题行右侧的常驻错误提示 ---------- */
  const errorEl = $('v6-error');

  /** key 为 i18n 词条 key（expandIPv6 抛出的 Error.message）；传 null 清除提示 */
  function setError(key) {
    errorEl.textContent = key ? t(key) : '';
    errorEl.hidden = !key;
  }

  /* ---------- 前缀长度位图（8 行 16 列 = 128 位） ---------- */
  const prefixBits = createBitMask($('prefix-bits'), {
    total: 128,
    columns: 16,
    value: 64,
    gapAfterRow: 3, // 第 4 行（/64 边界）之后加大间距，分隔前半段与后半段
    bitLabel: (n) => t('bitAria', { n }),
    onChange: () => calculate(),
  });

  /* ---------- 核心计算（输入变化时自动触发） ---------- */
  function calculate() {
    const prefix = prefixBits.value;

    const text = addressInput.value.trim();
    if (text === '') {
      addressInput.classList.remove('invalid');
      resetResults();
      setError(null);
      return;
    }

    let expanded;
    try {
      expanded = expandIPv6(text);
    } catch ({ message }) {
      addressInput.classList.add('invalid');
      resetResults();
      setError(message);
      return;
    }
    addressInput.classList.remove('invalid');
    setError(null);

    const ip = toBigInt(expanded);
    const hostMask = (1n << BigInt(128 - prefix)) - 1n;
    const networkMask = ((1n << 128n) - 1n) ^ hostMask;
    const network = ip & networkMask;
    const last = network | hostMask;
    const host = ip & hostMask;
    const compressed = compressIPv6(expanded);
    const networkExpanded = toExpanded(network);
    const typeKey = classifyIPv6(ip);

    resultEls.full.textContent = expanded;
    resultEls.compressed.textContent = compressed;
    resultEls.cidr.textContent = `${compressed}/${prefix}`;
    resultEls.network.textContent = `${compressIPv6(networkExpanded)}/${prefix}`;
    resultEls.host.textContent = compressIPv6(toExpanded(host));
    // IPv6 无网络地址/广播地址保留概念，起始地址即网络前缀本身的第一个地址
    resultEls.first.textContent = compressIPv6(networkExpanded);
    resultEls.last.textContent = compressIPv6(toExpanded(last));
    resultEls.count.textContent = formatCount(prefix);
    resultEls.type.textContent = t(typeKey);
    resultEls.dns.textContent = reverseDns(networkExpanded, prefix);
  }

  /* ---------- 事件绑定 ---------- */
  addressInput.addEventListener('input', () => calculate());
  addressInput.addEventListener('focus', () => addressInput.select());

  $('ipv6-clear-btn').addEventListener('click', () => {
    addressInput.value = '';
    addressInput.classList.remove('invalid');
    setError(null);
    resetResults();
    addressInput.focus();
  });

  // 语言切换：更新位图 aria 文案并重算计算结果文案
  onLangChange(() => {
    prefixBits.refresh();
    calculate();
  });
})();
