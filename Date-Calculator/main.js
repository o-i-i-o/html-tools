/**
 * 日期计算器
 * 功能：两个日期相差天数 / 日期推算（日、星期、月、工作日）/ 农历显示
 * 纯原生 JavaScript 实现，无任何外部依赖，农历数据本地计算。
 */

/* ==================== 农历转换 ==================== */

// 农历信息表（1900 - 2099，来源：github.com/jjonline/calendar.js，含 2057 年修正值）
// 编码含义：低 4 位为闰月月份（0 表示无闰月）；0x10000 位表示闰月大小（1 为 30 天）；
// 0x8000 起每位对应 1-12 月，1 为大月 30 天，0 为小月 29 天。
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0, // 2050-2059
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252, // 2090-2099
];

// 农历 1900 年正月初一对应的公历日期：1900-01-31
const LUNAR_EPOCH = Date.UTC(1900, 0, 31);

const LUNAR_MONTHS = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const LUNAR_DAY_PREFIX = ['初', '十', '廿', '卅'];
const LUNAR_DAY_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 闰月月份，无闰月返回 0
function lunarLeapMonth(year) {
  return LUNAR_INFO[year - 1900] & 0xf;
}

// 闰月天数，无闰月返回 0
function lunarLeapDays(year) {
  if (lunarLeapMonth(year) === 0) return 0;
  return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
}

// 农历年总天数
function lunarYearDays(year) {
  const info = LUNAR_INFO[year - 1900];
  let days = 348; // 12 个小月
  for (let bit = 0x8000; bit > 0x8; bit >>= 1) {
    if (info & bit) days++;
  }
  return days + lunarLeapDays(year);
}

