/* 简体中文 (zh-CN) */
window.I18N_LOCALES = window.I18N_LOCALES || {};

window.I18N_LOCALES['zh-CN'] = {
	localeName: '中文（简体）',
	dir: 'ltr',

	meta: {
		title: 'Chrome 书签恢复工具',
		description: '用于恢复丢失的 Chrome 书签的工具'
	},

	lang: {
		label: '语言'
	},

	tabs: {
		label: '操作说明',
		windows: 'Windows',
		mac: 'Mac',
		linux: 'Linux',
		google: 'Google 服务器'
	},

	windows: {
		intro: '以下是在 Windows 上恢复丢失书签的方法：',
		steps: [
			'打开文件资源管理器，进入 <code>C:\\Users\\%username%\\AppData\\Local\\Google\\Chrome\\User Data</code>（可将该路径复制粘贴到地址栏）。',
			'在搜索栏中输入 <code>Bookmarks</code>，你会看到名为 <code>Bookmarks</code> 和/或 <code>Bookmarks.bak</code> 的文件列表。（<i>注意：如果同一台电脑上有多个 Chrome 用户，其他用户的书签也会出现在列表中</i>）',
			'用鼠标选中所有文件，并将它们拖到下方的方框中。',
			'下载所有生成的 HTML 文件。',
			'用 Chrome 打开每个 HTML 文件，找出包含你的书签的那个文件。（<i>注意：最大的文件最有可能就是正确的文件</i>）',
			'在 Chrome 中点击 Chrome 菜单图标，然后进入“书签”&gt;“书签管理器”。',
			'点击搜索栏旁边的菜单图标，然后点击“导入书签”。',
			'选择包含你的书签的 HTML 文件。',
			'你的书签现在应该已经导入回 Chrome，并出现在书签栏中的新文件夹里。'
		]
	},

	mac: {
		intro: '以下是在 Mac 上恢复丢失书签的方法：',
		steps: [
			'在屏幕顶部的 Mac 菜单栏中，点击“前往”。',
			'选择“前往文件夹”。',
			'输入 <code>~/Library/Application Support/Google/Chrome</code>，然后点击“前往”。',
			'在搜索栏中输入 <code>Bookmarks</code>（确保搜索范围为 Chrome 文件夹），你会看到名为 <code>Bookmarks</code> 和/或 <code>Bookmarks.bak</code> 的文件列表。（<i>注意：如果同一台电脑上有多个 Chrome 用户，其他用户的书签也会出现在列表中</i>）',
			'用鼠标选中所有文件，并将它们拖到下方的方框中。',
			'下载所有生成的 HTML 文件。',
			'用 Chrome 打开每个 HTML 文件，找出包含你的书签的那个文件。（<i>注意：最大的文件最有可能就是正确的文件</i>）',
			'在 Chrome 中点击 Chrome 菜单图标，然后进入“书签”&gt;“书签管理器”。',
			'点击搜索栏旁边的菜单图标，然后点击“导入书签”。',
			'选择包含你的书签的 HTML 文件。',
			'你的书签现在应该已经导入回 Chrome，并出现在书签栏中的新文件夹里。'
		]
	},

	linux: {
		intro: '以下是在 Linux 上恢复丢失书签的方法：',
		steps: [
			'打开文件管理器（<i>Nautilus、Dolphin 等</i>）。',
			'前往 <code>~/.config/google-chrome</code>（<i>在 Nautilus 中按 Ctrl+L</i>）。',
			'搜索 <code>Bookmarks*</code>，你会看到名为 <code>Bookmarks</code> 和/或 <code>Bookmarks.bak</code> 的文件列表。（<i>注意：如果同一台电脑上有多个 Chrome 用户，其他用户的书签也会出现在列表中</i>）',
			'用鼠标选中所有文件，并将它们拖到下方的方框中。',
			'下载所有生成的 HTML 文件。',
			'用 Chrome 打开每个 HTML 文件，找出包含你的书签的那个文件。（<i>注意：最大的文件最有可能就是正确的文件</i>）',
			'在 Chrome 中点击 Chrome 菜单图标，然后进入“书签”&gt;“书签管理器”。',
			'点击搜索栏旁边的菜单图标，然后点击“导入书签”。',
			'选择包含你的书签的 HTML 文件。',
			'你的书签现在应该已经导入回 Chrome，并出现在书签栏中的新文件夹里。'
		]
	},

	google: {
		intro: '如果你确定 Google 服务器上保存的 Chrome 同步数据中仍有你的书签，可以按以下步骤取回：',
		steps: [
			'前往 <a href="https://takeout.google.com/settings/takeout" target="_blank" rel="noopener">Google Takeout</a>，并登录用于 Chrome 同步的 Google 账号。',
			'点击“取消全选”按钮。',
			'在产品列表中勾选“Chrome”。',
			'展开“全部 Chrome 数据类型”。',
			'点击“选择 Chrome 数据”选项。',
			'在弹出的窗口中勾选“书签”，并取消勾选其他选项。',
			'滚动到页面底部，点击“下一步”按钮。',
			'点击“创建导出”按钮。',
			'下载并解压导出的压缩包。',
			'在解压后的文件夹中进入“Chrome”文件夹，名为“Bookmarks”的 HTML 文件就是我们需要的文件。',
			'在 Chrome 中点击 Chrome 菜单图标，然后进入“书签”&gt;“书签管理器”。',
			'点击搜索栏旁边的菜单图标，然后点击“导入书签”。',
			'选择包含你的书签的 HTML 文件。',
			'你的书签现在应该已经导入回 Chrome，并出现在书签栏中的新文件夹里。'
		]
	},

	dropzone: {
		label: '<b>点击导入 Bookmarks</b> 或将 Bookmarks 拖到此处',
		tooltip: '在 Chrome 数据文件夹中搜索“Bookmarks”，然后选中找到的所有文件。'
	},

	output: {
		placeholder: '转换后的 HTML 文件稍后会显示在这里供下载。',
		loading: '正在读取…'
	},

	other: {
		title: '其他恢复书签的方法',
		personal: {
			title: '个人备份',
			body: '如果你有电脑的备份，请在备份中找到书签文件，将它们上传到此工具，然后继续上面的步骤。'
		},
		devices: {
			title: '从旧设备恢复',
			body: '你是否有一台登录了 Google 账号、并且在书签丢失之后尚未同步的设备（例如旧笔记本电脑）？如果有，请在该设备上找到书签文件，上传到此工具，然后继续上面的步骤。'
		},
		tips: {
			title: '提示与技巧',
			body: '你可以使用此工具或书签管理器中的<i>导出书签</i>功能生成 HTML 文件，作为书签的归档或备份。定期备份有助于防止将来书签再次丢失。'
		}
	},

	disclaimer: '免责声明：本工具并非 Google 官方产品。',

	footer: {
		help: 'Chrome 帮助中心',
		forum: 'Chrome 帮助论坛'
	},

	github: {
		title: 'GitHub 上的源代码'
	},

	download: {
		ready: {
			one: '点击下载（共 {count} 个书签）',
			other: '点击下载（共 {count} 个书签）'
		},
		done: '已下载'
	},

	file: {
		modified: '最后修改时间：{date}',
		invalid: '文件无效，请重试。'
	},

	date: {
		unknown: '未知'
	}
};
