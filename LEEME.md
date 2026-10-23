# ATMOS BOLIVIA
## Una vista. Tres ciudades. Todos los climas.

### Abrir el proyecto
1. Extrae toda la carpeta ATMOS_Bolivia del ZIP.
2. Abre index.html con un navegador moderno (por ejemplo, Chrome o Edge).
3. No muevas index.html fuera de la carpeta: utiliza styles.css, app.js y assets.

La entrega también incluye una edición independiente, ATMOS_Bolivia.html,
con el código y los videos dentro de un solo archivo. Esa versión no necesita
extraerse ni tener la carpeta assets al lado.

### Qué incluye
- Selección de La Paz, Cochabamba y Santa Cruz en la misma página.
- Tres fondos MP4 locales: tormenta, sol y viento.
- Cada video dura 10 segundos, tiene resolución 1280 x 720 y 24 cuadros por segundo.
- Reproducción silenciosa y repetida, con transiciones entre videos.
- Lluvia por capas, relámpagos suaves y espaciados, rayos solares y hojas con viento.
- Siluetas ilustrativas que evocan cada ciudad; no son planos geográficos precisos.
- Panel de viento, ráfagas, humedad, precipitación y atardecer.
- Pronóstico de seis horas, cambio de unidades y control de intensidad visual.
- Modo cine, pausa de movimiento y respeto por movimiento reducido.
- Diseño adaptable a computadora y celular.
- Importación de un video propio para la ciudad seleccionada, sin subirlo a internet.

### Importante sobre los videos
Los tres fondos son ANIMACIONES 3D ORIGINALES renderizadas para este proyecto.
Son videos MP4 reales como formato de archivo, pero NO son filmaciones reales
de La Paz, Cochabamba o Santa Cruz y NO son el video original del diseño de Dribbble.
Las nubes se recrearon con un modelo volumétrico y sombreado procedural.
Lluvia, rayos, hojas, luz y siluetas se superponen mediante JavaScript, Canvas, CSS y SVG.
El enlace de Dribbble se utilizó como referencia conceptual; no se extrajeron sus recursos.

### Dos modos de uso
EXPLORAR (predeterminado):
Todos los datos son ficticios y están identificados como DEMO / DATOS DE EJEMPLO.
La Paz empieza con tormenta; Cochabamba con sol; Santa Cruz con viento.
Estos climas NO describen las condiciones actuales ni permanentes de esas ciudades.
Cualquiera de las cuatro atmósferas puede activarse en cualquiera de las ciudades.
Al elegir un efecto manual desde Clima actual, se cambia explícitamente a DEMO.
Los videos y efectos de este modo funcionan sin internet.

CLIMA ACTUAL:
El botón realiza una consulta a la API pública de Open-Meteo con las coordenadas
configuradas para un punto de cada ciudad. No representa un promedio de todo el
municipio o departamento. La fuente ofrece condiciones estimadas por modelos,
no una cámara en vivo ni mediciones instantáneas del lugar que aparece de fondo.
Requiere acceso a internet. La consulta se reutiliza durante diez minutos; el
botón de actualizar permite solicitar otra respuesta.
Si la consulta falla, los datos actuales aparecen como no disponibles. No se
reemplazan silenciosamente por números ficticios.

La respuesta real del servicio NO pudo verificarse desde el entorno de creación.
Se probaron el procesamiento de respuestas simuladas, los errores de conexión,
la separación del modo DEMO y los controles. Revisa el botón Clima actual con
tu propia conexión antes de presentar el proyecto.

### Personalizar
- Textos, ubicaciones y efectos: app.js (objeto cities).
- Colores, tamaños y distribución: styles.css.
- Estructura de la vista: index.html.
- Fondos: assets/tormenta.mp4, assets/sol.mp4 y assets/viento.mp4.
- Imágenes de respaldo: los JPG del mismo nombre.

Para usar un video tuyo sin editar código, abre el botón de ajustes de la esquina
superior derecha, elige MP4 o WebM y selecciona el archivo. Se usa para la ciudad
activa durante la sesión. No se guarda al cerrar o recargar ni se sube a servidores.
Para un reemplazo permanente, modifica los archivos o las rutas en el código.
Si distribuyes la versión independiente, recuerda volver a incorporar los cambios;
los cambios del proyecto dividido no modifican automáticamente el HTML independiente.
Usa siempre videos propios o autorizados.

### Presentación sugerida
1. Abre el proyecto y muestra la tormenta de La Paz.
2. Cambia a Cochabamba para mostrar el sol y el cambio de iluminación.
3. Cambia a Santa Cruz y ajusta la intensidad del viento.
4. Activa lluvia o tormenta en otra ciudad para mostrar que los efectos no son fijos.
5. Activa el modo cine para destacar el fondo. Usa Escape para volver.
6. Explica que Explorar usa ejemplos y Clima actual consulta una fuente externa.

### Archivos del proyecto
index.html        Estructura de la interfaz.
styles.css        Diseño adaptable, transiciones y capas de luz.
app.js            Interacción, clima, control de video y efectos Canvas.
assets/           Tres MP4 y tres JPG locales.
LEEME.md          Estas instrucciones.
PRUEBAS.md        Alcance de las verificaciones.

### Referencias y créditos
Inspiración visual: Weather & Forecasting Web Design, Gapsy Studio.
https://dribbble.com/shots/25898869-Weather-Forecasting-Web-Design

Datos meteorológicos: Open-Meteo, atribución CC BY 4.0.
https://open-meteo.com/
https://open-meteo.com/en/docs
https://open-meteo.com/en/terms
El acceso gratuito está orientado a uso no comercial y sujeto a sus condiciones.

Interfaz, videos y efectos: adaptación original ATMOS Bolivia para este proyecto.
No incluye bibliotecas, tipografías ni metraje de terceros descargados.
Puedes estudiar y modificar los archivos entregados para tu trabajo académico.
