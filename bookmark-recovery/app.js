'use strict';
(function () {
	var $ = document.querySelector.bind(document);
	var input = $('#input');
	var output = $('#output');
	var entries = [];

	function Bookmark(raw) {
		this.tree = JSON.parse(raw);
		this.html = '';
		this.count = 0;
		this.first = true;
	}

	function chromeTime2TimeT(time) {
		return Math.floor((time - 11644473600000000) / 1000000);
	}

	Bookmark.prototype.walk = function (node) {
		if (node.type === 'folder') {
			this.html += '<DT><H3 ADD_DATE="' + chromeTime2TimeT(node.date_added) + '" LAST_MODIFIED="' + chromeTime2TimeT(node.date_modified) + '"';
			if (this.first) {
				this.html += ' PERSONAL_TOOLBAR_FOLDER="true"';
				this.first = false;
			}
			this.html += '>' + node.name + '</H3>\n';
			this.html += '<DL><p>\n';
			node.children.forEach(this.walk.bind(this));
			this.html += '</DL><p>\n';
		} else { // node.type == 'url'
			this.html += '<DT><A HREF="' + node.url + '" ADD_DATE="' + chromeTime2TimeT(node.date_added) + '">' + node.name + '</A>\n';
			this.count++;
		}
	};

	Bookmark.prototype.parse = function () {
		this.html = '<!DOCTYPE NETSCAPE-Bookmark-file-1><META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8"><TITLE>Bookmarks</TITLE><H1>Bookmarks</H1>\n';
		this.html += '<DL><p>\n';
		var roots = this.tree.roots;
		this.walk(roots.bookmark_bar);
		if (roots.other.children.length > 0) this.walk(roots.other);
		if (roots.synced.children.length > 0) this.walk(roots.synced);
		this.html += '<style>dt, dl { padding-left: 12px; }</style>\n';
	};

	function fileDate(file) {
		var date;
		if (file.lastModified) {
			date = new Date(file.lastModified);
		} else if (file.lastModifiedDate !== undefined) {
			date = file.lastModifiedDate;
		}
		if (!date) return I18n.t('date.unknown');
		try {
			return date.toLocaleDateString(I18n.lang);
		} catch (e) {
			return I18n.t('date.unknown');
		}
	}

	function createDownloadLink(entry) {
		var link = document.createElement('a');
		link.download = 'bookmark_backup.html';

		if (entry.downloaded) {
			link.dataset.disabled = true;
			link.textContent = I18n.t('download.done');
			link.onclick = function () {
				return false;
			};
			return link;
		}

		if (!entry.url) {
			var blob = new Blob([entry.bookmark.html], { type: 'text/plain' });
			entry.url = window.URL.createObjectURL(blob);
		}
		link.href = entry.url;
		link.textContent = I18n.t('download.ready', { count: entry.bookmark.count });
		link.onclick = function () {
			var url = entry.url;
			entry.downloaded = true;
			entry.url = null;
			link.textContent = I18n.t('download.done');
			link.dataset.disabled = true;
			link.removeAttribute('href');
			setTimeout(function () {
				window.URL.revokeObjectURL(url);
			}, 1500);
			return false;
		};
		return link;
	}

	function renderOutput() {
		output.innerHTML = '';

		if (entries.length === 0) {
			output.textContent = I18n.t('output.placeholder');
			output.setAttribute('aria-hidden', 'true');
			return;
		}

		output.setAttribute('aria-hidden', 'false');
		var list = document.createElement('ul');
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i];
			var item = document.createElement('li');
			var meta = document.createElement('strong');
			meta.textContent = I18n.t('file.modified', { date: fileDate(entry.file) });
			item.appendChild(meta);
			item.appendChild(document.createTextNode(' (' + entry.file.size + 'B) '));

			if (entry.status === 'ok') {
				item.appendChild(createDownloadLink(entry));
			} else if (entry.status === 'error') {
				var error = document.createElement('b');
				error.textContent = I18n.t('file.invalid');
				item.appendChild(error);
			} else {
				var pending = document.createElement('i');
				pending.textContent = I18n.t('output.loading');
				item.appendChild(pending);
			}

			list.appendChild(item);
		}
		output.appendChild(list);
	}

	function readEntry(entry) {
		var reader = new FileReader();
		reader.onload = function () {
			try {
				var bookmark = new Bookmark(reader.result);
				bookmark.parse();
				entry.bookmark = bookmark;
				entry.status = 'ok';
			} catch (e) {
				entry.status = 'error';
			}
			renderOutput();
		};
		reader.onerror = function () {
			entry.status = 'error';
			renderOutput();
		};
		reader.readAsText(entry.file);
	}

	function handleFiles(files) {
		if (!files || files.length === 0) return;

		entries = [];
		for (var i = 0; i < files.length; i++) {
			var entry = {
				file: files[i],
				status: 'pending',
				bookmark: null,
				url: null,
				downloaded: false
			};
			entries.push(entry);
			readEntry(entry);
		}
		renderOutput();
	}

	input.addEventListener('change', function (e) {
		handleFiles(e.target.files);
		e.target.value = '';
	}, false);

	function handleFileSelect(e) {
		e.stopPropagation();
		e.preventDefault();
		handleFiles(e.dataTransfer.files);
		this.classList.remove('is_dragover');
	}

	function handleDragOver(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		this.classList.add('is_dragover');
	}

	function handleDragLeave(e) {
		e.stopPropagation();
		e.preventDefault();
		this.classList.remove('is_dragover');
	}

	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
	dropZone.addEventListener('dragleave', handleDragLeave, false);

	var solns = ['#windows', '#mac', '#linux', '#google'];
	function handleHashChange() {
		var hash = location.hash;
		for (var i = 0; i < solns.length; i++) {
			var id = solns[i];
			var tab = $(id + '-tab');
			var soln = $(id + '-soln');
			var visible;
			if (hash === id) {
				tab.classList.add('active');
				soln.classList.add('show');
				visible = true;
			} else {
				tab.classList.remove('active');
				soln.classList.remove('show');
				visible = false;
			}
			tab.setAttribute('aria-selected', visible);
			soln.setAttribute('aria-hidden', !visible);
		}
	}
	window.addEventListener('hashchange', handleHashChange, false);
	if (location.hash === '') location.hash = '#windows';
	handleHashChange();

	function toggleZip() {
		var visible = this.parentNode.classList.toggle('unzip');
		this.setAttribute('aria-expanded', visible);
		this.nextElementSibling.setAttribute('aria-hidden', !visible);
	}
	var zipH = document.querySelectorAll('.zip-h');
	for (var i = 0; i < zipH.length; i++) {
		zipH[i].addEventListener('click', toggleZip, false);
	}

	// Keep dynamically generated text in sync with the selected language.
	I18n.onChange(renderOutput);
}());
