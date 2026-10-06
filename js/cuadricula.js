/* =====================================================================
   Cuadrícula con letras y números + rosa de los vientos
   ===================================================================== */
(function (global) {
  'use strict';

  var D = global.DATOS;

  function rosaHTML() {
    return '<svg class="rosa-svg" viewBox="0 0 200 200" aria-label="Rosa de los vientos">' +
      global.Mapa.rosaConLetras(100, 104, 92) + '</svg>';
  }

  function crear(contenedor, opc) {
    opc = opc || {};
    var C = D.cuadricula;
    var porCelda = {};
    C.lugares.forEach(function (l) { porCelda[l.celda] = l; });

    var envoltura = document.createElement('div');
    envoltura.className = 'cuad-envoltura';
    var h = '<div class="cuad" style="--cols:' + C.columnas.length + '">';
    h += '<div class="cuad-esquina"></div>';
    C.columnas.forEach(function (L) { h += '<div class="cuad-cab cuad-col" data-col="' + L + '">' + L + '</div>'; });
    for (var f = 1; f <= C.filas; f++) {
      h += '<div class="cuad-cab cuad-fila" data-fila="' + f + '">' + f + '</div>';
      C.columnas.forEach(function (L) {
        var id = L + f;
        var lugar = porCelda[id];
        h += '<button type="button" class="celda" data-celda="' + id + '" data-col="' + L + '" data-fila="' + f + '" aria-label="Casilla ' + id + (lugar ? ': ' + lugar.etiqueta : '') + '">';
        if (lugar) h += '<span class="celda-emoji">' + lugar.emoji + '</span><span class="celda-nombre">' + lugar.etiqueta + '</span>';
        h += '</button>';
      });
    }
    h += '</div>';
    h += '<div class="cuad-rosa">' + rosaHTML() + '</div>';
    envoltura.innerHTML = h;
    contenedor.appendChild(envoltura);

    var grid = envoltura.querySelector('.cuad');

    // Ajusta el tamaño de las casillas al espacio disponible.
    function ajustar() {
      var W = contenedor.clientWidth, H = contenedor.clientHeight;
      if (!W || !H) return;
      // La rosa de los vientos va siempre a la derecha de la cuadrícula.
      var rosaTam = Math.round(Math.max(88, Math.min(160, W * 0.17, H * 0.42)));
      var cabeza = 34;
      var anchoDisp = W - cabeza - 12 - rosaTam - 18;
      var altoDisp = H - cabeza - 10;
      var celda = Math.floor(Math.min(anchoDisp / C.columnas.length, altoDisp / C.filas));
      celda = Math.max(54, Math.min(118, celda));
      envoltura.style.setProperty('--celda', celda + 'px');
      envoltura.style.setProperty('--rosa', rosaTam + 'px');
    }
    ajustar();
    var ro = null;
    if (global.ResizeObserver) {
      ro = new ResizeObserver(ajustar);
      ro.observe(contenedor);
    } else {
      global.addEventListener('resize', ajustar);
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.celda') : null;
      if (!b || !opc.alTocar) return;
      var id = b.getAttribute('data-celda');
      opc.alTocar(id, porCelda[id] || null);
    });

    function marcar(ids, clase) {
      (ids || []).forEach(function (id) {
        var el = grid.querySelector('[data-celda="' + id + '"]');
        if (el) el.classList.add(clase);
      });
    }

    return {
      marcar: marcar,
      camino: function (ids) {
        (ids || []).forEach(function (id, i) {
          var el = grid.querySelector('[data-celda="' + id + '"]');
          if (!el) return;
          el.classList.add('camino');
          var n = document.createElement('span');
          n.className = 'paso';
          n.textContent = i + 1;
          el.appendChild(n);
        });
      },
      columna: function (L) {
        grid.querySelectorAll('[data-col="' + L + '"]').forEach(function (el) { el.classList.add('guia'); });
      },
      fila: function (n) {
        grid.querySelectorAll('[data-fila="' + n + '"]').forEach(function (el) { el.classList.add('guia'); });
      },
      limpiar: function () {
        grid.querySelectorAll('.correcto,.equivocado,.inicio,.guia,.camino,.elegida').forEach(function (el) {
          el.classList.remove('correcto', 'equivocado', 'inicio', 'guia', 'camino', 'elegida');
        });
        grid.querySelectorAll('.paso').forEach(function (el) { el.remove(); });
      },
      lugar: function (id) { return porCelda[id] || null; },
      destruir: function () { if (ro) ro.disconnect(); else global.removeEventListener('resize', ajustar); }
    };
  }

  global.Cuadricula = { crear: crear, rosaHTML: rosaHTML };
})(window);
