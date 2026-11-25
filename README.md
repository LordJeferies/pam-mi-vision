# Pam · Mi visión

PWA personal para iPhone y escritorio. **Iniciar** abre *Volver a mí* con música y narración, y **Continuar** recupera el punto guardado cuando se interrumpe una sesión. En **Más opciones** viven las otras meditaciones, el diario, el camino profesional y la visión.

## Meditaciones

- Seis sesiones y 27 capítulos narrados en español latino. Las grabaciones incluyen música ambiental original, pausas de reflexión y transcripciones que siguen el audio.
- El reproductor usa pistas MP3 premezcladas y las marcas de capítulo de `meditation-audio.js`.
- Voz sintética Laura de [HirCoir](https://huggingface.co/HirCoir/Piper-TTS-Laura), utilizada para esta aplicación personal y gratuita bajo [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Velocidad, pausas y mezcla adaptadas para las sesiones. El sitio no carga el modelo ni llama a un servicio de voz.
- Referencias de los guiones: [atención plena](https://oxfordmindfulness.org/resources/mindfulness-a-practical-guide-to-finding-peace-in-a-frantic-world-by-mark-williams-and-danny-penman-2), [autocompasión](https://pubmed.ncbi.nlm.nih.gov/37362192/), [etiquetado emocional](https://pubmed.ncbi.nlm.nih.gov/17576282/), [diálogo interno con distancia](https://pubmed.ncbi.nlm.nih.gov/24467424/) y [planificación con contraste mental](https://doi.org/10.3389/fpsyg.2021.565202). Los estudios evalúan las prácticas en sus propios contextos. Los guiones de Pam no son una intervención clínica validada.

## Uso y datos

El progreso, el diario y las herramientas profesionales se guardan en el navegador. Los respaldos JSON existentes siguen siendo compatibles. Tras una primera visita, la PWA conserva la interfaz y las transcripciones para usarlas sin conexión. Las pistas usan la conexión al sitio.

Para servirla localmente desde la raíz del repositorio, usa `python3 -m http.server 8000` y abre `http://localhost:8000`.

- [Sitio](https://lordjeferies.github.io/pam-mi-vision/)
- [Repositorio](https://github.com/LordJeferies/pam-mi-vision)
