/**
 * Crontab 执行时间计算器 + 图形化表达式生成器
 */
class CrontabCalculator {
  constructor() {
    // 输入区域DOM
    this.expressionInput = document.getElementById('crontabExpression');
    this.calculateBtn = document.getElementById('calculateBtn');
    this.openGeneratorBtn = document.getElementById('openGeneratorBtn');
    this.executionCountInput = document.getElementById('executionCount');
    this.exampleItems = document.querySelectorAll('.example-item');

    // 结果区域DOM
    this.resultPlaceholder = document.getElementById('resultPlaceholder');
    this.resultContent = document.getElementById('resultContent');
    this.crontabError = document.getElementById('crontabError');
    this.errorMessage = document.getElementById('errorMessage');

    // 模态框 DOM
    this.modal = document.getElementById('cronGeneratorModal');
    this.modalClose = document.getElementById('cronGeneratorClose');
    this.cronResetBtn = document.getElementById('cronResetBtn');
    this.cronCancelBtn = document.getElementById('cronCancelBtn');
    this.cronApplyBtn = document.getElementById('cronApplyBtn');
    this.tabs = document.querySelectorAll('.cron-tab');
    this.panels = document.querySelectorAll('.cron-panel');

    // 预览
    this.cronPreviewValue = document.getElementById('cronPreviewValue');
    this.cronPreviewDesc = document.getElementById('cronPreviewDesc');

    // cron 5段配置 minute hour day month weekday
    this.cronConfig = {
      minute: { mode: 'all', list: [] },
      hour: { mode: 'all', list: [] },
      day: { mode: 'all', list: [] },
      month: { mode: 'all', list: [] },
      weekday: { mode: 'all', list: [] }
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderAllCheckboxGrid();
    this.updatePreview();
  }

  bindEvents() {
    // 计算按钮
    this.calculateBtn.addEventListener('click', () => this.doCalculate());

    // 打开图形生成器
    this.openGeneratorBtn.addEventListener('click', () => this.openModal());
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.cronCancelBtn.addEventListener('click', () => this.closeModal());

    // 重置、应用
    this.cronResetBtn.addEventListener('click', () => this.resetGenerator());
    this.cronApplyBtn.addEventListener('click', () => this.applyToInput());

    // tab切换
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        this.switchTab(targetTab);
      });
    });

    // 单选模式切换（all / step / list / range / last）
    document.querySelectorAll('.cron-mode-option input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const name = e.target.name;
        const field = name.replace('mode-', '');
        const mode = e.target.value;
        this.onModeChange(field, mode);
      });
    });

    // 步长/范围输入框变更时更新预览
    this.modal.querySelectorAll('.cron-number-input').forEach(input => {
      input.addEventListener('input', () => this.updatePreview());
    });

    // 常用示例点击回填表达式
    this.exampleItems.forEach(item => {
      item.addEventListener('click', () => {
        const exp = item.dataset.expression;
        this.expressionInput.value = exp;
      });
    });
  }

  // tab切换
  switchTab(tabName) {
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    this.panels.forEach(p => p.style.display = 'none');
    document.getElementById(`panel-${tabName}`).style.display = 'block';
  }

  // 字段模式切换
  onModeChange(field, mode) {
    this.cronConfig[field].mode = mode;
    const panel = document.getElementById(`panel-${field}`);
    panel.querySelectorAll('.cron-mode-content').forEach(el => el.style.display = 'none');
    if (mode === 'all') return this.updatePreview();
    const target = panel.querySelector(`.mode-${mode}`);
    if (target) target.style.display = 'block';
    this.updatePreview();
  }

  // 渲染复选框网格
  renderAllCheckboxGrid() {
    this.renderCheckboxGrid('minute', 0, 59, '.grid-60');
    this.renderCheckboxGrid('hour', 0, 23, '.grid-24');
    this.renderCheckboxGrid('day', 1, 31, '.grid-31');
    this.renderCheckboxGrid('month', 1, 12, '.grid-12');
    this.renderCheckboxGrid('weekday', 0, 6, '.grid-7');
  }

  renderCheckboxGrid(field, min, max, selector) {
    const container = document.querySelector(`#panel-${field} ${selector}`);
    if (!container) return;
    container.innerHTML = '';
    for (let i = min; i <= max; i++) {
      const label = document.createElement('label');
      label.className = 'cb-item';
      label.innerHTML = `<input type="checkbox" data-field="${field}" data-val="${i}"><span>${i}</span>`;
      container.appendChild(label);
    }
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const f = cb.dataset.field;
        const v = Number(cb.dataset.val);
        if (cb.checked) {
          if (!this.cronConfig[f].list.includes(v)) this.cronConfig[f].list.push(v);
        } else {
          this.cronConfig[f].list = this.cronConfig[f].list.filter(x => x !== v);
        }
        this.updatePreview();
      });
    });
  }

  // 根据配置生成 cron 表达式字符串
  buildCronExpression() {
    const getSegment = (field) => {
      const cfg = this.cronConfig[field];
      switch (cfg.mode) {
        case 'all': return '*';
        case 'step': {
          const start = Number(document.querySelector(`#panel-${field} .mode-step input:nth-of-type(1)`).value);
          const interval = Number(document.querySelector(`#panel-${field} .mode-step input:nth-of-type(2)`).value);
          return `${start}/${interval}`;
        }
        case 'range': {
          const from = Number(document.querySelector(`#panel-${field} .mode-range input:nth-of-type(1)`).value);
          const to = Number(document.querySelector(`#panel-${field} .mode-range input:nth-of-type(2)`).value);
          return `${from}-${to}`;
        }
        case 'list': {
          const arr = [...cfg.list].sort((a, b) => a - b);
          return arr.length ? arr.join(',') : '*';
        }
        case 'last':
          return 'L';
        default: return '*';
      }
    };
    const minute = getSegment('minute');
    const hour = getSegment('hour');
    const day = getSegment('day');
    const month = getSegment('month');
    const weekday = getSegment('weekday');
    return `${minute} ${hour} ${day} ${month} ${weekday}`;
  }

  // 更新模态框预览
  updatePreview() {
    const expr = this.buildCronExpression();
    this.cronPreviewValue.textContent = expr;
    this.cronPreviewDesc.textContent = this.getHumanDesc(expr);
  }

  // 简易中文描述
  getHumanDesc(expr) {
    return `Cron表达式：${expr}`;
  }

  openModal() {
    this.modal.classList.add('active', 'show');
  }

  closeModal() {
    this.modal.classList.remove('active', 'show');
  }

  resetGenerator() {
    // 重置配置
    Object.keys(this.cronConfig).forEach(f => {
      this.cronConfig[f].mode = 'all';
      this.cronConfig[f].list = [];
    });
    // 重置radio
    this.modal.querySelectorAll('input[type="radio"]').forEach(r => {
      r.checked = r.value === 'all';
    });
    this.modal.querySelectorAll('.cron-mode-content').forEach(el => el.style.display = 'none');
    this.modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    this.switchTab('minute');
    this.updatePreview();
  }

  applyToInput() {
    const expr = this.buildCronExpression();
    this.expressionInput.value = expr;
    this.closeModal();
  }

  // 执行计算
  doCalculate() {
    const expr = this.expressionInput.value.trim();
    const count = parseInt(this.executionCountInput.value, 10) || 10;
    this.hideError();
    this.resultPlaceholder.style.display = 'none';
    this.resultContent.style.display = 'none';

    try {
      const parts = expr.split(/\s+/);
      if (parts.length !== 5) throw new Error('Crontab表达式必须为5段：分 时 日 月 星期');
      const nextList = this.calcNextExecutions(expr, Math.min(count, 100));
      this.renderResult(nextList);
    } catch (e) {
      this.showError(e.message);
    }
  }

  // 简易Cron解析，获取未来N次时间
  calcNextExecutions(cronStr, maxCount) {
    const parts = cronStr.split(/\s+/);
    const [minPart, hourPart, dayPart, monthPart, wdPart] = parts;
    const result = [];
    const current = new Date();
    current.setMilliseconds(0);
    let safety = 0;
    // 覆盖 366 天（分钟步进），保证 "每天/每周 × 100次" 这类稀疏表达式也能算满
    const SAFETY_LIMIT = 366 * 24 * 60;

    while (result.length < maxCount && safety < SAFETY_LIMIT) {
      current.setTime(current.getTime() + 60 * 1000);
      safety++;
      const m = current.getMinutes();
      const h = current.getHours();
      const d = current.getDate();
      const mo = current.getMonth() + 1;
      const w = current.getDay(); // 0-6, 0周日

      const matchMin = this.matchField(m, minPart, 0, 59);
      const matchHour = this.matchField(h, hourPart, 0, 23);
      const matchDay = dayPart === 'L' ? this.isLastDayOfMonth(current) : this.matchField(d, dayPart, 1, 31);
      const matchMonth = this.matchField(mo, monthPart, 1, 12);
      const matchWd = this.matchWeekday(w, wdPart);

      if (matchMin && matchHour && matchDay && matchMonth && matchWd) {
        result.push(new Date(current));
      }
    }
    if (result.length === 0) throw new Error('未匹配到未来执行时间，表达式可能无效');
    return result;
  }

  // 是否当月最后一天（支持日字段 L）
  isLastDayOfMonth(date) {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + 1);
    return next.getDate() === 1;
  }

  matchField(val, part, min, max) {
    if (part === '*') return true;
    if (part.includes('/')) {
      const [base, step] = part.split('/');
      const b = base === '*' ? min : parseInt(base, 10);
      const s = parseInt(step, 10);
      return (val - b) % s === 0 && val >= b;
    }
    if (part.includes('-')) {
      const [from, to] = part.split('-').map(Number);
      return val >= from && val <= to;
    }
    if (part.includes(',')) {
      const arr = part.split(',').map(Number);
      return arr.includes(val);
    }
    const num = parseInt(part, 10);
    return val === num;
  }

  // jsDay: 0=周日；cron 星期字段中 0 和 7 都表示周日
  matchWeekday(jsDay, part) {
    if (part === '*') return true;
    const allowed = new Set();
    for (const tok of part.split(',')) {
      if (tok === '*') return true;
      if (tok.includes('-')) {
        // 范围：7 归一化为周日(0)，如 0-7、5-7
        const [a, b] = tok.split('-').map(Number);
        for (let d = a; d <= b; d++) allowed.add(d % 7);
      } else if (tok.includes('/')) {
        // 步长：*/2 或 1/2
        const [base, step] = tok.split('/').map(Number);
        const start = Number.isNaN(base) ? 0 : base;
        const s = step || 1;
        for (let d = start; d <= 7; d += s) allowed.add(d % 7);
      } else {
        allowed.add(Number(tok) % 7);
      }
    }
    return allowed.has(jsDay);
  }

  renderResult(list) {
    let html = `<div class="result-header"><strong>未来 ${list.length} 次执行时间</strong></div><ul class="time-list">`;
    list.forEach(d => {
      html += `<li>${d.toLocaleString()}</li>`;
    });
    html += '</ul>';
    this.resultContent.innerHTML = html;
    this.resultContent.style.display = 'block';
  }

  showError(msg) {
    this.crontabError.style.display = 'block';
    this.errorMessage.textContent = msg;
    this.resultPlaceholder.style.display = 'block';
    this.resultContent.style.display = 'none';
  }

  hideError() {
    this.crontabError.style.display = 'none';
    this.errorMessage.textContent = '';
  }
}

// DOM加载完成实例化
document.addEventListener('DOMContentLoaded', () => {
  new CrontabCalculator();
});
