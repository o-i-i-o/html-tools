/* =====================================================
 * IPv6 子网计算逻辑
 * 依赖：common-script.js（window.SubnetTool）
 * 输入变化时自动计算，无需点击按钮
 * ===================================================== */
(() => {
  'use strict';

  const { toast, t, registerI18n, onLangChange, createBitMask } = window.SubnetTool;
  const $ = (id) => document.getElementById(id);

  /* ---------- 页面文案（中英文） ---------- */
  registerI18n({
    v6IpLabel:         { zh: 'IPv6 地址', en: 'IPv6 Address' },
    v6IpPlaceholder:   { zh: '例如: 2001:db8::1', en: 'e.g. 2001:db8::1' },
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
    v6TDoc:         { zh: '文档示例地址', en: 'Documentation' },
    v6T6to4:        { zh: '6to4 过渡地址', en: '6to4 Transition' },
    v6TIetf:        { zh: '特殊用途地址', en: 'Special (IETF Assignments)' },
    v6TGlobal:      { zh: '全局单播地址', en: 'Global Unicast' },
    v6TV4Mapped:    { zh: 'IPv4 映射地址', en: 'IPv4-mapped' },
    v6TOther:       { zh: '其他类型', en: 'Other' },

    v6SUnspecified: { zh: '表示“不存在此地址”，常见于主机初始化或重复地址检测过程', en: 'Indicates "no address"; used during host initialization and duplicate address detection' },
    v6SLoopback:    { zh: '本地主机回环地址，等价于 IPv4 的 127.0.0.1', en: 'Local host loopback address, equivalent to IPv4 127.0.0.1' },
    v6SLinkLocal:   { zh: '仅在单条链路上有效，不可路由；用于邻居发现、地址自动配置等', en: 'Valid only on a single link and not routable; used for neighbor discovery and autoconfiguration' },
    v6SUla:         { zh: '私有地址，类似 IPv4 的 10.0.0.0/8 等', en: 'Private address similar to IPv4 private ranges (10.0.0.0/8 etc.); for internal local networks only' },
    v6SMulticast:   { zh: '用于一对多通信，替代 IPv4 的广播', en: 'Used for one-to-many communication, replacing IPv4 broadcast' },
    v6SDoc:         { zh: 'RFC 3849 规定的文档示例地址', en: 'Documentation prefix per RFC 3849; must not be used in real networks' },
    v6S6to4:        { zh: '用于 IPv6 到 IPv4 的自动隧道机制', en: 'Used for automatic IPv6-to-IPv4 tunneling' },
    v6SIetf:        { zh: '包含 Teredo、Benchmarking 等 IETF 协议特殊用途', en: 'Reserved for IETF protocol assignments (Teredo, benchmarking, etc.)' },
    v6SGlobal:      { zh: '公网地址', en: 'Globally routable public address' },
    v6SV4Mapped:    { zh: '内嵌 IPv4 地址的 IPv6 表示（::ffff:0:0/96），用于双栈过渡', en: 'IPv6 representation of an embedded IPv4 address (::ffff:0:0/96), used for dual-stack transition' },
    v6SOther:       { zh: '其他特殊用途或保留地址', en: 'Other special-purpose or reserved address' },

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

  /* ---------- 地址类型与用途（返回字典 key） ---------- */
    const classifyIPv6 = (ip) => {
      if (ip === 0n) return { typeKey: 'v6TUnspecified', scopeKey: 'v6SUnspecified' };
      if (ip === 1n) return { typeKey: 'v6TLoopback', scopeKey: 'v6SLoopback' };

    const top16 = Number(ip >> 112n);
    const top32 = ip >> 96n;
    if ((top16 & 0xffc0) === 0xfe80) return { typeKey: 'v6TLinkLocal', scopeKey: 'v6SLinkLocal' };
    if ((top16 & 0xfe00) === 0xfc00) return { typeKey: 'v6TUla', scopeKey: 'v6SUla' };
    if ((top16 & 0xff00) === 0xff00) return { typeKey: 'v6TMulticast', scopeKey: 'v6SMulticast' };
    if (top32 === 0x20010db8n) return { typeKey: 'v6TDoc', scopeKey: 'v6SDoc' };
    if (top16 === 0x2002) return { typeKey: 'v6T6to4', scopeKey: 'v6S6to4' };
    if (top32 === 0x20010000n) return { typeKey: 'v6TIetf', scopeKey: 'v6SIetf' };
    if ((ip >> 32n) === 0xffffn) return { typeKey: 'v6TV4Mapped', scopeKey: 'v6SV4Mapped' };
    if ((top16 & 0xe000) === 0x2000) return { typeKey: 'v6TGlobal', scopeKey: 'v6SGlobal' };
    return { typeKey: 'v6TOther', scopeKey: 'v6SOther' };
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
  const RESULT_KEYS = ['full', 'compressed', 'cidr', 'network', 'host', 'last', 'count', 'type', 'scope', 'dns'];
  const resultEls = Object.fromEntries(RESULT_KEYS.map((key) => [key, $('v6-' + key)]));

  const resetResults = () => {
    for (const el of Object.values(resultEls)) el.textContent = '-';
  };

  /* ---------- 前缀长度位图（8 行 16 列 = 128 位） ---------- */
  const prefixBits = createBitMask($('prefix-bits'), {
    total: 128,
    columns: 16,
    value: 64,
    gapAfterRow: 3, // 第 4 行（/64 边界）之后加大间距，分隔前半段与后半段
    bitLabel: (n) => t('bitAria', { n }),
    onChange: () => calculate(false),
  });

  let invalidToastShown = false; // 无效提示仅在“由有效转为无效”时弹出一次

  /* ---------- 核心计算（输入变化时自动触发） ---------- */
  function calculate(showError = true) {
    const prefix = prefixBits.value;

    const text = addressInput.value.trim();
    if (text === '') {
      addressInput.classList.remove('invalid');
      invalidToastShown = false;
      resetResults();
      return;
    }

    let expanded;
    try {
      expanded = expandIPv6(text);
    } catch ({ message }) {
      addressInput.classList.add('invalid');
      resetResults();
      if (showError && !invalidToastShown) {
        toast(t(message), 'error');
        invalidToastShown = true;
      }
      return;
    }
    addressInput.classList.remove('invalid');
    invalidToastShown = false;

    const ip = toBigInt(expanded);
    const hostMask = (1n << BigInt(128 - prefix)) - 1n;
    const networkMask = ((1n << 128n) - 1n) ^ hostMask;
    const network = ip & networkMask;
    const last = network | hostMask;
    const host = ip & hostMask;
    const compressed = compressIPv6(expanded);
    const networkExpanded = toExpanded(network);
    const { typeKey, scopeKey } = classifyIPv6(ip);

    resultEls.full.textContent = expanded;
    resultEls.compressed.textContent = compressed;
    resultEls.cidr.textContent = `${compressed}/${prefix}`;
    resultEls.network.textContent = `${compressIPv6(networkExpanded)}/${prefix}`;
    resultEls.host.textContent = compressIPv6(toExpanded(host));
    resultEls.last.textContent = compressIPv6(toExpanded(last));
    resultEls.count.textContent = formatCount(prefix);
    resultEls.type.textContent = t(typeKey);
    resultEls.scope.textContent = t(scopeKey);
    resultEls.dns.textContent = reverseDns(networkExpanded, prefix);
  }

  /* ---------- 事件绑定 ---------- */
  addressInput.addEventListener('input', () => calculate());
  addressInput.addEventListener('focus', () => addressInput.select());

  $('ipv6-clear-btn').addEventListener('click', () => {
    addressInput.value = '';
    addressInput.classList.remove('invalid');
    invalidToastShown = false;
    resetResults();
    addressInput.focus();
  });

  // 语言切换：更新位图 aria 文案并重算计算结果文案
  onLangChange(() => {
    prefixBits.refresh();
    calculate(false);
  });
})();
