/* =====================================================================
   DATOS EDITABLES — "Explora el Mundo"
   ---------------------------------------------------------------------
   Aquí puedes cambiar nombres, textos y preguntas para que calcen con
   lo que dice el cuaderno de 3° básico.

   Reglas simples para editar sin romper nada:
   • No cambies los "id" (el mapa los usa para saber qué zona es).
   • Los textos van siempre entre comillas "..." y separados por comas.
   • En las preguntas con opciones, la "respuesta" debe estar escrita
     EXACTAMENTE igual que una de las "opciones".
   • Si algo queda mal escrito, la app muestra un aviso en la consola
     del navegador y se salta esa pregunta.
   ===================================================================== */
window.DATOS = {

  titulo: "Explora el Mundo",
  subtitulo: "Ubicar lugares con líneas de referencia y puntos cardinales",

  // Cantidad de preguntas
  preguntasPorPractica: 10,
  prueba: {
    totalPreguntas: 20,     // se reparten en partes iguales entre las 4 secciones
    exigencia: 0.6          // 60 % de logro = nota 4,0
  },

  secciones: [
    { n: 1, titulo: "Puntos cardinales", detalle: "En una cuadrícula", icono: "🧭", color: "#FFB627" },
    { n: 2, titulo: "Líneas de la Tierra", detalle: "Ecuador, trópicos y polos", icono: "🌐", color: "#FF7A59" },
    { n: 3, titulo: "Continentes y océanos", detalle: "Toca y nombra", icono: "🗺️", color: "#3FB8AF" },
    { n: 4, titulo: "Ubicar en el planisferio", detalle: "Junta todo lo aprendido", icono: "📍", color: "#9B6BD6" }
  ],

  /* ---------------- CONTINENTES ---------------- */
  continentes: [
    { id: "norteamerica",  nombre: "América del Norte", color: "#F4A259", info: "Está arriba en América. Llega hasta México." },
    { id: "centroamerica", nombre: "América Central",   color: "#EF5D8F", info: "Es angosta. Va de Guatemala a Panamá, con las islas del Caribe." },
    { id: "sudamerica",    nombre: "América del Sur",   color: "#7CC24A", info: "Empieza en Colombia. ¡Aquí está Chile!" },
    { id: "europa",        nombre: "Europa",            color: "#A585E0", info: "Está al norte de África y al oeste de Asia." },
    { id: "africa",        nombre: "África",            color: "#F6C445", info: "La cruzan el Ecuador y los dos trópicos." },
    { id: "asia",          nombre: "Asia",              color: "#E8705A", info: "Es el continente más grande." },
    { id: "oceania",       nombre: "Oceanía",           color: "#3CB9A8", info: "Está formada por Australia y muchas islas." },
    { id: "antartica",     nombre: "Antártica",         color: "#F4F7FB", info: "Está en el Polo Sur, cubierta de hielo." }
  ],

  /* ---------------- OCÉANOS ---------------- */
  oceanos: [
    { id: "pacifico",  nombre: "Océano Pacífico",  info: "Es el océano más grande. Baña las costas de Chile." },
    { id: "atlantico", nombre: "Océano Atlántico", info: "Está entre América, Europa y África." },
    { id: "indico",    nombre: "Océano Índico",    info: "Está entre África, Asia y Oceanía." },
    { id: "artico",    nombre: "Océano Ártico",    info: "Está alrededor del Polo Norte." },
    { id: "antartico", nombre: "Océano Antártico", info: "Rodea a la Antártica, cerca del Polo Sur." }
  ],

  /* ------- LÍNEAS DE REFERENCIA, POLOS Y HEMISFERIOS ------- */
  lineas: [
    { id: "ecuador",           tipo: "linea", lat: 0,     color: "#E53935", nombre: "Línea del Ecuador",       conArticulo: "la línea del Ecuador",
      info: "Divide la Tierra en dos mitades: hemisferio norte y hemisferio sur." },
    { id: "cancer",            tipo: "linea", lat: 23.5,  color: "#F57C00", nombre: "Trópico de Cáncer",       conArticulo: "el Trópico de Cáncer",
      info: "Está en el hemisferio norte, arriba del Ecuador." },
    { id: "capricornio",       tipo: "linea", lat: -23.5, color: "#F57C00", nombre: "Trópico de Capricornio",  conArticulo: "el Trópico de Capricornio",
      info: "Está en el hemisferio sur, abajo del Ecuador." },
    { id: "circulo-artico",    tipo: "linea", lat: 66.5,  color: "#3949AB", nombre: "Círculo Polar Ártico",    conArticulo: "el Círculo Polar Ártico",
      info: "Está cerca del Polo Norte." },
    { id: "circulo-antartico", tipo: "linea", lat: -66.5, color: "#3949AB", nombre: "Círculo Polar Antártico", conArticulo: "el Círculo Polar Antártico",
      info: "Está cerca del Polo Sur." },
    { id: "polo-norte",        tipo: "polo",  lat: 90,    nombre: "Polo Norte", conArticulo: "el Polo Norte",
      info: "Es el punto más al norte de la Tierra. En el mapa está arriba." },
    { id: "polo-sur",          tipo: "polo",  lat: -90,   nombre: "Polo Sur",   conArticulo: "el Polo Sur",
      info: "Es el punto más al sur de la Tierra. En el mapa está abajo." },
    { id: "hn", tipo: "hemisferio", nombre: "Hemisferio norte", conArticulo: "el hemisferio norte",
      info: "Es la mitad de arriba, al norte del Ecuador." },
    { id: "hs", tipo: "hemisferio", nombre: "Hemisferio sur",   conArticulo: "el hemisferio sur",
      info: "Es la mitad de abajo, al sur del Ecuador." }
  ],

  /* ---------------- CUADRÍCULA (sección 1) ----------------
     Las columnas usan letras y las filas números (la fila 1 está arriba).
     El norte siempre está hacia arriba.
     Cada lugar va en una casilla distinta. Las preguntas de esta sección
     se crean solas a partir de esta lista. */
  cuadricula: {
    columnas: ["A", "B", "C", "D", "E", "F"],
    filas: 5,
    lugares: [
      { id: "cerro",     emoji: "⛰️", etiqueta: "Cerro",      nombre: "el cerro",      celda: "A1" },
      { id: "arbol",     emoji: "🌳", etiqueta: "Árbol",      nombre: "el árbol",      celda: "C1" },
      { id: "castillo",  emoji: "🏰", etiqueta: "Castillo",   nombre: "el castillo",   celda: "D1" },
      { id: "vaca",      emoji: "🐄", etiqueta: "Vaca",       nombre: "la vaca",       celda: "F1" },
      { id: "casa",      emoji: "🏠", etiqueta: "Casa",       nombre: "la casa",       celda: "B2" },
      { id: "escuela",   emoji: "🏫", etiqueta: "Escuela",    nombre: "la escuela",    celda: "C2" },
      { id: "girasol",   emoji: "🌻", etiqueta: "Girasol",    nombre: "el girasol",    celda: "E2" },
      { id: "laguna",    emoji: "🦆", etiqueta: "Laguna",     nombre: "la laguna",     celda: "A3" },
      { id: "iglesia",   emoji: "⛪", etiqueta: "Iglesia",    nombre: "la iglesia",    celda: "C3" },
      { id: "cancha",    emoji: "⚽", etiqueta: "Cancha",     nombre: "la cancha",     celda: "D3" },
      { id: "hospital",  emoji: "🏥", etiqueta: "Hospital",   nombre: "el hospital",   celda: "F3" },
      { id: "perro",     emoji: "🐶", etiqueta: "Perro",      nombre: "el perro",      celda: "B4" },
      { id: "carrusel",  emoji: "🎠", etiqueta: "Carrusel",   nombre: "el carrusel",   celda: "D4" },
      { id: "bicicleta", emoji: "🚲", etiqueta: "Bicicleta",  nombre: "la bicicleta",  celda: "E4" },
      { id: "almacen",   emoji: "🏪", etiqueta: "Almacén",    nombre: "el almacén",    celda: "A5" },
      { id: "bomberos",  emoji: "🚒", etiqueta: "Bomberos",   nombre: "los bomberos",  celda: "C5" },
      { id: "helados",   emoji: "🍦", etiqueta: "Heladería",  nombre: "la heladería",  celda: "E5" },
      { id: "paradero",  emoji: "🚌", etiqueta: "Paradero",   nombre: "el paradero",   celda: "F5" }
    ]
  },

  /* ---------------- MODO APRENDER ----------------
     Cada sección tiene varias "láminas". "visual" indica qué dibujo se
     muestra (no lo cambies); los textos sí puedes cambiarlos. */
  aprender: {
    1: [
      { titulo: "Los puntos cardinales", visual: "rosa",
        texto: ["Norte ⬆️ arriba", "Sur ⬇️ abajo", "Este ➡️ derecha", "Oeste ⬅️ izquierda"] },
      { titulo: "Un truco para recordar", visual: "sol",
        texto: ["El Sol sale por el Este 🌅", "y se esconde por el Oeste 🌇"] },
      { titulo: "La cuadrícula", visual: "cuadricula-ejemplo",
        texto: ["Las columnas tienen letras.", "Las filas tienen números.", "Primero la letra, después el número: C3."] },
      { titulo: "¡Explora la cuadrícula!", visual: "cuadricula-explorar",
        texto: ["Toca una casilla.", "Te digo su nombre y qué hay."] }
    ],
    2: [
      { titulo: "Líneas imaginarias", visual: "mapa-lineas",
        texto: ["No existen de verdad.", "Las dibujamos en los mapas para ubicarnos."] },
      { titulo: "El Ecuador y los hemisferios", visual: "mapa-hemisferios",
        texto: ["El Ecuador corta la Tierra en dos mitades.", "Arriba: hemisferio norte.", "Abajo: hemisferio sur."] },
      { titulo: "Trópicos y círculos polares", visual: "mapa-lineas",
        texto: ["Trópico de Cáncer: al norte del Ecuador.", "Trópico de Capricornio: al sur del Ecuador.", "Los círculos polares están cerca de los polos."] },
      { titulo: "¡Explora las líneas!", visual: "mapa-lineas-explorar",
        texto: ["Toca una línea o un polo.", "Toca el mapa para ver el hemisferio."] }
    ],
    3: [
      { titulo: "Los continentes", visual: "mapa-continentes",
        texto: ["Son grandes extensiones de tierra.", "Cada uno tiene su color."] },
      { titulo: "Las tres Américas", visual: "mapa-americas",
        texto: ["América del Norte llega hasta México.", "América Central va de Guatemala a Panamá.", "América del Sur empieza en Colombia."] },
      { titulo: "Los océanos", visual: "mapa-oceanos",
        texto: ["Son grandes masas de agua salada.", "Hay cinco: Pacífico, Atlántico, Índico, Ártico y Antártico."] },
      { titulo: "¡Explora el mapa!", visual: "mapa-explorar",
        texto: ["Toca un continente o un océano.", "Te digo cómo se llama."] }
    ],
    4: [
      { titulo: "Arriba es el norte", visual: "mapa-rosa",
        texto: ["En el planisferio, el norte está arriba.", "El sur abajo, el este a la derecha y el oeste a la izquierda."] },
      { titulo: "¿Dónde está Chile?", visual: "mapa-chile",
        texto: ["Chile está en América del Sur.", "Está en el hemisferio sur.", "Al oeste tiene el océano Pacífico."] },
      { titulo: "Para ubicar un lugar", visual: "mapa-explorar-todo",
        texto: ["1. Mira en qué hemisferio está.", "2. Busca qué líneas lo cruzan.", "3. Mira qué hay a su alrededor."] }
    ]
  },

  /* ---------------- PREGUNTAS EXTRA ----------------
     Las secciones 1, 2 y 3 crean preguntas automáticamente, y además usan
     las de esta lista. La sección 4 usa solo esta lista.

     Formato de pregunta con botones:
       { texto: "...", opciones: ["A", "B", "C"], respuesta: "A",
         explicacion: "una línea", tema: "nombre del tema",
         mostrar: ["id", ...]  ← (opcional) zonas que se iluminan al corregir
         marcar: "chile"       ← (opcional) marca Chile en el mapa }

     Formato de pregunta para tocar el mapa:
       { tipo: "tocar", capa: "continentes" | "oceanos",
         texto: "...", respuesta: "id de la zona", explicacion: "...", tema: "..." }
  */
  preguntas: {
    seccion2: [
      { texto: "¿Qué línea divide la Tierra en hemisferio norte y hemisferio sur?",
        opciones: ["Línea del Ecuador", "Trópico de Cáncer", "Círculo Polar Ártico"], respuesta: "Línea del Ecuador",
        explicacion: "El Ecuador corta la Tierra en dos mitades: norte y sur.", tema: "Línea del Ecuador", mostrar: ["ecuador"] },
      { texto: "¿Qué trópico está en el hemisferio norte?",
        opciones: ["Trópico de Cáncer", "Trópico de Capricornio"], respuesta: "Trópico de Cáncer",
        explicacion: "Cáncer está arriba del Ecuador, en el hemisferio norte.", tema: "Trópicos", mostrar: ["cancer"] },
      { texto: "¿Qué trópico está en el hemisferio sur?",
        opciones: ["Trópico de Cáncer", "Trópico de Capricornio"], respuesta: "Trópico de Capricornio",
        explicacion: "Capricornio está abajo del Ecuador, en el hemisferio sur.", tema: "Trópicos", mostrar: ["capricornio"] },
      { texto: "¿Qué círculo polar está cerca del Polo Norte?",
        opciones: ["Círculo Polar Ártico", "Círculo Polar Antártico"], respuesta: "Círculo Polar Ártico",
        explicacion: "El Círculo Polar Ártico está arriba, cerca del Polo Norte.", tema: "Círculos polares", mostrar: ["circulo-artico", "polo-norte"] },
      { texto: "¿Qué círculo polar está cerca del Polo Sur?",
        opciones: ["Círculo Polar Ártico", "Círculo Polar Antártico"], respuesta: "Círculo Polar Antártico",
        explicacion: "El Círculo Polar Antártico está abajo, cerca del Polo Sur.", tema: "Círculos polares", mostrar: ["circulo-antartico", "polo-sur"] },
      { texto: "¿Qué línea está entre el Ecuador y el Círculo Polar Ártico?",
        opciones: ["Trópico de Cáncer", "Trópico de Capricornio", "Círculo Polar Antártico"], respuesta: "Trópico de Cáncer",
        explicacion: "Subiendo desde el Ecuador, primero está el Trópico de Cáncer.", tema: "Trópicos", mostrar: ["cancer"] },
      { texto: "Si viajas desde el Ecuador hacia el sur, ¿a qué línea llegas primero?",
        opciones: ["Trópico de Capricornio", "Trópico de Cáncer", "Círculo Polar Antártico"], respuesta: "Trópico de Capricornio",
        explicacion: "Bajando desde el Ecuador, primero está el Trópico de Capricornio.", tema: "Trópicos", mostrar: ["capricornio"] },
      { texto: "¿Cuál de estas líneas está más al norte?",
        opciones: ["Trópico de Cáncer", "Línea del Ecuador", "Trópico de Capricornio"], respuesta: "Trópico de Cáncer",
        explicacion: "El Trópico de Cáncer está más arriba que el Ecuador y Capricornio.", tema: "Trópicos", mostrar: ["cancer"] },
      { texto: "¿En qué hemisferio está el Trópico de Capricornio?",
        opciones: ["Hemisferio norte", "Hemisferio sur"], respuesta: "Hemisferio sur",
        explicacion: "Capricornio está abajo del Ecuador: en el hemisferio sur.", tema: "Hemisferios", mostrar: ["capricornio", "hs"] }
    ],

    seccion3: [
      { texto: "¿Cuál es el océano más grande?",
        opciones: ["Océano Pacífico", "Océano Índico", "Océano Ártico"], respuesta: "Océano Pacífico",
        explicacion: "El Pacífico es el océano más grande de la Tierra.", tema: "Océano Pacífico", mostrar: ["pacifico"] },
      { texto: "¿Qué continente está cubierto de hielo?",
        opciones: ["Antártica", "Oceanía", "Europa"], respuesta: "Antártica",
        explicacion: "La Antártica está en el Polo Sur y está cubierta de hielo.", tema: "Antártica", mostrar: ["antartica"] },
      { texto: "¿Cuál es el continente más grande?",
        opciones: ["Asia", "Europa", "Oceanía"], respuesta: "Asia",
        explicacion: "Asia es el continente más grande.", tema: "Asia", mostrar: ["asia"] }
    ],

    seccion4: [
      { texto: "¿En qué hemisferio está América del Norte?",
        opciones: ["Hemisferio norte", "Hemisferio sur"], respuesta: "Hemisferio norte",
        explicacion: "América del Norte está arriba del Ecuador.", tema: "Hemisferios y continentes", mostrar: ["norteamerica", "ecuador"] },
      { texto: "¿En qué hemisferio está Chile?",
        opciones: ["Hemisferio norte", "Hemisferio sur"], respuesta: "Hemisferio sur",
        explicacion: "Chile está abajo del Ecuador, en el hemisferio sur.", tema: "Chile en el mapa", mostrar: ["ecuador"], marcar: "chile" },
      { texto: "¿En qué hemisferio está Europa?",
        opciones: ["Hemisferio norte", "Hemisferio sur"], respuesta: "Hemisferio norte",
        explicacion: "Europa está arriba del Ecuador.", tema: "Hemisferios y continentes", mostrar: ["europa", "ecuador"] },
      { texto: "¿En qué hemisferio está América Central?",
        opciones: ["Hemisferio norte", "Hemisferio sur"], respuesta: "Hemisferio norte",
        explicacion: "América Central está entera arriba del Ecuador.", tema: "Hemisferios y continentes", mostrar: ["centroamerica", "ecuador"] },
      { texto: "¿En qué hemisferio está la mayor parte de Oceanía?",
        opciones: ["Hemisferio norte", "Hemisferio sur"], respuesta: "Hemisferio sur",
        explicacion: "Australia y Nueva Zelanda están abajo del Ecuador.", tema: "Hemisferios y continentes", mostrar: ["oceania", "ecuador"] },
      { texto: "¿Qué océano está al oeste de América del Sur?",
        opciones: ["Océano Pacífico", "Océano Atlántico", "Océano Índico"], respuesta: "Océano Pacífico",
        explicacion: "A la izquierda (oeste) de América del Sur está el Pacífico.", tema: "Océanos alrededor de América", mostrar: ["pacifico", "sudamerica"] },
      { texto: "¿Qué océano está al este de América del Sur?",
        opciones: ["Océano Atlántico", "Océano Pacífico", "Océano Índico"], respuesta: "Océano Atlántico",
        explicacion: "A la derecha (este) de América del Sur está el Atlántico.", tema: "Océanos alrededor de América", mostrar: ["atlantico", "sudamerica"] },
      { texto: "¿Qué océano está al oeste de América del Norte?",
        opciones: ["Océano Pacífico", "Océano Atlántico", "Océano Ártico"], respuesta: "Océano Pacífico",
        explicacion: "A la izquierda (oeste) de América del Norte está el Pacífico.", tema: "Océanos alrededor de América", mostrar: ["pacifico", "norteamerica"] },
      { texto: "¿Qué hay al norte de América Central?",
        opciones: ["América del Norte", "América del Sur", "Europa"], respuesta: "América del Norte",
        explicacion: "Arriba (al norte) de América Central está América del Norte.", tema: "Las tres Américas", mostrar: ["norteamerica", "centroamerica"] },
      { texto: "¿Qué hay al sur de América Central?",
        opciones: ["América del Sur", "América del Norte", "África"], respuesta: "América del Sur",
        explicacion: "Abajo (al sur) de América Central está América del Sur.", tema: "Las tres Américas", mostrar: ["sudamerica", "centroamerica"] },
      { texto: "¿En cuál de las tres Américas está Chile?",
        opciones: ["América del Sur", "América Central", "América del Norte"], respuesta: "América del Sur",
        explicacion: "Chile está en América del Sur, junto al océano Pacífico.", tema: "Chile en el mapa", mostrar: ["sudamerica"], marcar: "chile" },
      { texto: "¿Qué océano baña las costas de Chile?",
        opciones: ["Océano Pacífico", "Océano Atlántico", "Océano Índico"], respuesta: "Océano Pacífico",
        explicacion: "Toda la costa de Chile da al océano Pacífico.", tema: "Chile en el mapa", mostrar: ["pacifico"], marcar: "chile" },
      { texto: "¿Qué línea cruza el norte de América del Sur?",
        opciones: ["Línea del Ecuador", "Trópico de Cáncer", "Círculo Polar Ártico"], respuesta: "Línea del Ecuador",
        explicacion: "El Ecuador pasa por Ecuador, Colombia y Brasil.", tema: "Líneas que cruzan los continentes", mostrar: ["ecuador", "sudamerica"] },
      { texto: "¿Qué trópico cruza Chile?",
        opciones: ["Trópico de Capricornio", "Trópico de Cáncer"], respuesta: "Trópico de Capricornio",
        explicacion: "El Trópico de Capricornio pasa por el norte de Chile, cerca de Antofagasta.", tema: "Líneas que cruzan los continentes", mostrar: ["capricornio"], marcar: "chile" },
      { texto: "¿Qué trópico cruza México, en América del Norte?",
        opciones: ["Trópico de Cáncer", "Trópico de Capricornio"], respuesta: "Trópico de Cáncer",
        explicacion: "El Trópico de Cáncer está en el hemisferio norte y cruza México.", tema: "Líneas que cruzan los continentes", mostrar: ["cancer", "norteamerica"] },
      { texto: "¿Qué línea cruza África por la mitad?",
        opciones: ["Línea del Ecuador", "Círculo Polar Ártico", "Círculo Polar Antártico"], respuesta: "Línea del Ecuador",
        explicacion: "El Ecuador pasa por el centro de África.", tema: "Líneas que cruzan los continentes", mostrar: ["ecuador", "africa"] },
      { texto: "¿Qué círculo polar cruza la Antártica?",
        opciones: ["Círculo Polar Antártico", "Círculo Polar Ártico"], respuesta: "Círculo Polar Antártico",
        explicacion: "El Círculo Polar Antártico está cerca del Polo Sur, sobre la Antártica.", tema: "Círculos polares", mostrar: ["circulo-antartico", "antartica"] },
      { texto: "¿Qué océano está entre América y África?",
        opciones: ["Océano Atlántico", "Océano Pacífico", "Océano Índico"], respuesta: "Océano Atlántico",
        explicacion: "El Atlántico separa a América de Europa y África.", tema: "Océanos entre continentes", mostrar: ["atlantico"] },
      { texto: "¿Qué océano está al este de África?",
        opciones: ["Océano Índico", "Océano Atlántico", "Océano Pacífico"], respuesta: "Océano Índico",
        explicacion: "A la derecha (este) de África está el océano Índico.", tema: "Océanos entre continentes", mostrar: ["indico", "africa"] },
      { texto: "¿Qué océano está al sur de Asia?",
        opciones: ["Océano Índico", "Océano Ártico", "Océano Atlántico"], respuesta: "Océano Índico",
        explicacion: "Abajo (al sur) de Asia está el océano Índico.", tema: "Océanos entre continentes", mostrar: ["indico", "asia"] },
      { texto: "¿Qué océano está al norte de Asia?",
        opciones: ["Océano Ártico", "Océano Índico", "Océano Antártico"], respuesta: "Océano Ártico",
        explicacion: "Arriba (al norte) de Asia está el océano Ártico.", tema: "Océanos entre continentes", mostrar: ["artico", "asia"] },
      { texto: "¿Qué continente está al sur de Europa?",
        opciones: ["África", "Asia", "Oceanía"], respuesta: "África",
        explicacion: "Abajo (al sur) de Europa, cruzando el mar Mediterráneo, está África.", tema: "Continentes vecinos", mostrar: ["africa", "europa"] },
      { texto: "¿Qué continente está al este de Europa?",
        opciones: ["Asia", "África", "América del Norte"], respuesta: "Asia",
        explicacion: "A la derecha (este) de Europa está Asia.", tema: "Continentes vecinos", mostrar: ["asia", "europa"] },
      { texto: "¿Qué continente está más cerca del Polo Sur?",
        opciones: ["Antártica", "África", "Europa"], respuesta: "Antártica",
        explicacion: "La Antártica está justo en el Polo Sur.", tema: "Continentes vecinos", mostrar: ["antartica", "polo-sur"] },
      { tipo: "tocar", capa: "oceanos",
        texto: "Toca el océano que está al oeste de América del Sur.", respuesta: "pacifico",
        explicacion: "A la izquierda (oeste) de América del Sur está el Pacífico.", tema: "Océanos alrededor de América" },
      { tipo: "tocar", capa: "continentes",
        texto: "Toca el continente que está al sur de Europa.", respuesta: "africa",
        explicacion: "Abajo (al sur) de Europa está África.", tema: "Continentes vecinos" },
      { tipo: "tocar", capa: "continentes",
        texto: "Toca la parte de América donde está Chile.", respuesta: "sudamerica",
        explicacion: "Chile está en América del Sur.", tema: "Chile en el mapa" },
      { tipo: "tocar", capa: "oceanos",
        texto: "Toca el océano que rodea la Antártica.", respuesta: "antartico",
        explicacion: "El océano Antártico rodea a la Antártica.", tema: "Océanos entre continentes" },
      { tipo: "tocar", capa: "continentes",
        texto: "Toca el continente que está entre América del Norte y América del Sur.", respuesta: "centroamerica",
        explicacion: "Entre las dos está América Central.", tema: "Las tres Américas" }
    ]
  }
};
