/* =====================================================================
   Explora el Mundo — lógica de la aplicación
   ===================================================================== */
(function () {
  'use strict';

  var D = window.DATOS;
  var app = document.getElementById('app');
  var mapaActual = null;
  var cuadActual = null;
  var estado = { aprender: null };
  var juego = null;

  /* ---------------- utilidades ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function sec(n) {
    for (var i = 0; i < D.secciones.length; i++) if (D.secciones[i].n === n) return D.secciones[i];
    return D.secciones[0];
  }
  function alAzar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function fmtNota(n) { return n.toFixed(1).replace('.', ','); }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  /* ---------------- almacenamiento seguro ---------------- */
  var Almacen = (function () {
    var CLAVE = 'explora-el-mundo-v1';
    var disponible = false;
    var datos = null;
    try {
      var t = '__prueba__';
      window.localStorage.setItem(t, t);
      window.localStorage.removeItem(t);
      disponible = true;
    } catch (e) { disponible = false; }

    function vacio() {
      var p = {};
      D.secciones.forEach(function (s) { p[s.n] = { intentos: 0, aciertos: 0, estrellas: 0, sesiones: 0 }; });
      return { practica: p, pruebas: [] };
    }
    function normalizar(d) {
      var v = vacio();
      if (!d || typeof d !== 'object') return v;
      if (d.practica) {
        Object.keys(v.practica).forEach(function (k) {
          var x = d.practica[k];
          if (x) ['intentos', 'aciertos', 'estrellas', 'sesiones'].forEach(function (c) {
            if (typeof x[c] === 'number') v.practica[k][c] = x[c];
          });
        });
      }
      if (Array.isArray(d.pruebas)) v.pruebas = d.pruebas.filter(function (p) { return p && typeof p.nota === 'number'; });
      return v;
    }
    function cargar() {
      if (datos) return datos;
      var crudo = null;
      if (disponible) {
        try { crudo = JSON.parse(window.localStorage.getItem(CLAVE)); } catch (e) { crudo = null; }
      }
      datos = normalizar(crudo);
      return datos;
    }
    function guardar() {
      if (!disponible) return;
      try { window.localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* lleno o bloqueado */ }
    }
    function borrar() {
      datos = vacio();
      if (disponible) { try { window.localStorage.removeItem(CLAVE); } catch (e) { /* nada */ } }
    }
    return { cargar: cargar, guardar: guardar, borrar: borrar, disponible: function () { return disponible; } };
  })();

  /* ---------------- voz ---------------- */
  var Voz = (function () {
    var soportada = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
    var voz = null;
    var reEmoji;
    try { reEmoji = new RegExp('[\\p{Extended_Pictographic}\\u{FE0F}\\u{200D}\\u{20E3}]', 'gu'); }
    catch (e) { reEmoji = /[←-⇿☀-➿️‍]|[\uD83C-\uD83E][\uDC00-\uDFFF]/g; }

    function elegir() {
      if (!soportada) return;
      var voces = window.speechSynthesis.getVoices() || [];
      var pref = ['es-cl', 'es-419', 'es-us', 'es-mx', 'es-ar', 'es-co', 'es-es', 'es'];
      for (var i = 0; i < pref.length; i++) {
        for (var j = 0; j < voces.length; j++) {
          var lang = (voces[j].lang || '').replace('_', '-').toLowerCase();
          if (lang.indexOf(pref[i]) === 0) { voz = voces[j]; return; }
        }
      }
    }
    if (soportada) {
      elegir();
      if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', elegir);
    }
    function limpiar(t) {
      return String(t)
        .replace(/<[^>]+>/g, ' ')
        .replace(reEmoji, ' ')
        .replace(/[⬆⬇⬅➡→]/g, ' ')
        .replace(/°/g, ' grados')
        .replace(/(\d),(\d)/g, '$1 coma $2')
        .replace(/\s+/g, ' ')
        .trim();
    }
    function hablar(t) {
      if (!soportada) { aviso('Este navegador no puede leer en voz alta 🙊'); return; }
      try {
        window.speechSynthesis.cancel();
        if (!voz) elegir();
        var u = new window.SpeechSynthesisUtterance(limpiar(t));
        u.lang = voz ? voz.lang : 'es-CL';
        if (voz) u.voice = voz;
        u.rate = 0.9;
        u.pitch = 1.05;
        window.speechSynthesis.speak(u);
      } catch (e) { /* sin voz */ }
    }
    function callar() {
      if (soportada) { try { window.speechSynthesis.cancel(); } catch (e) { /* nada */ } }
    }
    return { hablar: hablar, callar: callar };
  })();

  /* ---------------- efectos ---------------- */
  var temporizadorAviso = null;
  function aviso(texto) {
    var el = document.getElementById('aviso');
    el.textContent = texto;
    el.classList.add('visible');
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(function () { el.classList.remove('visible'); }, 2400);
  }

  function celebrar() {
    var capa = document.getElementById('fiesta');
    var simbolos = ['⭐', '✨', '🌟', '⭐', '💛'];
    for (var i = 0; i < 16; i++) {
      var s = document.createElement('span');
      var ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
      var dist = 140 + Math.random() * 160;
      s.textContent = simbolos[i % simbolos.length];
      s.style.setProperty('--dx', Math.round(Math.cos(ang) * dist) + 'px');
      s.style.setProperty('--dy', Math.round(Math.sin(ang) * dist) + 'px');
      s.style.setProperty('--r', Math.round(Math.random() * 360) + 'deg');
      capa.appendChild(s);
    }
    setTimeout(function () { capa.innerHTML = ''; }, 1300);
  }

  /* ---------------- navegación ---------------- */
  function montar(html) {
    Voz.callar();
    if (cuadActual) cuadActual.destruir();
    cuadActual = null;
    mapaActual = null;
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function estrellasHTML(n) {
    var s = '';
    for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? 'llena' : '') + '">★</span>';
    return s;
  }

  /* ================= INICIO ================= */
  function irInicio() {
    var datos = Almacen.cargar();
    var tarjetas = D.secciones.map(function (s) {
      var p = datos.practica[s.n] || { estrellas: 0 };
      return '' +
        '<article class="tarjeta" style="--color:' + s.color + '">' +
          '<div class="tarjeta-cab">' +
            '<span class="tarjeta-icono" aria-hidden="true">' + s.icono + '</span>' +
            '<div><h2>' + s.n + '. ' + esc(s.titulo) + '</h2><p>' + esc(s.detalle) + '</p></div>' +
          '</div>' +
          '<div class="tarjeta-premios" aria-label="' + p.estrellas + ' de 3 estrellas">' +
            '<span class="estrellas">' + estrellasHTML(p.estrellas) + '</span>' +
            (p.estrellas >= 3 ? '<span class="medalla" title="Medalla ganada">🏅</span>' : '') +
          '</div>' +
          '<div class="tarjeta-botones">' +
            '<button class="btn btn-claro" data-accion="aprender" data-sec="' + s.n + '">📖 Aprender</button>' +
            '<button class="btn" data-accion="practicar" data-sec="' + s.n + '">✏️ Practicar</button>' +
          '</div>' +
        '</article>';
    }).join('');

    montar('' +
      '<section class="pantalla desplazable inicio">' +
        '<header class="portada">' +
          '<div class="portada-globo" aria-hidden="true">🌎</div>' +
          '<div><h1>' + esc(D.titulo) + '</h1><p>' + esc(D.subtitulo) + '</p></div>' +
        '</header>' +
        '<div class="tarjetas">' + tarjetas + '</div>' +
        '<div class="inicio-grandes">' +
          '<button class="btn btn-grande btn-prueba" data-accion="prueba">📝 Hacer la prueba<small>' + (D.prueba.totalPreguntas || 20) + ' preguntas de todo</small></button>' +
          '<button class="btn btn-grande btn-papas" data-accion="progreso">👨‍👩‍👧 Progreso<small>Para papás y mamás</small></button>' +
        '</div>' +
      '</section>');
  }

  /* ================= APRENDER ================= */
  var NOMBRES_MARES = {
    mediterraneo: 'Mar Mediterráneo', negro: 'Mar Negro', caspio: 'Mar Caspio',
    baltico: 'Mar Báltico', hudson: 'Bahía de Hudson'
  };

  function irAprender(n, paso) {
    var laminas = D.aprender[n] || [];
    if (!laminas.length) { irInicio(); return; }
    paso = Math.max(0, Math.min(laminas.length - 1, paso || 0));
    var L = laminas[paso];
    var s = sec(n);
    estado.aprender = { n: n, paso: paso };
    var ultimo = paso === laminas.length - 1;
    montar('' +
      '<section class="pantalla aprender" style="--color:' + s.color + '">' +
        '<header class="barra">' +
          '<button class="btn-icono" data-accion="inicio" aria-label="Volver al inicio">🏠</button>' +
          '<div class="barra-titulo"><span aria-hidden="true">' + s.icono + '</span> Aprender: ' + esc(s.titulo) + '</div>' +
          '<div class="pasos" aria-label="Lámina ' + (paso + 1) + ' de ' + laminas.length + '">' +
            laminas.map(function (_, i) { return '<span class="' + (i === paso ? 'activo' : (i < paso ? 'visto' : '')) + '"></span>'; }).join('') +
          '</div>' +
        '</header>' +
        '<div class="aprender-cuerpo">' +
          '<div class="aprender-texto">' +
            '<h2>' + esc(L.titulo) + '</h2>' +
            '<ul>' + L.texto.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
            '<button class="btn btn-claro btn-escuchar" data-accion="leer-lamina">🔊 Escuchar</button>' +
            '<div class="info-explorar" id="info-explorar" aria-live="polite"></div>' +
          '</div>' +
          '<div class="visual" id="visual"></div>' +
        '</div>' +
        '<footer class="nav-laminas">' +
          '<button class="btn btn-claro" data-accion="lamina" data-paso="' + (paso - 1) + '"' + (paso === 0 ? ' disabled' : '') + '>◀ Atrás</button>' +
          (ultimo
            ? '<button class="btn btn-verde" data-accion="practicar" data-sec="' + n + '">¡A practicar! ✏️</button>'
            : '<button class="btn" data-accion="lamina" data-paso="' + (paso + 1) + '">Siguiente ▶</button>') +
        '</footer>' +
      '</section>');
    dibujarVisualAprender(L.visual, document.getElementById('visual'));
  }

  function mostrarInfo(titulo, texto, hablarTambien) {
    var info = document.getElementById('info-explorar');
    if (!info) return;
    info.innerHTML = '<strong>' + esc(titulo) + '</strong><span>' + esc(texto) + '</span>';
    info.classList.remove('pop');
    void info.offsetWidth;
    info.classList.add('pop');
    if (hablarTambien !== false) Voz.hablar(titulo + '. ' + texto);
  }

  function solSVG() {
    return '' +
      '<svg class="sol-svg" viewBox="0 0 600 340" role="img" aria-label="El Sol sale por el este y se esconde por el oeste">' +
        '<defs><linearGradient id="cielo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB38A"/><stop offset=".5" stop-color="#BFE6FF"/><stop offset="1" stop-color="#FFE08A"/></linearGradient></defs>' +
        '<rect x="0" y="0" width="600" height="340" rx="28" fill="url(#cielo)"/>' +
        '<path d="M70 230 Q300 20 530 230" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>' +
        '<g class="sol-salida"><circle cx="520" cy="220" r="40" fill="#FFC93C"/><circle cx="520" cy="220" r="54" fill="#FFC93C" opacity=".3"/></g>' +
        '<circle cx="80" cy="222" r="34" fill="#FF8A5B" opacity=".9"/>' +
        '<rect x="0" y="230" width="600" height="110" fill="#7CC24A"/>' +
        '<path d="M0 250 Q150 225 300 250 T600 250 V340 H0Z" fill="#5FAE3B"/>' +
        '<text x="520" y="300" text-anchor="middle" class="sol-texto">ESTE 🌅</text>' +
        '<text x="80" y="300" text-anchor="middle" class="sol-texto">OESTE 🌇</text>' +
        '<text x="300" y="60" text-anchor="middle" class="sol-texto sol-norte">⬆ NORTE</text>' +
      '</svg>';
  }

  function dibujarVisualAprender(clave, cont) {
    var m;
    var lineasIds = D.lineas.filter(function (l) { return l.tipo !== 'hemisferio'; }).map(function (l) { return l.id; });

    function explorarLinea(info) {
      m.limpiar();
      if (info.id) {
        var l = Mapa.infoLinea(info.id);
        m.resaltar(info.id, 'brilla');
        m.etiqueta(info.id);
        mostrarInfo(l.nombre, l.info);
      } else {
        var h = Mapa.infoLinea(info.hemisferio);
        m.resaltar(info.hemisferio, 'brilla');
        m.etiqueta(info.hemisferio);
        mostrarInfo(h.nombre, h.info);
      }
    }
    function explorarRegion(info) {
      m.limpiar();
      if (info.tipo === 'continente' || info.tipo === 'oceano') {
        m.resaltar(info.id, 'brilla');
        m.etiqueta(info.id);
        mostrarInfo(Mapa.nombreDe(info.id), Mapa.infoDe(info.id));
      } else if (info.tipo === 'mar') {
        mostrarInfo(NOMBRES_MARES[info.id] || 'Un mar', 'Es un mar: más pequeño que un océano.');
      }
    }
    function fijas(ids) { ids.forEach(function (id) { m.etiqueta(id, true); }); }

    switch (clave) {
      case 'rosa':
        cont.innerHTML = '<div class="rosa-grande">' + Cuadricula.rosaHTML() + '</div>';
        break;
      case 'sol':
        cont.innerHTML = solSVG();
        break;
      case 'cuadricula-ejemplo':
        cuadActual = Cuadricula.crear(cont, {
          alTocar: function (id, lugar) {
            mostrarInfo('Casilla ' + id, lugar ? 'Aquí está ' + lugar.nombre + ' ' + lugar.emoji + '.' : 'Esta casilla está vacía.');
          }
        });
        cuadActual.columna('C');
        cuadActual.fila(3);
        cuadActual.marcar(['C3'], 'correcto');
        mostrarInfo('Casilla C3', 'Columna C y fila 3: ahí está la iglesia ⛪.', false);
        break;
      case 'cuadricula-ruta':
        cuadActual = Cuadricula.crear(cont, {});
        cuadActual.marcar(['B2'], 'inicio');
        cuadActual.camino(['C2', 'D2', 'D3']);
        cuadActual.marcar(['D3'], 'correcto');
        break;
      case 'cuadricula-explorar':
        cuadActual = Cuadricula.crear(cont, {
          alTocar: function (id, lugar) {
            cuadActual.limpiar();
            cuadActual.marcar([id], 'elegida');
            cuadActual.columna(id.charAt(0));
            cuadActual.fila(id.slice(1));
            mostrarInfo('Casilla ' + id, lugar ? 'Aquí está ' + lugar.nombre + ' ' + lugar.emoji + '.' : 'Esta casilla está vacía.');
          }
        });
        break;
      case 'mapa-lineas':
        m = Mapa.crear(cont, { modo: 'lineas', lineas: true, alTocar: explorarLinea });
        fijas(lineasIds);
        break;
      case 'mapa-lineas-explorar':
        m = Mapa.crear(cont, { modo: 'lineas', lineas: true, alTocar: explorarLinea });
        break;
      case 'mapa-hemisferios':
        m = Mapa.crear(cont, { modo: 'lineas', lineas: true, alTocar: explorarLinea });
        m.clase('ver-hemisferios');
        fijas(['hn', 'hs', 'ecuador']);
        break;
      case 'mapa-continentes':
        m = Mapa.crear(cont, { modo: 'explorar', alTocar: explorarRegion });
        fijas(D.continentes.map(function (c) { return c.id; }));
        break;
      case 'mapa-americas':
        m = Mapa.crear(cont, { modo: 'explorar', alTocar: explorarRegion });
        m.clase('foco-americas');
        m.clase('anillos-fijos');
        fijas(['norteamerica', 'centroamerica', 'sudamerica']);
        break;
      case 'mapa-oceanos':
        m = Mapa.crear(cont, { modo: 'explorar', alTocar: explorarRegion });
        m.clase('oceanos-color');
        fijas(D.oceanos.map(function (o) { return o.id; }));
        break;
      case 'mapa-explorar':
        m = Mapa.crear(cont, { modo: 'explorar', alTocar: explorarRegion });
        break;
      case 'mapa-artico':
        m = Mapa.crear(cont, { modo: 'explorar', alTocar: explorarRegion });
        m.resaltar('artico', 'brilla');
        m.resaltar('antartico', 'brilla');
        fijas(['artico', 'antartico', 'antartica']);
        break;
      case 'mapa-polares':
        m = Mapa.crear(cont, { modo: 'lineas', lineas: true, alTocar: explorarLinea });
        m.resaltar('circulo-artico', 'brilla');
        m.resaltar('circulo-antartico', 'brilla');
        fijas(['circulo-artico', 'circulo-antartico', 'polo-norte', 'polo-sur']);
        break;
      case 'mapa-greenwich':
        m = Mapa.crear(cont, { modo: 'lineas', lineas: true, alTocar: explorarLinea });
        m.resaltar('greenwich', 'brilla');
        fijas(['greenwich', 'bordes']);
        break;
      case 'mapa-rosa':
        m = Mapa.crear(cont, { modo: 'explorar', alTocar: explorarRegion });
        m.clase('rosa-grande-mapa');
        fijas(['bordes']);
        break;
      case 'mapa-chile':
        m = Mapa.crear(cont, { modo: 'explorar', lineas: true, alTocar: explorarRegion });
        m.marcarChile();
        fijas(['sudamerica', 'pacifico', 'atlantico', 'ecuador']);
        break;
      case 'mapa-explorar-todo':
        m = Mapa.crear(cont, { modo: 'explorar', lineas: true, alTocar: explorarRegion });
        break;
      default:
        cont.innerHTML = '';
    }
    mapaActual = m || null;
  }

  /* ================= PRÁCTICA Y PRUEBA ================= */
  function iniciarJuego(modo, seccion) {
    var preguntas = modo === 'prueba'
      ? Preguntas.generarPrueba()
      : Preguntas.generar(seccion, D.preguntasPorPractica || 10);
    if (!preguntas.length) { aviso('No hay preguntas para esta sección.'); return; }
    juego = { modo: modo, seccion: seccion, preguntas: preguntas, i: 0, aciertos: 0, registro: [], respondida: false };
    renderPregunta();
  }

  function preguntaActual() { return juego.preguntas[juego.i]; }

  function renderPregunta() {
    var q = preguntaActual();
    var n = juego.preguntas.length;
    var s = sec(q.seccion);
    juego.respondida = false;
    var titulo = juego.modo === 'prueba'
      ? '📝 Prueba'
      : '<span aria-hidden="true">' + s.icono + '</span> ' + esc(s.titulo);
    montar('' +
      '<section class="pantalla juego ' + juego.modo + '" style="--color:' + s.color + '">' +
        '<header class="barra">' +
          '<button class="btn-icono" data-accion="salir-juego" aria-label="Salir">✕</button>' +
          '<div class="barra-titulo">' + titulo + '</div>' +
          '<div class="avance" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + juego.i + '">' +
            '<div class="avance-relleno" style="width:' + (juego.i / n) * 100 + '%"></div>' +
          '</div>' +
          '<div class="contador">' + (juego.i + 1) + ' / ' + n + '</div>' +
        '</header>' +
        '<div class="pregunta">' +
          '<button class="btn-voz" data-accion="leer-pregunta" aria-label="Escuchar la pregunta">🔊</button>' +
          '<div class="pregunta-cuerpo">' +
            '<p class="pregunta-texto">' + esc(q.texto) + '</p>' +
            (q.pasos ? '<ol class="pasos-ruta">' + q.pasos.map(function (p) { var corto = p.replace(/^(Luego )?avanza /i, ''); return '<li>' + esc(corto.charAt(0).toUpperCase() + corto.slice(1)) + '</li>'; }).join('') + '</ol>' : '') +
          '</div>' +
        '</div>' +
        '<div class="visual" id="visual"></div>' +
        '<div class="respuestas" id="respuestas"></div>' +
      '</section>');

    var cont = document.getElementById('visual');
    if (q.vista === 'cuadricula') {
      cuadActual = Cuadricula.crear(cont, {
        alTocar: q.tipo === 'tocar' ? function (id) { responderCelda(id); } : null
      });
      // En práctica se marca el punto de partida; en la prueba, no (sin pistas).
      if (juego.modo === 'practica' && q.marcar) cuadActual.marcar(q.marcar, 'inicio');
    } else {
      var mo = q.mapa || {};
      mapaActual = Mapa.crear(cont, {
        modo: q.tipo === 'tocar' ? mo.modo : 'ninguno',
        lineas: !!mo.lineas,
        alTocar: q.tipo === 'tocar' ? responderMapa : null
      });
      [].concat(mo.foco || []).forEach(function (id) {
        mapaActual.resaltar(id, 'brilla');
        if (Mapa.infoContinente(id)) mapaActual.foco(true);
      });
      if (mo.tramposo) mapaActual.etiquetaTexto(mo.tramposo.id, mo.tramposo.texto);
      if (mo.marcar === 'chile') mapaActual.marcarChile();
    }

    var resp = document.getElementById('respuestas');
    if (q.tipo === 'opciones') {
      resp.innerHTML = '<div class="opciones n' + q.opciones.length + '">' +
        q.opciones.map(function (o, i) {
          return '<button class="btn-opcion" data-accion="opcion" data-i="' + i + '">' + esc(o) + '</button>';
        }).join('') + '</div>';
    } else {
      resp.innerHTML = '<div class="indicacion">👆 ' + (q.vista === 'cuadricula' ? 'Toca una casilla' : 'Toca en el mapa') + '</div>';
    }
  }

  function responderOpcion(i) {
    if (!juego || juego.respondida) return;
    var q = preguntaActual();
    var elegida = q.opciones[i];
    var botones = document.querySelectorAll('.btn-opcion');
    if (botones[i]) botones[i].classList.add('elegida');
    finalizar(elegida === q.respuesta, elegida, {});
  }

  function responderCelda(id) {
    if (!juego || juego.respondida) return;
    var q = preguntaActual();
    if (cuadActual) cuadActual.marcar([id], 'elegida');
    finalizar(id === q.respuesta, 'Casilla ' + id, { celda: id });
  }

  function responderMapa(info) {
    if (!juego || juego.respondida) return;
    var q = preguntaActual();
    var modo = q.mapa.modo;
    var toque = null;
    if (modo === 'lineas') {
      var esHemi = !!Mapa.infoLinea(q.respuesta) && Mapa.infoLinea(q.respuesta).tipo === 'hemisferio';
      if (esHemi) {
        if (Math.abs(info.lat) < 2) { aviso('Toca un poco más arriba o más abajo del Ecuador 🙂'); return; }
        toque = info.hemisferio;
      } else {
        if (!info.id) { aviso('Toca justo encima de una línea o de un polo 🙂'); return; }
        toque = info.id;
      }
    } else if (modo === 'continentes') {
      if (info.tipo !== 'continente') { aviso('Eso es agua 💧 Toca un continente.'); return; }
      toque = info.id;
    } else if (modo === 'oceanos') {
      if (info.tipo === 'continente') { aviso('Eso es tierra 🏝️ Toca el agua.'); return; }
      if (info.tipo === 'mar') { aviso('Ese es un mar, no un océano. ¡Busca uno más grande! 🌊'); return; }
      if (info.tipo !== 'oceano') return;
      toque = info.id;
    } else {
      return;
    }
    if (mapaActual && juego.modo === 'prueba') mapaActual.resaltar(toque, 'elegida');
    var validas = q.respuestasValidas || [q.respuesta];
    finalizar(validas.indexOf(toque) >= 0, Mapa.nombreDe(toque), { toque: toque });
  }

  function textoRespuesta(q) {
    if (q.tipo === 'opciones') return q.respuesta;
    if (q.vista === 'cuadricula') return 'casilla ' + q.respuesta;
    return q.nombreRespuesta || Mapa.nombreDe(q.respuesta);
  }

  function finalizar(correcto, dada, extra) {
    juego.respondida = true;
    var q = preguntaActual();
    juego.registro.push({ q: q, correcto: correcto, dada: dada });
    if (correcto) juego.aciertos++;
    if (juego.modo === 'prueba') {
      setTimeout(siguiente, 600);
      return;
    }
    mostrarCorreccion(q, correcto, dada, extra);
  }

  function mostrarCorreccion(q, correcto, dada, extra) {
    // 1. Mostrar la respuesta correcta en el dibujo
    if (q.vista === 'cuadricula' && cuadActual) {
      cuadActual.limpiar();
      if (q.marcar) cuadActual.marcar(q.marcar, 'inicio');
      if (q.camino) cuadActual.camino(q.camino);
      if (!correcto && extra.celda) cuadActual.marcar([extra.celda], 'equivocado');
      cuadActual.marcar(q.correctas || [], 'correcto');
    } else if (mapaActual) {
      var m = mapaActual;
      if (q.tipo === 'tocar') {
        if (!correcto && extra.toque) { m.resaltar(extra.toque, 'equivocado'); m.etiqueta(extra.toque); }
        (q.respuestasValidas || [q.respuesta]).forEach(function (id) {
          m.resaltar(id, 'correcto');
          m.etiqueta(id);
        });
      } else {
        var mo = q.mapa || {};
        if (mo.tramposo) {
          // Se corrige el nombre: queda el verdadero, en verde.
          m.etiquetaTexto(mo.tramposo.id, mo.tramposo.correcto + (mo.tramposo.texto === mo.tramposo.correcto ? ' ✔' : ''), 'etq-bien');
        } else {
          [].concat(mo.foco || []).forEach(function (id) { m.etiqueta(id); });
        }
        (q.mostrar || []).forEach(function (id) { m.resaltar(id, 'correcto'); m.etiqueta(id); });
      }
    }

    // 2. Mensaje amable (reemplaza los botones de respuesta)
    var titulo = correcto
      ? alAzar(['¡Muy bien!', '¡Excelente!', '¡Sí, así es!', '¡Bravo!', '¡Lo lograste!'])
      : alAzar(['¡Casi!', '¡Buen intento!', '¡Ya casi!']);
    var detalle = '';
    if (!correcto) {
      if (q.tipo === 'tocar' && dada) detalle += 'Tocaste ' + esc(dada.replace(/^Casilla/, 'la casilla')) + '. ';
      detalle += 'La respuesta es: <b>' + esc(textoRespuesta(q)) + '</b>. ';
    }
    detalle += esc(q.explicacion || '');
    var ultimo = juego.i === juego.preguntas.length - 1;
    var resp = document.getElementById('respuestas');
    var panel = document.createElement('div');
    panel.className = 'correccion ' + (correcto ? 'bien' : 'casi');
    panel.innerHTML = '' +
      '<div class="correccion-icono" aria-hidden="true">' + (correcto ? '⭐' : '💪') + '</div>' +
      '<div class="correccion-texto"><strong>' + titulo + '</strong><span>' + detalle + '</span></div>' +
      '<button class="btn-voz btn-voz-chico" data-accion="leer-correccion" aria-label="Escuchar">🔊</button>' +
      '<button class="btn btn-siguiente" data-accion="siguiente">' + (ultimo ? 'Terminar 🏁' : 'Siguiente ▶') + '</button>';
    resp.innerHTML = '';
    resp.appendChild(panel);
    juego.textoCorreccion = titulo + '. ' + panel.querySelector('.correccion-texto span').textContent;
    if (correcto) celebrar();
  }

  function siguiente() {
    if (!juego) return;
    juego.i++;
    if (juego.i >= juego.preguntas.length) terminar();
    else renderPregunta();
  }

  function terminar() {
    if (juego.modo === 'prueba') terminarPrueba();
    else terminarPractica();
  }

  /* ---------- fin de la práctica ---------- */
  function terminarPractica() {
    var n = juego.preguntas.length, a = juego.aciertos;
    var p = a / n;
    var estrellas = p >= 0.9 ? 3 : p >= 0.7 ? 2 : 1;
    var datos = Almacen.cargar();
    var reg = datos.practica[juego.seccion];
    var medallaNueva = estrellas === 3 && reg.estrellas < 3;
    reg.intentos += n;
    reg.aciertos += a;
    reg.sesiones += 1;
    reg.estrellas = Math.max(reg.estrellas, estrellas);
    Almacen.guardar();

    var s = sec(juego.seccion);
    var msj = estrellas === 3 ? '¡Increíble! 🌟' : estrellas === 2 ? '¡Muy bien! 👏' : '¡Buen trabajo! Sigue practicando 💪';
    montar('' +
      '<section class="pantalla desplazable resultado" style="--color:' + s.color + '">' +
        '<div class="resultado-tarjeta">' +
          '<div class="resultado-estrellas">' +
            [1, 2, 3].map(function (i) { return '<span class="estrella ' + (i <= estrellas ? 'llena' : '') + '" style="--d:' + (i * 0.25) + 's">★</span>'; }).join('') +
          '</div>' +
          '<h1>' + msj + '</h1>' +
          '<p class="resultado-puntos">Acertaste <b>' + a + '</b> de <b>' + n + '</b></p>' +
          (medallaNueva ? '<div class="medalla-nueva"><span>🏅</span> ¡Ganaste la medalla de ' + esc(s.titulo) + '!</div>' : '') +
          '<div class="resultado-botones">' +
            '<button class="btn" data-accion="practicar" data-sec="' + s.n + '">🔁 Otra vez</button>' +
            '<button class="btn btn-claro" data-accion="aprender" data-sec="' + s.n + '">📖 Repasar</button>' +
            '<button class="btn btn-claro" data-accion="inicio">🏠 Inicio</button>' +
          '</div>' +
        '</div>' +
      '</section>');
    celebrar();
    juego = null;
  }

  /* ---------- prueba ---------- */
  function irIntroPrueba() {
    var total = D.prueba.totalPreguntas || 20;
    montar('' +
      '<section class="pantalla desplazable intro-prueba">' +
        '<header class="barra"><button class="btn-icono" data-accion="inicio" aria-label="Volver al inicio">🏠</button><div class="barra-titulo">📝 Prueba</div></header>' +
        '<div class="resultado-tarjeta">' +
          '<div class="intro-icono" aria-hidden="true">📝</div>' +
          '<h1>¡Hora de la prueba!</h1>' +
          '<ul class="intro-lista">' +
            '<li>Son <b>' + total + ' preguntas</b> de las 4 secciones.</li>' +
            '<li>No hay pistas: responde lo que sabes.</li>' +
            '<li>No hay apuro. Tómate tu tiempo. 🐢</li>' +
            '<li>Al final verás tu nota.</li>' +
          '</ul>' +
          '<div class="resultado-botones"><button class="btn btn-verde btn-comenzar" data-accion="comenzar-prueba">¡Comenzar! 🚀</button></div>' +
        '</div>' +
      '</section>');
  }

  function terminarPrueba() {
    var total = juego.preguntas.length, p = juego.aciertos;
    var nota = Preguntas.nota(p, total, D.prueba.exigencia);
    var porSec = {};
    D.secciones.forEach(function (s) { porSec[s.n] = [0, 0]; });
    var contTemas = {};
    var errores = [];
    juego.registro.forEach(function (r) {
      var ps = porSec[r.q.seccion];
      ps[1]++;
      if (r.correcto) ps[0]++;
      else {
        contTemas[r.q.tema] = (contTemas[r.q.tema] || 0) + 1;
        errores.push(r);
      }
    });
    var temas = Object.keys(contTemas).sort(function (a, b) { return contTemas[b] - contTemas[a]; });
    var datos = Almacen.cargar();
    datos.pruebas.push({ fecha: new Date().toISOString(), puntaje: p, total: total, nota: nota, secciones: porSec, temas: temas });
    if (datos.pruebas.length > 60) datos.pruebas = datos.pruebas.slice(-60);
    Almacen.guardar();

    var exig = Math.round((D.prueba.exigencia || 0.6) * 100);
    var msj = nota >= 6 ? '¡Excelente trabajo! 🌟' : nota >= 5 ? '¡Muy bien! 👏' : nota >= 4 ? '¡Bien! Vas por buen camino 👍' : '¡Sigue practicando, tú puedes! 💪';
    var barras = D.secciones.map(function (s) {
      var ps = porSec[s.n], porc = pct(ps[0], ps[1]);
      return '<div class="barra-sec" style="--color:' + s.color + '">' +
        '<div class="barra-sec-nombre"><span aria-hidden="true">' + s.icono + '</span> ' + esc(s.titulo) + '</div>' +
        '<div class="barra-sec-pista"><div class="barra-sec-relleno" style="width:' + porc + '%"></div></div>' +
        '<div class="barra-sec-num">' + ps[0] + '/' + ps[1] + '</div>' +
      '</div>';
    }).join('');
    var seccionesDebiles = D.secciones.filter(function (s) { var ps = porSec[s.n]; return ps[1] && ps[0] / ps[1] < (D.prueba.exigencia || 0.6); });

    montar('' +
      '<section class="pantalla desplazable resultado-prueba">' +
        '<header class="barra"><button class="btn-icono" data-accion="inicio" aria-label="Volver al inicio">🏠</button><div class="barra-titulo">📝 Resultado de la prueba</div></header>' +
        '<div class="contenido-ancho">' +
          '<div class="tarjeta-nota">' +
            '<div class="nota ' + (nota >= 4 ? 'aprobada' : 'repasar') + '"><small>Nota</small>' + fmtNota(nota) + '</div>' +
            '<div><h1>' + msj + '</h1>' +
              '<p class="resultado-puntos">Puntaje: <b>' + p + '</b> de ' + total + ' (' + pct(p, total) + ' %)</p>' +
              '<p class="nota-escala">Escala de 1,0 a 7,0 con exigencia del ' + exig + ' %.</p></div>' +
          '</div>' +
          '<h2>Resultado por sección</h2>' +
          '<div class="barras">' + barras + '</div>' +
          '<h2>Conviene repasar</h2>' +
          (temas.length
            ? '<ul class="temas">' + temas.map(function (t) { return '<li>📌 ' + esc(t) + '</li>'; }).join('') + '</ul>' +
              (seccionesDebiles.length ? '<div class="botones-repaso">' + seccionesDebiles.map(function (s) {
                return '<button class="btn btn-claro" data-accion="aprender" data-sec="' + s.n + '">' + s.icono + ' Repasar ' + esc(s.titulo) + '</button>';
              }).join('') + '</div>' : '')
            : '<p class="sin-temas">¡Nada! Respondiste todo bien. 🎉</p>') +
          (errores.length
            ? '<details class="errores"><summary>Ver las preguntas que faltaron (' + errores.length + ')</summary><ol>' +
              errores.map(function (r) {
                return '<li><span class="err-preg">' + esc(r.q.texto) + '</span>' +
                  '<span class="err-ok">✔ ' + esc(textoRespuesta(r.q)) + '</span>' +
                  (r.dada ? '<span class="err-dada">Tu respuesta: ' + esc(r.dada) + '</span>' : '') + '</li>';
              }).join('') + '</ol></details>'
            : '') +
          '<div class="resultado-botones">' +
            '<button class="btn" data-accion="comenzar-prueba">🔁 Otra prueba</button>' +
            '<button class="btn btn-claro" data-accion="inicio">🏠 Inicio</button>' +
          '</div>' +
        '</div>' +
      '</section>');
    if (nota >= 4) celebrar();
    juego = null;
  }

  /* ================= PROGRESO (papás) ================= */
  function irProgreso() {
    var datos = Almacen.cargar();
    var exig = D.prueba.exigencia || 0.6;
    var tarjetas = D.secciones.map(function (s) {
      var pr = datos.practica[s.n];
      var ok = 0, tot = 0;
      datos.pruebas.forEach(function (t) {
        var x = t.secciones && t.secciones[s.n];
        if (x) { ok += x[0]; tot += x[1]; }
      });
      function fila(nombre, a, b, vacio) {
        var porc = pct(a, b);
        return '<div class="prog-fila"><span class="prog-etq">' + nombre + '</span>' +
          (b ? '<div class="barra-sec-pista"><div class="barra-sec-relleno ' + (a / b < exig ? 'bajo' : '') + '" style="width:' + porc + '%"></div></div><b>' + porc + ' %</b>'
             : '<span class="prog-vacio">' + vacio + '</span>') + '</div>';
      }
      return '<div class="prog-tarjeta" style="--color:' + s.color + '">' +
        '<h3><span aria-hidden="true">' + s.icono + '</span> ' + esc(s.titulo) +
          ' <span class="estrellas">' + estrellasHTML(pr.estrellas) + '</span>' + (pr.estrellas >= 3 ? ' 🏅' : '') + '</h3>' +
        fila('Práctica', pr.aciertos, pr.intentos, 'Aún no practica') +
        fila('Pruebas', ok, tot, 'Aún no hay pruebas') +
        '<p class="prog-detalle">' + pr.sesiones + ' práctica' + (pr.sesiones === 1 ? '' : 's') + ' · ' + pr.aciertos + ' de ' + pr.intentos + ' respuestas correctas en práctica</p>' +
      '</div>';
    }).join('');

    var historial;
    if (!datos.pruebas.length) {
      historial = '<p class="prog-vacio">Todavía no hay pruebas. Cuando haga una, aparecerá aquí.</p>';
    } else {
      historial = '<table class="tabla"><thead><tr><th>Fecha</th><th>Nota</th><th>Puntaje</th>' +
        D.secciones.map(function (s) { return '<th title="' + esc(s.titulo) + '">' + s.icono + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        datos.pruebas.slice().reverse().map(function (t) {
          var f = new Date(t.fecha);
          var fecha = isNaN(f) ? '' : f.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) + ' ' +
            f.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
          return '<tr><td>' + esc(fecha) + '</td>' +
            '<td><span class="nota-chica ' + (t.nota >= 4 ? 'aprobada' : 'repasar') + '">' + fmtNota(t.nota) + '</span></td>' +
            '<td>' + t.puntaje + '/' + t.total + '</td>' +
            D.secciones.map(function (s) {
              var x = t.secciones && t.secciones[s.n];
              return '<td>' + (x && x[1] ? pct(x[0], x[1]) + '%' : '–') + '</td>';
            }).join('') + '</tr>' +
            (t.temas && t.temas.length ? '<tr class="fila-temas"><td colspan="' + (3 + D.secciones.length) + '">Repasar: ' + t.temas.map(esc).join(' · ') + '</td></tr>' : '');
        }).join('') + '</tbody></table>';
    }

    // Temas que más se repiten en las pruebas
    var cuenta = {};
    datos.pruebas.forEach(function (t) { (t.temas || []).forEach(function (x) { cuenta[x] = (cuenta[x] || 0) + 1; }); });
    var dificiles = Object.keys(cuenta).sort(function (a, b) { return cuenta[b] - cuenta[a]; }).slice(0, 6);

    montar('' +
      '<section class="pantalla desplazable progreso">' +
        '<header class="barra"><button class="btn-icono" data-accion="inicio" aria-label="Volver al inicio">🏠</button><div class="barra-titulo">👨‍👩‍👧 Progreso</div></header>' +
        '<div class="contenido-ancho">' +
          (Almacen.disponible() ? '' : '<p class="alerta">⚠️ Este navegador no permite guardar datos (por ejemplo, en navegación privada). La app funciona igual, pero el progreso se borra al cerrarla.</p>') +
          '<h2>Logro por sección</h2>' +
          '<div class="prog-grid">' + tarjetas + '</div>' +
          (dificiles.length ? '<h2>Temas que más cuestan</h2><ul class="temas">' + dificiles.map(function (t) {
            return '<li>📌 ' + esc(t) + ' <small>(' + cuenta[t] + ' prueba' + (cuenta[t] === 1 ? '' : 's') + ')</small></li>';
          }).join('') + '</ul>' : '') +
          '<h2>Historial de pruebas</h2>' + historial +
          '<p class="nota-escala">Nota en escala de 1,0 a 7,0 con exigencia del ' + Math.round(exig * 100) + ' % (60 % de logro = 4,0).</p>' +
          '<div class="resultado-botones"><button class="btn btn-peligro" data-accion="borrar">🗑️ Borrar el progreso</button></div>' +
        '</div>' +
      '</section>');
  }

  /* ================= EVENTOS ================= */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-accion]') : null;
    if (!b || b.disabled) return;
    var accion = b.getAttribute('data-accion');
    var s = parseInt(b.getAttribute('data-sec'), 10);
    switch (accion) {
      case 'inicio': juego = null; irInicio(); break;
      case 'aprender': juego = null; irAprender(s, 0); break;
      case 'lamina': irAprender(estado.aprender.n, parseInt(b.getAttribute('data-paso'), 10)); break;
      case 'practicar': iniciarJuego('practica', s); break;
      case 'prueba': irIntroPrueba(); break;
      case 'comenzar-prueba': iniciarJuego('prueba'); break;
      case 'progreso': irProgreso(); break;
      case 'opcion': responderOpcion(parseInt(b.getAttribute('data-i'), 10)); break;
      case 'siguiente': siguiente(); break;
      case 'leer-pregunta': {
        var q = juego && preguntaActual();
        if (q) Voz.hablar(q.texto + (q.pasos ? ' ' + q.pasos.join(' ') : '') + (q.tipo === 'opciones' ? '. ' + q.opciones.join('. ') : ''));
        break;
      }
      case 'leer-correccion': if (juego && juego.textoCorreccion) Voz.hablar(juego.textoCorreccion); break;
      case 'leer-lamina': {
        var L = D.aprender[estado.aprender.n][estado.aprender.paso];
        Voz.hablar(L.titulo + '. ' + L.texto.join('. '));
        break;
      }
      case 'salir-juego': {
        var enCurso = juego && juego.i > 0;
        var msj = juego && juego.modo === 'prueba' ? '¿Quieres salir de la prueba? Se perderán las respuestas.' : '¿Quieres salir de la práctica?';
        if (!enCurso || window.confirm(msj)) { juego = null; irInicio(); }
        break;
      }
      case 'borrar':
        if (window.confirm('¿Borrar todo el progreso y el historial de pruebas? Esto no se puede deshacer.')) {
          Almacen.borrar();
          irProgreso();
          aviso('Progreso borrado.');
        }
        break;
    }
  });

  // Evita el zoom con pellizco en Safari (iPad). El doble toque se evita
  // con "touch-action: manipulation" en el CSS.
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });

  irInicio();
})();