// 农历某月天数（month: 1-12）
function lunarMonthDays(year, month) {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

/**
 * 公历转农历
 * @param {Date} date 公历日期
 * @returns {{year:number, month:number, leap:boolean, day:number}|null} 超出 1901-2099 年返回 null
 */
function solarToLunar(date) {
  const t = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  let offset = Math.round((t - LUNAR_EPOCH) / 86400000);
  if (offset < 0) return null;

  // 定位农历年
  let year = 1900;
  for (; year <= 2099; year++) {
    const days = lunarYearDays(year);
    if (offset < days) break;
    offset -= days;
  }
  if (year > 2099) return null;

  // 定位农历月、日（闰月排在数字月之后，如闰四月排在四月至五月之间）
  const leap = lunarLeapMonth(year);
  let month = 1;
  let leapDone = false;
  while (month <= 13) {
    const isLeapIter = leap > 0 && month === leap + 1 && !leapDone;
    const days = isLeapIter ? lunarLeapDays(year) : lunarMonthDays(year, month);
    if (offset < days) {
      return { year, month: isLeapIter ? leap : month, leap: isLeapIter, day: offset + 1 };
    }
    offset -= days;
    if (isLeapIter) leapDone = true;
    else month++;
  }
  return null;
}

// 格式化农历，如「马年五月初五」「兔年闰二月初一」
function formatLunar(l) {
  const zodiac = ZODIAC[(l.year - 4) % 12];
  const mon = (l.leap ? '闰' : '') + (l.month === 1 ? '正' : LUNAR_MONTHS[l.month]);
  let day;
  if (l.day === 10) day = '初十';
  else if (l.day === 20) day = '二十';
  else if (l.day === 30) day = '三十';
  else day = LUNAR_DAY_PREFIX[Math.floor(l.day / 10)] + LUNAR_DAY_NUM[l.day % 10];
  return `${zodiac}年${mon}月${day}`;
}

/* ==================== 日期计算器 ==================== */

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MS_PER_DAY = 86400000;
const UNITS = ['day', 'workday', 'week', 'month'];

class DateCalculator {
  constructor() {
    // 相差表单
    this.diffForm = document.getElementById('diff-form');
    this.diffStart = document.getElementById('diff-start');
    this.diffEnd = document.getElementById('diff-end');
    this.diffResult = document.getElementById('diff-result');

    // 推算表单
    this.addForm = document.getElementById('add-form');
    this.addDate = document.getElementById('add-date');
    this.addDir = document.getElementById('add-dir');
    this.addNum = document.getElementById('add-num');
    this.addUnit = document.getElementById('add-unit');
    this.addResult = document.getElementById('add-result');
    this.addLunar = document.getElementById('add-lunar');

    // 说明区域
    this.workYear = document.getElementById('work-year');
    this.workRange = document.getElementById('work-range');

    // 工作日数据（以 2026 年为例，按年更新即可）
    this.workdayData = {
      year: 2026,
      makeup: [[4], [14, 28], [], [], [9], [], [], [], [20], [10], [], []],           // 每月调休补班日
      holidays: [[1, 2, 3], [15, 16, 17, 18, 19, 20, 21, 22, 23], [], [4, 5, 6], [1, 2, 3, 4, 5], [19, 20, 21], [], [], [25, 26, 27], [1, 2, 3, 4, 5, 6, 7], [], []], // 每月法定假日
      range: [new Date(2025, 9, 15, 12), new Date(2027, 0, 15, 12)],                  // 工作日计算有效范围
    };

    this.init();
  }

  init() {
    this.diffForm.addEventListener('submit', (e) => this.handleDiffSubmit(e));
    this.addForm.addEventListener('submit', (e) => this.handleAddSubmit(e));
    this.restoreState();
    this.renderHolidayInfo();
  }

  /* ---------- 相差计算 ---------- */

  handleDiffSubmit(e) {
    e.preventDefault();
    const from = this.parseInputValue(this.diffStart.value);
    const to = this.parseInputValue(this.diffEnd.value);
    if (!from || !to) return;

    const days = Math.round((to - from) / MS_PER_DAY);
    let text = `${days} 天`;
    if (days > 0) {
      text += ` = ${Math.floor(days / 7)} 星期 ${days % 7} 天`;
      const md = this.splitMonthsDays(from, to);
      text += ` = ${md.months} 个月 ${md.days} 天`;
    }
    const workdays = this.countWorkdays(from, to);
    if (workdays !== null && workdays > 0) {
      text += `（${workdays - 1} 个工作日）`;
    }
    this.diffResult.textContent = text;
    localStorage.setItem('diffc', this.diffEnd.value);
  }

  // 拆分为 X 个月 Y 天
  splitMonthsDays(from, to) {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    let days;
    if (to.getDate() >= from.getDate()) {
      days = to.getDate() - from.getDate();
    } else {
      months--;
      const anchor = new Date(to.getFullYear(), to.getMonth() - 1, from.getDate(), 12);
      days = Math.round((to - anchor) / MS_PER_DAY);
    }
    return { months, days };
  }

  /* ---------- 日期推算 ---------- */

  handleAddSubmit(e) {
    e.preventDefault();
    const base = this.parseInputValue(this.addDate.value);
    if (!base) return;
    const num = parseInt(this.addNum.value, 10);
    if (!Number.isFinite(num) || num < 0) return;
    const dir = this.addDir.value === '-1' ? -1 : 1;
    const unit = this.addUnit.value;
    localStorage.setItem('dayadd', `${num},${unit},${dir}`);

    let target;
    let outOfRange = false;
    if (unit === 'month') {
      // 与原版一致：月固定加在月份上，日期超出自动进位（如 1 月 31 日 + 1 个月 = 3 月 3 日）
      target = new Date(base.getFullYear(), base.getMonth() + dir * num, base.getDate(), 12);
    } else if (unit === 'week') {
      target = this.addDays(base, dir * num * 7);
    } else if (unit === 'workday') {
      target = this.addWorkdays(base, num, dir);
      const [lo, hi] = this.workdayData.range;
      outOfRange = target < lo || target > hi;
    } else {
      target = this.addDays(base, dir * num);
    }

    this.addResult.textContent = this.daystr(target) + (outOfRange ? '（超出计算范围）' : '');
    const lunar = solarToLunar(target);
    this.addLunar.textContent = lunar ? `农历 ${formatLunar(lunar)}` : '';
  }

  addDays(from, n) {
    const d = new Date(from);
    d.setDate(d.getDate() + n);
    return d;
  }

  // 推算 num 个工作日后的日期（不含基准日）
  addWorkdays(from, num, dir) {
    const d = new Date(from);
    let remaining = num;
    while (remaining > 0) {
      d.setDate(d.getDate() + dir);
      if (this.isWorkday(d)) remaining--;
    }
    return d;
  }

  /* ---------- 工作日 ---------- */

  isWorkday(d) {
    const { makeup, holidays } = this.workdayData;
    const m = d.getMonth();
    const day = d.getDate();
    if (makeup[m].includes(day)) return true;   // 调休补班
    if (holidays[m].includes(day)) return false; // 法定假日
    const w = d.getDay();
    return w !== 0 && w !== 6;
  }

  // 统计两端日期内（含）的工作日数，超出数据范围返回 null
  countWorkdays(from, to) {
    const [lo, hi] = this.workdayData.range;
    if (from < lo || to > hi) return null;
    let count = 0;
    const d = new Date(from);
    while (d <= to) {
      if (this.isWorkday(d)) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  }

  /* ---------- 说明 ---------- */

  renderHolidayInfo() {
    const { year, range } = this.workdayData;
    this.workYear.textContent = year;
    const fmt = (d) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    this.workRange.textContent = `${fmt(range[0])} 至 ${fmt(range[1])}`;
  }

  /* ---------- 工具方法 ---------- */

  // 统一取当天中午，避免时区/夏令时导致的边界问题
  toNoon(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  }

  // "2026-10-08" → 本地时区 Date；非法返回 null
  parseInputValue(value) {
    const parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12);
  }

  // Date → "2026-10-08"（date input 值格式）
  toInputValue(d) {
    const pad = (n) => (n <= 9 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // Date → "2026年3月6日星期五"
  daystr(d) {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日星期${WEEKDAYS[d.getDay()]}`;
  }

  // 恢复上次使用的输入值
  restoreState() {
    const today = this.toNoon(new Date());
    this.diffStart.value = this.toInputValue(today);
    this.addDate.value = this.toInputValue(today);

    // 上次使用的结束日期，默认明年 1 月 1 日
    const savedEnd = localStorage.getItem('diffc');
    const savedDate = savedEnd && this.parseInputValue(savedEnd);
    if (savedDate) {
      this.diffEnd.value = savedEnd;
    } else {
      this.diffEnd.value = this.toInputValue(new Date(today.getFullYear() + 1, 0, 1, 12));
    }

    // 上次使用的推算参数，默认往后 100 日
    const saved = localStorage.getItem('dayadd');
    let restored = false;
    if (saved) {
      const [num, unit, dir] = saved.split(',');
      if (/^\d+$/.test(num)) { this.addNum.value = num; restored = true; }
      if (UNITS.includes(unit)) this.addUnit.value = unit;
      if (dir === '1' || dir === '-1') this.addDir.value = dir;
    }
    if (!restored) this.addNum.value = 100;
  }
}

new DateCalculator();
