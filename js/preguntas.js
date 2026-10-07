/* =====================================================================
   Generador de preguntas
   Crea las preguntas de cada sección a partir de js/datos.js
   ===================================================================== */
(function (global) {
  'use strict';

  var D = global.DATOS;

  /* ---------- utilidades ---------- */
  function mezclar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function unicos(arr) {
    var vistos = {}, res = [];
    arr.forEach(function (x) { if (!vistos[x]) { vistos[x] = 1; res.push(x); } });
    return res;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function de(nombre) { return nombre.indexOf('el ') === 0 ? 'del ' + nombre.slice(3) : 'de ' + nombre; }
  function plural(n, s) { return n + ' ' + s + (n === 1 ? '' : 's'); }

  // Arma opciones: la correcta + distractores (prefiere los "cercanos"), sin repetir.
  function armarOpciones(correcta, cercanos, otros, total) {
    var lista = [correcta];
    unicos(mezclar(cercanos).concat(mezclar(otros))).forEach(function (o) {
      if (lista.length < total && lista.indexOf(o) === -1) lista.push(o);
    });
    return mezclar(lista);
  }

  // Toma n preguntas variando entre grupos (una de cada grupo por turno).
  function elegirVariado(grupos, n) {
    var colas = mezclar(grupos.filter(function (g) { return g.length; }).map(mezclar));
    var res = [], vistos = {};
    while (res.length < n && colas.some(function (c) { return c.length; })) {
      colas.forEach(function (c) {
        while (res.length < n && c.length) {
          var q = c.shift();
          var clave = q.clave || q.texto;
          if (!vistos[clave]) { vistos[clave] = 1; res.push(q); break; }
        }
      });
    }
    return res;
  }

  /* ================= SECCIÓN 1: cuadrícula ================= */
  var DIRS = [
    { id: 'norte', dc: 0, df: -1, pista: 'El norte es hacia arriba ⬆️.' },
    { id: 'sur', dc: 0, df: 1, pista: 'El sur es hacia abajo ⬇️.' },
    { id: 'este', dc: 1, df: 0, pista: 'El este es hacia la derecha ➡️.' },
    { id: 'oeste', dc: -1, df: 0, pista: 'El oeste es hacia la izquierda ⬅️.' }
  ];

  function cuad() {
    var C = D.cuadricula;
    var porCelda = {};
    C.lugares.forEach(function (l) { porCelda[l.celda] = l; });
    function pos(celda) { return { c: C.columnas.indexOf(celda.charAt(0)), f: parseInt(celda.slice(1), 10) - 1 }; }
    function celda(c, f) {
      if (c < 0 || f < 0 || c >= C.columnas.length || f >= C.filas) return null;
      return C.columnas[c] + (f + 1);
    }
    return { C: C, porCelda: porCelda, pos: pos, celda: celda };
  }

  function etq(l) { return l.emoji + ' ' + l.etiqueta; }

  function generarSeccion1() {
    var K = cuad(), C = K.C;
    var grupos = { vecino: [], moverOpc: [], moverToca: [], casilla: [], queHay: [], direccion: [], tocaCelda: [], tocaVecina: [] };
    var todos = C.lugares.map(etq);

    function vecinosDe(l) {
      var p = K.pos(l.celda), res = {};
      DIRS.forEach(function (d) {
        var c = K.celda(p.c + d.dc, p.f + d.df);
        res[d.id] = c;
      });
      return res;
    }

    C.lugares.forEach(function (X) {
      var p = K.pos(X.celda);
      var vec = vecinosDe(X);

      // ¿Qué hay justo al norte de...?
      DIRS.forEach(function (d) {
        var c = vec[d.id];
        var Y = c && K.porCelda[c];
        if (!Y) return;
        var cercanos = DIRS.map(function (o) { var cc = vec[o.id]; return cc && K.porCelda[cc] ? etq(K.porCelda[cc]) : null; })
          .filter(function (v) { return v && v !== etq(Y); });
        grupos.vecino.push({
          seccion: 1, tipo: 'opciones', vista: 'cuadricula',
          texto: '¿Qué hay justo al ' + d.id + ' ' + de(X.nombre) + ' ' + X.emoji + '?',
          opciones: armarOpciones(etq(Y), cercanos, todos, 4),
          respuesta: etq(Y),
          explicacion: 'Una casilla al ' + d.id + ' ' + de(X.nombre) + ' está ' + Y.nombre + '. ' + d.pista,
          tema: 'Puntos cardinales en la cuadrícula',
          marcar: [X.celda], correctas: [Y.celda]
        });

        // Toca la casilla que está justo al ... de ...
      });
      DIRS.forEach(function (d) {
        var c = vec[d.id];
        if (!c) return;
        grupos.tocaVecina.push({
          seccion: 1, tipo: 'tocar', vista: 'cuadricula',
          texto: 'Toca la casilla que está justo al ' + d.id + ' ' + de(X.nombre) + ' ' + X.emoji + '.',
          respuesta: c,
          explicacion: 'Al ' + d.id + ' ' + de(X.nombre) + ' (' + X.celda + ') está la casilla ' + c + '. ' + d.pista,
          tema: 'Puntos cardinales en la cuadrícula',
          correctas: [c]
        });
      });

      // ¿En qué casilla está...?
      var cercanas = [];
      [[0, -1], [0, 1], [1, 0], [-1, 0], [1, 1], [-1, -1]].forEach(function (m) {
        var c = K.celda(p.c + m[0], p.f + m[1]);
        if (c) cercanas.push(c);
      });
      var invertida = K.celda(p.f, p.c); // confunde columna con fila
      if (invertida) cercanas.push(invertida);
      var todasCeldas = [];
      for (var cc = 0; cc < C.columnas.length; cc++) for (var ff = 0; ff < C.filas; ff++) todasCeldas.push(K.celda(cc, ff));
      grupos.casilla.push({
        seccion: 1, tipo: 'opciones', vista: 'cuadricula',
        texto: '¿En qué casilla está ' + X.nombre + ' ' + X.emoji + '?',
        opciones: armarOpciones(X.celda, cercanas, todasCeldas, 4),
        respuesta: X.celda,
        explicacion: cap(X.nombre) + ' está en la columna ' + X.celda.charAt(0) + ' y la fila ' + X.celda.slice(1) + ': ' + X.celda + '.',
        tema: 'Nombrar casillas (letra y número)',
        correctas: [X.celda]
      });

      // ¿Qué hay en la casilla...?
      var mismaLinea = C.lugares.filter(function (o) {
        return o !== X && (o.celda.charAt(0) === X.celda.charAt(0) || o.celda.slice(1) === X.celda.slice(1));
      }).map(etq);
      grupos.queHay.push({
        seccion: 1, tipo: 'opciones', vista: 'cuadricula',
        texto: '¿Qué hay en la casilla ' + X.celda + '?',
        opciones: armarOpciones(etq(X), mismaLinea, todos, 4),
        respuesta: etq(X),
        explicacion: 'Columna ' + X.celda.charAt(0) + ', fila ' + X.celda.slice(1) + ': ahí está ' + X.nombre + '.',
        tema: 'Nombrar casillas (letra y número)',
        correctas: [X.celda]
      });

      // Desde X, ¿hacia dónde está Y? (misma fila o columna)
      C.lugares.forEach(function (Y) {
        if (Y === X) return;
        var q = K.pos(Y.celda);
        var d = null, dist = 0;
        if (q.c === p.c) { d = q.f < p.f ? DIRS[0] : DIRS[1]; dist = Math.abs(q.f - p.f); }
        else if (q.f === p.f) { d = q.c > p.c ? DIRS[2] : DIRS[3]; dist = Math.abs(q.c - p.c); }
        if (!d) return;
        grupos.direccion.push({
          seccion: 1, tipo: 'opciones', vista: 'cuadricula',
          texto: 'Si estás en ' + X.nombre + ' ' + X.emoji + ', ¿hacia dónde está ' + Y.nombre + ' ' + Y.emoji + '?',
          opciones: ['Norte', 'Sur', 'Este', 'Oeste'],
          respuesta: cap(d.id),
          explicacion: cap(Y.nombre) + ' está ' + plural(dist, 'casilla') + ' al ' + d.id + ' ' + de(X.nombre) + '. ' + d.pista,
          tema: 'Puntos cardinales en la cuadrícula',
          marcar: [X.celda], correctas: [Y.celda]
        });
      });

      // Muévete ... ¿dónde llegas?
      for (var mx = -3; mx <= 3; mx++) {
        for (var my = -2; my <= 2; my++) {
          if (Math.abs(mx) + Math.abs(my) < 2) continue;
          var destino = K.celda(p.c + mx, p.f + my);
          if (!destino) continue;
          var camino = [], instrucciones = [], pasos = [];
          var cx = p.c, cy = p.f;
          var dx = mx > 0 ? DIRS[2] : DIRS[3];
          var dy = my > 0 ? DIRS[1] : DIRS[0];
          for (var i = 0; i < Math.abs(mx); i++) { cx += dx.dc; camino.push(K.celda(cx, cy)); }
          if (mx) { instrucciones.push(plural(Math.abs(mx), 'espacio') + ' al ' + dx.id); pasos.push(Math.abs(mx) + ' al ' + dx.id + ' → ' + K.celda(cx, cy)); }
          for (var j = 0; j < Math.abs(my); j++) { cy += dy.df; camino.push(K.celda(cx, cy)); }
          if (my) { instrucciones.push(plural(Math.abs(my), 'espacio') + ' al ' + dy.id); pasos.push(Math.abs(my) + ' al ' + dy.id + ' → ' + K.celda(cx, cy)); }
          var orden = instrucciones.join(' y ');
          var Y2 = K.porCelda[destino];
          var base = 'Parte en ' + X.nombre + ' ' + X.emoji + '. Avanza ' + orden + '.';
          var expl = 'Desde ' + X.celda + ': ' + pasos.join('; ') + '.';
          if (Y2 && Y2 !== X) {
            // distractores: lo que hay si se confunden las direcciones
            var errores = [[-mx, my], [mx, -my], [-mx, -my], [my, mx]].map(function (m) {
              var c2 = K.celda(p.c + m[0], p.f + m[1]);
              return c2 && K.porCelda[c2] ? etq(K.porCelda[c2]) : null;
            }).filter(function (v) { return v && v !== etq(Y2) && v !== etq(X); });
            grupos.moverOpc.push({
              seccion: 1, tipo: 'opciones', vista: 'cuadricula',
              texto: base + ' ¿Dónde llegas?',
              opciones: armarOpciones(etq(Y2), errores, todos.filter(function (t) { return t !== etq(X); }), 4),
              respuesta: etq(Y2),
              explicacion: expl + ' Ahí está ' + Y2.nombre + '.',
              tema: 'Moverse en la cuadrícula',
              marcar: [X.celda], correctas: [destino], camino: camino
            });
          }
          grupos.moverToca.push({
            seccion: 1, tipo: 'tocar', vista: 'cuadricula',
            texto: base + ' Toca la casilla donde llegas.',
            respuesta: destino,
            explicacion: expl,
            tema: 'Moverse en la cuadrícula',
            marcar: [X.celda], correctas: [destino], camino: camino
          });
        }
      }
    });

    // Toca la casilla B4
    for (var c = 0; c < C.columnas.length; c++) {
      for (var f = 0; f < C.filas; f++) {
        var ce = K.celda(c, f);
        grupos.tocaCelda.push({
          seccion: 1, tipo: 'tocar', vista: 'cuadricula',
          texto: 'Toca la casilla ' + ce + '.',
          respuesta: ce,
          explicacion: ce + ' es la columna ' + ce.charAt(0) + ' y la fila ' + ce.slice(1) + '. Primero la letra, después el número.',
          tema: 'Nombrar casillas (letra y número)',
          correctas: [ce]
        });
      }
    }
    generarRutas(K, C, grupos);
    return [grupos.vecino, grupos.moverOpc, grupos.moverToca, grupos.casilla, grupos.queHay, grupos.direccion,
      grupos.tocaCelda, grupos.tocaVecina, grupos.rutaOpc, grupos.rutaToca, grupos.rutaOpc2];
  }

  /* Rutas de varios pasos, como en el cuaderno:
     "Comienza en el cuadrado. Avanza 4 espacios al norte. Luego 4 al este..." */
  function generarRutas(K, C, grupos) {
    grupos.rutaOpc = []; grupos.rutaToca = []; grupos.rutaOpc2 = [];
    var vistos = {};
    var todos = C.lugares.map(etq);

    function maxPasos(c, f, d) {
      var n = 0;
      while (K.celda(c + d.dc * (n + 1), f + d.df * (n + 1))) n++;
      return n;
    }
    // Recorre los tramos (opcionalmente cambiando direcciones) y devuelve la casilla final.
    function recorrer(p, tramos, cambio) {
      var c = p.c, f = p.f;
      for (var i = 0; i < tramos.length; i++) {
        var d = cambio ? cambio(tramos[i].d, i) : tramos[i].d;
        c += d.dc * tramos[i].n; f += d.df * tramos[i].n;
        if (!K.celda(c, f)) return null;
      }
      return K.celda(c, f);
    }
    var OPUESTA = { norte: DIRS[1], sur: DIRS[0], este: DIRS[3], oeste: DIRS[2] };

    C.lugares.forEach(function (X) {
      var p = K.pos(X.celda);
      for (var intento = 0; intento < 60; intento++) {
        var nTramos = 3 + Math.floor(Math.random() * 2);
        var c = p.c, f = p.f, previa = null, tramos = [], camino = [], ok = true;
        for (var s = 0; s < nTramos; s++) {
          var posibles = DIRS.filter(function (d) {
            return d !== previa && !(previa && d === OPUESTA[previa.id]) && maxPasos(c, f, d) > 0;
          });
          if (!posibles.length) { ok = false; break; }
          var d = posibles[Math.floor(Math.random() * posibles.length)];
          var n = 1 + Math.floor(Math.random() * Math.min(4, maxPasos(c, f, d)));
          for (var i = 0; i < n; i++) { c += d.dc; f += d.df; camino.push(K.celda(c, f)); }
          tramos.push({ d: d, n: n });
          previa = d;
        }
        if (!ok) continue;
        var destino = K.celda(c, f);
        var Y = K.porCelda[destino];
        if (!Y || Y === X || camino.indexOf(X.celda) >= 0) continue;
        var pasos = tramos.map(function (t, i) {
          return (i === 0 ? 'Avanza ' : 'Luego avanza ') + plural(t.n, 'espacio') + ' al ' + t.d.id + '.';
        });
        var clave = X.id + ':' + pasos.join(' ');
        if (vistos[clave]) continue;
        vistos[clave] = 1;

        // Errores típicos: confundir norte/sur, este/oeste, o la última dirección.
        var errores = [
          recorrer(p, tramos, function (d) { return d.dc === 0 ? OPUESTA[d.id] : d; }),
          recorrer(p, tramos, function (d) { return d.df === 0 ? OPUESTA[d.id] : d; }),
          recorrer(p, tramos, function (d, i) { return i === tramos.length - 1 ? OPUESTA[d.id] : d; }),
          recorrer(p, tramos.slice(0, -1))
        ].map(function (ce) { return ce && K.porCelda[ce] ? etq(K.porCelda[ce]) : null; })
          .filter(function (v) { return v && v !== etq(Y) && v !== etq(X); });

        var base = {
          seccion: 1, vista: 'cuadricula', clave: clave, pasos: pasos,
          explicacion: 'Siguiendo los pasos desde ' + X.celda + ' llegas a ' + destino + ': ahí está ' + Y.nombre + '.',
          tema: 'Seguir instrucciones con puntos cardinales',
          marcar: [X.celda], correctas: [destino], camino: camino
        };
        var qo = Object.assign({}, base, {
          tipo: 'opciones',
          texto: 'Comienza en ' + X.nombre + ' ' + X.emoji + ' y sigue los pasos. ¿Dónde llegas?',
          opciones: armarOpciones(etq(Y), errores, todos.filter(function (t) { return t !== etq(X); }), 4),
          respuesta: etq(Y)
        });
        (grupos.rutaOpc.length <= grupos.rutaOpc2.length ? grupos.rutaOpc : grupos.rutaOpc2).push(qo);
        grupos.rutaToca.push(Object.assign({}, base, {
          tipo: 'tocar', clave: clave + ':tocar',
          texto: 'Comienza en ' + X.nombre + ' ' + X.emoji + ' y sigue los pasos. Toca dónde llegas.',
          respuesta: destino
        }));
      }
    });
  }

  /* ================= SECCIÓN 2: líneas de referencia ================= */
  function temaLinea(l) {
    if (l.id === 'ecuador') return 'Línea del Ecuador';
    if (l.tipo === 'polo') return 'Polo Norte y Polo Sur';
    if (l.tipo === 'hemisferio') return 'Hemisferios';
    if (l.id === 'cancer' || l.id === 'capricornio') return 'Trópicos';
    if (l.vertical) return 'Meridiano de Greenwich';
    return 'Círculos polares';
  }

  function generarSeccion2() {
    var tocar = [], nombrar = [];
    var lineas = D.lineas.filter(function (l) { return l.tipo === 'linea'; });
    D.lineas.forEach(function (l) {
      tocar.push({
        seccion: 2, tipo: 'tocar', vista: 'mapa',
        mapa: { modo: 'lineas', lineas: true },
        texto: 'Toca ' + l.conArticulo + '.',
        respuesta: l.id,
        explicacion: cap(l.conArticulo) + ': ' + l.info.charAt(0).toLowerCase() + l.info.slice(1),
        tema: temaLinea(l)
      });
      var texto, opciones;
      if (l.tipo === 'linea') {
        texto = '¿Cómo se llama la línea que brilla en el mapa?';
        opciones = armarOpciones(l.nombre, [], lineas.map(function (o) { return o.nombre; }), 4);
      } else if (l.tipo === 'polo') {
        texto = '¿Qué polo brilla en el mapa?';
        opciones = mezclar(D.lineas.filter(function (o) { return o.tipo === 'polo'; }).map(function (o) { return o.nombre; }));
      } else {
        texto = '¿Qué hemisferio está pintado de amarillo?';
        opciones = mezclar(D.lineas.filter(function (o) { return o.tipo === 'hemisferio'; }).map(function (o) { return o.nombre; }));
      }
      nombrar.push({
        seccion: 2, tipo: 'opciones', vista: 'mapa',
        mapa: { modo: 'ninguno', lineas: true, foco: l.id },
        texto: texto, opciones: opciones, respuesta: l.nombre,
        explicacion: 'Es ' + l.conArticulo + '. ' + l.info,
        tema: temaLinea(l)
      });
    });
    var extras = extrasDe(D.preguntas.seccion2, 2, { modo: 'ninguno', lineas: true });
    return [tocar, nombrar, extras];
  }

  /* ================= SECCIÓN 3: continentes y océanos ================= */
  var AMERICAS = ['norteamerica', 'centroamerica', 'sudamerica'];

  function enFrase(nombreOceano) { return nombreOceano.replace('Océano', 'océano'); }

  // Nombres de los 6 continentes (América cuenta como uno solo).
  function seisContinentes() {
    return [D.america.nombre].concat(D.continentes.filter(function (c) { return AMERICAS.indexOf(c.id) < 0; })
      .map(function (c) { return c.nombre; }));
  }

  function generarSeccion3() {
    var tc = [], nc = [], to = [], no = [], tramposo = [];
    var nombres6 = seisContinentes();
    var partesAm = D.continentes.filter(function (c) { return AMERICAS.indexOf(c.id) >= 0; });
    var nombresO = D.oceanos.map(function (o) { return o.nombre; });
    D.continentes.forEach(function (c) {
      var esParte = AMERICAS.indexOf(c.id) >= 0;
      tc.push({
        seccion: 3, tipo: 'tocar', vista: 'mapa', mapa: { modo: 'continentes' },
        texto: 'Toca ' + c.nombre + '.', respuesta: c.id,
        explicacion: c.nombre + ': ' + c.info.charAt(0).toLowerCase() + c.info.slice(1),
        tema: esParte ? 'Las tres Américas' : 'Continentes'
      });
      nc.push(esParte ? {
        seccion: 3, tipo: 'opciones', vista: 'mapa', mapa: { modo: 'ninguno', foco: c.id },
        texto: '¿Qué parte de América brilla en el mapa?',
        opciones: mezclar(partesAm.map(function (o) { return o.nombre; })), respuesta: c.nombre,
        explicacion: 'Es ' + c.nombre + '. ' + c.info,
        tema: 'Las tres Américas'
      } : {
        seccion: 3, tipo: 'opciones', vista: 'mapa', mapa: { modo: 'ninguno', foco: c.id },
        texto: '¿Qué continente brilla en el mapa?',
        opciones: armarOpciones(c.nombre, [], nombres6, 4), respuesta: c.nombre,
        explicacion: 'Es ' + c.nombre + '. ' + c.info,
        tema: 'Continentes'
      });
    });
    // América completa (un solo continente)
    tc.push({
      seccion: 3, tipo: 'tocar', vista: 'mapa', mapa: { modo: 'continentes' },
      texto: 'Toca el continente americano (cualquiera de sus partes).', respuesta: 'america',
      respuestasValidas: AMERICAS.slice(), nombreRespuesta: D.america.nombre,
      explicacion: D.america.info, tema: 'Las tres Américas'
    });
    nc.push({
      seccion: 3, tipo: 'opciones', vista: 'mapa', mapa: { modo: 'ninguno', foco: AMERICAS.slice() },
      texto: '¿Qué continente brilla en el mapa?',
      opciones: armarOpciones(D.america.nombre, [], nombres6, 4), respuesta: D.america.nombre,
      explicacion: D.america.info, tema: 'Las tres Américas'
    });

    // Mapa tramposo: ¿el nombre está bien puesto?
    var zonas = D.continentes.filter(function (c) { return AMERICAS.indexOf(c.id) < 0; })
      .map(function (c) { return { id: c.id, nombre: c.nombre, tipo: 'continente' }; })
      .concat([{ id: 'sudamerica', nombre: D.america.nombre, tipo: 'continente' }])
      .concat(D.oceanos.map(function (o) { return { id: o.id, nombre: o.nombre, tipo: 'oceano' }; }));
    // Errores "tramposos" típicos
    var TRAMPAS = {
      artico: ['Océano Antártico'], antartico: ['Océano Ártico'],
      pacifico: ['Océano Atlántico'], atlantico: ['Océano Pacífico'],
      europa: ['África', 'Asia'], africa: ['Europa'], asia: ['Europa', 'Oceanía'], indico: ['Asia', 'Océano Pacífico']
    };
    var todosNombres = nombres6.concat(nombresO);
    zonas.forEach(function (z) {
      var queEs = (z.tipo === 'oceano' ? 'el ' + enFrase(z.nombre) : z.nombre);
      tramposo.push({
        seccion: 3, tipo: 'opciones', vista: 'mapa', clave: 'tramposo:' + z.id + ':ok',
        mapa: { modo: 'ninguno', foco: z.id, tramposo: { id: z.id, texto: z.nombre, correcto: z.nombre } },
        texto: '🕵️ Mapa tramposo: ¿está bien puesto el nombre de lo que brilla?',
        opciones: ['Sí, está bien', 'No, está mal'], respuesta: 'Sí, está bien',
        explicacion: '¡Sí! Ahí está ' + queEs + '.', tema: z.tipo === 'oceano' ? 'Océanos' : 'Continentes'
      });
      var malos = (TRAMPAS[z.id] || []).concat(mezclar(todosNombres.filter(function (n) { return n !== z.nombre; })).slice(0, 2));
      unicos(malos).slice(0, 3).forEach(function (malo) {
        tramposo.push({
          seccion: 3, tipo: 'opciones', vista: 'mapa', clave: 'tramposo:' + z.id + ':' + malo,
          mapa: { modo: 'ninguno', foco: z.id, tramposo: { id: z.id, texto: malo, correcto: z.nombre } },
          texto: '🕵️ Mapa tramposo: ¿está bien puesto el nombre de lo que brilla?',
          opciones: ['Sí, está bien', 'No, está mal'], respuesta: 'No, está mal',
          explicacion: 'Ahí no dice bien: ese es ' + queEs + ', no ' + malo.replace('Océano', 'el océano') + '.',
          tema: (z.id === 'artico' || z.id === 'antartico') ? 'Ártico y Antártico' : (z.tipo === 'oceano' ? 'Océanos' : 'Continentes')
        });
      });
    });
    D.oceanos.forEach(function (o) {
      to.push({
        seccion: 3, tipo: 'tocar', vista: 'mapa', mapa: { modo: 'oceanos' },
        texto: 'Toca el ' + enFrase(o.nombre) + '.', respuesta: o.id,
        explicacion: o.nombre + ': ' + o.info.charAt(0).toLowerCase() + o.info.slice(1),
        tema: 'Océanos'
      });
      no.push({
        seccion: 3, tipo: 'opciones', vista: 'mapa', mapa: { modo: 'ninguno', foco: o.id },
        texto: '¿Qué océano brilla en el mapa?',
        opciones: armarOpciones(o.nombre, [], nombresO, 4), respuesta: o.nombre,
        explicacion: 'Es el ' + enFrase(o.nombre) + '. ' + o.info,
        tema: 'Océanos'
      });
    });
    var extras = extrasDe(D.preguntas.seccion3, 3, { modo: 'ninguno' });
    return [tc, nc, to, no, tramposo, extras];
  }

  /* ================= SECCIÓN 4 y preguntas escritas a mano ================= */
  function existeZona(id) {
    return D.continentes.concat(D.oceanos, D.lineas).some(function (z) { return z.id === id; });
  }

  function extrasDe(lista, seccion, mapaBase) {
    var res = [];
    (lista || []).forEach(function (p, i) {
      var donde = 'Sección ' + seccion + ', pregunta ' + (i + 1);
      if (!p || !p.texto) { console.warn(donde + ': falta el texto.'); return; }
      if (p.tipo === 'tocar') {
        if (p.capa !== 'continentes' && p.capa !== 'oceanos') { console.warn(donde + ': "capa" debe ser "continentes" u "oceanos".'); return; }
        var lista2 = p.capa === 'continentes' ? D.continentes : D.oceanos;
        var esAmerica = p.capa === 'continentes' && p.respuesta === 'america';
        if (!esAmerica && !lista2.some(function (z) { return z.id === p.respuesta; })) { console.warn(donde + ': la respuesta "' + p.respuesta + '" no es un id válido.'); return; }
        var qt = {
          seccion: seccion, tipo: 'tocar', vista: 'mapa',
          mapa: { modo: p.capa },
          texto: p.texto, respuesta: p.respuesta,
          explicacion: p.explicacion || '', tema: p.tema || 'Ubicar en el planisferio'
        };
        if (esAmerica) { qt.respuestasValidas = AMERICAS.slice(); qt.nombreRespuesta = D.america.nombre; }
        res.push(qt);
      } else {
        if (!Array.isArray(p.opciones) || p.opciones.length < 2) { console.warn(donde + ': necesita al menos 2 opciones.'); return; }
        if (p.opciones.indexOf(p.respuesta) === -1) { console.warn(donde + ': la respuesta no está entre las opciones.'); return; }
        if (unicos(p.opciones).length !== p.opciones.length) { console.warn(donde + ': hay opciones repetidas.'); return; }
        var mostrar = (p.mostrar || []).filter(function (id) {
          if (existeZona(id)) return true;
          console.warn(donde + ': "' + id + '" en "mostrar" no es un id válido.');
          return false;
        });
        res.push({
          seccion: seccion, tipo: 'opciones', vista: 'mapa',
          mapa: { modo: mapaBase.modo, lineas: mapaBase.lineas, marcar: p.marcar },
          texto: p.texto, opciones: mezclar(p.opciones), respuesta: p.respuesta,
          explicacion: p.explicacion || '', tema: p.tema || 'Ubicar en el planisferio',
          mostrar: mostrar
        });
      }
    });
    return res;
  }

  function generarSeccion4() {
    return [extrasDe(D.preguntas.seccion4, 4, { modo: 'ninguno', lineas: true })];
  }

  var GENERADORES = { 1: generarSeccion1, 2: generarSeccion2, 3: generarSeccion3, 4: generarSeccion4 };

  function generar(seccion, n) {
    return elegirVariado(GENERADORES[seccion](), n);
  }

  function generarPrueba() {
    var total = D.prueba.totalPreguntas || 20;
    var por = Math.floor(total / 4);
    var resto = total - por * 4;
    var todas = [];
    [1, 2, 3, 4].forEach(function (s, i) {
      todas = todas.concat(generar(s, por + (i < resto ? 1 : 0)));
    });
    return mezclar(todas);
  }

  // Nota chilena de 1,0 a 7,0 con exigencia (por defecto 60 %).
  function nota(puntaje, total, exigencia) {
    exigencia = exigencia || 0.6;
    if (!total) return 1;
    var corte = exigencia * total;
    var n = puntaje < corte
      ? 1 + 3 * (puntaje / corte)
      : 4 + 3 * ((puntaje - corte) / (total - corte));
    n = Math.round(n * 10 + 1e-9) / 10;
    return Math.max(1, Math.min(7, n));
  }

  global.Preguntas = {
    generar: generar,
    generarPrueba: generarPrueba,
    todas: function (s) { return GENERADORES[s]().reduce(function (a, g) { return a.concat(g); }, []); },
    nota: nota,
    mezclar: mezclar,
    cuad: cuad
  };
})(typeof window !== 'undefined' ? window : globalThis);
