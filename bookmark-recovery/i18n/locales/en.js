/* English (en) — source locale. */
window.I18N_LOCALES = window.I18N_LOCALES || {};

window.I18N_LOCALES.en = {
	localeName: 'English',
	dir: 'ltr',

	meta: {
		title: 'Chrome Bookmarks Recovery Tool',
		description: 'Tool to recover your lost Chrome bookmarks'
	},

	lang: {
		label: 'Language'
	},

	tabs: {
		label: 'Instructions',
		windows: 'Windows',
		mac: 'Mac',
		linux: 'Linux',
		google: 'Google Server'
	},

	windows: {
		intro: 'Here is how to recover your lost bookmarks (Windows):',
		steps: [
			'Open File Explorer and navigate to <code>C:\\Users\\%username%\\AppData\\Local\\Google\\Chrome\\User Data</code> (you can copy the path into the address bar).',
			'In the search bar, type <code>Bookmarks</code>; you will see a list of files named <code>Bookmarks</code> and/or <code>Bookmarks.bak</code>. (<i>Note: If there is more than one user using the same Chrome, bookmarks from other users will be listed too</i>)',
			'Select all the files with your mouse and drag them to the block below.',
			'Download all the HTML files.',
			'Open each HTML file with Chrome and determine the HTML file that contains your bookmarks. (<i>Note: The largest file is most likely the correct one</i>)',
			'In your Chrome browser, click the Chrome menu icon and go to Bookmarks &gt; Bookmark Manager.',
			'Click the menu icon beside the search bar and click "Import Bookmarks".',
			'Select the HTML file that contains your bookmarks.',
			'Your bookmarks should now be imported back to Chrome in a new folder in the bookmarks bar.'
		]
	},

	mac: {
		intro: 'Here is how to recover your lost bookmarks (Mac):',
		steps: [
			'In the Mac menu bar at the top of the screen, click Go.',
			'Select Go to Folder.',
			'Type <code>~/Library/Application Support/Google/Chrome</code> and click Go.',
			'In the search bar, type <code>Bookmarks</code>; you will see a list of files named <code>Bookmarks</code> and/or <code>Bookmarks.bak</code>. (<i>Note: If there is more than one user using the same Chrome, bookmarks from other users will be listed too</i>)',
			'Select all the files with your mouse and drag them to the block below.',
			'Download all the HTML files.',
			'Open each HTML file with Chrome and determine the HTML file that contains your bookmarks. (<i>Note: The largest file is most likely the correct one</i>)',
			'In your Chrome browser, click the Chrome menu icon and go to Bookmarks &gt; Bookmark Manager.',
			'Click the menu icon beside the search bar and click "Import Bookmarks".',
			'Select the HTML file that contains your bookmarks.',
			'Your bookmarks should now be imported back to Chrome in a new folder in the bookmarks bar.'
		]
	},

	linux: {
		intro: 'Here is how to recover your lost bookmarks (Linux):',
		steps: [
			'Open your file explorer (<i>Nautilus, Dolphin ...</i>).',
			'Go to <code>~/.config/google-chrome</code> (<i>use Ctrl+L in Nautilus</i>).',
			'Search for <code>Bookmarks*</code>; you will see a list of files named <code>Bookmarks</code> and/or <code>Bookmarks.bak</code>. (<i>Note: If there is more than one user using the same Chrome, bookmarks from other users will be listed too</i>)',
			'Select all the files with your mouse and drag them to the block below.',
			'Download all the HTML files.',
			'Open each HTML file with Chrome and determine the HTML file that contains your bookmarks. (<i>Note: The largest file is most likely the correct one</i>)',
			'In your Chrome browser, click the Chrome menu icon and go to Bookmarks &gt; Bookmark Manager.',
			'Click the menu icon beside the search bar and click "Import Bookmarks".',
			'Select the HTML file that contains your bookmarks.',
			'Your bookmarks should now be imported back to Chrome in a new folder in the bookmarks bar.'
		]
	},

	google: {
		intro: 'If you are sure that the Chrome sync data stored on Google servers still has your bookmarks, here is how to retrieve them:',
		steps: [
			'Go to <a href="https://takeout.google.com/settings/takeout" target="_blank" rel="noopener">Google Takeout</a> and sign in to the Google Account used for Chrome Sync.',
			'Click the "Select None" button.',
			'Check "Chrome" in the product list.',
			'Expand "All Chrome data types".',
			'Click the "Select Chrome data" option.',
			'In the popup, check the "Bookmarks" option and uncheck the rest.',
			'Scroll down to the bottom of the page and click the "Next" button.',
			'Click the "Create archive" button.',
			'Download and unzip the archive.',
			'In the unzipped folder, navigate to the "Chrome" folder. The HTML file named "Bookmarks" is the one we need.',
			'In your Chrome browser, click the Chrome menu icon and go to Bookmarks &gt; Bookmark Manager.',
			'Click the menu icon beside the search bar and click "Import Bookmarks".',
			'Select the HTML file that contains your bookmarks.',
			'Your bookmarks should now be imported back to Chrome in a new folder in the bookmarks bar.'
		]
	},

	dropzone: {
		label: '<b>Click to import Bookmarks</b> or drag them here',
		tooltip: 'Search with the keyword of "Bookmarks" and select all the files found.'
	},

	output: {
		placeholder: 'Converted HTML files will appear here for download.',
		loading: 'Loading…'
	},

	other: {
		title: 'Other ways to recover bookmarks',
		personal: {
			title: 'Personal backup',
			body: 'If backups of your computer are available, find the bookmarks files in the backups, upload them to this tool and continue with the steps above.'
		},
		devices: {
			title: 'Recover from old devices',
			body: 'Do you have a device (e.g. an old laptop) that is signed in to your Google Account and has not been synced since the moment your bookmarks were lost? If so, find the files on this device, upload them to this tool and continue with the steps above.'
		},
		tips: {
			title: 'Tips and tricks',
			body: 'You can use this tool or the <i>Export Bookmarks</i> function in Bookmark Manager to generate an HTML file that can be used as an archive/backup of your bookmarks. Making regular backups is useful in case your bookmarks get lost again in the future.'
		}
	},

	disclaimer: 'Disclaimer: this is not an official Google product.',

	footer: {
		help: 'Chrome Help Center',
		forum: 'Chrome Help Forum'
	},

	github: {
		title: 'Source on GitHub'
	},

	download: {
		ready: {
			one: 'Click to download (1 bookmark)',
			other: 'Click to download ({count} bookmarks)'
		},
		done: 'Downloaded'
	},

	file: {
		modified: 'Last modified: {date}',
		invalid: 'Invalid file, please try again.'
	},

	date: {
		unknown: 'n/a'
	}
};
