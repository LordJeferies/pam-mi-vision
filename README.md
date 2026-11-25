# Pam · Mi visión

PWA personal para iPhone y escritorio. **Iniciar** abre *Volver a mí* con música y narración, y **Continuar** recupera el punto guardado cuando se interrumpe una sesión. En **Más opciones** viven las otras meditaciones, el diario, el camino profesional y la visión.

## Meditaciones

- Seis sesiones y 27 capítulos. La frase actual se muestra siempre y cambia según las marcas de la narración.
- **Repetir meditación** vuelve a abrir la misma sesión desde el principio al terminar.
- Voz y música se reproducen en pistas MP3 separadas. **Silenciar voz** conserva la música y el avance del texto. La pausa detiene ambas pistas.
- Narración sintética pregrabada con la voz Lola de [Pocket TTS de Kyutai](https://huggingface.co/kyutai/pocket-tts-without-voice-cloning), modelo en español de 24 capas bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). A partir de esa generación se editaron el nivel, los silencios y las marcas del texto.
- Referencias de los guiones: [atención plena](https://oxfordmindfulness.org/resources/mindfulness-a-practical-guide-to-finding-peace-in-a-frantic-world-by-mark-williams-and-danny-penman-2), [autocompasión](https://pubmed.ncbi.nlm.nih.gov/37362192/), [etiquetado emocional](https://pubmed.ncbi.nlm.nih.gov/17576282/), [diálogo interno con distancia](https://pubmed.ncbi.nlm.nih.gov/24467424/) y [planificación con contraste mental](https://doi.org/10.3389/fpsyg.2021.565202). Los estudios evalúan las prácticas en sus propios contextos. Los guiones de Pam no son una intervención clínica validada.

## Uso y datos

El progreso, el diario y las herramientas profesionales se guardan en el navegador. Los respaldos JSON existentes siguen siendo compatibles. Tras una primera visita, la PWA conserva la interfaz y las transcripciones para usarlas sin conexión. Las pistas usan la conexión al sitio.

Para servirla localmente desde la raíz del repositorio, usa `python3 -m http.server 8000` y abre `http://localhost:8000`.

- [Sitio](https://lordjeferies.github.io/pam-mi-vision/)
- [Repositorio](https://github.com/LordJeferies/pam-mi-vision)
