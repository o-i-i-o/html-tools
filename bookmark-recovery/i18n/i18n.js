/*
 * Lightweight i18n runtime for the Chrome Bookmarks Recovery Tool.
 *
 * Usage in markup:
 *   data-i18n="key"              -> textContent
 *   data-i18n-html="key"         -> innerHTML (trusted locale strings)
 *   data-i18n-list="key"         -> <li> items from a locale array
 *   data-i18n-attr="title:key;aria-label:other.key"
 *
 * Usage in JavaScript:
 *   I18n.t('download.ready', { count: 3 })
 *   I18n.setLang('zh-CN')
 *   I18n.onChange(function (lang) { ... })
 */
'use strict';
(function (global) {
	var locales = global.I18N_LOCALES || {};
	var FALLBACK = 'en';
	var STORAGE_KEY = 'bookmark-recovery.lang';
	var current = FALLBACK;
	var initialized = false;
	var listeners = [];
	var warned = {};

	function has(object, key) {
		return Object.prototype.hasOwnProperty.call(object, key);
	}

	function normalizeLang(lang) {
		if (!lang) return null;
		var value = String(lang).replace(/_/g, '-').toLowerCase();
		var codes = Object.keys(locales);
		var i;
		for (i = 0; i < codes.length; i++) {
			if (codes[i].toLowerCase() === value) return codes[i];
		}
		var base = value.split('-')[0];
		for (i = 0; i < codes.length; i++) {
			if (codes[i].toLowerCase().split('-')[0] === base) return codes[i];
		}
		return null;
	}

	function lookup(key, lang) {
		var node = locales[lang];
		var parts = String(key).split('.');
		for (var i = 0; i < parts.length; i++) {
			if (!node || typeof node !== 'object' || !has(node, parts[i])) return undefined;
			node = node[parts[i]];
		}
		return node;
	}

	function pluralForm(count) {
		try {
			return new Intl.PluralRules(current).select(count);
		} catch (e) {
			return count === 1 ? 'one' : 'other';
		}
	}

	function interpolate(text, vars) {
		if (!vars) return text;
		return text.replace(/\{(\w+)\}/g, function (match, name) {
			return has(vars, name) ? String(vars[name]) : match;
		});
	}

	function t(key, vars) {
		var value = lookup(key, current);
		if (value === undefined) value = lookup(key, FALLBACK);
		if (value === undefined) {
			if (!warned[key] && global.console) {
				warned[key] = true;
				global.console.warn('[i18n] Missing translation key: ' + key);
			}
			return key;
		}
		if (Array.isArray(value)) return value;
		if (value && typeof value === 'object') {
			var count = vars && vars.count;
			var form = count === undefined ? 'other' : pluralForm(count);
			value = has(value, form) ? value[form] : (has(value, 'other') ? value.other : value.one);
		}
		if (typeof value !== 'string') return String(value);
		return interpolate(value, vars);
	}

	function translateAttributes(element) {
		var spec = element.getAttribute('data-i18n-attr');
		if (!spec) return;
		var pairs = spec.split(';');
		for (var i = 0; i < pairs.length; i++) {
			var split = pairs[i].indexOf(':');
			if (split < 0) continue;
			var attr = pairs[i].slice(0, split).trim();
			var key = pairs[i].slice(split + 1).trim();
			if (attr && key) element.setAttribute(attr, t(key));
		}
	}

	function apply(root) {
		root = root || document;
		document.documentElement.lang = current;
		document.documentElement.dir = (locales[current] && locales[current].dir) || 'ltr';

		var nodes = root.querySelectorAll('[data-i18n]');
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
		}

		nodes = root.querySelectorAll('[data-i18n-html]');
		for (i = 0; i < nodes.length; i++) {
			nodes[i].innerHTML = t(nodes[i].getAttribute('data-i18n-html'));
		}

		nodes = root.querySelectorAll('[data-i18n-list]');
		for (i = 0; i < nodes.length; i++) {
			var items = t(nodes[i].getAttribute('data-i18n-list'));
			if (!Array.isArray(items)) items = [items];
			var html = '';
			for (var j = 0; j < items.length; j++) {
				html += '<li>' + items[j] + '</li>';
			}
			nodes[i].innerHTML = html;
		}

		nodes = root.querySelectorAll('[data-i18n-attr]');
		for (i = 0; i < nodes.length; i++) {
			translateAttributes(nodes[i]);
		}
	}

	function populateSwitchers() {
		var selects = document.querySelectorAll('[data-lang-switcher]');
		var codes = Object.keys(locales);
		for (var i = 0; i < selects.length; i++) {
			var select = selects[i];
			if (select.options.length !== codes.length) {
				while (select.firstChild) select.removeChild(select.firstChild);
				for (var j = 0; j < codes.length; j++) {
					var option = document.createElement('option');
					option.value = codes[j];
					option.lang = codes[j];
					option.textContent = locales[codes[j]].localeName || codes[j];
					select.appendChild(option);
				}
			}
			select.value = current;
		}
	}

	function syncSwitchers() {
		var selects = document.querySelectorAll('[data-lang-switcher]');
		for (var i = 0; i < selects.length; i++) {
			selects[i].value = current;
		}
	}

	function bindSwitchers() {
		var selects = document.querySelectorAll('[data-lang-switcher]');
		for (var i = 0; i < selects.length; i++) {
			if (selects[i].getAttribute('data-i18n-bound')) continue;
			selects[i].setAttribute('data-i18n-bound', 'true');
			selects[i].addEventListener('change', function () {
				setLang(this.value);
			}, false);
		}
	}

	function emit() {
		var detail = { lang: current };
		var event;
		try {
			event = new global.CustomEvent('i18n:change', { detail: detail });
		} catch (e) {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent('i18n:change', false, false, detail);
		}
		document.dispatchEvent(event);
		var copy = listeners.slice();
		for (var i = 0; i < copy.length; i++) copy[i](current);
	}

	function updateUrl(lang) {
		if (!global.history || !global.history.replaceState) return;
		try {
			var url = new global.URL(global.location.href);
			if (lang === FALLBACK) {
				url.searchParams['delete']('lang');
			} else {
				url.searchParams.set('lang', lang);
			}
			global.history.replaceState(null, '', url.pathname + url.search + url.hash);
		} catch (e) {
			// file:// pages and older browsers do not allow this.
		}
	}

	function queryLang() {
		var match = global.location.search.match(/[?&]lang=([^&#]*)/);
		if (!match) return null;
		try {
			return decodeURIComponent(match[1].replace(/\+/g, ' '));
		} catch (e) {
			return match[1];
		}
	}

	function storedLang() {
		try {
			return global.localStorage.getItem(STORAGE_KEY);
		} catch (e) {
			return null;
		}
	}

	function detectLang() {
		var candidates = [
			queryLang(),
			storedLang(),
			document.documentElement.getAttribute('data-default-lang')
		];
		if (global.navigator) {
			if (navigator.languages && navigator.languages.length) {
				candidates = candidates.concat(navigator.languages);
			}
			candidates.push(navigator.language || navigator.userLanguage);
		}
		candidates.push(document.documentElement.getAttribute('lang'));
		candidates.push(FALLBACK);

		for (var i = 0; i < candidates.length; i++) {
			var match = normalizeLang(candidates[i]);
			if (match) return match;
		}
		return FALLBACK;
	}

	function setLang(lang, options) {
		options = options || {};
		var next = normalizeLang(lang) || FALLBACK;
		if (next === current) {
			syncSwitchers();
			return current;
		}
		current = next;
		try {
			global.localStorage.setItem(STORAGE_KEY, current);
		} catch (e) {
			// Storage can be disabled; the current page still switches.
		}
		apply(document);
		syncSwitchers();
		if (!options.silentUrl) updateUrl(current);
		emit();
		return current;
	}

	function onChange(fn) {
		if (typeof fn !== 'function') return function () {};
		listeners.push(fn);
		return function () {
			var index = listeners.indexOf(fn);
			if (index >= 0) listeners.splice(index, 1);
		};
	}

	function init() {
		if (initialized) return;
		initialized = true;
		current = detectLang();
		bindSwitchers();
		populateSwitchers();
		apply(document);
	}

	var I18n = {
		fallback: FALLBACK,
		t: t,
		apply: apply,
		setLang: setLang,
		getLang: function () {
			return current;
		},
		onChange: onChange,
		available: function () {
			return Object.keys(locales);
		}
	};

	Object.defineProperty(I18n, 'lang', {
		get: function () {
			return current;
		}
	});

	global.I18n = I18n;

	if (document.readyState === 'loading' && !document.body) {
		document.addEventListener('DOMContentLoaded', init, false);
	} else {
		init();
	}
}(window));
