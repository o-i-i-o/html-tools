# Chrome Bookmarks Recovery Tool

A fully client-side tool that converts the Chrome native bookmarks file (`Bookmarks` or `Bookmarks.bak`) into an HTML file that can be imported back to Chrome through Bookmark Manager.

Everything runs locally: files are read with the File API and converted in the browser. Nothing is uploaded and no network request is made by the tool itself.

## Usage

- Open `index.html` directly in a browser (double-click it), or
- open `bookmark-recovery.html`, a self-contained single-file copy with the CSS, JavaScript and all locales inlined.

Choose the language in the header. The choice is remembered in `localStorage` when the browser allows it for local files; `?lang=zh-CN`, `?lang=es` or `?lang=en` can also be used.

## Files

```
index.html              page markup and styles
app.js                  bookmark conversion and UI logic
i18n/i18n.js            i18n runtime
i18n/locales/en.js      English dictionary (fallback)
i18n/locales/zh-CN.js   Simplified Chinese dictionary
i18n/locales/es.js      Spanish dictionary
build-standalone.js     builds the single-file copy
bookmark-recovery.html  generated single-file copy
README.md
```

## Single-file build

No dependencies are needed:

```sh
node build-standalone.js
```

This reads `index.html` and inlines `i18n/locales/*.js`, `i18n/i18n.js` and `app.js` into `bookmark-recovery.html`. Re-run the command after editing any source file. Do not edit the generated file directly.

## Internationalization

The source is split into small locale modules so translations stay maintainable; the generated standalone file inlines them.

Markup uses:

| Attribute | Effect |
| --- | --- |
| `data-i18n="key"` | Sets `textContent` |
| `data-i18n-html="key"` | Sets `innerHTML` (trusted strings with `<code>`, `<i>`, links…) |
| `data-i18n-list="key"` | Rebuilds the element with one `<li>` per array item |
| `data-i18n-attr="title:key;aria-label:other.key"` | Translates attributes |

Any element with `data-lang-switcher` becomes a language `<select>` populated from the loaded locales.

JavaScript API:

```js
I18n.t('download.ready', { count: 3 });
I18n.setLang('zh-CN');
I18n.lang;
I18n.onChange(function (lang) { ... });
```

The initial language comes from `?lang=`, then the saved choice, then the browser language, then English.

To add a language:

1. Copy `i18n/locales/en.js` to `i18n/locales/<code>.js` and translate the values while keeping the keys and HTML tags.
2. Set `localeName` and `dir` (`ltr` or `rtl`).
3. Add `<script src="i18n/locales/<code>.js"></script>` before `i18n.js` in `index.html`.
4. Run `node build-standalone.js` to refresh the single-file copy.

## Contributors
Special thanks to David King, Hennie Rozengarden, Jeroen Van Antwerpen, Cor Koomen and other TC/RS Chromies in refining this tool.
