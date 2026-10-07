# 🌎 Explora el Mundo

App web para practicar la prueba de **Historia y Geografía de 3° básico**:
*"Ubicar lugares usando líneas de referencia y puntos cardinales"*.

Está pensada para usarse en un **iPad con Safari**, en vertical u horizontal.
Es un sitio 100 % estático (HTML, CSS y JavaScript sin frameworks ni dependencias
externas), así que se publica gratis en GitHub Pages.

## Qué incluye

| Sección | Qué se practica |
|---|---|
| 🧭 1. Puntos cardinales | Cuadrícula con letras y números, rosa de los vientos, rutas de varios pasos ("avanza 4 espacios al norte, luego 3 al este…") |
| 🌐 2. Líneas de la Tierra | Ecuador, trópicos, círculos polares, meridiano de Greenwich, polos y hemisferios |
| 🗺️ 3. Continentes y océanos | Los 6 continentes (América como uno solo, con sus tres partes) y los 5 océanos; tocar, nombrar y "mapa tramposo" |
| 📍 4. Ubicar en el planisferio | Preguntas y adivinanzas que combinan todo (Chile, océanos vecinos, Ártico/Antártico…) |

Cada sección tiene cuatro modos:

- **Aprender**: láminas cortas con dibujos y mapas que se pueden tocar.
- **Practicar**: 10 preguntas, sin tiempo. Si se equivoca, se muestra la respuesta correcta en el mapa con una explicación amable.
- **Prueba**: 20 preguntas mezcladas (5 de cada sección), en orden distinto cada vez y sin pistas. Muestra el puntaje, la **nota de 1,0 a 7,0 con exigencia del 60 %**, el resultado por sección y los temas que conviene repasar.
- **Progreso** (para los papás): historial de pruebas y porcentaje de logro por sección.

Además: botón 🔊 para escuchar las preguntas en voz alta, estrellas y medallas, y barra de avance.

## Estructura

```
index.html          ← página principal (debe quedar en la raíz)
css/estilos.css     ← diseño
js/datos.js         ← ✏️ TEXTOS, LISTAS Y PREGUNTAS (el archivo para editar)
js/geo.js           ← coordenadas del planisferio (proyección equirectangular)
js/mapa.js          ← dibuja el mapa SVG y detecta los toques
js/cuadricula.js    ← cuadrícula de la sección 1
js/preguntas.js     ← crea las preguntas y calcula la nota
js/app.js           ← pantallas y navegación
img/                ← íconos
```

## Cómo ajustar el contenido a lo que dice el cuaderno

Todo lo editable está en **`js/datos.js`**, con comentarios en español:

- **Nombres** de continentes, océanos y líneas (por ejemplo, cambiar "Antártica" por "Antártida").
- **Lugares de la cuadrícula** (emoji, nombre y casilla). Las preguntas de la sección 1 se crean solas a partir de esta lista.
- **Textos del modo Aprender**.
- **Preguntas extra** de las secciones 2 y 3, y **todas las preguntas de la sección 4**.

Para agregar una pregunta con botones, copia una que ya exista y cambia el texto:

```js
{ texto: "¿Qué océano está al oeste de América del Sur?",
  opciones: ["Océano Pacífico", "Océano Atlántico", "Océano Índico"],
  respuesta: "Océano Pacífico",
  explicacion: "A la izquierda (oeste) de América del Sur está el Pacífico.",
  tema: "Océanos alrededor de América",
  mostrar: ["pacifico", "sudamerica"] },   // zonas que se iluminan al corregir
```

La `respuesta` tiene que estar escrita **exactamente igual** que una de las `opciones`.
Si algo queda mal escrito, la app se salta esa pregunta y muestra un aviso en la consola del navegador.

> Para probar los cambios en el computador basta con abrir `index.html` en el navegador (doble clic).

## Publicar en GitHub Pages (paso a paso)

### Opción A: desde la página de GitHub (sin instalar nada)

1. Entra a [github.com](https://github.com) e inicia sesión (o crea una cuenta gratis).
2. Arriba a la derecha, toca **+** → **New repository**.
3. Ponle un nombre, por ejemplo `explora-el-mundo`, déjalo como **Public** y toca **Create repository**.
4. En el repositorio nuevo, toca **uploading an existing file** (o **Add file → Upload files**).
5. Arrastra **todo el contenido** de esta carpeta (`index.html`, `README.md`, `.nojekyll` y las carpetas `css`, `js` e `img`).
   `index.html` tiene que quedar en la raíz, no dentro de otra carpeta.
   (El archivo `.nojekyll` puede venir oculto: si no se sube, no pasa nada.)
6. Toca **Commit changes**.
7. Ve a **Settings** → **Pages** (menú de la izquierda).
8. En **Build and deployment** → **Source**, elige **Deploy from a branch**.
9. En **Branch**, elige **main** y la carpeta **/ (root)**, y toca **Save**.
10. Espera uno o dos minutos y recarga la página: arriba aparecerá la dirección, del tipo
    `https://TU-USUARIO.github.io/explora-el-mundo/`.

### Opción B: con git

```bash
git init
git add .
git commit -m "Explora el Mundo"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/explora-el-mundo.git
git push -u origin main
```

Luego sigue los pasos 7 a 10 de la opción A.

### Para actualizar la app

Edita los archivos (por ejemplo `js/datos.js`) y vuelve a subirlos con **Add file → Upload files**
(o con `git commit` y `git push`). GitHub Pages se actualiza solo en uno o dos minutos.
Si el iPad muestra la versión antigua, recarga la página.

## Usarla en el iPad

1. Abre la dirección en **Safari**.
2. Toca el botón **Compartir** (cuadrado con flecha) → **Agregar a pantalla de inicio**.
   Así se abre como una app, a pantalla completa y con su ícono.

**Voz en español:** el botón 🔊 usa la voz del iPad. Si suena en inglés o no suena:
*Ajustes → Accesibilidad → Contenido leído → Voces → Español*, descarga una voz
(si existe "Español (Chile)", mejor). Revisa también que el iPad no esté en silencio.

## Privacidad y progreso

- No usa internet después de cargar, no tiene publicidad ni envía datos a ninguna parte.
- El progreso se guarda **solo en ese iPad y en ese navegador** (localStorage).
  Si se usa en modo privado o con el almacenamiento bloqueado, la app funciona igual,
  pero el progreso se pierde al cerrarla (la pantalla de Progreso lo avisa).
- En **Progreso** hay un botón para borrar todo el historial.

## Notas sobre el mapa

- Proyección **equirectangular**: el Ecuador (0°), los trópicos (23,5°) y los círculos
  polares (66,5°) son líneas rectas horizontales en su latitud correcta.
- **América del Norte** llega hasta México; **América Central** va de Guatemala a Panamá
  e incluye las islas del Caribe; **América del Sur** comienza en Colombia.
- El límite entre Europa y Asia sigue los montes Urales, el río Ural, el mar Caspio,
  el Cáucaso y el Bósforo.
- Los mares interiores (Mediterráneo, Negro, Caspio, Báltico, bahía de Hudson) no cuentan
  como océano: si se tocan, la app avisa que son mares.
- América Central es muy angosta: tiene un área tocable invisible más ancha y un círculo
  rosado en el océano Pacífico que también se puede tocar.
