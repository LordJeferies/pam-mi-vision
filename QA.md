# Validación V2 Alfa

- ✅ `node --check app.js` y `node --check data.js`.
- ✅ `bash -n PUBLICAR_MAC.command`.
- ✅ HTML contiene enlaces relativos para subruta de GitHub Pages.
- ✅ Manifest/iconos/service worker y archivos locales completos.
- ✅ Se verificaron los 6 programas y 27 capítulos de la fuente HTML original.
- ⚠️ Se intentó ejecutar Playwright/Chromium en vista móvil y escritorio, pero el entorno bloquea la navegación por política del administrador (`ERR_BLOCKED_BY_ADMINISTRATOR`) incluso con `file://`. No se pudo concluir una prueba interactiva real ni validar Safari/iOS.
- ⚠️ Audio, narración del sistema y PWA instalable necesitan comprobarse en el dispositivo final. Los archivos incluyen fallback textual cuando la narración no esté soportada.
- ⚠️ La conexión a servicios externos de voz IA no forma parte de esta versión estática (para proteger claves de API).
