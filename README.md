# Pam · Mi visión — V2 Alfa

**PWA mobile-first**, independiente y sin framework ni CDNs. Mantiene los seis programas y 27 capítulos del HTML Alfa Pro suministrado, con navegación nueva, lectura ajustable y contraste mejorado.

## Incluye

- Seis programas guiados con 27 capítulos, capítulo actual y progreso, modo lectura, temporizador y narración opcional por `speechSynthesis`.
- Sonido ambiental sintetizado mediante Web Audio API (no son pistas musicales comerciales ni voz IA remota). El sonido necesita iniciarse desde un toque del usuario; la voz del dispositivo depende del navegador.
- Diario editable, biblioteca de evidencias, estado de postulaciones, plan de siete días, rutas A y B, declaración de visión y ejercicio de planificación.
- Guardado local; migración de datos del identificador `pam_mi_vision_calm_v3` de la versión recibida (cuando existe); exportación/importación de respaldo JSON.
- PWA con manifest, iconos PNG y caché offline de los archivos de la aplicación.
- Temas oscuro y claro, escalado de letra 100–140%, teclado y movimiento reducido.

## Publicar

En macOS, descarga `Pam_Mi_Vision_V2_Alfa_GitHubPages.zip` a `~/Downloads` y ejecuta `bash PUBLICAR_MAC.command` desde la carpeta extraída, o utiliza el comando que acompaña la entrega para extraer y ejecutar este script desde el ZIP.

Repositorio: https://github.com/LordJeferies/pam-mi-vision  
Sitio: https://lordjeferies.github.io/pam-mi-vision/

## Privacidad y límites

Los datos personales se guardan **solo en este navegador**; no se comparten entre teléfonos. Exporta respaldos de vez en cuando. No hay API de empleos en vivo, ni narración premium de pago ni sincronización entre dispositivos. `speechSynthesis` puede pausarse o detenerse si iOS suspende la pestaña. El audio ambiental es un fondo de ruido filtrado sin música comercial. La PWA necesita HTTPS para la instalación y caché; abrir index.html con `file://` no habilita el service worker.

Las lecturas CEE/Neville son contenidos de reflexión filosófico-espiritual, no pruebas de manifestación garantizada. Los perfiles profesionales del material aportado deben confirmarse antes de utilizarlos en candidaturas. El contenido no sustituye asesoría profesional clínica.

## Cambios respecto al HTML original

Se reemplazó el CDN de Tailwind por CSS autocontenido; se eliminó el falso indicador de megabytes de audio y la opción de Gemini TTS sin clave; se simplificó la UI a cinco secciones, un reproductor por capítulo y formularios de una tarea a la vez; se conservaron datos y capítulos; se agregaron validaciones de entrada y respaldo estructurado. La V2 Alfa es una versión funcional **sin conexión backend**, no una versión comercial final ni equivalente a Calm en catálogo/licencias.
