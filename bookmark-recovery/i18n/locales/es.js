/* Español (es) */
window.I18N_LOCALES = window.I18N_LOCALES || {};

window.I18N_LOCALES.es = {
	localeName: 'Español',
	dir: 'ltr',

	meta: {
		title: 'Herramienta de recuperación de marcadores de Chrome',
		description: 'Herramienta para recuperar tus marcadores de Chrome perdidos'
	},

	lang: {
		label: 'Idioma'
	},

	tabs: {
		label: 'Instrucciones',
		windows: 'Windows',
		mac: 'Mac',
		linux: 'Linux',
		google: 'Servidor de Google'
	},

	windows: {
		intro: 'Sigue estos pasos para recuperar tus marcadores perdidos (Windows):',
		steps: [
			'Abre el explorador de Windows y navega al directorio <code>C:\\Users\\%username%\\AppData\\Local\\Google\\Chrome\\User Data</code> (copia y pega esa dirección en la barra superior).',
			'En la barra de búsqueda, escribe <code>Bookmarks</code>; verás una lista de ficheros llamados <code>Bookmarks</code> y/o <code>Bookmarks.bak</code>. (<i>Nota: Si tienes más de un usuario en Chrome, los marcadores de los otros usuarios también saldrán en la lista</i>)',
			'Selecciona todos los archivos con tu ratón y arrástralos al bloque de aquí abajo.',
			'Descarga todos los ficheros HTML que generará esta página web automáticamente.',
			'Abre cada archivo HTML con Chrome y determina cuál es el archivo que contiene tus marcadores. (<i>Nota: lo más probable es que el fichero más grande sea el correcto, de todas formas siempre puedes intentar importarlos uno a uno hasta dar con el correcto</i>)',
			'En Chrome, abre el menú de Chrome y ve a Marcadores &gt; Administrador de marcadores.',
			'Haz clic en el menú que hay al lado de la barra de búsqueda y haz clic en "Importar marcadores".',
			'Selecciona el archivo HTML que contiene tus marcadores.',
			'Tus marcadores se deberían haber importado ahora a Chrome en una carpeta nueva en la barra de marcadores.'
		]
	},

	mac: {
		intro: 'Sigue estos pasos para recuperar tus marcadores perdidos (Mac):',
		steps: [
			'En el menú del Mac de arriba del todo de la pantalla, haz clic en Ir.',
			'Selecciona Ir a la carpeta.',
			'Escribe <code>~/Library/Application Support/Google/Chrome</code> y haz clic en Ir.',
			'En la barra de búsqueda escribe <code>Bookmarks</code> (asegúrate de seleccionar que busque en la carpeta Chrome); verás una lista de archivos llamados <code>Bookmarks</code> y/o <code>Bookmarks.bak</code>. (<i>Nota: Si tienes más de un usuario en Chrome, los marcadores de los otros usuarios también saldrán en la lista</i>)',
			'Selecciona todos los archivos con tu ratón y arrástralos al bloque de aquí abajo.',
			'Descarga todos los ficheros HTML que generará esta página web automáticamente.',
			'Abre cada archivo HTML con Chrome y determina cuál es el archivo que contiene tus marcadores. (<i>Nota: lo más probable es que el fichero más grande sea el correcto, de todas formas siempre puedes intentar importarlos uno a uno hasta dar con el correcto</i>)',
			'En Chrome, abre el menú de Chrome y ve a Marcadores &gt; Administrador de marcadores.',
			'Haz clic en el menú que hay al lado de la barra de búsqueda y haz clic en "Importar marcadores".',
			'Selecciona el archivo HTML que contiene tus marcadores.',
			'Tus marcadores se deberían haber importado ahora a Chrome en una carpeta nueva en la barra de marcadores.'
		]
	},

	linux: {
		intro: 'Sigue estos pasos para recuperar tus marcadores perdidos (Linux):',
		steps: [
			'Abre tu explorador de archivos (<i>Nautilus, Dolphin ...</i>).',
			'Ve a <code>~/.config/google-chrome</code> (<i>usa Ctrl+L en Nautilus</i>).',
			'Busca <code>Bookmarks*</code>; verás una lista de archivos llamados <code>Bookmarks</code> y/o <code>Bookmarks.bak</code>. (<i>Nota: Si tienes más de un usuario en Chrome, los marcadores de los otros usuarios también saldrán en la lista</i>)',
			'Selecciona todos los archivos con tu ratón y arrástralos al bloque de aquí abajo.',
			'Descarga todos los ficheros HTML que generará esta página web automáticamente.',
			'Abre cada archivo HTML con Chrome y determina cuál es el archivo que contiene tus marcadores. (<i>Nota: lo más probable es que el fichero más grande sea el correcto, de todas formas siempre puedes intentar importarlos uno a uno hasta dar con el correcto</i>)',
			'En Chrome, abre el menú de Chrome y ve a Marcadores &gt; Administrador de marcadores.',
			'Haz clic en el menú que hay al lado de la barra de búsqueda y haz clic en "Importar marcadores".',
			'Selecciona el archivo HTML que contiene tus marcadores.',
			'Tus marcadores se deberían haber importado ahora a Chrome en una carpeta nueva en la barra de marcadores.'
		]
	},

	google: {
		intro: 'Si estás seguro de que en los datos de la sincronización de Chrome que hay en los servidores de Google todavía están tus marcadores, puedes seguir los siguientes pasos para recuperarlos del servidor de Google:',
		steps: [
			'Ve a <a href="https://takeout.google.com/settings/takeout" target="_blank" rel="noopener">Google Takeout</a> e inicia sesión con la cuenta de Google que usas para la sincronización de Chrome.',
			'Haz clic en el botón "Desmarcar todo".',
			'Activa el producto "Chrome" en el listado.',
			'Haz clic en el botón "Se han incluido todos los datos de Chrome".',
			'En la ventana emergente, activa solo la opción "Bookmarks" y desactiva el resto.',
			'Haz clic en "Aceptar" y ve hasta el final de la página para hacer clic en el botón "Siguiente paso".',
			'Haz clic en el botón "Programar otra exportación".',
			'Descarga y descomprime el archivo ZIP que se exportará.',
			'En la carpeta descomprimida, navega a la carpeta "Chrome". El archivo HTML llamado "Bookmarks" es el que necesitamos.',
			'En Chrome, abre el menú de Chrome y ve a Marcadores &gt; Administrador de marcadores.',
			'Haz clic en el menú que hay al lado de la barra de búsqueda y haz clic en "Importar marcadores".',
			'Selecciona el archivo HTML que contiene tus marcadores.',
			'Tus marcadores se deberían haber importado ahora a Chrome en una carpeta nueva en la barra de marcadores.'
		]
	},

	dropzone: {
		label: '<b>Selecciona un archivo</b> o arrástralo aquí',
		tooltip: 'Busca "Bookmarks" en la carpeta de datos de Chrome y selecciona todos los archivos que encuentres.'
	},

	output: {
		placeholder: 'El fichero HTML se producirá aquí más tarde.',
		loading: 'Cargando…'
	},

	other: {
		title: 'Otras maneras de recuperar marcadores',
		personal: {
			title: 'Copia de seguridad personal',
			body: 'En el caso de que dispongas de copias de seguridad de tu ordenador, encuentra los archivos de los marcadores que haya en las copias de seguridad, súbelos a esta herramienta y continúa con los pasos de arriba.'
		},
		devices: {
			title: 'Recuperarlos desde un dispositivo viejo',
			body: '¿Tienes un dispositivo (por ejemplo, un portátil antiguo) donde has iniciado sesión en Chrome con tu cuenta de Google y todavía no se ha sincronizado desde el momento en que perdiste tus marcadores? Si es así, encuentra los archivos de los marcadores en ese dispositivo, súbelos a esta herramienta y sigue con los pasos de arriba.'
		},
		tips: {
			title: 'Consejos y trucos',
			body: 'Puedes usar esta herramienta o la función <i>Exportar marcadores</i> del administrador de marcadores para generar archivos HTML que se pueden usar como copias de seguridad de tus marcadores. Hacer copias de seguridad regulares puede llegar a ser útil en el caso de que vuelvas a perder tus marcadores en el futuro.'
		}
	},

	disclaimer: 'Aviso: esta herramienta no es un producto oficial de Google.',

	footer: {
		help: 'Centro de ayuda de Chrome',
		forum: 'Foro de ayuda de Chrome'
	},

	github: {
		title: 'Código fuente en GitHub'
	},

	download: {
		ready: {
			one: 'Descarga lista (1 marcador encontrado)',
			other: 'Descarga lista ({count} marcadores encontrados)'
		},
		done: 'Descargado'
	},

	file: {
		modified: 'Modificado por última vez: {date}',
		invalid: '¡Error! El archivo no es válido. ¡Vuélvelo a intentar!'
	},

	date: {
		unknown: 'n/a'
	}
};
