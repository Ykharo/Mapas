/* =====================================================================
   Planisferio interactivo en SVG
   ===================================================================== */
(function (global) {
  'use strict';

  var G = global.GEO;
  var D = global.DATOS;
  var NS = 'http://www.w3.org/2000/svg';
  var contador = 0;

  function n1(v) { return Math.round(v * 10) / 10; }
  function px(p) { return n1(G.x(p[0])) + ' ' + n1(G.y(p[1])); }
  function ruta(poligonos) {
    return poligonos.map(function (pol) {
      return 'M' + pol.map(px).join('L') + 'Z';
    }).join('');
  }
  function linea(puntos) { return 'M' + puntos.map(px).join('L'); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function buscar(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }
  function infoLinea(id) { return buscar(D.lineas, id); }
  function infoContinente(id) { return buscar(D.continentes, id); }
  function infoOceano(id) { return buscar(D.oceanos, id); }

  // Rosa de los vientos (también se usa fuera del mapa).
  function rosa(cx, cy, r, extra) {
    var k = r / 100;
    function p(xx, yy) { return n1(cx + xx * k) + ',' + n1(cy + yy * k); }
    var puntas = [
      // [punta, izquierda, derecha, color]
      [[0, -88], [-15, -15], [15, -15], '#E53935'],
      [[0, 88], [15, 15], [-15, 15], '#3949AB'],
      [[88, 0], [15, -15], [15, 15], '#F57C00'],
      [[-88, 0], [-15, 15], [-15, -15], '#2E9E5B']
    ];
    var s = '<g class="rosa ' + (extra || '') + '">';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(r * 0.98) + '" class="rosa-fondo"/>';
    s += '<polygon class="rosa-diag" points="' + [p(0, -50), p(8, -8), p(50, 0), p(8, 8), p(0, 50), p(-8, 8), p(-50, 0), p(-8, -8)].join(' ') + '" transform="rotate(45 ' + cx + ' ' + cy + ')"/>';
    puntas.forEach(function (t) {
      s += '<polygon points="' + p(t[0][0], t[0][1]) + ' ' + p(t[1][0], t[1][1]) + ' ' + p(0, 0) + '" fill="' + t[3] + '"/>';
      s += '<polygon points="' + p(t[0][0], t[0][1]) + ' ' + p(t[2][0], t[2][1]) + ' ' + p(0, 0) + '" fill="' + t[3] + '" opacity=".7"/>';
    });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(9 * k) + '" fill="#fff" stroke="#5a4a7a" stroke-width="' + n1(3 * k) + '"/>';
    s += '</g>';
    return s;
  }
  function rosaConLetras(cx, cy, r) {
    var f = n1(r * 0.36);
    var s = rosa(cx, cy, r * 0.7);
    s += '<g class="rosa-letras" font-size="' + f + '">';
    s += '<text x="' + cx + '" y="' + n1(cy - r * 0.78) + '" fill="#E53935">N</text>';
    s += '<text x="' + cx + '" y="' + n1(cy + r * 1.02) + '" fill="#3949AB">S</text>';
    s += '<text x="' + n1(cx + r * 0.9) + '" y="' + n1(cy + f * 0.35) + '" fill="#F57C00">E</text>';
    s += '<text x="' + n1(cx - r * 0.9) + '" y="' + n1(cy + f * 0.35) + '" fill="#2E9E5B">O</text>';
    s += '</g>';
    return s;
  }

  function construir(opc) {
    var u = ++contador;
    var W = G.ANCHO, H = G.ALTO;
    var s = '';
    s += '<defs><clipPath id="marco' + u + '"><rect width="' + W + '" height="' + H + '" rx="26"/></clipPath></defs>';
    s += '<g clip-path="url(#marco' + u + ')">';

    // Fondo de agua (evita líneas finas entre océanos vecinos)
    s += '<rect class="agua" width="' + W + '" height="' + H + '"/>';

    // Océanos
    s += '<g class="capa-oceanos">';
    D.oceanos.forEach(function (o) {
      if (!G.OCEANOS[o.id]) return;
      s += '<path class="oceano" data-region="' + o.id + '" d="' + ruta(G.OCEANOS[o.id]) + '"/>';
    });
    s += '</g>';

    // Mares interiores (no son océanos)
    s += '<g class="capa-mares">';
    Object.keys(G.MARES).forEach(function (k) {
      s += '<path class="mar" data-mar="' + k + '" d="' + ruta([G.MARES[k]]) + '"/>';
    });
    s += '</g>';

    // Continentes
    s += '<g class="capa-continentes">';
    D.continentes.forEach(function (c) {
      if (!G.CONTINENTES[c.id]) return;
      s += '<path class="continente" data-region="' + c.id + '" style="--c:' + c.color + '" d="' + ruta(G.CONTINENTES[c.id]) + '"/>';
    });
    s += '</g>';

    // Chile
    s += '<path class="chile" d="' + ruta([G.CHILE]) + '"/>';

    // Hemisferios
    s += '<rect class="hemi" data-hemi="hn" x="0" y="0" width="' + W + '" height="' + (H / 2) + '"/>';
    s += '<rect class="hemi" data-hemi="hs" x="0" y="' + (H / 2) + '" width="' + W + '" height="' + (H / 2) + '"/>';

    // Áreas tocables extra (invisibles)
    s += '<g class="capa-extra">';
    Object.keys(G.AREAS_EXTRA).forEach(function (id) {
      G.AREAS_EXTRA[id].forEach(function (a) {
        if (a.tipo === 'linea') {
          s += '<path class="extra extra-linea" data-region="' + id + '" d="' + linea(a.puntos) + '" stroke-width="' + (a.ancho * G.ESCALA) + '"/>';
        } else {
          s += '<ellipse class="extra" data-region="' + id + '" cx="' + G.x(a.centro[0]) + '" cy="' + G.y(a.centro[1]) + '" rx="' + (a.rx * G.ESCALA) + '" ry="' + (a.ry * G.ESCALA) + '"/>';
        }
      });
    });
    s += '</g>';

    // Marcadores tocables para zonas angostas (América Central)
    s += '<g class="capa-marcadores">';
    Object.keys(G.MARCADORES).forEach(function (id) {
      var mk = G.MARCADORES[id];
      var c = buscar(D.continentes, id);
      var mx = G.x(mk.pos[0]), my = G.y(mk.pos[1]);
      s += '<g class="marcador" data-region="' + id + '" style="--c:' + (c ? c.color : '#EF5D8F') + '">';
      s += '<line x1="' + mx + '" y1="' + my + '" x2="' + G.x(mk.apunta[0]) + '" y2="' + G.y(mk.apunta[1]) + '"/>';
      s += '<circle class="marcador-toque" cx="' + mx + '" cy="' + my + '" r="' + (mk.radioToque * G.ESCALA) + '"/>';
      s += '<circle class="marcador-punto" cx="' + mx + '" cy="' + my + '" r="' + (mk.radio * G.ESCALA) + '"/>';
      s += '</g>';
    });
    s += '</g>';

    // Anillos para zonas pequeñas
    Object.keys(G.ANILLOS).forEach(function (id) {
      var a = G.ANILLOS[id];
      s += '<circle class="anillo" data-anillo="' + id + '" cx="' + G.x(a.centro[0]) + '" cy="' + G.y(a.centro[1]) + '" r="' + (a.radio * G.ESCALA) + '"/>';
    });

    // Líneas de referencia y polos
    s += '<g class="capa-lineas">';
    D.lineas.forEach(function (l) {
      if (l.tipo === 'linea' && l.vertical) {
        var xx = G.x(l.lon || 0);
        s += '<g class="linea meridiano" data-linea="' + l.id + '" style="--l:' + (l.color || '#2E9E5B') + '">';
        s += '<line x1="' + xx + '" x2="' + xx + '" y1="0" y2="' + H + '"/>';
        s += '<text class="etq etq-linea" data-etq="' + l.id + '" x="' + (xx + 12) + '" y="' + G.y(-50) + '">' + esc(l.nombre) + ' (0°)</text>';
        s += '</g>';
      } else if (l.tipo === 'linea') {
        var yy = G.y(l.lat);
        s += '<g class="linea' + (l.id === 'ecuador' ? ' ecuador' : '') + '" data-linea="' + l.id + '" style="--l:' + (l.color || '#E53935') + '">';
        s += '<line x1="0" x2="' + W + '" y1="' + yy + '" y2="' + yy + '"/>';
        var arriba = l.lat >= 0 ? -10 : 34;
        s += '<text class="etq etq-linea" data-etq="' + l.id + '" x="14" y="' + (yy + arriba) + '">' + esc(l.nombre.replace('Línea del ', '')) + ' (' + String(Math.abs(l.lat)).replace('.', ',') + '°)</text>';
        s += '</g>';
      } else if (l.tipo === 'polo') {
        var norte = l.lat > 0;
        var py = norte ? 0 : H;
        var cy = norte ? 22 : H - 22;
        s += '<g class="polo" data-linea="' + l.id + '">';
        s += '<line class="polo-borde" x1="0" x2="' + W + '" y1="' + py + '" y2="' + py + '"/>';
        s += '<circle class="polo-punto" cx="' + (W / 2) + '" cy="' + cy + '" r="13"/>';
        s += '<text class="etq etq-polo" data-etq="' + l.id + '" x="' + (W / 2 + 26) + '" y="' + (cy + 10) + '">' + esc(l.nombre) + '</text>';
        s += '</g>';
      }
    });
    s += '</g>';

    // Marcador de Chile
    s += '<g class="pin-chile"><line x1="' + G.x(G.SANTIAGO[0]) + '" y1="' + G.y(G.SANTIAGO[1]) + '" x2="' + G.x(-95) + '" y2="' + G.y(-43) + '"/>';
    s += '<circle cx="' + G.x(G.SANTIAGO[0]) + '" cy="' + G.y(G.SANTIAGO[1]) + '" r="9"/>';
    s += '<text class="etq-chile" x="' + G.x(-95) + '" y="' + (G.y(-43) + 34) + '">Chile</text></g>';

    // Etiquetas de continentes y océanos
    s += '<g class="capa-etiquetas">';
    D.continentes.concat(D.oceanos).forEach(function (r) {
      var e = G.ETIQUETAS[r.id];
      if (!e) return;
      var esOceano = !!G.OCEANOS[r.id];
      s += '<g class="etq etq-region' + (esOceano ? ' etq-oceano' : '') + '" data-etq="' + r.id + '">';
      if (e.linea) {
        s += '<line x1="' + G.x(e.pos[0]) + '" y1="' + G.y(e.pos[1]) + '" x2="' + G.x(e.linea[0]) + '" y2="' + G.y(e.linea[1]) + '"/>';
      }
      s += '<text x="' + G.x(e.pos[0]) + '" y="' + (G.y(e.pos[1]) + 12) + '"' + (e.ancla ? ' style="text-anchor:' + e.ancla + '"' : '') + '>' + esc(r.nombre) + '</text>';
      s += '</g>';
    });
    // Nombres de hemisferios
    s += '<text class="etq etq-hemi" data-etq="hn" x="' + (W * 0.74) + '" y="' + (H / 2 - 22) + '">Hemisferio norte</text>';
    s += '<text class="etq etq-hemi" data-etq="hs" x="' + (W * 0.74) + '" y="' + (H / 2 + 50) + '">Hemisferio sur</text>';
    // Puntos cardinales en los bordes
    s += '<g class="etq etq-borde" data-etq="bordes">';
    s += '<text x="' + (W / 2) + '" y="76">⬆ NORTE</text>';
    s += '<text x="' + (W / 2) + '" y="' + (H - 52) + '">SUR ⬇</text>';
    s += '<text x="40" y="' + (H / 2 - 20) + '" text-anchor="start">⬅ OESTE</text>';
    s += '<text x="' + (W - 40) + '" y="' + (H / 2 - 20) + '" text-anchor="end">ESTE ➡</text>';
    s += '</g>';
    s += '</g>';

    // Rosa de los vientos pequeña (en el Pacífico sur)
    s += '<g class="rosa-mapa">' + rosaConLetras(G.x(-158), G.y(-47), 50) + '</g>';

    s += '</g>';
    s += '<rect class="marco" x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" rx="25"/>';
    return s;
  }

  /*  Crea un mapa dentro de "contenedor".
      opc.modo: 'continentes' | 'oceanos' | 'lineas' | 'explorar' | 'ninguno'
      opc.lineas: muestra las líneas de referencia
      opc.alTocar(info): info = { tipo, id, lat, lon, hemisferio } */
  function crear(contenedor, opc) {
    opc = opc || {};
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + G.ANCHO + ' ' + G.ALTO);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('class', 'mapa');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Planisferio');
    svg.innerHTML = construir(opc);
    var modo = opc.modo || 'ninguno';
    svg.classList.add('modo-' + modo);
    if (opc.lineas) svg.classList.add('con-lineas');
    if (opc.rosa !== false) svg.classList.add('con-rosa');
    contenedor.appendChild(svg);

    function sel(q) { return svg.querySelectorAll(q); }

    function punto(e) {
      var pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      var m = svg.getScreenCTM();
      if (!m) return null;
      return pt.matrixTransform(m.inverse());
    }

    // Busca la línea o polo más cercano a una latitud (con tolerancia en grados).
    // (el meridiano es vertical: se mide por longitud; cerca de un polo gana el polo)
    function lineaCercana(lat, lon, tol) {
      var mejor = null, dist = 999;
      D.lineas.forEach(function (l) {
        if (l.tipo === 'polo' && Math.abs(lat - l.lat) <= tol * 1.4) { mejor = l.id; dist = -1; }
      });
      if (dist < 0) return mejor;
      D.lineas.forEach(function (l) {
        if (l.tipo !== 'linea') return;
        var d = l.vertical ? Math.abs(lon - (l.lon || 0)) : Math.abs(lat - l.lat);
        if (d <= tol && d < dist) { dist = d; mejor = l.id; }
      });
      return mejor;
    }

    var inicio = null;
    svg.addEventListener('pointerdown', function (e) {
      inicio = { x: e.clientX, y: e.clientY, target: e.target };
    });
    svg.addEventListener('pointercancel', function () { inicio = null; });
    svg.addEventListener('pointerup', function (e) {
      if (!inicio || !opc.alTocar) return;
      var dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
      var objetivo = inicio.target;
      inicio = null;
      if (dx * dx + dy * dy > 30 * 30) return;
      var p = punto(e);
      if (!p) return;
      var info = { lon: p.x / G.ESCALA - 180, lat: 90 - p.y / G.ESCALA };
      info.hemisferio = info.lat >= 0 ? 'hn' : 'hs';
      if (svg.classList.contains('modo-lineas') || svg.classList.contains('modo-explorar-lineas')) {
        var escala = svg.getScreenCTM().a || 0.5;
        // unos 28 px de pantalla, entre 6° y 11°
        var tol = Math.max(6, Math.min(11, 28 / escala / G.ESCALA));
        info.tipo = 'linea';
        info.id = lineaCercana(info.lat, info.lon, tol);
      } else {
        var el = objetivo && objetivo.closest ? objetivo.closest('[data-region]') : null;
        var mar = objetivo && objetivo.closest ? objetivo.closest('[data-mar]') : null;
        if (el) {
          info.id = el.getAttribute('data-region');
          info.tipo = el.classList.contains('oceano') ? 'oceano' : 'continente';
        } else if (mar) {
          info.tipo = 'mar';
          info.id = mar.getAttribute('data-mar');
        } else {
          info.tipo = 'nada';
        }
      }
      opc.alTocar(info);
    });

    var api = {
      svg: svg,
      // Ilumina una zona: continente, océano, línea, polo o hemisferio.
      resaltar: function (id, clase) {
        clase = clase || 'brilla';
        var hecho = false;
        sel('[data-region="' + id + '"]').forEach(function (el) {
          if (el.classList.contains('extra')) return;
          el.classList.add(clase);
          // al frente para que el borde se vea completo
          if (!el.classList.contains('marcador')) el.parentNode.appendChild(el);
          hecho = true;
        });
        sel('[data-linea="' + id + '"]').forEach(function (el) { el.classList.add(clase); hecho = true; });
        sel('[data-hemi="' + id + '"]').forEach(function (el) { el.classList.add(clase); hecho = true; });
        sel('[data-anillo="' + id + '"]').forEach(function (el) { el.classList.add('visible', clase); });
        if (infoLinea(id) && infoLinea(id).tipo !== 'hemisferio') svg.classList.add('con-lineas');
        return hecho;
      },
      // fija = la etiqueta no se borra con limpiar()
      etiqueta: function (id, fija) {
        sel('[data-etq="' + id + '"]').forEach(function (el) {
          el.classList.add('visible');
          if (fija) el.classList.add('etq-fija');
        });
        if (fija) sel('[data-anillo="' + id + '"]').forEach(function (el) { el.classList.add('visible', 'etq-fija'); });
      },
      etiquetas: function (ids) { ids.forEach(function (id) { api.etiqueta(id); }); },
      // Muestra un texto cualquiera en el lugar del nombre (para el "mapa tramposo").
      etiquetaTexto: function (id, texto, clase) {
        sel('[data-etq="' + id + '"]').forEach(function (el) {
          var t = el.tagName.toLowerCase() === 'text' ? el : el.querySelector('text');
          if (t) t.textContent = texto;
          el.classList.add('visible', 'etq-fija');
          el.classList.remove('etq-bien', 'etq-mal');
          if (clase) el.classList.add(clase);
        });
      },
      limpiar: function () {
        ['brilla', 'correcto', 'equivocado', 'visible'].forEach(function (c) {
          sel('.' + c).forEach(function (el) {
            if (el.classList.contains('etq-fija')) return;
            el.classList.remove(c);
          });
        });
      },
      foco: function (activo) { svg.classList.toggle('foco', !!activo); },
      clase: function (c, activo) { svg.classList.toggle(c, activo !== false); },
      marcarChile: function () { svg.classList.add('ver-chile'); }
    };
    return api;
  }

  function nombreDe(id) {
    var r = infoContinente(id) || infoOceano(id) || infoLinea(id);
    return r ? r.nombre : '';
  }
  function infoDe(id) {
    var r = infoContinente(id) || infoOceano(id) || infoLinea(id);
    return r ? r.info : '';
  }

  global.Mapa = {
    crear: crear,
    rosa: rosa,
    rosaConLetras: rosaConLetras,
    nombreDe: nombreDe,
    infoDe: infoDe,
    infoLinea: infoLinea,
    infoContinente: infoContinente,
    infoOceano: infoOceano
  };
})(window);
