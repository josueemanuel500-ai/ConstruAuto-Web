/* ============================================================
   RETO CONSTRUAUTO — mini juego Modern Pixel Art (<ca-game>)
   9 niveles por la península de Yucatán:
   1 Selva Maya · 2 Izamal · 3 Cenote · 4 Tulum · 5 Campeche
   6 Las Coloradas · 7 Mérida · 8 Chetumal · 9 Bacalar
   Arte: hojas de diseño "diseño de juego" (fondos limpios,
   pisos/plataformas texturizados, decoración, llave pixel).
   Animación ambiental: palmeras (viento), nubes, destellos de
   agua. Enemigos con comportamientos propios + pisotón/daño.
   ============================================================ */
(function () {
  if (window.customElements && customElements.get('ca-game')) return;

  var TILE = 16, VW = 480, VH = 256;
  var PW = 13, PH = 18;
  var LOW = !!(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  /* ============================================================
     DIFICULTAD (1..10). 8 = enemigos rápidos y agresivos.
     DSP escala velocidad; DCD acorta pausas de ataque; DRG amplía
     el alcance con que detectan al jugador.
     ============================================================ */
  var DIFF = 8;
  var DSP = 0.9 + DIFF * 0.05;    /* 8 → 1.30 (velocidad) */
  var DCD = 1.25 - DIFF * 0.075;  /* 8 → 0.65 (menos espera) */
  var DRG = 0.75 + DIFF * 0.06;   /* 8 → 1.23 (más alcance) */

  /* ============================================================
     CONFIG — valores ajustables (velocidad, gravedad, salto,
     tiempos de animación y volumen). Un solo lugar para afinar.
     ============================================================ */
  var CFG = {
    player: {
      acc: 0.34,        /* aceleración horizontal */
      maxSpeed: 2.3,    /* velocidad máxima */
      frictionG: 0.68,  /* frenado en suelo (menor = frena más rápido) */
      frictionA: 0.9,   /* frenado en aire */
      jump1: 7.0,       /* impulso 1er salto */
      jump2: 5.9,       /* impulso 2do salto (más corto) */
      gravityUp: 0.38,  /* gravedad subiendo */
      gravityDown: 0.5, /* gravedad cayendo */
      maxFall: 7.5,     /* velocidad terminal */
      coyote: 7,        /* frames de coyote time */
      buffer: 7         /* frames de jump buffer */
    },
    anim: {
      runFrame: 6,      /* frames por paso al correr */
      signDelay: 180,   /* 3 s quieto → letrero "ConstruAuto" */
      signDur: 110,     /* duración del letrero (~1.8 s) */
      landDur: 9        /* duración pose de aterrizaje */
    },
    audio: { volume: 1 } /* volumen maestro 0..1 */
  };

  /* ============================================================
     SONG — loop chiptune de 8 compases (lead square + bajo
     triangle). Notas: [paso(corchea), midi, dur en pasos, canal]
     ============================================================ */
  var SONG = (function () {
    var roots = [48, 43, 45, 41, 48, 43, 41, 43];  /* C G Am F · C G F G */
    var mel = [
      72, 76, 79, 76,  74, 71, 74, 79,
      76, 81, 79, 76,  77, 81, 77, 74,
      72, 76, 79, 84,  83, 79, 74, 79,
      81, 77, 76, 74,  74, 71, 74, 76
    ];
    var notes = [];
    for (var b = 0; b < 8; b++) {
      var r = roots[b];
      notes.push([b * 8, r, 2, 1], [b * 8 + 2, r, 1, 1], [b * 8 + 4, r + 7, 2, 1], [b * 8 + 6, r, 1, 1]);
      for (var q = 0; q < 4; q++) notes.push([b * 8 + q * 2, mel[b * 4 + q], 2, 0]);
    }
    return { bpm: 118, len: 64, notes: notes };
  })();

  /* ---------- Mapas (tiles de 16px, 16 filas) ----------
     # muro   = plataforma  K llave  P inicio  G meta  A auto
     E enemigo terrestre    F enemigo especial (vuela/cae/cuelga) */
  var LEVELS = [
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '         K             K                     K',
      '',
      '        ====          ====                  ====',
      '',
      '  P     F                 E                   E        G',
      '################   #################   ###################',
      '################   #################   ###################'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '                                        F',
      '',
      '                K                                   K',
      '',
      '        K     =====                K              =====',
      '',
      '      =====             =====    =====',
      '  P                           E                E             G',
      '##################   ####################   ####################',
      '##################   ####################   ####################'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '             K                 K                 K',
      '                              F                  F',
      '            ====              ====              ====',
      '                                                          K',
      '  P                   E                   E               E    G',
      '############    ##############    ##############    ##############',
      '############    ##############    ##############    ##############'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '                   K    K',
      '                      F',
      '                  ========   K',
      '                               F',
      '            ====            ====',
      '                      K                          K',
      '      ====',
      '                    =====                      =====',
      '  P                                E                        E    G',
      '####################     ######################     ####################',
      '####################     ######################     ####################'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '                      K                      K',
      '               K                   K                    K',
      '            F                        ====                ====',
      '              ====                ====          F',
      '',
      '  P               E              E                        E         G',
      '##############    ################    ################    ##################',
      '##############    ################    ################    ##################'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '                       K                        K',
      '               K              F                                K',
      '                      ====                     ====',
      '              ====                 ====                       ====',
      '                                             F',
      '  P                 E                    E                      E       G',
      '##############    ################    ################    ##################',
      '##############    ################    ################    ##################'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '                     K                          K',
      '              K                    F                        K',
      '                     ====                      ====',
      '             ====                  ====                      ====',
      '                                            F',
      '  P                E                     E                     E       G',
      '##############    ################    ################    ##################',
      '##############    ################    ################    ##################'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '                    K                        K                  K',
      '             K                   F                      K',
      '                    ====                     ====',
      '            ====                  ====                       ====',
      '                                           F',
      '  P               E                   E                   E           G',
      '##############    ################    ################    ##################',
      '##############    ################    ################    ##################'
    ],
    [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '                   K                        K                   K',
      '            K         F                                  K',
      '                   ====                     ====',
      '           =====                 =====                       =====',
      '',
      '  P               E                   E     F             E           G',
      '##############    ################    ################    ##################',
      '##############    ################    ################    ##################'
    ]
  ];

  var LEVELCFG = [
    { name: 'SELVA MAYA · YUCATAN', bg: 1, A: 'iguana', B: 'serpiente', dec: 1 },
    { name: 'IZAMAL · YUCATAN', bg: 2, A: 'alux', B: 'cuervo', dec: 1, notile: 1 },
    { name: 'CENOTE · YUCATAN', bg: 3, A: 'rana', B: 'murcielago', dec: 3 },
    { name: 'TULUM · QUINTANA ROO', bg: 4, A: 'coyote', B: 'cangrejorojo', dec: 1 },
    { name: 'CAMPECHE', bg: 5, A: 'bomba', B: 'abeja', dec: 1 },
    { name: 'LAS COLORADAS · YUCATAN', bg: 6, A: 'cocodrilo', B: 'abeja', dec: 6, flamingos: 1 },
    { name: 'MERIDA · YUCATAN', bg: 7, A: 'ogro', B: 'arana', dec: 1, notile: 1, zoom: 1.1 },
    { name: 'CHETUMAL · QUINTANA ROO', bg: 8, A: 'coyote', B: 'abeja', dec: 1, notile: 1, zoom: 1.1 },
    { name: 'BACALAR · QUINTANA ROO', bg: 9, A: 'cocodrilo', B: 'cangrejorojo', dec: 1, notile: 1, zoom: 1.1 }
  ];

  /* comportamiento y tamaño (alto en px) por enemigo */
  var ENDEF = {
    iguana:     { b: 'walk', v: 0.5,  h: 20, pauseEvery: 240, pauseDur: 70 },
    serpiente:  { b: 'walk', v: 0.42, h: 18, lunge: { r: 48, v: 2.1, dur: 16, cd: 180 } },
    alux:       { b: 'walk', v: 0.8,  h: 24, hop: true, pauseEvery: 210, pauseDur: 85, tease: true, chase: { r: 96, v: 1.7 } },
    paloma:     { b: 'bird', v: 0.35, h: 19, range: 66 },
    cuervo:     { b: 'bird', v: 0.35, h: 22, range: 70 },
    rana:       { b: 'hop',  v: 1.3,  h: 17 },
    murcielago: { b: 'fly',  v: 0.028, h: 18, range: 52, bob: 13 },
    cangrejo:   { b: 'walk', v: 0.75, h: 17 },
    coyote:     { b: 'walk', v: 0.85, h: 22, chase: { r: 104, v: 1.8 } },
    coco:       { b: 'fall', v: 0,    h: 16 },
    cangrejorojo: { b: 'walk', v: 0.7, h: 16 },
    barril:     { b: 'walk', v: 1.05, h: 21, roll: true },
    bomba:      { b: 'walk', v: 0,    h: 19 },
    arana:      { b: 'pend', v: 0.045, h: 17, drop: 46, dartR: 36 },
    abeja:      { b: 'fly',  v: 0.032, h: 18, range: 60, bob: 14 },
    flamingo:     { b: 'bird', v: 0.3,  h: 26, range: 70 },
    cangrejoazul: { b: 'walk', v: 0.85, h: 17 },
    cocodrilo:  { b: 'walk', v: 0.7,  h: 18, chase: { r: 100, v: 1.6 } },
    ogro:       { b: 'walk', v: 0.6,  h: 24, chase: { r: 118, v: 1.55 } }
  };

  /* embestida leve por defecto para enemigos sin patrón de ataque propio:
     igual que la serpiente pero más suave (menos alcance/velocidad, más pausa) */
  var MILDLUNGE = { r: 46, v: 1.35, dur: 13, cd: 190 };

  /* decoración procedimental (tipo, alto en px de juego) */
  var DECSETS = {
    1: [
      { t: 'palm', h: 50 },
      { t: 'bush', h: 15 },
      { t: 'fern', h: 22 },
      { t: 'flower', h: 13 },
      { t: 'palm', h: 42 }
    ],
    3: [
      { t: 'fern', h: 24 },
      { t: 'stela', h: 30 },
      { t: 'bush', h: 15 },
      { t: 'flower', h: 13 }
    ],
    6: [
      { t: 'bush', h: 14 },
      { t: 'flower', h: 13 },
      { t: 'bush', h: 12 },
      { t: 'flower', h: 11 }
    ]
  };

  /* franjas de agua por fondo (y en px de juego) para destellos */
  var WATER = { 1: [213, 224], 3: [172, 222], 4: [162, 218], 6: [140, 172], 7: [120, 198] };

  var PRIZES = [
    { label: '1 mensualidad bonificada', w: 60 },
    { label: '50% de descuento en el interés de 2 mensualidades', w: 27 },
    { label: '3 mensualidades bonificadas', w: 10 },
    { label: '1 año de seguro gratis', w: 3 }
  ];

  var COL = {
    bg1: '#5DB8F0',
    key: '#FFD34D',
    tire: '#10161C', hub: '#9AA5B1',
    car: '#FF690F', win: '#BFE3F5',
    skin: '#F5C9A6', capC: '#FF690F', shirt: '#E4E7EB', pants: '#323F4B',
    text: '#FFFFFF', dim: '#E4E7EB', accent: '#FFD34D', outline: '#10161C'
  };

  /* sprites */
  function ld(src) { var im = new Image(); im.src = src; return im; }
  var SPR = {};
  ['idle', 'run1', 'run2', 'jump', 'peak', 'land', 'victory', 'key'].forEach(function (n) {
    SPR[n] = ld('/assets/sprites/hero-' + n + '.png');
  });
  SPR.logo = ld('/assets/sprites/logo-retro.png');
  /* hoja del personaje propio (Sprite Brew): 6 frames de 74×117, 3×2 */
  /* personaje que camina/corre (Sprite Brew): 6 frames de 74×117, mira a la DERECHA */
  SPR.sheet = ld('/assets/sprites/hero-run.png');
  var SHEET = { fw: 74, fh: 117, frames: [[0, 0], [75, 0], [150, 0], [0, 118], [75, 118], [150, 118]] };
  /* idle: personaje con llave (Sprite Brew): 8 frames de 69×116, mira a la DERECHA */
  SPR.idleSheet = ld('/assets/sprites/hero-key.png');
  var IDLE = { fw: 69, fh: 116, frames: [[0, 0], [70, 0], [140, 0], [0, 117], [70, 117], [140, 117], [0, 234], [70, 234]] };
  /* quieto: respiración (Sprite Brew): 8 frames de 53×116, mira a la DERECHA.
     Entra apenas se detiene; tras unos segundos aparece el letrero + pose con llave */
  SPR.stillSheet = ld('/assets/sprites/hero-still.png');
  var STILL = { fw: 53, fh: 116, frames: [[0, 0], [54, 0], [108, 0], [0, 117], [54, 117], [108, 117], [0, 234], [54, 234]] };
  /* personaje con llave para la cinemática (Sprite Brew): 8 frames de 69×116 */
  SPR.cineKey = ld('/assets/sprites/hero-cine.png');
  var CINEKEY = { fw: 69, fh: 116, frames: [[0, 0], [70, 0], [140, 0], [0, 117], [70, 117], [140, 117], [0, 234], [70, 234]] };
  /* letrero ¡CONTRATA YA! (Sprite Brew): 8 frames de 121×82 */
  SPR.sign = ld('/assets/sprites/sign-contrata.png');
  var SIGN = { fw: 121, fh: 82, frames: [[0, 0], [122, 0], [244, 0], [0, 83], [122, 83], [244, 83], [0, 166], [122, 166]] };
  /* bomba/trampa (Sprite Brew): 8 frames de 96×115 */
  SPR.bomba = ld('/assets/sprites/bomba-run.png');
  var BOMBA = { fw: 96, fh: 115, frames: [[0, 0], [97, 0], [194, 0], [0, 116], [97, 116], [194, 116], [0, 232], [97, 232]] };
  /* abeja (Sprite Brew): 8 frames de 115×97, mira a la IZQUIERDA */
  SPR.abeja = ld('/assets/sprites/abeja-run.png');
  var ABEJA = { fw: 115, fh: 97, frames: [[0, 0], [116, 0], [232, 0], [0, 98], [116, 98], [232, 98], [0, 196], [116, 196]] };
  /* cocodrilo (Sprite Brew): 8 frames de 117×41, mira a la IZQUIERDA */
  SPR.cocodrilo = ld('/assets/sprites/cocodrilo-run.png');
  var COCO = { fw: 117, fh: 41, frames: [[0, 0], [118, 0], [236, 0], [0, 42], [118, 42], [236, 42], [0, 84], [118, 84]] };
  /* ogro (Sprite Brew): 8 frames de 117×119, mira a la IZQUIERDA */
  SPR.ogro = ld('/assets/sprites/ogro-run.png');
  var OGRO = { fw: 117, fh: 119, frames: [[0, 0], [118, 0], [236, 0], [0, 120], [118, 120], [236, 120], [0, 240], [118, 240]] };
  /* llave animada (Sprite Brew): 8 frames de 116×117 */
  SPR.llaveAnim = ld('/assets/sprites/llave-run.png');
  var KEY = { fw: 116, fh: 117, frames: [[0, 0], [117, 0], [234, 0], [0, 118], [117, 118], [234, 118], [0, 236], [117, 236]] };
  /* nubes (Sprite Brew): 8 frames de 115×37 */
  SPR.nube = ld('/assets/sprites/nube-run.png');
  var NUBE = { fw: 115, fh: 37, frames: [[0, 0], [116, 0], [232, 0], [0, 38], [116, 38], [232, 38], [0, 76], [116, 76]] };
  /* nube esponjosa 2 (Sprite Brew): 8 frames de 115×64 */
  SPR.nube2 = ld('/assets/sprites/nube2-run.png');
  var NUBE2 = { fw: 115, fh: 64, frames: [[0, 0], [116, 0], [232, 0], [0, 65], [116, 65], [232, 65], [0, 130], [116, 130]] };
  /* flamencos voladores (Sprite Brew): 8 frames de 116×108 en tira horizontal */
  SPR.flamenco = ld('/assets/sprites/flamenco.png');
  var FLAM = { fw: 116, fh: 108, n: 8 };
  /* oficina ConstruAuto (meta) y pinchos (trampa fija) */
  SPR.oficina = ld('/assets/levels/oficina.png');
  SPR.pinchos = ld('/assets/levels/pinchos.png');
  /* arbusto (decoración en los bordes de los abismos; el hueco sigue siendo trampa) */
  SPR.arbusto = ld('/assets/levels/arbusto.png');
  /* pinchos por nivel: columnas de tile sobre suelo sólido (la fila se calcula sola) */
  var SPIKES = {};
  /* auto del final (Sprite Brew): 8 frames de 115×34, mira a la IZQUIERDA */
  SPR.auto = ld('/assets/sprites/auto-run.png');
  var AUTO = { fw: 115, fh: 34, frames: [[0, 0], [116, 0], [232, 0], [0, 35], [116, 35], [232, 35], [0, 70], [116, 70]] };
  /* ===== CINEMÁTICA FINAL ===== paisaje + Claudina + auto que llega */
  SPR.paisaje = ld('/assets/levels/cinematica.png');
  /* Claudina saludando (Sprite Brew): 8 frames de 52×117, vista frontal */
  SPR.claudina = ld('/assets/sprites/claudina-idle.png');
  var CLAUD = { fw: 52, fh: 117, frames: [[0, 0], [53, 0], [106, 0], [0, 118], [53, 118], [106, 118], [0, 236], [53, 236]] };
  /* Claudina celebrando (Sprite Brew): 8 frames de 51×117, vista frontal */
  SPR.claudCel = ld('/assets/sprites/claudina-celebra.png');
  var CLAUDC = { fw: 51, fh: 117, frames: [[0, 0], [52, 0], [104, 0], [0, 118], [52, 118], [104, 118], [0, 236], [52, 236]] };
  /* auto de la cinemática (Sprite Brew): 8 frames de 115×48, mira a la IZQUIERDA */
  SPR.autoCine = ld('/assets/sprites/auto-cine.png');
  var AUTOC = { fw: 115, fh: 48, frames: [[0, 0], [116, 0], [232, 0], [0, 49], [116, 49], [232, 49], [0, 98], [116, 98]] };
  /* explosión (Sprite Brew): 9 frames de 124×125, 3×3 */
  SPR.explosion = ld('/assets/sprites/explosion.png');
  var EXPL = { fw: 124, fh: 125, frames: [[0, 0], [125, 0], [250, 0], [0, 126], [125, 126], [250, 126], [0, 252], [125, 252], [250, 252]] };
  var CONFCOL = ['#FF690F', '#FFD34D', '#4A8FD8', '#57B36A', '#FF5A5A', '#FFFFFF'];
  /* serpiente propia (Sprite Brew): 8 frames de 115×41, mira a la IZQUIERDA */
  SPR.snake = ld('/assets/sprites/snake-run.png');
  var SNAKE = { fw: 115, fh: 41, frames: [[0, 0], [116, 0], [232, 0], [0, 42], [116, 42], [232, 42], [0, 84], [116, 84]] };
  /* iguana propia (Sprite Brew): 8 frames de 118×52, mira a la IZQUIERDA */
  SPR.iguana = ld('/assets/sprites/iguana-run.png');
  var IGUANA = { fw: 118, fh: 52, frames: [[0, 0], [119, 0], [238, 0], [0, 53], [119, 53], [238, 53], [0, 106], [119, 106]] };
  /* alux propio (Sprite Brew): 8 frames de 66×116, vista frontal */
  SPR.alux = ld('/assets/sprites/alux-run.png');
  var ALUX = { fw: 66, fh: 116, frames: [[0, 0], [67, 0], [134, 0], [0, 117], [67, 117], [134, 117], [0, 234], [67, 234]] };
  /* cuervo propio (Sprite Brew): 8 frames de 116×100, mira a la IZQUIERDA */
  SPR.cuervo = ld('/assets/sprites/cuervo-run.png');
  var CUERVO = { fw: 116, fh: 100, frames: [[0, 0], [117, 0], [234, 0], [0, 101], [117, 101], [234, 101], [0, 202], [117, 202]] };
  /* rana propia (Sprite Brew): 8 frames de 116×100, mira a la IZQUIERDA */
  SPR.rana = ld('/assets/sprites/rana-run.png');
  var RANA = { fw: 116, fh: 100, frames: [[0, 0], [117, 0], [234, 0], [0, 101], [117, 101], [234, 101], [0, 202], [117, 202]] };
  /* murciélago propio (Sprite Brew): 8 frames de 118×61, mira a la IZQUIERDA */
  SPR.murcielago = ld('/assets/sprites/murcielago-run.png');
  var BAT = { fw: 118, fh: 61, frames: [[0, 0], [119, 0], [238, 0], [0, 62], [119, 62], [238, 62], [0, 124], [119, 124]] };
  /* coyote propio (Sprite Brew): 8 frames de 128×128, mira a la IZQUIERDA */
  SPR.coyote = ld('/assets/sprites/coyote-run.png');
  var COYOTE = { fw: 128, fh: 128, frames: [[0, 0], [129, 0], [258, 0], [0, 129], [129, 129], [258, 129], [0, 258], [129, 258]] };
  /* cangrejo rojo propio (Sprite Brew): 8 frames de 114×60, mira a la IZQUIERDA */
  SPR.cangrejorojo = ld('/assets/sprites/cangrejorojo-run.png');
  var CRAB = { fw: 114, fh: 60, frames: [[0, 0], [115, 0], [230, 0], [0, 61], [115, 61], [230, 61], [0, 122], [115, 122]] };
  /* araña propia (Sprite Brew): 8 frames de 115×80, vista superior (cuelga) */
  SPR.arana = ld('/assets/sprites/arana-run.png');
  var ARANA = { fw: 115, fh: 80, frames: [[0, 0], [116, 0], [232, 0], [0, 81], [116, 81], [232, 81], [0, 162], [116, 162]] };
  SPR.llave = ld('/assets/sprites/llaves-hud.png');
  /* ============================================================
     Sprites de enemigos: modern pixel art por frames, dibujados
     como objetos del juego — no imágenes recortadas.
     ============================================================ */
  var PIX = {
    iguana: {
      pal: { o: '#1E4426', G: '#4FA35C', g: '#8ED07F', e: '#FFE066', l: '#2F6B3A' },
      f: [[
        '................',
        '...........oo...',
        '..........oGGo..',
        'oo.......oGGGGo.',
        'oGoo...ooGGGGGe.',
        '.oGGo.oGGGGGGGo.',
        '..oGGoGGGGGGGo..',
        '...oGgGGggGGo...',
        '....ll...ll.....',
        '...ll.....ll....'
      ], [
        '............o...',
        '...........oo...',
        '..........oGGo..',
        'oo.......oGGGGo.',
        '.oGo...ooGGGGGe.',
        '..oGGo.oGGGGGGo.',
        '..oGGoGGGGGGGo..',
        '...oGgGGggGGo...',
        '.....ll.ll......',
        '....ll...ll.....'
      ]]
    },
    serpiente: {
      pal: { S: '#7FBF45', s: '#4E8A26', e: '#FFDD55', r: '#E04848' },
      f: [[
        '.............ss.',
        '............sSSe',
        '............sSSr',
        '..sss......sSs..',
        '.sSSSs...ssSs...',
        'sSs.sSs.sSSs....',
        'Ss...sSSSs......',
        's...............'
      ], [
        '.............ss.',
        '............sSSe',
        '............sSS.',
        '.sss.......sSs..',
        'sSSSs...ssSs....',
        's..sSs.sSSs.....',
        '....sSSSs.......',
        '................'
      ]]
    },
    alux: {
      pal: { h: '#3A2415', k: '#C07A45', e: '#151515', w: '#F2E6D0', o: '#FF690F' },
      f: [[
        '..hhhh....',
        '.hhkkkh...',
        '.hkekek...',
        '..kkkk....',
        '.kwwwwk...',
        '..wwww....',
        '..woow....',
        '..k..k....',
        '..k...k...',
        '.kk...kk..',
        '..........'
      ], [
        '..hhhh....',
        '.hhkkkh...',
        '.hkekek...',
        '..kkkk....',
        '.kwwwwk...',
        '..wwww....',
        '..woow....',
        '..k..k....',
        '...k..k...',
        '..kk..kk..',
        '..........'
      ], [
        'k.hhhh...k',
        'k.hkkkh..k',
        '.khkekekk.',
        '..kkkkk...',
        '..wwww....',
        '..wwww....',
        '..woow....',
        '..k..k....',
        '..k..k....',
        '.kk..kk...',
        '..........'
      ]]
    },
    paloma: {
      pal: { p: '#B9C4CE', P: '#7E8B98', e: '#20262C', o: '#F2A03D' },
      f: [[
        '............',
        '......ppp...',
        '.....pppppe.',
        '.....ppppo..',
        '..ppppppp...',
        '.pPPPPppp...',
        '.ppPPPpp....',
        '..pppppp....',
        '....o..o....'
      ], [
        '............',
        '......ppp...',
        '.....pppppe.',
        '.....ppppo..',
        '..ppppppp...',
        '.pPPPPppp...',
        '.ppPPPpp....',
        '..pppppp....',
        '...o...o....'
      ], [
        '..PPPP......',
        '.pppppp.....',
        '.....pppppe.',
        '.....ppppo..',
        '..ppppppp...',
        '..pppppp....',
        '...ppppp....',
        '....pppp....',
        '............'
      ], [
        '............',
        '......ppp...',
        '.....pppppe.',
        '.....ppppo..',
        '..ppppppp...',
        '.pPPPPppp...',
        '..PPPPpp....',
        '...PPpp.....',
        '............'
      ]]
    },
    murcielago: {
      pal: { m: '#5B4A8A', w: '#7A67B5', e: '#FFD34D' },
      f: [[
        'ww..........ww',
        'www........www',
        '.wwm..mm..mww.',
        '..wmmmmmmmmw..',
        '....memmem....',
        '....mmmmmm....',
        '.....m..m.....',
        '..............'
      ], [
        '..............',
        '..............',
        '...m..mm..m...',
        '..wmmmmmmmmw..',
        '.wwwmemmemwww.',
        'ww..mmmmmm..ww',
        '.....m..m.....',
        '..............'
      ]]
    },
    rana: {
      pal: { F: '#5DBF4A', f: '#3D8A30', e: '#FFE066', b: '#E8F5C9' },
      f: [[
        '..........',
        '.ff....ff.',
        '.fefFFfef.',
        '.FFFFFFFF.',
        '.FbbbbbbF.',
        '.FFbbbbFF.',
        '.ff....ff.',
        'ff......ff'
      ], [
        '.ff....ff.',
        '.fefFFfef.',
        '.FFFFFFFF.',
        '.FbbbbbbF.',
        '..FFFFFF..',
        '..f....f..',
        '.f......f.',
        'f........f'
      ]]
    },
    cangrejo: {
      pal: { C: '#E05A3A', c: '#B03A20', e: '#20262C' },
      f: [[
        '.cc........cc.',
        'cc..........cc',
        'c..e......e..c',
        '..cCCCCCCCCc..',
        '.cCCCCCCCCCCc.',
        '.cCCCCCCCCCCc.',
        '..cCCCCCCCCc..',
        '..c..c..c..c..',
        '.c..c....c..c.'
      ], [
        '.cc........cc.',
        'cc..........cc',
        'c..e......e..c',
        '..cCCCCCCCCc..',
        '.cCCCCCCCCCCc.',
        '.cCCCCCCCCCCc.',
        '..cCCCCCCCCc..',
        '.c..c....c..c.',
        '..c..c..c..c..'
      ]]
    },
    coco: {
      pal: { n: '#6E4A2A', N: '#4A2E16', d: '#2E1B0C' },
      f: [[
        '..nnn..',
        '.nnnnn.',
        'nnNdNnn',
        'nnnNnnn',
        'nnnnnnn',
        '.nnnnn.',
        '..nnn..'
      ]]
    },
    barril: {
      pal: { B: '#B5773A', b: '#8A5424', i: '#6E7A87' },
      f: [[
        '..BBBBBB..',
        '.iiiiiiii.',
        'BBbBBBBbBB',
        'BbBBBBbBBB',
        'iiiiiiiiii',
        'BBbBBBBbBB',
        'BbBBBBbBBB',
        '.iiiiiiii.',
        '..BBBBBB..'
      ], [
        '..BBBBBB..',
        '.iiiiiiii.',
        'BbBBBBbBBB',
        'BBBbBBBBbB',
        'iiiiiiiiii',
        'BbBBBBbBBB',
        'BBBbBBBBbB',
        '.iiiiiiii.',
        '..BBBBBB..'
      ]]
    },
    arana: {
      pal: { A: '#2E2438', a: '#4A3A5C', e: '#E04848' },
      f: [[
        'a..a....a..a',
        '.a..a..a..a.',
        '..a.aAAa.a..',
        '...AAAAAA...',
        '..AAeAAeAA..',
        '...AAAAAA...',
        '..a.a..a.a..',
        '.a..a..a..a.',
        'a..a....a..a'
      ], [
        '.a..a..a..a.',
        'a..a....a..a',
        '..a.aAAa.a..',
        '...AAAAAA...',
        '..AAeAAeAA..',
        '...AAAAAA...',
        '.a..a..a..a.',
        'a..a....a..a',
        '.a..a..a.a..'
      ]]
    }
  };
  Object.keys(PIX).forEach(function (k) {
    var p = PIX[k];
    p.rows = p.f[0].length; p.w = 0;
    p.f.forEach(function (fr) { fr.forEach(function (row) { if (row.length > p.w) p.w = row.length; }); });
  });
  /* proporciones de caja para enemigos dibujados solo en vector (EDRAW) */
  PIX.flamingo = { w: 20, rows: 26 };
  PIX.cangrejoazul = { w: 26, rows: 17 };

  /* dibuja un sprite de pixel-art a tamaño w×h, opcionalmente volteado */
  function drawPix(c, def, fi, dx, dy, w, h, flip) {
    var rows = def.f[fi] || def.f[0];
    var nr = rows.length, nc = def.w;
    var sw = w / nc, sh = h / nr;
    for (var r = 0; r < nr; r++) {
      var row = rows[r];
      for (var i = 0; i < row.length; i++) {
        var ch = row[i];
        if (ch === '.') continue;
        var col = def.pal[ch];
        if (!col) continue;
        var cc = flip ? nc - 1 - i : i;
        var x0 = Math.round(dx + cc * sw), x1 = Math.round(dx + (cc + 1) * sw);
        var y0 = Math.round(dy + r * sh), y1 = Math.round(dy + (r + 1) * sh);
        c.fillStyle = col;
        c.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
      }
    }
  }

  /* dibuja una imagen suavizada (alta calidad), opcionalmente volteada */
  function drawSm(c, img, dx, dy, w, h, flip) {
    c.save();
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    if (flip) { c.translate(dx + w, dy); c.scale(-1, 1); c.drawImage(img, 0, 0, w, h); }
    else c.drawImage(img, dx, dy, w, h);
    c.restore();
  }

  /* ============================================================
     EDRAW — enemigos vectoriales articulados (calidad 32-bit).
     Cada función dibuja mirando a la DERECHA, con el suelo en y=0
     y el cuerpo dentro de [-w/2, w/2] × [-h, 0].
     Partes animadas con en.t: patas, colas, bocas, alas, tenazas.
     ============================================================ */
  function limb(c, col, wdt, x0, y0, x1, y1, x2, y2) {
    c.strokeStyle = col; c.lineWidth = wdt; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
  }
  function blob(c, col, x, y, rx, ry, rot) {
    c.fillStyle = col;
    c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, 6.2832); c.fill();
  }
  function grad(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }
  var EDRAW = {
    iguana: function (c, en, w, h) {
      var t = en.t, walking = en.mode !== 1;
      var lp = walking ? Math.sin(t * 0.35) : 0;                 /* ciclo de patas */
      var tw = Math.sin(t * 0.11) * h * 0.10;                    /* vaivén de cola */
      var by = -h * 0.40;
      /* cola en dos tramos, ondeando */
      limb(c, '#3E8A4C', h * 0.18, -w * 0.16, by + h * 0.06, -w * 0.34, by + tw * 0.5, -w * 0.44, by - h * 0.12 + tw);
      limb(c, '#2F6B3A', h * 0.09, -w * 0.42, by - h * 0.10 + tw, -w * 0.50, by - h * 0.26 + tw * 1.6, -w * 0.50, by - h * 0.40 + tw * 2);
      /* patas traseras (lado lejano más oscuro) */
      limb(c, '#2F6B3A', h * 0.14, -w * 0.10, by, -w * 0.12, -h * 0.16, -w * 0.14 - w * 0.05 * lp, -0.5);
      limb(c, '#2F6B3A', h * 0.14, w * 0.16, by, w * 0.15, -h * 0.16, w * 0.13 + w * 0.05 * lp, -0.5);
      /* cuerpo */
      c.fillStyle = grad(c, 0, by - h * 0.26, 0, 0, [[0, '#8ED07F'], [0.5, '#4FA35C'], [1, '#2F6B3A']]);
      c.beginPath(); c.ellipse(-w * 0.01, by, w * 0.30, h * 0.24, 0.05, 0, 6.2832); c.fill();
      /* cresta de púas */
      c.fillStyle = '#E0763B';
      for (var s = 0; s < 5; s++) {
        var sx = -w * 0.26 + s * w * 0.115, sy = by - h * (0.20 - 0.02 * Math.sin(s * 1.7));
        c.beginPath(); c.moveTo(sx - w * 0.022, sy); c.lineTo(sx + w * 0.022, sy); c.lineTo(sx + w * 0.004, sy - h * 0.15); c.closePath(); c.fill();
      }
      /* patas delanteras (lado cercano) */
      limb(c, '#4FA35C', h * 0.14, -w * 0.04, by + h * 0.06, -w * 0.06, -h * 0.14, -w * 0.05 + w * 0.05 * lp, -0.5);
      limb(c, '#4FA35C', h * 0.14, w * 0.22, by + h * 0.06, w * 0.22, -h * 0.14, w * 0.25 - w * 0.05 * lp, -0.5);
      /* cabeza: bob al caminar, boca que se abre en pausa */
      var hb = walking ? Math.sin(t * 0.35 + 1.6) * h * 0.03 : 0;
      var mo = walking ? 0 : Math.max(0, Math.sin(t * 0.12)) * h * 0.10;   /* boca abierta */
      var hx = w * 0.37, hy = by - h * 0.08 + hb;
      blob(c, '#5FAF6B', hx, hy, w * 0.13, h * 0.15, -0.1);
      /* mandíbula (rota al abrir) */
      c.save(); c.translate(hx + w * 0.01, hy + h * 0.05); c.rotate(mo * 0.06);
      blob(c, '#4FA35C', w * 0.05, h * 0.03, w * 0.09, h * 0.07, 0.1);
      c.restore();
      if (mo > 0.2) { c.fillStyle = '#B03A30'; c.beginPath(); c.moveTo(hx + w * 0.04, hy + h * 0.04); c.lineTo(hx + w * 0.13, hy + h * 0.02); c.lineTo(hx + w * 0.05, hy + h * 0.10 + mo); c.closePath(); c.fill(); }
      /* papada */
      c.fillStyle = '#7FC46F';
      c.beginPath(); c.moveTo(hx - w * 0.06, hy + h * 0.08); c.quadraticCurveTo(hx - w * 0.04, hy + h * 0.26, hx + w * 0.03, hy + h * 0.10); c.closePath(); c.fill();
      /* ojo */
      blob(c, '#FFE066', hx + w * 0.035, hy - h * 0.045, w * 0.030, h * 0.045);
      blob(c, '#10161C', hx + w * 0.045, hy - h * 0.045, w * 0.014, h * 0.024);
    },

    serpiente: function (c, en, w, h) {
      var t = en.t, lunging = en.lg > 0;
      var wv = Math.sin(t * 0.18) * h * 0.06;                    /* ondulación */
      /* cuerpo serpenteante: tres arcos apilados */
      c.strokeStyle = grad(c, 0, -h, 0, 0, [[0, '#8FCC55'], [1, '#4E8A26']]);
      c.lineWidth = h * 0.30; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-w * 0.36, -h * 0.15);
      c.quadraticCurveTo(-w * 0.12, -h * 0.55 - wv, w * 0.05, -h * 0.30 + wv);
      c.quadraticCurveTo(w * 0.18, -h * 0.10, w * 0.26, -h * (lunging ? 0.42 : 0.52) - wv);
      c.stroke();
      /* vientre claro */
      c.strokeStyle = 'rgba(230,244,180,0.55)'; c.lineWidth = h * 0.10;
      c.beginPath();
      c.moveTo(-w * 0.34, -h * 0.10);
      c.quadraticCurveTo(-w * 0.12, -h * 0.48 - wv, w * 0.05, -h * 0.26 + wv);
      c.stroke();
      /* punta de cola */
      limb(c, '#4E8A26', h * 0.10, -w * 0.36, -h * 0.15, -w * 0.46, -h * 0.10 + wv, -w * 0.50, -h * 0.22 + wv * 2);
      /* cabeza */
      var hx = w * 0.28, hy = -h * (lunging ? 0.46 : 0.56) - wv;
      var mo = lunging ? 0.5 : Math.max(0, Math.sin(t * 0.1) - 0.6) * 1.4;  /* boca */
      blob(c, '#6FAF3B', hx, hy, w * 0.14, h * 0.15, 0.15);
      if (mo > 0.05) {
        c.fillStyle = '#7A1F1F';
        c.beginPath(); c.moveTo(hx + w * 0.05, hy - h * 0.02);
        c.lineTo(hx + w * 0.17, hy - h * 0.06 - mo * h * 0.08);
        c.lineTo(hx + w * 0.16, hy + h * 0.06 + mo * h * 0.08);
        c.closePath(); c.fill();
      }
      /* lengua bífida parpadeante */
      var tng = Math.sin(t * 0.5);
      if (tng > 0.2 || lunging) {
        var ln = (lunging ? 1 : tng) * w * 0.12;
        c.strokeStyle = '#E04848'; c.lineWidth = h * 0.035; c.lineCap = 'round';
        c.beginPath(); c.moveTo(hx + w * 0.13, hy + h * 0.01);
        c.lineTo(hx + w * 0.13 + ln, hy);
        c.moveTo(hx + w * 0.13 + ln * 0.8, hy);
        c.lineTo(hx + w * 0.13 + ln, hy - h * 0.05);
        c.moveTo(hx + w * 0.13 + ln * 0.8, hy);
        c.lineTo(hx + w * 0.13 + ln, hy + h * 0.05);
        c.stroke();
      }
      /* ojo */
      blob(c, '#FFDD55', hx + w * 0.03, hy - h * 0.055, w * 0.032, h * 0.045);
      blob(c, '#10161C', hx + w * 0.042, hy - h * 0.055, w * 0.014, h * 0.024);
    },

    alux: function (c, en, w, h) {
      var t = en.t, tease = en.mode === 1;
      var lp = tease ? 0 : Math.sin(t * 0.4);                    /* zancada */
      var arm = tease ? Math.sin(t * 0.33) : lp;                 /* brazos */
      var by = -h * 0.34;                                        /* cadera */
      /* piernas caminando */
      limb(c, '#B06E38', h * 0.11, -w * 0.06, by, -w * 0.08 - w * 0.10 * lp, -h * 0.16, -w * 0.06 - w * 0.16 * lp, -0.5);
      limb(c, '#C07A45', h * 0.11, w * 0.06, by, w * 0.08 + w * 0.10 * lp, -h * 0.16, w * 0.06 + w * 0.16 * lp, -0.5);
      /* taparrabo blanco */
      c.fillStyle = '#F2E6D0';
      c.beginPath(); c.ellipse(0, by, w * 0.15, h * 0.10, 0, 0, 6.2832); c.fill();
      /* torso */
      c.fillStyle = grad(c, 0, -h * 0.62, 0, by, [[0, '#CE8A52'], [1, '#A8653A']]);
      c.beginPath(); c.ellipse(0, -h * 0.48, w * 0.13, h * 0.16, 0, 0, 6.2832); c.fill();
      /* brazo lejano */
      limb(c, '#A8653A', h * 0.09, -w * 0.09, -h * 0.54, -w * 0.16, -h * 0.48, -w * 0.14 - w * 0.06 * arm, -h * 0.36);
      /* cabeza grande con orejas puntiagudas */
      var hy = -h * 0.74 + (tease ? Math.sin(t * 0.28) * h * 0.02 : Math.abs(lp) * h * 0.015);
      blob(c, '#C07A45', 0, hy, w * 0.155, h * 0.145);
      c.fillStyle = '#C07A45';
      c.beginPath(); c.moveTo(-w * 0.14, hy - h * 0.02); c.lineTo(-w * 0.24, hy - h * 0.06); c.lineTo(-w * 0.13, hy + h * 0.045); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(w * 0.14, hy - h * 0.02); c.lineTo(w * 0.24, hy - h * 0.06); c.lineTo(w * 0.13, hy + h * 0.045); c.closePath(); c.fill();
      /* sombrero */
      c.fillStyle = '#F5EFDC';
      c.beginPath(); c.ellipse(0, hy - h * 0.10, w * 0.17, h * 0.045, 0, 0, 6.2832); c.fill();
      c.beginPath(); c.ellipse(0, hy - h * 0.13, w * 0.105, h * 0.07, 0, 3.34, 6.08); c.fill();
      c.fillStyle = '#E4D8BC'; c.fillRect(-w * 0.105, hy - h * 0.135, w * 0.21, h * 0.028);
      /* cara: ojos + boca sonriente que se abre al burlarse */
      blob(c, '#151515', -w * 0.045, hy + h * 0.005, w * 0.020, h * 0.028);
      blob(c, '#151515', w * 0.045, hy + h * 0.005, w * 0.020, h * 0.028);
      var mo = tease ? (0.5 + 0.5 * Math.sin(t * 0.3)) : 0.2;
      c.fillStyle = '#7A2F1F';
      c.beginPath(); c.ellipse(0, hy + h * 0.07, w * 0.05, h * (0.015 + 0.04 * mo), 0, 0, 3.1416); c.fill();
      /* brazo cercano: saluda/burla arriba, o balancea */
      var ay = tease ? -h * 0.78 - Math.abs(Math.sin(t * 0.33)) * h * 0.06 : -h * 0.38;
      limb(c, '#C07A45', h * 0.09, w * 0.10, -h * 0.54, w * 0.19, -h * 0.52, w * (tease ? 0.20 : 0.14 + 0.06 * arm), ay);
    },

    paloma: function (c, en, w, h) {
      var t = en.t, flying = en.phase === 1;
      var flap = flying ? Math.sin(t * 0.55) : 0;                /* aleteo */
      var step = flying ? 0 : Math.sin(t * 0.45);
      var by = -h * 0.42;
      /* patas al caminar / recogidas al volar */
      if (!flying) {
        limb(c, '#F2A03D', h * 0.06, -w * 0.02, by + h * 0.18, -w * 0.02, -h * 0.10, -w * 0.02 - w * 0.06 * step, -0.5);
        limb(c, '#F2A03D', h * 0.06, w * 0.06, by + h * 0.18, w * 0.06, -h * 0.10, w * 0.06 + w * 0.06 * step, -0.5);
      } else {
        limb(c, '#F2A03D', h * 0.05, 0, by + h * 0.16, w * 0.02, by + h * 0.24, -w * 0.03, by + h * 0.26);
      }
      /* cola */
      c.fillStyle = '#7E8B98';
      c.beginPath(); c.moveTo(-w * 0.16, by - h * 0.06);
      c.lineTo(-w * 0.44, by - h * 0.02 + flap * h * 0.05);
      c.lineTo(-w * 0.40, by + h * 0.10 + flap * h * 0.05);
      c.lineTo(-w * 0.12, by + h * 0.08); c.closePath(); c.fill();
      /* cuerpo */
      c.fillStyle = grad(c, 0, by - h * 0.24, 0, by + h * 0.22, [[0, '#C6D0D9'], [0.6, '#9AA7B3'], [1, '#7E8B98']]);
      c.beginPath(); c.ellipse(-w * 0.02, by, w * 0.26, h * 0.22, -0.12, 0, 6.2832); c.fill();
      /* ala: plegada (tapa) o batiendo */
      c.save();
      c.translate(-w * 0.02, by - h * 0.06);
      c.rotate(flying ? -flap * 0.9 : 0.12);
      c.fillStyle = grad(c, 0, -h * 0.3, 0, h * 0.1, [[0, '#8B98A5'], [1, '#5F6C78']]);
      c.beginPath();
      c.moveTo(w * 0.10, 0);
      c.quadraticCurveTo(-w * 0.10, flying ? -h * 0.34 : -h * 0.04, -w * (flying ? 0.26 : 0.30), flying ? -h * 0.34 : h * 0.06);
      c.quadraticCurveTo(-w * 0.10, flying ? -h * 0.10 : h * 0.12, w * 0.06, h * 0.08);
      c.closePath(); c.fill();
      c.restore();
      /* cabeza con bob de paloma */
      var hb = flying ? 0 : Math.sin(t * 0.45 + 1.2) * w * 0.03;
      var hx = w * 0.24 + hb, hy = by - h * 0.26;
      /* cuello tornasol */
      blob(c, '#6BA08A', w * 0.16 + hb * 0.6, by - h * 0.14, w * 0.09, h * 0.10, 0.3);
      blob(c, '#B9C4CE', hx, hy, w * 0.105, h * 0.115);
      /* pico + ojo */
      c.fillStyle = '#F2A03D';
      c.beginPath(); c.moveTo(hx + w * 0.08, hy - h * 0.01); c.lineTo(hx + w * 0.17, hy + h * 0.012); c.lineTo(hx + w * 0.08, hy + h * 0.04); c.closePath(); c.fill();
      blob(c, '#20262C', hx + w * 0.025, hy - h * 0.02, w * 0.020, h * 0.026);
      blob(c, '#FFFFFF', hx + w * 0.032, hy - h * 0.028, w * 0.007, h * 0.009);
    },

    flamingo: function (c, en, w, h) {
      var t = en.t, flying = en.phase === 1;
      var flap = flying ? Math.sin(t * 0.5) : 0;
      var by = -h * 0.60;
      /* patas largas y delgadas: una plantada, otra recogida */
      if (!flying) {
        var step = Math.sin(t * 0.22);
        limb(c, '#E8709E', h * 0.026, -w * 0.04, by + h * 0.10, -w * 0.02, -h * 0.26, -w * 0.04 + w * 0.05 * step, -0.5);
        var fold = 0.55 + 0.45 * Math.sin(t * 0.045);
        limb(c, '#D95585', h * 0.026, w * 0.08, by + h * 0.10, w * 0.20, by + h * 0.28, w * 0.06, by + h * (0.28 + 0.15 * fold));
      } else {
        limb(c, '#E8709E', h * 0.024, -w * 0.02, by + h * 0.10, -w * 0.22, by + h * 0.18, -w * 0.40, by + h * 0.22);
      }
      /* cola de plumas */
      c.fillStyle = '#D95585';
      c.beginPath(); c.moveTo(-w * 0.18, by - h * 0.05);
      c.lineTo(-w * 0.48, by - h * 0.11 + flap * h * 0.03);
      c.lineTo(-w * 0.38, by + h * 0.05); c.closePath(); c.fill();
      /* cuerpo */
      c.fillStyle = grad(c, 0, by - h * 0.13, 0, by + h * 0.12, [[0, '#FBAECB'], [0.6, '#F58BB0'], [1, '#E8709E']]);
      c.beginPath(); c.ellipse(-w * 0.02, by, w * 0.30, h * 0.115, -0.10, 0, 6.2832); c.fill();
      /* ala: plegada o batiendo */
      c.save();
      c.translate(-w * 0.04, by - h * 0.03);
      c.rotate(flying ? -flap * 0.8 : 0.1);
      c.fillStyle = grad(c, 0, -h * 0.16, 0, h * 0.06, [[0, '#E8709E'], [1, '#C74578']]);
      c.beginPath();
      c.moveTo(w * 0.12, 0);
      c.quadraticCurveTo(-w * 0.08, flying ? -h * 0.20 : -h * 0.02, -w * (flying ? 0.30 : 0.32), flying ? -h * 0.18 : h * 0.03);
      c.quadraticCurveTo(-w * 0.08, flying ? -h * 0.05 : h * 0.07, w * 0.08, h * 0.05);
      c.closePath(); c.fill();
      c.restore();
      /* cuello en S */
      var hx = w * 0.34, hy = by - h * 0.32 + (flying ? h * 0.05 : Math.sin(t * 0.06) * h * 0.012);
      c.strokeStyle = '#F58BB0'; c.lineWidth = w * 0.10; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(w * 0.18, by - h * 0.04);
      c.bezierCurveTo(w * 0.46, by - h * 0.12, w * 0.10, hy + h * 0.10, hx, hy + h * 0.015);
      c.stroke();
      /* cabeza + pico curvo con punta negra */
      blob(c, '#F58BB0', hx, hy, w * 0.095, h * 0.045);
      c.fillStyle = '#F2E9E4';
      c.beginPath(); c.moveTo(hx + w * 0.05, hy - h * 0.014);
      c.quadraticCurveTo(hx + w * 0.17, hy - h * 0.006, hx + w * 0.155, hy + h * 0.045);
      c.quadraticCurveTo(hx + w * 0.10, hy + h * 0.036, hx + w * 0.04, hy + h * 0.020);
      c.closePath(); c.fill();
      c.fillStyle = '#20262C';
      c.beginPath(); c.moveTo(hx + w * 0.135, hy + h * 0.010);
      c.quadraticCurveTo(hx + w * 0.16, hy + h * 0.028, hx + w * 0.15, hy + h * 0.045);
      c.quadraticCurveTo(hx + w * 0.11, hy + h * 0.036, hx + w * 0.112, hy + h * 0.016);
      c.closePath(); c.fill();
      blob(c, '#20262C', hx + w * 0.012, hy - h * 0.012, w * 0.017, h * 0.010);
      blob(c, '#FFFFFF', hx + w * 0.020, hy - h * 0.016, w * 0.007, h * 0.004);
    },

    rana: function (c, en, w, h) {
      var t = en.t, air = en.phase === 1;
      var crouch = air ? 0 : Math.max(0, Math.sin(t * 0.11)) * 0.3;   /* respira/carga */
      var by = -h * (0.38 - crouch * 0.06);
      /* ancas: plegadas en Z o extendidas al saltar */
      if (air) {
        limb(c, '#3D8A30', h * 0.13, -w * 0.14, by + h * 0.05, -w * 0.30, by + h * 0.22, -w * 0.42, by + h * 0.34);
        limb(c, '#3D8A30', h * 0.13, -w * 0.08, by + h * 0.10, -w * 0.24, by + h * 0.28, -w * 0.36, by + h * 0.40);
      } else {
        blob(c, '#3D8A30', -w * 0.20, -h * 0.18, w * 0.14, h * 0.16, 0.5);
        limb(c, '#4FA53C', h * 0.10, -w * 0.28, -h * 0.10, -w * 0.30, -0.5, -w * 0.16, -0.5);
      }
      /* cuerpo */
      c.fillStyle = grad(c, 0, by - h * 0.30, 0, 0, [[0, '#7ED063'], [0.55, '#5DBF4A'], [1, '#3D8A30']]);
      c.beginPath(); c.ellipse(0, by, w * 0.30, h * (0.30 - crouch * 0.05), -0.08, 0, 6.2832); c.fill();
      /* garganta que pulsa */
      var thr = air ? 0.2 : 0.3 + 0.25 * Math.sin(t * 0.22);
      blob(c, '#E8F5C9', w * 0.16, by + h * 0.10, w * 0.10, h * 0.10 * (0.6 + thr));
      /* manchas */
      c.globalAlpha = 0.35; blob(c, '#2F6B24', -w * 0.06, by - h * 0.10, w * 0.05, h * 0.04, 0.4);
      blob(c, '#2F6B24', w * 0.05, by - h * 0.02, w * 0.04, h * 0.033, -0.3); c.globalAlpha = 1;
      /* patas delanteras */
      limb(c, '#4FA53C', h * 0.09, w * 0.16, by + h * 0.12, w * 0.20, -h * 0.10, w * (air ? 0.30 : 0.22), air ? -h * 0.02 : -0.5);
      /* ojos saltones */
      var ex = w * 0.16, ey = by - h * 0.26;
      blob(c, '#5DBF4A', ex - w * 0.10, ey, w * 0.065, h * 0.085);
      blob(c, '#5DBF4A', ex + w * 0.06, ey, w * 0.065, h * 0.085);
      blob(c, '#FFE066', ex - w * 0.10, ey - h * 0.01, w * 0.042, h * 0.055);
      blob(c, '#FFE066', ex + w * 0.06, ey - h * 0.01, w * 0.042, h * 0.055);
      blob(c, '#10161C', ex - w * 0.09, ey - h * 0.01, w * 0.020, h * 0.030);
      blob(c, '#10161C', ex + w * 0.07, ey - h * 0.01, w * 0.020, h * 0.030);
      /* boca */
      c.strokeStyle = '#2F6B24'; c.lineWidth = h * 0.035; c.lineCap = 'round';
      c.beginPath(); c.moveTo(w * 0.06, by + h * 0.02); c.quadraticCurveTo(w * 0.20, by + h * (air ? 0.10 : 0.05), w * 0.29, by - h * 0.01); c.stroke();
    },

    murcielago: function (c, en, w, h) {
      var t = en.t;
      var flap = Math.sin(t * 0.55);                             /* aleteo continuo */
      var cy = -h * 0.5;
      /* alas: membranas con dos festones, rotando desde el hombro */
      for (var side = -1; side <= 1; side += 2) {
        c.save();
        c.translate(side * w * 0.06, cy - h * 0.04);
        c.rotate(side * (-0.25 - flap * 0.55));
        c.scale(side, 1);
        c.fillStyle = grad(c, 0, -h * 0.2, 0, h * 0.3, [[0, '#8A77C5'], [1, '#5B4A8A']]);
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(w * 0.16, -h * 0.22, w * 0.42, -h * 0.14);   /* borde superior */
        c.quadraticCurveTo(w * 0.34, h * 0.02, w * 0.30, h * 0.06);
        c.quadraticCurveTo(w * 0.24, -h * 0.02, w * 0.18, h * 0.10);    /* festón 1 */
        c.quadraticCurveTo(w * 0.10, h * 0.02, w * 0.04, h * 0.14);     /* festón 2 */
        c.closePath(); c.fill();
        /* dedos de la membrana */
        c.strokeStyle = 'rgba(40,28,70,0.5)'; c.lineWidth = h * 0.028;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(w * 0.18, -h * 0.10, w * 0.30, h * 0.05); c.stroke();
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(w * 0.10, -h * 0.05, w * 0.18, h * 0.09); c.stroke();
        c.restore();
      }
      /* cuerpo peludo */
      c.fillStyle = grad(c, 0, cy - h * 0.2, 0, cy + h * 0.24, [[0, '#7A67B5'], [1, '#4A3A70']]);
      c.beginPath(); c.ellipse(0, cy + h * 0.02 + flap * h * 0.03, w * 0.13, h * 0.20, 0, 0, 6.2832); c.fill();
      /* cabeza + orejas */
      var hy = cy - h * 0.16 + flap * h * 0.03;
      blob(c, '#7A67B5', 0, hy, w * 0.115, h * 0.13);
      c.fillStyle = '#7A67B5';
      c.beginPath(); c.moveTo(-w * 0.09, hy - h * 0.06); c.lineTo(-w * 0.13, hy - h * 0.22); c.lineTo(-w * 0.02, hy - h * 0.10); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(w * 0.09, hy - h * 0.06); c.lineTo(w * 0.13, hy - h * 0.22); c.lineTo(w * 0.02, hy - h * 0.10); c.closePath(); c.fill();
      c.fillStyle = '#B9A8E8';
      c.beginPath(); c.moveTo(-w * 0.085, hy - h * 0.08); c.lineTo(-w * 0.108, hy - h * 0.17); c.lineTo(-w * 0.04, hy - h * 0.095); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(w * 0.085, hy - h * 0.08); c.lineTo(w * 0.108, hy - h * 0.17); c.lineTo(w * 0.04, hy - h * 0.095); c.closePath(); c.fill();
      /* ojos + colmillos */
      blob(c, '#FFD34D', -w * 0.045, hy - h * 0.01, w * 0.026, h * 0.034);
      blob(c, '#FFD34D', w * 0.045, hy - h * 0.01, w * 0.026, h * 0.034);
      blob(c, '#10161C', -w * 0.040, hy - h * 0.005, w * 0.012, h * 0.017);
      blob(c, '#10161C', w * 0.050, hy - h * 0.005, w * 0.012, h * 0.017);
      c.fillStyle = '#FFFFFF';
      c.beginPath(); c.moveTo(-w * 0.030, hy + h * 0.07); c.lineTo(-w * 0.012, hy + h * 0.07); c.lineTo(-w * 0.021, hy + h * 0.115); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(w * 0.030, hy + h * 0.07); c.lineTo(w * 0.012, hy + h * 0.07); c.lineTo(w * 0.021, hy + h * 0.115); c.closePath(); c.fill();
    },

    cangrejo: function (c, en, w, h) {
      var t = en.t;
      var lp = Math.sin(t * 0.5);                                /* paso lateral */
      var pinch = 0.5 + 0.5 * Math.sin(t * 0.16);                /* tenazas */
      var by = -h * 0.42;
      /* patas: 3 por lado, alternando */
      for (var s2 = -1; s2 <= 1; s2 += 2) {
        for (var l2 = 0; l2 < 3; l2++) {
          var phw = lp * (l2 % 2 ? 1 : -1) * w * 0.03;
          var bx2 = s2 * w * (0.14 + l2 * 0.07);
          limb(c, '#B03A20', h * 0.07, bx2, by + h * 0.10, bx2 + s2 * w * 0.10, -h * 0.16, bx2 + s2 * w * 0.16 + phw, -0.5);
        }
      }
      /* caparazón */
      c.fillStyle = grad(c, 0, by - h * 0.26, 0, by + h * 0.2, [[0, '#F07A50'], [0.55, '#E05A3A'], [1, '#B03A20']]);
      c.beginPath(); c.ellipse(0, by, w * 0.28, h * 0.23, 0, 0, 6.2832); c.fill();
      c.globalAlpha = 0.4; blob(c, '#FFC0A0', -w * 0.08, by - h * 0.10, w * 0.10, h * 0.06, -0.2); c.globalAlpha = 1;
      /* tenazas que abren y cierran */
      for (var s3 = -1; s3 <= 1; s3 += 2) {
        var cx3 = s3 * w * 0.34, cy3 = by - h * 0.06;
        limb(c, '#B03A20', h * 0.08, s3 * w * 0.22, by, s3 * w * 0.30, by - h * 0.02, cx3, cy3);
        c.save(); c.translate(cx3, cy3); c.scale(s3, 1);
        /* pinza fija */
        c.fillStyle = '#E05A3A';
        c.beginPath(); c.moveTo(0, 0);
        c.quadraticCurveTo(w * 0.10, h * 0.02, w * 0.11, h * 0.07);
        c.quadraticCurveTo(w * 0.04, h * 0.08, 0, h * 0.04); c.closePath(); c.fill();
        /* pinza móvil */
        c.save(); c.rotate(-0.5 - pinch * 0.55);
        c.beginPath(); c.moveTo(0, 0);
        c.quadraticCurveTo(w * 0.10, -h * 0.02, w * 0.11, -h * 0.06);
        c.quadraticCurveTo(w * 0.04, -h * 0.07, 0, -h * 0.03); c.closePath(); c.fill();
        c.restore(); c.restore();
      }
      /* ojos en tallos */
      var eb = Math.sin(t * 0.3) * h * 0.015;
      limb(c, '#B03A20', h * 0.045, -w * 0.06, by - h * 0.18, -w * 0.07, by - h * 0.30, -w * 0.07, by - h * 0.32 + eb);
      limb(c, '#B03A20', h * 0.045, w * 0.06, by - h * 0.18, w * 0.07, by - h * 0.30, w * 0.07, by - h * 0.32 + eb);
      blob(c, '#FFFFFF', -w * 0.07, by - h * 0.34 + eb, w * 0.035, h * 0.05);
      blob(c, '#FFFFFF', w * 0.07, by - h * 0.34 + eb, w * 0.035, h * 0.05);
      blob(c, '#20262C', -w * 0.065, by - h * 0.335 + eb, w * 0.017, h * 0.026);
      blob(c, '#20262C', w * 0.075, by - h * 0.335 + eb, w * 0.017, h * 0.026);
      /* boca sonriente */
      c.strokeStyle = '#7A2412'; c.lineWidth = h * 0.03; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-w * 0.05, by + h * 0.06); c.quadraticCurveTo(0, by + h * 0.11, w * 0.05, by + h * 0.06); c.stroke();
    },

    cangrejoazul: function (c, en, w, h) {
      var t = en.t;
      var lp = Math.sin(t * 0.5);                                /* paso lateral */
      var pinch = 0.5 + 0.5 * Math.sin(t * 0.16);                /* tenazas */
      var by = -h * 0.42;
      /* patas: 3 por lado, alternando */
      for (var s2 = -1; s2 <= 1; s2 += 2) {
        for (var l2 = 0; l2 < 3; l2++) {
          var phw = lp * (l2 % 2 ? 1 : -1) * w * 0.03;
          var bx2 = s2 * w * (0.14 + l2 * 0.07);
          limb(c, '#2A5FA8', h * 0.07, bx2, by + h * 0.10, bx2 + s2 * w * 0.10, -h * 0.16, bx2 + s2 * w * 0.16 + phw, -0.5);
        }
      }
      /* caparazón azul */
      c.fillStyle = grad(c, 0, by - h * 0.26, 0, by + h * 0.2, [[0, '#6FB1E8'], [0.55, '#4A8FD8'], [1, '#2A5FA8']]);
      c.beginPath(); c.ellipse(0, by, w * 0.28, h * 0.23, 0, 0, 6.2832); c.fill();
      c.globalAlpha = 0.4; blob(c, '#BFE0F5', -w * 0.08, by - h * 0.10, w * 0.10, h * 0.06, -0.2); c.globalAlpha = 1;
      /* tenazas que abren y cierran */
      for (var s3 = -1; s3 <= 1; s3 += 2) {
        var cx3 = s3 * w * 0.34, cy3 = by - h * 0.06;
        limb(c, '#2A5FA8', h * 0.08, s3 * w * 0.22, by, s3 * w * 0.30, by - h * 0.02, cx3, cy3);
        c.save(); c.translate(cx3, cy3); c.scale(s3, 1);
        /* pinza fija */
        c.fillStyle = '#4A8FD8';
        c.beginPath(); c.moveTo(0, 0);
        c.quadraticCurveTo(w * 0.10, h * 0.02, w * 0.11, h * 0.07);
        c.quadraticCurveTo(w * 0.04, h * 0.08, 0, h * 0.04); c.closePath(); c.fill();
        /* pinza móvil */
        c.save(); c.rotate(-0.5 - pinch * 0.55);
        c.fillStyle = '#4A8FD8';
        c.beginPath(); c.moveTo(0, 0);
        c.quadraticCurveTo(w * 0.10, -h * 0.02, w * 0.11, -h * 0.06);
        c.quadraticCurveTo(w * 0.04, -h * 0.07, 0, -h * 0.03); c.closePath(); c.fill();
        c.restore(); c.restore();
      }
      /* ojos en tallos */
      var eb = Math.sin(t * 0.3) * h * 0.015;
      limb(c, '#2A5FA8', h * 0.045, -w * 0.06, by - h * 0.18, -w * 0.07, by - h * 0.30, -w * 0.07, by - h * 0.32 + eb);
      limb(c, '#2A5FA8', h * 0.045, w * 0.06, by - h * 0.18, w * 0.07, by - h * 0.30, w * 0.07, by - h * 0.32 + eb);
      blob(c, '#FFFFFF', -w * 0.07, by - h * 0.34 + eb, w * 0.035, h * 0.05);
      blob(c, '#FFFFFF', w * 0.07, by - h * 0.34 + eb, w * 0.035, h * 0.05);
      blob(c, '#20262C', -w * 0.065, by - h * 0.335 + eb, w * 0.017, h * 0.026);
      blob(c, '#20262C', w * 0.075, by - h * 0.335 + eb, w * 0.017, h * 0.026);
      /* boca sonriente */
      c.strokeStyle = '#1B3F70'; c.lineWidth = h * 0.03; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-w * 0.05, by + h * 0.06); c.quadraticCurveTo(0, by + h * 0.11, w * 0.05, by + h * 0.06); c.stroke();
    },

    coco: function (c, en, w, h) {
      var t = en.t;
      var falling = en.phase === 1;
      var rot = falling ? t * 0.18 * (en.vy > 0 ? 1 : 1) : Math.sin(t * 0.05) * 0.06;
      c.save();
      c.translate(0, -h * 0.5);
      c.rotate(rot);
      var r = h * 0.46;
      var g2 = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.15, 0, 0, r * 1.1);
      g2.addColorStop(0, '#8A6238'); g2.addColorStop(0.6, '#6E4A2A'); g2.addColorStop(1, '#3E2712');
      c.fillStyle = g2;
      c.beginPath(); c.arc(0, 0, r, 0, 6.2832); c.fill();
      /* fibras */
      c.strokeStyle = 'rgba(46,27,12,0.5)'; c.lineWidth = h * 0.03;
      c.beginPath(); c.moveTo(-r * 0.7, -r * 0.3); c.quadraticCurveTo(0, -r * 0.05, r * 0.68, -r * 0.35); c.stroke();
      c.beginPath(); c.moveTo(-r * 0.6, r * 0.45); c.quadraticCurveTo(0, r * 0.62, r * 0.6, r * 0.42); c.stroke();
      /* tres poros = carita */
      blob(c, '#2E1B0C', -r * 0.28, -r * 0.15, r * 0.14, r * 0.17);
      blob(c, '#2E1B0C', r * 0.28, -r * 0.15, r * 0.14, r * 0.17);
      blob(c, '#2E1B0C', 0, r * 0.28, r * 0.17, r * 0.14);
      /* brillo */
      c.globalAlpha = 0.35; blob(c, '#C99B62', -r * 0.32, -r * 0.45, r * 0.22, r * 0.13, -0.5); c.globalAlpha = 1;
      c.restore();
    },

    barril: function (c, en, w, h) {
      /* rueda de verdad: rotación ligada al avance */
      var rot = (en.x * 0.09) % 6.2832;
      c.save();
      c.translate(0, -h * 0.5);
      c.rotate(rot);
      var r = h * 0.48;
      /* cuerpo del barril visto de lado (rodando) */
      var g3 = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.2, 0, 0, r * 1.05);
      g3.addColorStop(0, '#C98D4C'); g3.addColorStop(0.65, '#B5773A'); g3.addColorStop(1, '#7A4A1E');
      c.fillStyle = g3;
      c.beginPath(); c.arc(0, 0, r, 0, 6.2832); c.fill();
      /* duelas radiales que giran */
      c.strokeStyle = 'rgba(110,74,36,0.75)'; c.lineWidth = h * 0.045;
      for (var d3 = 0; d3 < 3; d3++) {
        var a3 = d3 * 2.094;
        c.beginPath(); c.moveTo(Math.cos(a3) * r * 0.9, Math.sin(a3) * r * 0.9);
        c.lineTo(Math.cos(a3 + 3.1416) * r * 0.9, Math.sin(a3 + 3.1416) * r * 0.9); c.stroke();
      }
      /* aro metálico + centro */
      c.strokeStyle = '#6E7A87'; c.lineWidth = h * 0.09;
      c.beginPath(); c.arc(0, 0, r * 0.82, 0, 6.2832); c.stroke();
      c.fillStyle = '#8A5424';
      c.beginPath(); c.arc(0, 0, r * 0.22, 0, 6.2832); c.fill();
      c.restore();
    },

    arana: function (c, en, w, h) {
      var t = en.t;
      var wig = Math.sin(t * 0.45);                              /* patas trepando */
      var cy = -h * 0.52;
      /* 4 pares de patas articuladas */
      for (var s4 = -1; s4 <= 1; s4 += 2) {
        for (var l4 = 0; l4 < 4; l4++) {
          var ph4 = wig * (l4 % 2 ? 1 : -1) * 0.12;
          var ang4 = -0.9 + l4 * 0.55 + ph4;
          var kx = s4 * w * (0.14 + Math.cos(ang4) * 0.16), ky = cy - h * 0.14 + Math.sin(ang4) * h * 0.10;
          var fx4 = s4 * w * (0.24 + Math.cos(ang4) * 0.26), fy4 = cy + Math.sin(ang4) * h * 0.30 + h * 0.16;
          limb(c, '#2E2438', h * 0.05, s4 * w * 0.08, cy - h * 0.02, kx, ky, fx4, fy4);
        }
      }
      /* abdomen con dibujo */
      c.fillStyle = grad(c, 0, cy - h * 0.3, 0, cy + h * 0.1, [[0, '#5A4870'], [1, '#2E2438']]);
      c.beginPath(); c.ellipse(0, cy - h * 0.16, w * 0.17, h * 0.18, 0, 0, 6.2832); c.fill();
      c.fillStyle = '#C76B3B';
      blob(c, '#C76B3B', 0, cy - h * 0.20, w * 0.06, h * 0.07);
      blob(c, '#C76B3B', 0, cy - h * 0.09, w * 0.035, h * 0.04);
      /* cabeza */
      blob(c, '#4A3A5C', 0, cy + h * 0.06, w * 0.115, h * 0.11);
      /* ojos rojos (2 grandes + 2 chicos) */
      blob(c, '#E04848', -w * 0.045, cy + h * 0.04, w * 0.028, h * 0.036);
      blob(c, '#E04848', w * 0.045, cy + h * 0.04, w * 0.028, h * 0.036);
      blob(c, '#FF8A8A', -w * 0.038, cy + h * 0.032, w * 0.010, h * 0.013);
      blob(c, '#FF8A8A', w * 0.052, cy + h * 0.032, w * 0.010, h * 0.013);
      blob(c, '#E04848', -w * 0.085, cy + h * 0.055, w * 0.014, h * 0.018);
      blob(c, '#E04848', w * 0.085, cy + h * 0.055, w * 0.014, h * 0.018);
      /* quelíceros que se mueven */
      var ch4 = Math.abs(Math.sin(t * 0.2)) * h * 0.02;
      limb(c, '#2E2438', h * 0.035, -w * 0.02, cy + h * 0.14, -w * 0.02, cy + h * 0.18 + ch4, -w * 0.035, cy + h * 0.20 + ch4);
      limb(c, '#2E2438', h * 0.035, w * 0.02, cy + h * 0.14, w * 0.02, cy + h * 0.18 + ch4, w * 0.035, cy + h * 0.20 + ch4);
    }
  };

  /* nubes pixel-art esponjosas: unión de círculos con sombreado por contorno.
     Cada celda se clasifica: 0 brillo blanco (borde sup-izq), 1 cuerpo,
     2 gris pálido (media sombra), 3 azul claro (sombra de base que sigue la curva). */
  var CLOUD_COLS = ['#FFFFFF', '#F6FAFE', '#E3ECF4', '#C9DFF2'];
  function makeCloudShape(wpx) {
    /* nubes pequeñas usan celda de 1px para conservar la silueta redondeada */
    var u = wpx <= 44 ? 1 : 2;
    var W = Math.max(26, Math.round(wpx / u));
    function rnd(a, b) { return a + Math.random() * (b - a); }
    var lumps = [
      { x: W * 0.50, y: 0, r: W * rnd(0.24, 0.30) },
      { x: W * rnd(0.20, 0.27), y: W * 0.06, r: W * rnd(0.16, 0.21) },
      { x: W * rnd(0.73, 0.80), y: W * 0.05, r: W * rnd(0.16, 0.21) },
      { x: W * rnd(0.33, 0.42), y: -W * rnd(0.08, 0.12), r: W * rnd(0.13, 0.18) },
      { x: W * rnd(0.58, 0.67), y: -W * rnd(0.04, 0.09), r: W * rnd(0.11, 0.16) },
      { x: W * rnd(0.07, 0.13), y: W * 0.13, r: W * rnd(0.08, 0.12) },
      { x: W * rnd(0.87, 0.93), y: W * 0.12, r: W * rnd(0.08, 0.12) }
    ];
    var cut = Math.round(W * 0.17);
    function inside(px, py) {
      if (py > cut) return false;
      for (var i = 0; i < lumps.length; i++) {
        var dx = px - lumps[i].x, dy = py - lumps[i].y;
        if (dx * dx + dy * dy <= lumps[i].r * lumps[i].r) return true;
      }
      return false;
    }
    var ymin = 999;
    lumps.forEach(function (l) { ymin = Math.min(ymin, Math.floor(l.y - l.r)); });
    var shD = Math.max(2, Math.round(W * 0.10));   /* profundidad sombra azul */
    var midD = Math.max(1, Math.round(W * 0.05));  /* franja gris intermedia */
    var runs = [];
    for (var py = ymin; py <= cut; py++) {
      var run = null;
      for (var px = 0; px <= W + 2; px++) {
        var ci = -1;
        if (inside(px, py)) {
          if (!inside(px, py + shD)) ci = 3;                 /* sombra que sigue el contorno */
          else if (!inside(px, py + shD + midD)) ci = 2;     /* media sombra */
          else if (!inside(px - 1, py - 1)) ci = 0;          /* brillo del borde superior */
          else ci = 1;
        }
        if (run && ci === run.ci && px === run.x + run.len) { run.len++; }
        else if (ci >= 0) { run = { x: px, y: py - ymin, len: 1, ci: ci }; runs.push(run); }
        else run = null;
      }
    }
    return { u: u, runs: runs, h: cut - ymin + 1 };
  }
  var BG = {};
  [1, 2, 3, 4, 5, 6, 7].forEach(function (i) { BG[i] = ld('/assets/levels/fondo' + i + '.png'); });
  BG[7] = ld('/assets/levels/fondo7-nuevo.png');
  BG[8] = ld('/assets/levels/fondo8-chetumal.png');
  BG[9] = ld('/assets/levels/fondo9-bacalar.png');
  var TEX = {
    piso: ld('/assets/levels/piso-maya.png'),
    plat: ld('/assets/levels/plataforma-maya.png'),
    piso6: ld('/assets/levels/piso6.png'),
    plat6: ld('/assets/levels/plataforma6.png'),
    piso2: ld('/assets/levels/piso2.png'),
    plat2: ld('/assets/levels/plataforma2.png'),
    piso7: ld('/assets/levels/piso7.png'),
    plat7: ld('/assets/levels/plataforma7.png'),
    inicio: ld('/assets/levels/inicio.png')
  };
  function okImg(im) { return im && im.complete && im.naturalWidth > 0; }

  function pickPrize() {
    var tot = 0, i;
    for (i = 0; i < PRIZES.length; i++) tot += PRIZES[i].w;
    var r = Math.random() * tot;
    for (i = 0; i < PRIZES.length; i++) { r -= PRIZES[i].w; if (r < 0) return PRIZES[i]; }
    return PRIZES[0];
  }
  function makeCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c = 'CA-', i;
    for (i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return c;
  }

  class CAGame extends HTMLElement {
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      var touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      this.style.cssText = 'display:block;width:100%;position:relative;font-family:Barlow,system-ui,sans-serif';
      this.innerHTML =
        '<style>' +
        '.ca-pads{position:absolute;inset:auto 0 0 0;display:flex;justify-content:space-between;align-items:flex-end;padding:0 10px 10px;pointer-events:none;z-index:3}' +
        '.ca-pads .ca-grp{display:flex;gap:18px;pointer-events:auto}' +
        'button.ca-pad{width:100px;height:100px;padding:0;margin:0;background:none;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}' +
        'button.ca-pad span{width:86px;height:86px;border-radius:99px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.4);background:rgba(31,41,51,0.45);color:#fff;font-size:28px;pointer-events:none;transition:background 0.08s,transform 0.08s}' +
        'button.ca-pad[data-btn="j"]{width:124px;height:124px}' +
        'button.ca-pad[data-btn="j"] span{width:108px;height:108px;border-color:rgba(255,105,15,0.85);background:rgba(255,105,15,0.45);font-size:32px;font-weight:800}' +
        'button.ca-pad.ca-on span{background:rgba(31,41,51,0.75);transform:scale(0.94)}' +
        'button.ca-pad[data-btn="j"].ca-on span{background:rgba(255,105,15,0.75)}' +
        '@media (min-width:820px){.ca-pads{padding:0 18px 16px}.ca-pads .ca-grp{gap:24px}button.ca-pad{width:116px;height:116px}button.ca-pad span{width:98px;height:98px;font-size:32px}button.ca-pad[data-btn="j"]{width:140px;height:140px}button.ca-pad[data-btn="j"] span{width:120px;height:120px;font-size:36px}}' +
        '@media (max-height:420px) and (orientation:landscape){button.ca-pad{width:90px;height:90px}button.ca-pad span{width:76px;height:76px;font-size:26px}button.ca-pad[data-btn="j"]{width:108px;height:108px}button.ca-pad[data-btn="j"] span{width:92px;height:92px}}' +
        '</style>' +
        '<canvas width="' + (VW * 2) + '" height="' + (VH * 2) + '" style="width:100%;display:block;aspect-ratio:' + VW + '/' + VH + ';image-rendering:pixelated;background:' + COL.bg1 + ';touch-action:none"></canvas>' +
        '<button class="ca-dev" aria-label="Modo prueba: eliminar enemigos" title="Prueba: elimina enemigos (E) · siguiente nivel (N)" style="position:absolute;top:10px;left:10px;height:40px;padding:0 12px;border-radius:10px;border:1px solid rgba(255,105,15,0.7);background:rgba(16,22,28,0.75);color:#FF9A5C;font-size:11px;font-weight:800;letter-spacing:0.04em;cursor:pointer">PRUEBA</button>' +
        '<button class="ca-restart" aria-label="Reiniciar nivel" style="position:absolute;top:10px;right:10px;width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.5);background:rgba(31,41,51,0.55);color:#fff;font-size:18px;cursor:pointer;display:none">&#8634;</button>' +
        '<button class="ca-fs" aria-label="Pantalla completa" style="position:absolute;top:10px;right:58px;width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.5);background:rgba(31,41,51,0.55);color:#fff;font-size:17px;cursor:pointer">&#x26F6;</button>' +
        '<button class="ca-audio" aria-label="Configuracion de sonido" style="position:absolute;top:10px;right:106px;width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.5);background:rgba(31,41,51,0.55);color:#fff;font-size:18px;cursor:pointer;z-index:6">&#9881;</button>' +
        '<div class="ca-cfg" style="position:absolute;top:56px;right:10px;z-index:7;display:none;background:rgba(20,29,38,0.96);border:1.5px solid rgba(255,105,15,0.55);border-radius:14px;padding:14px 16px;min-width:215px;box-shadow:0 20px 50px rgba(0,0,0,0.5)">' +
        '<div style="font-family:\'Press Start 2P\',monospace;font-size:9px;color:#FF9A5C;margin-bottom:12px">SONIDO</div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px"><span style="color:#E4E7EB;font-size:13.5px;font-weight:600">M&uacute;sica</span><button class="ca-mus" style="width:58px;padding:6px 0;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:800;font-size:11px;cursor:pointer;letter-spacing:0.08em">ON</button></div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px"><span style="color:#9AA5B1;font-size:11px;font-weight:600;letter-spacing:0.04em">Vol.</span><div style="display:flex;align-items:center;gap:8px"><button class="ca-mvdn" aria-label="Bajar volumen musica" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:15px;font-weight:800;cursor:pointer;line-height:1">&#8722;</button><div class="ca-mvbar" style="display:flex;gap:2px;align-items:center"></div><button class="ca-mvup" aria-label="Subir volumen musica" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:15px;font-weight:800;cursor:pointer;line-height:1">+</button></div></div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px"><span style="color:#E4E7EB;font-size:13.5px;font-weight:600">Efectos</span><button class="ca-sfx" style="width:58px;padding:6px 0;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-weight:800;font-size:11px;cursor:pointer;letter-spacing:0.08em">ON</button></div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><span style="color:#9AA5B1;font-size:11px;font-weight:600;letter-spacing:0.04em">Vol.</span><div style="display:flex;align-items:center;gap:8px"><button class="ca-svdn" aria-label="Bajar volumen efectos" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:15px;font-weight:800;cursor:pointer;line-height:1">&#8722;</button><div class="ca-svbar" style="display:flex;gap:2px;align-items:center"></div><button class="ca-svup" aria-label="Subir volumen efectos" style="width:26px;height:26px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:15px;font-weight:800;cursor:pointer;line-height:1">+</button></div></div>' +
        '</div>' +
        (
          '<div class="ca-pads">' +
          '<div class="ca-grp">' +
          '<button data-btn="l" class="ca-pad" aria-label="Caminar hacia atrás"><span><svg viewBox="0 0 24 24" width="52" height="52" fill="currentColor" style="transform:scaleX(-1)"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"></path></svg></span></button>' +
          '<button data-btn="r" class="ca-pad" aria-label="Caminar hacia adelante"><span><svg viewBox="0 0 24 24" width="52" height="52" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"></path></svg></span></button>' +
          '</div>' +
          '<div class="ca-grp">' +
          '<button data-btn="j" class="ca-pad" aria-label="Brincar"><span><svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor"><path d="M12 3.6l-7.2 7.2h4.2V21h6v-10.2h4.2z"></path></svg></span></button>' +
          '</div></div>') +
        '<div class="ca-prize" style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(20,29,38,0.94);padding:20px;z-index:5">' +
        '<div style="max-width:420px;width:100%;background:#1F2933;border:1.5px solid rgba(255,105,15,0.6);border-radius:18px;padding:28px 26px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,0.5)">' +
        '<div style="font-family:\'Press Start 2P\',monospace;font-size:15px;color:#FF9A5C;margin-bottom:14px">&#127942; &iexcl;GANASTE!</div>' +
        '<div style="color:#CBD2D9;font-size:14px;margin-bottom:8px">Completaste el Reto ConstruAuto. Tu premio:</div>' +
        '<div class="ca-prize-label" style="color:#fff;font-size:20px;font-weight:800;font-style:italic;line-height:1.3;margin-bottom:14px"></div>' +
        '<div style="background:rgba(255,255,255,0.07);border:1px dashed rgba(255,255,255,0.3);border-radius:10px;padding:10px;margin-bottom:18px;color:#FFD34D;font-weight:800;font-size:18px;letter-spacing:0.12em"><span class="ca-prize-code"></span></div>' +
        '<a class="ca-prize-wa" target="_blank" style="display:block;background:#25D366;color:#fff;font-weight:800;font-size:15.5px;padding:13px;border-radius:11px;text-decoration:none;margin-bottom:10px">Reclamar por WhatsApp</a>' +
        '<button class="ca-prize-again" style="width:100%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.25);color:#fff;font-weight:700;font-size:14.5px;padding:12px;border-radius:11px;cursor:pointer;margin-bottom:12px">Jugar de nuevo</button>' +
        '<p style="margin:0;font-size:11.5px;line-height:1.5;color:#9AA5B1">Un premio por persona. Sujeto a validación con tu asesor y aplicable según contrato. No canjeable por efectivo. Aplican restricciones. Válido para financiamiento de $100,000 MXN en adelante.</p>' +
        '</div></div>';

      this.cv = this.querySelector('canvas');
      this.cx = this.cv.getContext('2d');
      /* preferencias de audio persistentes */
      var clampV = function (v, d) { return typeof v === 'number' ? Math.min(1, Math.max(0, v)) : d; };
      this.audio = { music: true, sfx: true, musicVol: 0.3, sfxVol: 0.7 };
      this.paused = false;
      try {
        var sa = JSON.parse(localStorage.getItem('construauto-game-audio') || 'null');
        if (sa) this.audio = {
          music: sa.music !== false, sfx: sa.sfx !== false,
          musicVol: clampV(sa.musicVol, clampV(sa.vol, 0.3)),
          sfxVol: clampV(sa.sfxVol, clampV(sa.vol, 0.7))
        };
      } catch (e) {}
      this.inp = { l: false, r: false, jHeld: false };
      this.state = 'menu';
      this.lives = 5;
      this.tick = 0; this.msgT = 0; this.levelT = 0;
      this.coyote = 0; this.jbuf = 0; this.invulnT = 0;
      this.parts = [];
      this._last = 0;
      try { this.level = Math.min(LEVELS.length - 1, parseInt(localStorage.getItem('construauto-game-level') || '0', 10) || 0); }
      catch (e) { this.level = 0; }
      this.parse(this.level);

      var self = this;
      /* ===== InputManager — teclado + botones táctiles ===== */
      this._kd = function (e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'Spacebar'].indexOf(e.key) !== -1) e.preventDefault();
        if (e.repeat) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') self.inp.l = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') self.inp.r = true;
        if (e.key === ' ' || e.key === 'Spacebar') { if (self.state === 'menu') self.start(); else self.press(); }
        if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && self.state !== 'menu') self.press();
        if (e.key === 'r' || e.key === 'R') self.resetLevel();
        if (e.key === 'e' || e.key === 'E') self.devClear();
        if (e.key === 'n' || e.key === 'N') self.devNext();
      };
      this._ku = function (e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') self.inp.l = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') self.inp.r = false;
        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'Spacebar') self.inp.jHeld = false;
      };
      this._vis = function () {
        if (document.hidden) {
          self._last = 0;
          self.inp.l = self.inp.r = self.inp.jHeld = false;
          if (self._ac && self._ac.state === 'running') self._ac.suspend();
        } else if (self._ac && self._ac.state === 'suspended') self._ac.resume();
      };
      /* al perder el foco, soltar todas las entradas (evita movimiento fantasma) */
      this._bl = function () { self.inp.l = self.inp.r = self.inp.jHeld = false; };
      window.addEventListener('blur', this._bl);
      window.addEventListener('keydown', this._kd);
      window.addEventListener('keyup', this._ku);
      document.addEventListener('visibilitychange', this._vis);
      this.cv.addEventListener('pointerdown', function (e) {
        if (self.state !== 'menu') return;
        var box = self._startBox;
        if (!box) { self.start(); return; }
        var r = self.cv.getBoundingClientRect();
        var gx = (e.clientX - r.left) / r.width * VW;
        var gy = (e.clientY - r.top) / r.height * VH;
        if (gx >= box.x && gx <= box.x + box.w && gy >= box.y && gy <= box.y + box.h) self.start();
      });
      this.querySelectorAll('[data-btn]').forEach(function (b) {
        var k = b.getAttribute('data-btn');
        /* captura de puntero: el botón recibe pointerup aunque el pulgar se deslice
           fuera del círculo — sin entradas atascadas ni toques perdidos.
           Cada botón maneja su propio puntero, así que mover + saltar simultáneo funciona. */
        var on = function (e) {
          e.preventDefault();
          if (e.pointerId !== undefined) { try { b.setPointerCapture(e.pointerId); } catch (err) { } }
          b._pid = (e.pointerId !== undefined) ? e.pointerId : 'mouse';
          b.classList.add('ca-on');
          if (k === 'j') self.press(); else self.inp[k] = true;
        };
        var off = function (e) {
          e.preventDefault();
          b._pid = null;
          b.classList.remove('ca-on');
          if (k === 'j') self.inp.jHeld = false; else self.inp[k] = false;
        };
        b.addEventListener('pointerdown', on);
        b.addEventListener('pointerup', off);
        b.addEventListener('pointercancel', off);
        b.addEventListener('lostpointercapture', off);
        b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      });
      /* Red de seguridad: si un pointerup/cancel se pierde (el dedo se desliza fuera
         del botón, multitáctil, o falla la captura), soltamos EXACTAMENTE el botón
         cuyo puntero se levantó — así el personaje nunca se queda caminando solo,
         y mover + brincar a la vez sigue funcionando. */
      this._relPtr = function (e) {
        self.querySelectorAll('[data-btn]').forEach(function (b) {
          if (b._pid != null && (b._pid === e.pointerId || (b._pid === 'mouse' && e.pointerId === undefined))) {
            b._pid = null; b.classList.remove('ca-on');
            var kk = b.getAttribute('data-btn');
            if (kk === 'j') self.inp.jHeld = false; else self.inp[kk] = false;
          }
        });
      };
      window.addEventListener('pointerup', this._relPtr);
      window.addEventListener('pointercancel', this._relPtr);
      this.querySelector('.ca-restart').addEventListener('click', function () { self.resetLevel(); });
      this.querySelector('.ca-dev').addEventListener('click', function () { self.devClear(); });
      /* ===== Panel de configuración de sonido ===== */
      var cfgPanel = this.querySelector('.ca-cfg');
      var mkBar = function (sel) {
        var bar = self.querySelector(sel); if (!bar) return;
        for (var vi = 0; vi < 10; vi++) {
          var sg = document.createElement('div');
          sg.style.cssText = 'width:5px;height:14px;border-radius:1px;background:rgba(255,255,255,0.12)';
          bar.appendChild(sg);
        }
      };
      mkBar('.ca-mvbar'); mkBar('.ca-svbar');
      var closeCfg = function () {
        cfgPanel.style.display = 'none';
        self.paused = false;
        self.ensureAC();
        if (self.audio.music && self.state !== 'menu') self.startMusic();
      };
      this.querySelector('.ca-audio').addEventListener('click', function () {
        var open = cfgPanel.style.display === 'none';
        if (open) {
          cfgPanel.style.display = 'block';
          self.ensureAC();
          if (self.state === 'play') self.paused = true;
          if (self._bgm) { try { self._bgm.pause(); } catch (e) {} }
        } else { closeCfg(); }
      });
      this.querySelector('.ca-mus').addEventListener('click', function () {
        self.audio.music = !self.audio.music;
        self.ensureAC(); self._applyAudio();
        if (self.audio.music && !self.paused) self.startMusic();
      });
      this.querySelector('.ca-sfx').addEventListener('click', function () {
        self.audio.sfx = !self.audio.sfx; self._applyAudio();
        if (self.audio.sfx) self.beep(660, 0.08);
      });
      var stepVol = function (key, delta, freq) {
        self.audio[key] = Math.min(1, Math.max(0, Math.round((self.audio[key] + delta) * 10) / 10));
        self._applyAudio(); self.beep(freq, 0.06);
      };
      this.querySelector('.ca-mvdn').addEventListener('click', function () { stepVol('musicVol', -0.1, 440); });
      this.querySelector('.ca-mvup').addEventListener('click', function () { stepVol('musicVol', 0.1, 660); });
      this.querySelector('.ca-svdn').addEventListener('click', function () { stepVol('sfxVol', -0.1, 440); });
      this.querySelector('.ca-svup').addEventListener('click', function () { stepVol('sfxVol', 0.1, 660); });
      this._applyAudio();
      /* ===== FullscreenManager ===== */
      this._fsFallback = false;
      this.querySelector('.ca-fs').addEventListener('click', function () { self.toggleFS(); });
      this._fsc = function () { self._syncFS(); };
      document.addEventListener('fullscreenchange', this._fsc);
      document.addEventListener('webkitfullscreenchange', this._fsc);
      this.querySelector('.ca-prize-again').addEventListener('click', function () {
        self.querySelector('.ca-prize').style.display = 'none';
        self.level = 0; self.lives = 5; self.saveLevel(); self.parse(0); self.state = 'play';
      });

      this._raf = requestAnimationFrame(function loop(now) {
        var dt = 1;
        if (self._last) dt = Math.min(3, Math.max(0.25, (now - self._last) / 16.667));
        self._last = now;
        self.update(dt); self.draw();
        self._raf = requestAnimationFrame(loop);
      });
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      if (this._mTimer) { clearInterval(this._mTimer); this._mTimer = null; }
      if (this._bgm) { try { this._bgm.pause(); } catch (e) {} this._bgm = null; }
      if (this._ac) { try { this._ac.close(); } catch (e) {} this._ac = null; }
      window.removeEventListener('keydown', this._kd);
      window.removeEventListener('keyup', this._ku);
      window.removeEventListener('blur', this._bl);
      if (this._relPtr) { window.removeEventListener('pointerup', this._relPtr); window.removeEventListener('pointercancel', this._relPtr); }
      document.removeEventListener('visibilitychange', this._vis);
      document.removeEventListener('fullscreenchange', this._fsc);
      document.removeEventListener('webkitfullscreenchange', this._fsc);
      this._init = false;
    }

    /* ===== FullscreenManager — nativo con respaldo CSS (iPhone) ===== */
    toggleFS() {
      var d = document, self = this;
      if (d.fullscreenElement === this || d.webkitFullscreenElement === this) {
        if (d.exitFullscreen) d.exitFullscreen();
        else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
        return;
      }
      if (this._fsFallback) { this.setFsFallback(false); return; }
      var rq = this.requestFullscreen ? 'requestFullscreen' : (this.webkitRequestFullscreen ? 'webkitRequestFullscreen' : null);
      if (rq) {
        try {
          var pr = this[rq]();
          if (pr && pr.catch) pr.catch(function () { self.setFsFallback(true); });
        } catch (e) { this.setFsFallback(true); }
      } else this.setFsFallback(true);
    }
    setFsFallback(on) {
      this._fsFallback = on;
      this.style.position = on ? 'fixed' : 'relative';
      this.style.inset = on ? '0' : '';
      this.style.zIndex = on ? '9999' : '';
      this.style.background = on ? '#10161C' : '';
      try { document.documentElement.style.overflow = on ? 'hidden' : ''; } catch (e) {}
      this._syncFS();
    }
    _syncFS() {
      var d = document;
      var on = this._fsFallback || d.fullscreenElement === this || d.webkitFullscreenElement === this;
      this.style.height = on ? '100%' : '';
      if (!this._fsFallback && !(d.fullscreenElement === this || d.webkitFullscreenElement === this)) {
        this.style.position = 'relative'; this.style.inset = ''; this.style.zIndex = ''; this.style.background = '';
        try { document.documentElement.style.overflow = ''; } catch (e) {}
      }
      if (this.cv) {
        this.cv.style.height = on ? '100%' : '';
        this.cv.style.objectFit = on ? 'contain' : '';
      }
      var b = this.querySelector('.ca-fs');
      if (b) b.innerHTML = on ? '&#10005;' : '&#x26F6;';
    }

    /* ===== AudioManager (WebAudio; se crea tras la 1a interacción) ===== */
    ensureAC() {
      if (this._ac) return this._ac;
      try {
        this._ac = new (window.AudioContext || window.webkitAudioContext)();
        this._mg = this._ac.createGain();
        this._mg.connect(this._ac.destination);
        this._applyAudio();
      } catch (e) {}
      return this._ac;
    }
    beep(f, d, type, vol) {
      if (!this.audio || !this.audio.sfx) return;
      try {
        var ac = this.ensureAC(); if (!ac) return;
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = type || 'square'; o.frequency.value = f;
        g.gain.setValueAtTime((vol || 0.04) * this.audio.sfxVol * 1.4, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (d || 0.12));
        o.connect(g); g.connect(ac.destination);
        o.start(); o.stop(ac.currentTime + (d || 0.12));
      } catch (e) {}
    }
    /* aplica mute/volumen y refresca el panel; persiste preferencias */
    _applyAudio() {
      var mv = this.audio.musicVol, sv = this.audio.sfxVol;
      if (this._mg) this._mg.gain.value = this.audio.music ? mv * 0.5 : 0;
      if (this._bgm) {
        this._bgm.volume = Math.min(1, Math.max(0, mv));
        if (this.audio.music && !this.paused) { var pp = this._bgm.play(); if (pp && pp.catch) pp.catch(function () {}); }
        else this._bgm.pause();
      }
      function setBtn(b, on) {
        if (!b) return;
        b.textContent = on ? 'ON' : 'OFF';
        b.style.background = on ? 'rgba(255,105,15,0.85)' : 'rgba(255,255,255,0.1)';
        b.style.borderColor = on ? '#FF9A5C' : 'rgba(255,255,255,0.3)';
        b.style.color = on ? '#fff' : '#9AA5B1';
      }
      function fillBar(bar, val) {
        if (!bar) return;
        var n = Math.round(val * 10);
        for (var i = 0; i < bar.children.length; i++)
          bar.children[i].style.background = i < n ? (i < 7 ? '#FFD34D' : '#FF690F') : 'rgba(255,255,255,0.12)';
      }
      setBtn(this.querySelector('.ca-mus'), this.audio.music);
      setBtn(this.querySelector('.ca-sfx'), this.audio.sfx);
      fillBar(this.querySelector('.ca-mvbar'), mv);
      fillBar(this.querySelector('.ca-svbar'), sv);
      try { localStorage.setItem('construauto-game-audio', JSON.stringify(this.audio)); } catch (e) {}
    }
    /* ===== MusicManager — loop chiptune con lookahead ===== */
    startMusic() {
      var ac = this.ensureAC();
      if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) {} }
      if (!this._bgm) {
        this._bgm = new Audio(encodeURI('uploads/Pixel Parade.mp3'));
        this._bgm.loop = true;
        this._bgm.preload = 'auto';
      }
      this._bgm.volume = Math.min(1, Math.max(0, this.audio.musicVol));
      if (this.audio.music) {
        var p = this._bgm.play();
        if (p && p.catch) p.catch(function () {});
      }
    }
    schedMusic() {
      var ac = this._ac;
      if (!ac || !this.audio.music || ac.state !== 'running') return;
      var t = ac.currentTime, stepD = 60 / SONG.bpm / 2;
      if (this._mNext < t + 0.02) this._mNext = t + 0.06;
      while (this._mNext < t + 0.55) {
        var s = this._mStep;
        for (var i = 0; i < SONG.notes.length; i++) {
          var n = SONG.notes[i];
          if (n[0] === s) this.mnote(n[1], this._mNext, n[2] * stepD, n[3]);
        }
        this._mStep = (s + 1) % SONG.len;
        this._mNext += stepD;
      }
    }
    mnote(midi, t, dur, ch) {
      try {
        var ac = this._ac;
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = ch === 1 ? 'triangle' : 'square';
        o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
        var v = ch === 1 ? 0.06 : 0.032;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(v, t + 0.015);
        g.gain.setValueAtTime(v, Math.max(t + 0.02, t + dur - 0.07));
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(this._mg);
        o.start(t); o.stop(t + dur + 0.02);
      } catch (e) {}
    }
    /* motor del auto al final: arranque + revoluciones + claxon */
    engine() {
      if (!this.audio.sfx) return;
      var ac = this.ensureAC(); if (!ac) return;
      try {
        var t = ac.currentTime, vol = this.audio.sfxVol;
        var o1 = ac.createOscillator(), o2 = ac.createOscillator();
        var f = ac.createBiquadFilter(), g = ac.createGain();
        o1.type = 'sawtooth'; o2.type = 'square';
        o1.frequency.setValueAtTime(46, t);
        o1.frequency.linearRampToValueAtTime(60, t + 0.5);
        o1.frequency.exponentialRampToValueAtTime(190, t + 2.4);
        o1.frequency.exponentialRampToValueAtTime(130, t + 3.4);
        o2.frequency.setValueAtTime(69, t);
        o2.frequency.linearRampToValueAtTime(90, t + 0.5);
        o2.frequency.exponentialRampToValueAtTime(285, t + 2.4);
        o2.frequency.exponentialRampToValueAtTime(195, t + 3.4);
        f.type = 'lowpass';
        f.frequency.setValueAtTime(320, t);
        f.frequency.linearRampToValueAtTime(900, t + 2.4);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.16 * vol, t + 0.18);
        g.gain.setValueAtTime(0.16 * vol, t + 3.0);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
        o1.connect(f); o2.connect(f); f.connect(g); g.connect(ac.destination);
        o1.start(t); o2.start(t); o1.stop(t + 4.3); o2.stop(t + 4.3);
        var self = this;
        setTimeout(function () { self.beep(440, 0.12, 'square', 0.05); }, 500);
        setTimeout(function () { self.beep(440, 0.22, 'square', 0.05); }, 700);
      } catch (e) {}
    }

    parse(idx) {
      var rows = LEVELS[idx], cfg = LEVELCFG[idx];
      this.solids = {}; this.keys = []; this.enemies = [];
      this.goal = null; this.car = null; this.startPos = { x: 32, y: 180 };
      this.spikes = [];
      var w = 0, r, c, ch, row;
      for (r = 0; r < rows.length; r++) {
        row = rows[r]; if (row.length > w) w = row.length;
        for (c = 0; c < row.length; c++) {
          ch = row[c];
          if (ch === '#' || ch === '=') this.solids[r + ',' + c] = ch;
          else if (ch === 'K') this.keys.push({ x: c * TILE + 4, y: r * TILE + 3, got: false });
          else if (ch === 'E' || ch === 'F') {
            var type = ch === 'E' ? cfg.A : cfg.B;
            var def = ENDEF[type];
            this.enemies.push({
              type: type, b: def.b, v: def.v, h: def.h, def: def,
              x: c * TILE + 8, y: r * TILE + 8,
              x0: c * TILE + 8, y0: r * TILE + 8,
              floorY: (r + 1) * TILE, row: r, col: c,
              dir: 1, t: Math.floor(Math.random() * 60), phase: 0, vy: 0, vx: 0, yOff: 0,
              mode: 0, mt: Math.random() * 100, lg: 0, cd: 0, ang: Math.random() * 6.28,
              dead: false, sq: 0
            });
          }
          else if (ch === 'P') this.startPos = { x: c * TILE + 3, y: r * TILE + 2 };
          else if (ch === 'G') this.goal = { x: c * TILE, y: r * TILE };
          else if (ch === 'A') this.car = { x: c * TILE - 8, y: r * TILE + 1, vx: 0 };
        }
      }
      /* pinchos (trampa fija, no eliminable) sobre la fila de enemigos */
      var spk = SPIKES[idx];
      if (spk) {
        var srow = rows.length - 3;
        for (var sk = 0; sk < spk.length; sk++) this.spikes.push({ col: spk[sk], row: srow });
      }
      /* suelo real bajo enemigos 'bird' (raycast hacia abajo) */
      for (var e2 = 0; e2 < this.enemies.length; e2++) {
        var en2 = this.enemies[e2];
        if (en2.b !== 'bird') continue;
        en2.gy = null;
        for (var rr = en2.row; rr < rows.length; rr++) {
          if (this.solids[rr + ',' + en2.col]) { en2.gy = rr * TILE; break; }
        }
        if (en2.gy === null) { en2.b = 'fly'; en2.def = { b: 'fly', v: 0.02, h: en2.h, range: 44, bob: 9 }; en2.v = 0.02; }
        else { en2.y = en2.gy - en2.h; en2.phase = 0; en2.t = Math.random() * 80; }
      }
      /* spans de piso y plataformas (para dibujar texturas sin superponerse) */
      this.floorSpans = []; this.platSpans = [];
      for (r = 0; r < rows.length; r++) {
        row = rows[r] || '';
        var cch = null, s = -1;
        for (c = 0; c <= row.length; c++) {
          ch = c < row.length ? row[c] : ' ';
          var isTop = (ch === '#' && !(this.solids[(r - 1) + ',' + c])) ? '#' : (ch === '=' ? '=' : null);
          if (isTop !== cch) {
            if (cch === '#') this.floorSpans.push({ x: s * TILE, y: r * TILE, w: (c - s) * TILE });
            if (cch === '=') this.platSpans.push({ x: s * TILE, y: r * TILE, w: (c - s) * TILE });
            cch = isTop; s = c;
          }
        }
      }
      /* abismos (huecos entre pisos) tapados por un arbusto a ras de piso:
         se ve como maleza en el suelo, pero es una trampa — el hueco no tiene
         colisión, así que si el personaje entra ahí cae y muere */
      this.pits = [];
      for (var bi = 0; bi < this.floorSpans.length - 1; bi++) {
        var lsp = this.floorSpans[bi], rsp = this.floorSpans[bi + 1];
        this.pits.push({ x: lsp.x + lsp.w, w: rsp.x - (lsp.x + lsp.w), y: lsp.y });
      }
      /* decoración determinista sobre los pisos */
      this.decor = [];
      var set = DECSETS[cfg.dec], di = 0;
      for (var i = 0; i < this.floorSpans.length; i++) {
        var sp = this.floorSpans[i];
        if (sp.w < TILE * 6) continue;
        var spots = sp.w >= TILE * 12 ? [0.22, 0.72] : [0.5];
        for (var j = 0; j < spots.length; j++) {
          var d = set[(idx * 2 + di) % set.length]; di++;
          var dx = sp.x + sp.w * spots[j];
          if (this.goal && Math.abs(dx - this.goal.x) < 34) continue;
          if (this.car && Math.abs(dx - this.car.x) < 46) continue;
          if (Math.abs(dx - this.startPos.x) < 26) continue;
          this.decor.push({ t: d.t, h: d.h, x: dx, y: sp.y, ph: di * 2.1, rate: 0.75 + ((di * 37) % 10) / 22 });
        }
      }
      /* nubes (espacio de pantalla, 2 profundidades) */
      this.clouds = [];
      var nc = LOW ? 3 : 6;
      for (var ci = 0; ci < nc; ci++) {
        var depth = ci % 2;
        var cw = depth ? 30 + Math.random() * 14 : 46 + Math.random() * 22;
        this.clouds.push({
          x: Math.random() * VW, y: 6 + Math.random() * 66,
          s: depth ? 0.05 + Math.random() * 0.03 : 0.11 + Math.random() * 0.05,
          w: cw, a: depth ? 0.7 : 1, p: depth ? 0.4 : 0.6,
          fi: Math.floor(Math.random() * NUBE.frames.length),
          k2: Math.random() < 0.5,
          shape: makeCloudShape(cw)
        });
      }
      /* flamencos volando (decoración de Las Coloradas): bandada en espacio de
         pantalla, cruzan el cielo con leve cabeceo y aleteo animado */
      this.flamingos = [];
      if (cfg.flamingos) {
        var nf = LOW ? 3 : 5;
        for (var fi2 = 0; fi2 < nf; fi2++) {
          this.flamingos.push({
            x: Math.random() * (VW + 200) - 100,
            y: 12 + Math.random() * 60,
            s: 0.5 + Math.random() * 0.45,
            w: 22 + Math.random() * 10, p: 0.7,
            fr: Math.floor(Math.random() * FLAM.n),
            ft: Math.floor(Math.random() * 6),
            bph: Math.random() * 6.28, bmp: 3 + Math.random() * 4
          });
        }
      }
      /* destellos de agua (anclados al fondo con su parallax) */
      this.glints = [];
      var band = WATER[cfg.bg];
      if (band) {
        var ng = LOW ? 7 : 14;
        for (var gi = 0; gi < ng; gi++) {
          this.glints.push({
            u: Math.random(), y: band[0] + Math.random() * (band[1] - band[0]),
            ph: Math.random() * 6.28, sp: 0.045 + Math.random() * 0.05, w: 2 + Math.floor(Math.random() * 3)
          });
        }
      }
      this.levelW = w * TILE;
      this.p = { x: this.startPos.x, y: this.startPos.y, vx: 0, vy: 0, ground: false, face: 1, deadT: 0, jumps: 0, landT: 0, idleT: 0 };
      this.signT = 0;
      this.safe = { x: this.startPos.x, y: this.startPos.y };
      this._safeT = 0;
      this.parts = [];
      this.explosions = [];
      this.camX = 0;
      this.needMsgT = 0;
      this.levelT = 0;
    }
    saveLevel() { try { localStorage.setItem('construauto-game-level', String(this.level)); } catch (e) {} }
    resetLevel() { if (this.state === 'play') { this.parse(this.level); this.beep(140, 0.15, 'sawtooth'); } }
    /* --- modo prueba (temporal) --- */
    devClear() {
      if (this.state !== 'play') return;
      for (var i = 0; i < this.enemies.length; i++) {
        var en = this.enemies[i];
        if (!en.dead) { en.dead = true; en.sq = 16; }
      }
      this.spikes = [];
      this.beep(880, 0.08); this.beep(1200, 0.1);
    }
    devNext() {
      if (this.state !== 'play') return;
      if (this.level < LEVELS.length - 1) {
        this.level++; this.saveLevel(); this.parse(this.level);
        this.beep(660, 0.08); this.beep(990, 0.1);
      } else {
        this.beep(300, 0.12, 'sawtooth');
      }
    }
    start() { this.state = 'play'; this.lives = 5; this.levelT = 0; this.beep(660, 0.08); this.beep(880, 0.1); if (this.audio.music) this.startMusic(); }
    press() {
      if (this.state === 'menu') return;
      if (!this.inp.jHeld) { this.jbuf = CFG.player.buffer; }
      this.inp.jHeld = true;
    }

    solidPx(x, y) { return !!this.solids[Math.floor(y / TILE) + ',' + Math.floor(x / TILE)]; }
    solidRect(x, y, w, h) {
      var c0 = Math.floor(x / TILE), c1 = Math.floor((x + w - 0.01) / TILE);
      var r0 = Math.floor(y / TILE), r1 = Math.floor((y + h - 0.01) / TILE);
      for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) if (this.solids[r + ',' + c]) return true;
      return false;
    }
    hit(ax, ay, aw, ah, bx, by, bw, bh) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    dust(x, y, n, up) {
      if (LOW) n = Math.max(2, Math.floor(n / 2));
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        this.parts.push({
          x: x + Math.cos(a) * 3, y: y - Math.random() * 2,
          vx: Math.cos(a) * (up ? 0.9 : 0.5) + (Math.random() - 0.5) * 0.4,
          vy: up ? -Math.random() * 0.8 : -(0.3 + Math.random() * 0.5),
          t: 14 + Math.random() * 8
        });
      }
    }
    updateParts(dt) {
      for (var i = this.parts.length - 1; i >= 0; i--) {
        var p = this.parts[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.02 * dt; p.t -= dt;
        if (p.t <= 0) this.parts.splice(i, 1);
      }
      for (var j = 0; j < this.clouds.length; j++) {
        var cl = this.clouds[j];
        cl.x += cl.s * dt;
        var csx = cl.x - this.camX * cl.p;
        var cvw = cl.w * 1.6;
        if (csx - cvw > VW + 40) { cl.x = this.camX * cl.p - cvw - 10 - Math.random() * 60; cl.y = 6 + Math.random() * 66; }
        else if (csx + cvw < -40) { cl.x = this.camX * cl.p + VW + 20 + Math.random() * 60; cl.y = 6 + Math.random() * 66; }
      }
      if (this.flamingos) {
        for (var fj = 0; fj < this.flamingos.length; fj++) {
          var fl = this.flamingos[fj];
          fl.x += fl.s * dt;
          fl.ft += dt;
          if (fl.ft >= 6) { fl.ft -= 6; fl.fr = (fl.fr + 1) % FLAM.n; }
          var fsx = fl.x - this.camX * fl.p;
          if (fsx - fl.w > VW + 60) { fl.x = this.camX * fl.p - fl.w - 40 - Math.random() * 120; fl.y = 12 + Math.random() * 60; }
          else if (fsx + fl.w * 2 < -60) { fl.x = this.camX * fl.p + VW + 40 + Math.random() * 120; fl.y = 12 + Math.random() * 60; }
        }
      }
    }

    boom(x, y) {
      if (!this.explosions) this.explosions = [];
      this.explosions.push({ x: x, y: y, start: this.tick });
      this.beep(90, 0.32, 'sawtooth', 0.07); this.beep(55, 0.5, 'sawtooth', 0.06);
    }
    hurt() {
      var p = this.p;
      if (p.deadT > 0 || this.invulnT > 0) return;
      this.lives--;
      p.deadT = 30;
      this.signT = 0; p.idleT = 0;
      this.beep(110, 0.25, 'sawtooth', 0.06);
    }

    enemyBox(en) {
      var def = PIX[en.type];
      var w = def ? en.h * def.w / def.rows : en.h;
      var x, y;
      if (en.b === 'walk') { x = en.x - w / 2; y = en.floorY - en.h + (en.yOff || 0); }
      else if (en.b === 'hop' || en.b === 'bird') { x = en.x - w / 2; y = en.y; }
      else { x = en.x - w / 2; y = en.y - en.h / 2; }
      return { x: x, y: y, w: w, h: en.h };
    }

    /* caja de DAÑO ajustada al sprite visible (no al centro): usa el tamaño
       real dibujado y, en los que muerden, la sesga hacia el frente (boca) */
    enemyHitBox(en) {
      var box = this.enemyBox(en);
      var dim = null, sc = 1, bite = false;
      var t = en.type;
      if (t === 'iguana') { dim = IGUANA; sc = 1.30; bite = true; }
      else if (t === 'serpiente') { dim = SNAKE; sc = 1.35; bite = true; }
      else if (t === 'ogro') { dim = OGRO; sc = 1.9; bite = true; }
      else if (t === 'cocodrilo') { dim = COCO; sc = 1.35; bite = true; }
      else if (t === 'coyote') { dim = COYOTE; sc = 1.85; bite = true; }
      else if (t === 'cangrejorojo') { dim = CRAB; sc = 1.45; }
      else if (t === 'abeja') { dim = ABEJA; sc = 1.7; bite = true; }
      else if (t === 'murcielago') { dim = BAT; sc = 1.6; bite = true; }
      else if (t === 'cuervo') { dim = CUERVO; sc = 1.35; bite = true; }
      else if (t === 'rana') { dim = RANA; sc = 1.42; }
      else if (t === 'arana') { dim = ARANA; sc = 2.0; }
      else if (t === 'alux') { dim = ALUX; sc = 1.1; bite = true; }
      else if (t === 'bomba') { dim = BOMBA; sc = 1.4; }
      if (!dim) return box;
      var dh = en.h * sc, dw = dh * dim.fw / dim.fh;
      var cx = box.x + box.w / 2, feet = box.y + box.h;
      if (t === 'coyote') feet -= dh * (128 - 105) / 128;   /* patas reales del coyote */
      var hw = dw * (bite ? 0.66 : 0.62), hh = dh * 0.74;
      var off = bite ? en.dir * dw * 0.12 : 0;              /* sesgo hacia la boca */
      return { x: cx + off - hw / 2, y: feet - hh, w: hw, h: hh };
    }

    /* embestida aérea leve: cuando el jugador queda cerca, el ave/insecto
       se lanza un momento hacia él (offset ax/ay), luego regresa a su vuelo.
       Modulada para ser suave: alcance corto, empuje pequeño y con pausa. */
    mildSwoop(en, p, dt) {
      if (en.ax === undefined) { en.ax = 0; en.ay = 0; en.cd = en.cd || 0; en.sw = 0; }
      if (p.deadT > 0) { en.ax *= Math.pow(0.9, dt); en.ay *= Math.pow(0.9, dt); return; }
      var pdx = (p.x + PW / 2) - en.x;
      var pdy = (p.y + PH / 2) - en.y;
      var dist = Math.sqrt(pdx * pdx + pdy * pdy);
      en.cd -= dt;
      if (en.sw > 0) {
        en.sw -= dt;
        en.ax += pdx * 0.012 * dt;
        en.ay += pdy * 0.012 * dt;
      } else {
        en.ax *= Math.pow(0.92, dt);
        en.ay *= Math.pow(0.92, dt);
        if (dist < 66 * DRG && en.cd <= 0) { en.sw = 18; en.cd = 210 * DCD; this.beep(210, 0.06, 'sawtooth', 0.025); }
      }
      var mo = 24;
      if (en.ax > mo) en.ax = mo; else if (en.ax < -mo) en.ax = -mo;
      if (en.ay > mo) en.ay = mo; else if (en.ay < -mo) en.ay = -mo;
    }

    /* ===== EnemyController — patrón propio por enemigo ===== */
    updateEnemies(dt) {
      var p = this.p;
      for (var i = 0; i < this.enemies.length; i++) {
        var en = this.enemies[i];
        if (en.dead) { if (en.sq > 0) en.sq -= dt; continue; }
        en.t += dt;
        var d = en.def;
        if (en.b === 'walk') {
          var canMove = true;
          /* alux: detecta al jugador y lo persigue */
          var chasing = false;
          if (d.chase && p.deadT <= 0) {
            var cdx = (p.x + PW / 2) - en.x;
            var cdy = Math.abs((p.y + PH) - en.floorY);
            if (Math.abs(cdx) < d.chase.r && cdy < 34) {
              chasing = true;
              en.mode = 0; en.mt = 0; en.yOff = 0;
              en.dir = cdx > 0 ? 1 : -1;
            }
          } else if (p.deadT <= 0) {
            /* ataque leve: si el jugador pasa cerca y al mismo nivel,
               el animal lo encara y camina hacia él a su ritmo normal */
            var adx = (p.x + PW / 2) - en.x;
            var ady = Math.abs((p.y + PH) - en.floorY);
            if (Math.abs(adx) < 62 && ady < 26) en.dir = adx > 0 ? 1 : -1;
          }
          /* pausas (iguana / alux) */
          if (d.pauseEvery && !chasing) {
            en.mt += dt;
            if (en.mode === 1) {
              canMove = false;
              if (d.tease) { /* alux: gesto burlón */
                en.yOff = -Math.abs(Math.sin(en.t * 0.28)) * 5;
                en.dir = Math.sin(en.t * 0.33) > 0 ? 1 : -1;
              }
              if (en.mt > d.pauseDur) {
                en.mode = 0; en.mt = 0;
                if (Math.sin(en.x * 12.9898 + en.t) > 0.3) en.dir *= -1;
              }
            } else if (en.mt > d.pauseEvery * (0.75 + ((i * 53) % 10) / 20)) {
              en.mode = 1; en.mt = 0;
            }
          }
          /* embestida: la serpiente usa la suya; el resto una versión leve */
          var sp = (chasing ? d.chase.v : en.v) * DSP;
          var lg = d.lunge || (d.chase ? null : MILDLUNGE);
          if (lg && !chasing) {
            if (en.cd > 0) en.cd -= dt;
            var pdx = (p.x + PW / 2) - en.x;
            if (en.lg > 0) { en.lg -= dt; sp = lg.v * DSP; }
            else if (en.cd <= 0 && Math.abs(pdx) < lg.r * DRG && Math.abs((p.y + PH) - en.floorY) < 26 && p.deadT <= 0) {
              en.lg = lg.dur; en.dir = pdx > 0 ? 1 : -1; en.cd = lg.cd * DCD;
              this.beep(180, 0.08, 'sawtooth', 0.03);
            }
          }
          if (canMove) {
            var fx = en.dir > 0 ? en.x + 11 : en.x - 11;
            if (this.solidPx(fx, en.floorY - 6) || !this.solidPx(fx, en.floorY + 4)) {
              en.dir *= -1; en.lg = 0;
              /* si persigue y hay borde/pared, no rebota infinito: se detiene este frame */
              if (chasing) en.x += 0;
            } else en.x += en.dir * sp * dt;
            if (!d.tease) en.yOff = 0;
            if (d.hop) { var ph = en.t % 130; if (ph < 18) en.yOff = -Math.sin(Math.PI * ph / 18) * 7; }
          }
        } else if (en.b === 'bird') {
          en.x -= en._sx || 0; en.y -= en._sy || 0;
          /* paloma: camina un poco, vuela un tramo, aterriza */
          if (en.phase === 0) {
            en.y = en.gy - en.h;
            en.x += en.dir * en.v * dt;
            if (en.x > en.x0 + d.range * 0.5) en.dir = -1;
            if (en.x < en.x0 - d.range * 0.5) en.dir = 1;
            if (en.t > 120) {
              en.phase = 1; en.t = 0; en.u = 0; en.fx = en.x;
              var tx = en.x + en.dir * (36 + Math.random() * 30);
              if (tx > en.x0 + d.range) { en.dir = -1; tx = en.x - 50; }
              if (tx < en.x0 - d.range) { en.dir = 1; tx = en.x + 50; }
              en.tx = tx;
            }
          } else {
            en.u += 0.011 * dt;
            var u = Math.min(1, en.u);
            en.x = en.fx + (en.tx - en.fx) * u;
            en.y = en.gy - en.h - Math.sin(Math.PI * u) * 34;
            if (u >= 1) { en.phase = 0; en.t = 0; en.y = en.gy - en.h; }
          }
          this.mildSwoop(en, p, dt);
          en._sx = en.ax || 0; en._sy = en.ay || 0;
          en.x += en._sx; en.y += en._sy;
          if (en._sx !== 0) en.dir = en._sx > 0 ? 1 : -1;
        } else if (en.b === 'fly') {
          en.x = en.x0 + Math.sin(en.t * en.v) * d.range;
          en.y = en.y0 + Math.sin(en.t * 0.09) * d.bob;
          en.dir = Math.cos(en.t * en.v) >= 0 ? 1 : -1;
          this.mildSwoop(en, p, dt);
          en.x += en.ax || 0; en.y += en.ay || 0;
          if ((en.ax || 0) !== 0) en.dir = en.ax > 0 ? 1 : -1;
        } else if (en.b === 'hop') {
          if (en.phase === 0) {
            en.y = en.floorY - en.h;
            if (en.t > 55) {
              var hdx = (p.x + PW / 2) - en.x;
              if (p.deadT <= 0 && Math.abs(hdx) < 72) en.dir = hdx > 0 ? 1 : -1;
              en.phase = 1; en.vy = -4.4; en.vx = en.dir * en.v * DSP; en.t = 0;
            }
          } else {
            en.vy += 0.35 * dt; en.y += en.vy * dt; en.x += en.vx * dt;
            if (en.x < en.x0 - 44 || en.x > en.x0 + 44) { en.dir *= -1; en.vx = -en.vx; }
            if (en.y >= en.floorY - en.h) { en.y = en.floorY - en.h; en.phase = 0; en.t = 0; en.vx = 0; }
          }
        } else if (en.b === 'fall') {
          if (en.phase === 0) {
            en.y = en.y0;
            if (Math.abs((p.x + PW / 2) - en.x) < 15 && p.y > en.y - 10) { en.phase = 1; en.vy = 0; }
          } else if (en.phase === 1) {
            en.vy += 0.38 * dt; en.y += en.vy * dt;
            if (en.y > VH + 30 || this.solidRect(en.x - 5, en.y + 4, 10, 4)) {
              if (en.y <= VH + 30) this.dust(en.x, en.y + 5, 6, false); /* impacto */
              en.phase = 2; en.t = 0;
            }
          } else if (en.t > 130) { en.phase = 0; en.y = en.y0; }
        } else if (en.b === 'pend') {
          /* araña: péndulo + descenso rápido si el jugador está cerca */
          var near = Math.abs((p.x + PW / 2) - en.x0) < d.dartR && (p.y + PH) > en.y0;
          en.ang += en.v * (near ? 3 : 1) * dt;
          en.y = en.y0 + (1 + Math.sin(en.ang)) * (d.drop / 2);
          en.x = en.x0;
        }
        if (en.b === 'fall' && en.phase === 2) continue;
        var bx = this.enemyHitBox(en);
        if (this.hit(p.x + 1, p.y + 2, PW - 2, PH - 3, bx.x + 2, bx.y + 2, bx.w - 4, bx.h - 3)) {
          /* la bomba explota al contacto: animación de explosión + daño */
          if (en.type === 'bomba' && p.deadT <= 0) {
            en.dead = true; en.sq = 0;
            this.boom(bx.x + bx.w / 2, bx.y + bx.h / 2);
            this.hurt();
            continue;
          }
          /* pisotón: cayendo y con los pies por encima del enemigo (ventana generosa) */
          if (p.vy > 0.4 && (p.y + PH) < bx.y + Math.max(8, bx.h * 0.6) && p.deadT <= 0) {
            en.dead = true; en.sq = 16;
            this.dust(en.x, bx.y + 2, 8, true);
            p.vy = -4.8; p.jumps = 1; p.landT = 0;
            this.beep(340, 0.08); this.beep(170, 0.12, 'triangle', 0.05);
          } else this.hurt();
        }
      }
    }

    /* ===== PlayerController + bucle principal (delta time) ===== */
    update(dt) {
      if (this.paused) return;
      this.tick += dt;
      this.updateParts(dt);
      if (this.state === 'msg') {
        this.msgT -= dt;
        if (this.msgT <= 0) {
          this.level++; this.saveLevel(); this.parse(this.level); this.state = 'play';
        }
        return;
      }
      if (this.state === 'drive') {
        this.car.vx = Math.min(4, this.car.vx + 0.06 * dt);
        this.car.x += this.car.vx * dt;
        this.camX = Math.min(this.levelW - VW, Math.max(0, this.car.x - VW * 0.4));
        if (this.car.x > this.camX + VW + 60 || this.car.x > this.levelW + 60) this.showPrize();
        return;
      }
      if (this.state === 'cine') { this.updateCine(dt); return; }
      if (this.state === 'gameover') {
        this.goT -= dt;
        if (this.goT <= 0) {
          this.level = 0; this.saveLevel(); this.lives = 5;
          this.parse(0); this.state = 'menu';
        }
        return;
      }
      if (this.state !== 'play') return;
      this.levelT += dt;

      var p = this.p;
      if (this.invulnT > 0) this.invulnT -= dt;
      if (p.deadT > 0) {
        p.deadT -= dt;
        if (p.deadT <= 0) {
          p.deadT = 0;
          if (this.lives <= 0) {
            this.state = 'gameover'; this.goT = 150;
            this.beep(220, 0.2, 'sawtooth', 0.05); this.beep(160, 0.25, 'sawtooth', 0.05); this.beep(90, 0.5, 'sawtooth', 0.06);
            return;
          }
          p.x = this.safe.x; p.y = this.safe.y;
          p.vx = 0; p.vy = 0; p.jumps = 0;
          this.invulnT = 80;
        }
        return;
      }

      /* --- movimiento horizontal: aceleración suave, frenado firme --- */
      var acc = CFG.player.acc, maxv = CFG.player.maxSpeed;
      var moving = this.inp.l || this.inp.r;
      if (this.inp.l) { p.vx = Math.max(-maxv, p.vx - acc * dt); p.face = -1; }
      else if (this.inp.r) { p.vx = Math.min(maxv, p.vx + acc * dt); p.face = 1; }
      else p.vx *= Math.pow(p.ground ? CFG.player.frictionG : CFG.player.frictionA, dt);
      if (!moving && Math.abs(p.vx) < 0.08) p.vx = 0;

      /* --- salto: coyote + buffer + doble salto --- */
      if (p.ground) { this.coyote = CFG.player.coyote; p.jumps = 0; }
      else if (this.coyote > 0) this.coyote -= dt;
      if (this.jbuf > 0) this.jbuf -= dt;
      if (this.jbuf > 0) {
        if (this.coyote > 0) {                      /* 1er salto */
          p.vy = -CFG.player.jump1; p.ground = false; this.coyote = 0; this.jbuf = 0; p.jumps = 1;
          this.beep(240, 0.1); this.beep(420, 0.08);
        } else if (p.jumps <= 1) {                  /* 2do salto (más corto) */
          p.vy = -CFG.player.jump2; this.jbuf = 0; p.jumps = 2;
          this.dust(p.x + PW / 2, p.y + PH, 8, true);
          this.beep(500, 0.07); this.beep(720, 0.09);
        }
      }
      /* corte de salto variable */
      if (!this.inp.jHeld && p.vy < -2.5) p.vy = -2.5;
      /* gravedad: subida rápida, bajada controlada (sin flotar) */
      var grav = p.vy < 0 ? CFG.player.gravityUp : CFG.player.gravityDown;
      p.vy = Math.min(CFG.player.maxFall, p.vy + grav * dt);

      /* --- integración y colisiones --- */
      p.x += p.vx * dt;
      if (this.solidRect(p.x, p.y, PW, PH)) {
        if (p.vx > 0) p.x = Math.floor((p.x + PW) / TILE) * TILE - PW - 0.01;
        else p.x = (Math.floor(p.x / TILE) + 1) * TILE + 0.01;
        p.vx = 0;
      }
      if (p.x < 0) p.x = 0;
      if (p.x > this.levelW - PW) p.x = this.levelW - PW;

      var fallV = p.vy;
      p.y += p.vy * dt;
      var wasGround = p.ground;
      p.ground = false;
      if (this.solidRect(p.x, p.y, PW, PH)) {
        if (p.vy > 0) { p.y = Math.floor((p.y + PH) / TILE) * TILE - PH - 0.01; p.ground = true; }
        else p.y = (Math.floor(p.y / TILE) + 1) * TILE + 0.01;
        p.vy = 0;
      }
      /* aterrizaje */
      if (p.ground && !wasGround && fallV > 2.4) {
        p.landT = CFG.anim.landDur;
        this.dust(p.x + PW / 2, p.y + PH, 6, false);
        this.beep(150, 0.05, 'triangle', 0.03);
      }
      if (p.landT > 0) p.landT -= dt;
      if (p.y > VH + 60) this.hurt();

      /* posición segura (para reaparecer tras daño) */
      if (p.ground) {
        this._safeT += dt;
        if (this._safeT > 15) {
          this._safeT = 0;
          var okSafe = true;
          for (var si = 0; si < this.enemies.length; si++) {
            var se = this.enemies[si];
            if (!se.dead && Math.abs(se.x - p.x) < 42 && Math.abs((se.y || se.floorY) - p.y) < 46) { okSafe = false; break; }
          }
          if (okSafe) { this.safe.x = p.x; this.safe.y = p.y; }
        }
      }

      /* --- idle: letrero "ConstruAuto" tras 3 s quieto --- */
      var still = p.ground && !moving && Math.abs(p.vx) < 0.05 && p.deadT <= 0;
      if (this.signT > 0) {
        this.signT -= dt;
        if (!still) this.signT = 0;              /* se movió/saltó: desaparece */
        if (this.signT <= 0) { this.signT = 0; p.idleT = 0; }  /* reinicia timer */
      } else if (still) {
        p.idleT += dt;
        if (p.idleT >= CFG.anim.signDelay) this.signT = CFG.anim.signDur;
      } else p.idleT = 0;

      this.updateEnemies(dt);

      var got = 0;
      for (var i = 0; i < this.keys.length; i++) {
        var k = this.keys[i];
        if (!k.got) {
          /* magnetismo de corto alcance: si el personaje pasa muy cerca,
             la llave es atraída hacia él y se recoge sola */
          var kcx = k.x + 4, kcy = k.y + 4;
          var pcx = p.x + PW / 2, pcy = p.y + PH / 2;
          var mdx = pcx - kcx, mdy = pcy - kcy;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 22) {
            k.x += mdx * 0.35 * dt; k.y += mdy * 0.35 * dt;
          }
          if (mdist < 9 || this.hit(p.x - 2, p.y - 2, PW + 4, PH + 4, k.x - 1, k.y - 3, 12, 15)) {
            k.got = true; this.beep(880, 0.09); this.beep(1320, 0.12);
          }
        }
        if (k.got) got++;
      }
      this.got = got;

      var full = got === this.keys.length;
      if (this.goal && this.hit(p.x, p.y, PW, PH, this.goal.x - 2, this.goal.y - 26, 22, 42)) {
        if (full) {
          if (this.level >= LEVELS.length - 1) {   /* último nivel: entra la cinemática */
            this.startCine();
            this.beep(660, 0.1); this.beep(880, 0.1); this.beep(1320, 0.25);
          } else {
            this.state = 'msg'; this.msgT = 80;
            this.beep(660, 0.1); this.beep(880, 0.1); this.beep(1100, 0.2);
          }
        } else this.needMsgT = 60;
      }
      if (this.car && this.hit(p.x, p.y, PW, PH, this.car.x - 9, this.car.y - 16, 56, 32)) {
        if (full) {
          this.startCine();
          this.beep(660, 0.1); this.beep(880, 0.1); this.beep(1320, 0.25);
        } else this.needMsgT = 60;
      }
      if (this.needMsgT > 0) this.needMsgT -= dt;

      /* pinchos: daño al contacto, no se pueden eliminar */
      for (var si = 0; si < this.spikes.length; si++) {
        var sk = this.spikes[si];
        var sx = sk.col * TILE, sy = (sk.row + 1) * TILE - 11;
        if (this.hit(p.x, p.y, PW, PH, sx + 2, sy, TILE - 4, 11)) { this.hurt(); break; }
      }

      var target = Math.min(Math.max(0, p.x - VW / 2), Math.max(0, this.levelW - VW));
      this.camX += (target - this.camX) * (1 - Math.pow(0.88, dt));
    }

    /* ===== CINEMÁTICA FINAL: Claudina frente a la oficina + el auto;
       el personaje llega corriendo y celebran juntos ===== */
    startCine() {
      this.state = 'cine';
      if (this.audio.music) this.startMusic();
      this.cine = {
        t: 0, phase: 0, celT: 0,
        groundY: 210,
        claudX: 292, carX: 386,
        heroX: -34, heroSpeed: 3.0, heroTargetX: 244,
        conf: []
      };
    }
    updateCine(dt) {
      var cn = this.cine; if (!cn) return;
      cn.t += dt;
      if (cn.phase === 0) {
        cn.heroX += cn.heroSpeed * dt;
        if (cn.heroX >= cn.heroTargetX) {
          cn.heroX = cn.heroTargetX; cn.phase = 1; cn.celT = 0;
          this.beep(660, 0.1); this.beep(880, 0.12); this.beep(1100, 0.22);
          for (var i = 0; i < 60; i++) this.spawnConfetti(true);
        }
      } else {
        cn.celT += dt;
        if (cn.celT % 4 < dt) { this.spawnConfetti(false); this.spawnConfetti(false); }
        if (cn.celT > 230) this.showPrize();
      }
      /* física del confeti */
      for (var j = cn.conf.length - 1; j >= 0; j--) {
        var p = cn.conf[j];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.05 * dt;
        p.vx *= Math.pow(0.99, dt); p.rot += p.vr * dt; p.t -= dt;
        if (p.t <= 0 || p.y > VH + 12) cn.conf.splice(j, 1);
      }
    }
    spawnConfetti(burst) {
      var cn = this.cine; if (!cn) return;
      var cx = cn.claudX;
      cn.conf.push({
        x: burst ? cx + (Math.random() - 0.5) * 80 : Math.random() * VW,
        y: burst ? cn.groundY - 60 - Math.random() * 40 : -6,
        vx: (Math.random() - 0.5) * (burst ? 3.2 : 0.8),
        vy: burst ? -1.6 - Math.random() * 2.2 : 0.5 + Math.random() * 1.1,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
        w: 3 + Math.floor(Math.random() * 3), h: 2 + Math.floor(Math.random() * 3),
        col: CONFCOL[Math.floor(Math.random() * CONFCOL.length)],
        t: 90 + Math.random() * 60
      });
    }
    /* dibuja un actor de hoja de sprites: centro en cx, pies en feetY */
    cineActor(sheet, dim, fi, cx, feetY, h, flip, yOff) {
      if (!okImg(sheet)) return;
      var c = this.cx;
      var w = h * dim.fw / dim.fh;
      var fr = dim.frames[fi % dim.frames.length];
      var dy = feetY - h - (yOff || 0);
      c.save();
      c.imageSmoothingEnabled = true;
      if (flip) {
        c.translate(cx, 0); c.scale(-1, 1);
        c.drawImage(sheet, fr[0], fr[1], dim.fw, dim.fh, -w / 2, dy, w, h);
      } else {
        c.drawImage(sheet, fr[0], fr[1], dim.fw, dim.fh, cx - w / 2, dy, w, h);
      }
      c.restore();
    }
    drawCine() {
      var c = this.cx, cn = this.cine;
      /* paisaje a pantalla completa (cover) */
      var img = SPR.paisaje;
      if (okImg(img)) {
        var s = Math.max(VW / img.naturalWidth, VH / img.naturalHeight);
        var w = img.naturalWidth * s, h = img.naturalHeight * s;
        c.save(); c.imageSmoothingEnabled = true;
        c.drawImage(img, (VW - w) / 2, (VH - h) / 2, w, h);
        c.restore();
      } else { c.fillStyle = COL.bg1; c.fillRect(0, 0, VW, VH); }
      if (!cn) return;
      var gy = cn.groundY;
      /* auto estacionado (mira a la izquierda, hacia la oficina) */
      this.cineActor(SPR.autoCine, AUTOC, Math.floor(this.tick / 6) % 8, cn.carX, gy, 50, false, 0);
      /* Claudina: saluda mientras el personaje llega; celebra al reunirse */
      if (cn.phase === 0) {
        this.cineActor(SPR.claudina, CLAUD, Math.floor(this.tick / 8) % 8, cn.claudX, gy, 60, false, 0);
      } else {
        this.cineActor(SPR.claudCel, CLAUDC, Math.floor(cn.celT / 6) % 8, cn.claudX, gy, 60, false, 0);
      }
      /* personaje jugador: corre hacia Claudina; al llegar posa con la llave (sin brincar) */
      if (cn.phase === 0) {
        var rfi = Math.floor(this.tick / 4) % 6;
        this.cineActor(SPR.sheet, SHEET, rfi, cn.heroX, gy, 58, false, 0);
      } else {
        var hfi = Math.floor(cn.celT / 12) % 8;
        this.cineActor(SPR.cineKey, CINEKEY, hfi, cn.heroX, gy, 60, false, 0);
      }
      /* confeti */
      for (var i = 0; i < cn.conf.length; i++) {
        var p = cn.conf[i];
        c.save();
        c.globalAlpha = Math.min(1, p.t / 30);
        c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillStyle = p.col;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c.restore();
      }
      c.globalAlpha = 1;
      /* rótulo de celebración */
      if (cn.phase === 1 && cn.celT > 12)
        this.txt('¡BIENVENIDO A CONSTRUAUTO!', VW / 2, 26, 9, COL.accent);
    }
    showPrize() {
      this.state = 'prize';
      var stored = null;
      try { stored = JSON.parse(localStorage.getItem('construauto-game-prize') || 'null'); } catch (e) {}
      if (!stored || !stored.code) {
        stored = { label: pickPrize().label, code: makeCode(), date: new Date().toISOString() };
        try { localStorage.setItem('construauto-game-prize', JSON.stringify(stored)); } catch (e) {}
      }
      this.querySelector('.ca-prize-label').textContent = stored.label;
      this.querySelector('.ca-prize-code').textContent = stored.code;
      var num = (this.getAttribute('whatsapp') || '529991413325').replace(/\D/g, '');
      var msg = 'Hola, terminé el Reto ConstruAuto 🎮 y gané: ' + stored.label + '. Mi código es ' + stored.code + '. ¿Cómo lo reclamo?';
      this.querySelector('.ca-prize-wa').href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
      this.querySelector('.ca-prize').style.display = 'flex';
      try { localStorage.setItem('construauto-game-level', '0'); } catch (e) {}
      this.level = 0;
    }

    /* ---------- dibujo ---------- */
    /* ===== AnimationController / render ===== */
    px(x, y, w, h, col) {
      this.cx.fillStyle = col;
      this.cx.fillRect(Math.round(x - this.camX), Math.round(y), w, h);
    }
    txt(t, x, y, size, col, align) {
      var c = this.cx;
      c.font = size + 'px "Press Start 2P", monospace';
      c.textAlign = align || 'center'; c.textBaseline = 'top';
      c.lineWidth = 3; c.lineJoin = 'round'; c.strokeStyle = COL.outline;
      c.strokeText(t, x, y);
      c.fillStyle = col; c.fillText(t, x, y);
    }

    drawBackdrop() {
      var c = this.cx;
      var cfg = LEVELCFG[this.level];
      var img = BG[cfg.bg];
      if (okImg(img)) {
        c.save(); c.imageSmoothingEnabled = true;
        if (cfg.notile) {
          /* panorama único (sin repetir) que YA incluye su propio suelo:
             se dibuja llenando toda la altura del viewport, así su borde
             inferior siempre llega hasta abajo (sin huecos). El piso del
             juego se pinta encima. El letrero (MÉRIDA) queda justo sobre
             la línea de suelo. Parallax lento. */
          /* zoom opcional (acerca el paisaje) anclado a la línea de suelo,
             para que la barda de piedra crezca hacia abajo y tape los huecos
             del piso sin descuadrar el nivel */
          var Z = cfg.zoom || 1;
          var hN = VH * Z;
          var wN = hN * img.naturalWidth / img.naturalHeight;
          var groundY = (this.floorSpans && this.floorSpans[0]) ? this.floorSpans[0].y : VH * 0.75;
          var yT = Math.round(groundY * (1 - Z));
          var spanN = Math.max(1, this.levelW - VW);
          var pN = Math.max(0, Math.min(0.45, (wN - VW) / spanN));
          c.drawImage(img, -this.camX * pN, yT, wN + 1, hN);
          c.restore();
          return wN;
        }
        var h = VH, w = h * img.naturalWidth / img.naturalHeight;
        var off = (this.camX * 0.4) % w;
        for (var x = -off; x < VW; x += w) c.drawImage(img, x, 0, w + 1, h);
        c.restore();
        return w;
      }
      c.fillStyle = COL.bg1; c.fillRect(0, 0, VW, VH);
      return VW;
    }

    drawFlamingos() {
      if (!this.flamingos || !okImg(SPR.flamenco)) return;
      var c = this.cx;
      c.save(); c.imageSmoothingEnabled = true;
      for (var i = 0; i < this.flamingos.length; i++) {
        var fl = this.flamingos[i];
        var fw = fl.w, fh = fw * FLAM.fh / FLAM.fw;
        var y = fl.y + Math.sin(this.tick * 0.05 + fl.bph) * fl.bmp;
        var rx = Math.round(fl.x - this.camX * fl.p), ry = Math.round(y);
        /* el sprite mira a la IZQUIERDA pero la bandada avanza a la DERECHA:
           se voltea en horizontal para que vuele hacia donde se mueve */
        c.save();
        c.translate(rx + fw / 2, ry + fh / 2);
        c.scale(-1, 1);
        c.drawImage(SPR.flamenco, fl.fr * FLAM.fw, 0, FLAM.fw, FLAM.fh,
          -fw / 2, -fh / 2, fw, fh);
        c.restore();
      }
      c.restore();
    }

    drawClouds() {
      var c = this.cx;
      if (okImg(SPR.nube) && okImg(SPR.nube2)) {
        c.imageSmoothingEnabled = true;
        for (var n = 0; n < this.clouds.length; n++) {
          var nc2 = this.clouds[n];
          var sheet = nc2.k2 ? SPR.nube2 : SPR.nube;
          var dim = nc2.k2 ? NUBE2 : NUBE;
          var nw = nc2.w * 1.5, nh = nw * dim.fh / dim.fw;
          var nfr = dim.frames[nc2.fi];
          c.globalAlpha = nc2.a;
          c.drawImage(sheet, nfr[0], nfr[1], dim.fw, dim.fh,
            Math.round(nc2.x - this.camX * nc2.p), Math.round(nc2.y), Math.round(nw), Math.round(nh));
        }
        c.globalAlpha = 1;
        return;
      }
      for (var i = 0; i < this.clouds.length; i++) {
        var cl = this.clouds[i], sh = cl.shape, u = sh.u;
        var x = Math.round((cl.x - this.camX * cl.p) / 2) * 2, y = Math.round(cl.y / 2) * 2;
        c.globalAlpha = cl.a;
        for (var r = 0; r < sh.runs.length; r++) {
          var run = sh.runs[r];
          c.fillStyle = CLOUD_COLS[run.ci];
          c.fillRect(x + run.x * u, y + run.y * u, run.len * u, u);
        }
        c.globalAlpha = 1;
      }
    }

    drawGlints(bgW) {
      if (!this.glints.length) return;
      var c = this.cx;
      var off = (this.camX * 0.4) % bgW;
      for (var i = 0; i < this.glints.length; i++) {
        var g = this.glints[i];
        var a = 0.5 + 0.5 * Math.sin(this.tick * g.sp + g.ph);
        if (a < 0.25) continue;
        var x = (g.u * bgW - off + bgW) % bgW;
        for (var rep = x - bgW; rep < VW; rep += bgW) {
          if (rep + g.w < 0) continue;
          c.globalAlpha = a * 0.55;
          c.fillStyle = '#EAF9FF';
          c.fillRect(Math.round(rep), Math.round(g.y), g.w, 1);
        }
      }
      c.globalAlpha = 1;
    }

    drawTerrain() {
      var c = this.cx, i, sp;
      c.save();
      c.imageSmoothingEnabled = true;
      var tx = LEVELCFG[this.level].tex;
      var piso = (tx && okImg(TEX['piso' + tx])) ? TEX['piso' + tx] : TEX.piso;
      for (i = 0; i < this.floorSpans.length; i++) {
        sp = this.floorSpans[i];
        var sx = sp.x - this.camX;
        if (sx > VW || sx + sp.w < 0) continue;
        if (okImg(piso)) {
          var dh = 64, natW = piso.naturalWidth, natH = piso.naturalHeight;
          var dw = dh * natW / natH;
          var lx = Math.round(sx);
          /* ancho del remate en pantalla (~una piedra); su equivalente nativo */
          var capW = Math.min(56, Math.floor(sp.w / 2));
          var capN = Math.max(1, Math.round(capW * natH / dh));
          c.save();
          c.beginPath(); c.rect(lx, sp.y, sp.w, VH - sp.y); c.clip();
          /* relleno: el borde IZQUIERDO ya arranca en el inicio terminado de la textura */
          for (var x = 0; x < sp.w + dw; x += dw)
            c.drawImage(piso, lx + Math.round(x), sp.y, dw + 1, dh);
          /* remate DERECHO: se dibuja el borde terminado propio de la textura al ras
             del filo, para que el corte del pozo no quede a media piedra y luzca como
             el borde izquierdo (acabado, no cortado) */
          c.drawImage(piso, natW - capN, 0, capN, natH, lx + sp.w - capW, sp.y, capW + 1, dh);
          c.restore();
        } else this.px(sp.x, sp.y, sp.w, VH - sp.y, '#D9C089');
      }
      var pl = (tx && okImg(TEX['plat' + tx])) ? TEX['plat' + tx] : TEX.plat;
      for (i = 0; i < this.platSpans.length; i++) {
        sp = this.platSpans[i];
        var sx2 = sp.x - this.camX;
        if (sx2 > VW || sx2 + sp.w < 0) continue;
        if (okImg(pl)) c.drawImage(pl, Math.round(sx2), sp.y - 1, sp.w, 17);
        else this.px(sp.x, sp.y, sp.w, 9, '#E8731A');
      }
      c.restore();
    }

    /* ===== Decoración procedimental: elementos vivos del mundo ===== */
    drawPalm(sx, by, h, ph, rate) {
      var c = this.cx, t = this.tick;
      var lean = h * 0.10, trunkH = h * 0.62;
      var tw = Math.max(2, Math.round(h * 0.07));
      var n = 7, segH = trunkH / n;
      for (var i = 0; i < n; i++) {
        var f = i / (n - 1);
        var x = sx + lean * f * f;
        var y = by - trunkH * f;
        c.fillStyle = i % 2 ? '#9A6A38' : '#84582C';
        c.fillRect(Math.round(x - tw / 2), Math.round(y - segH), tw, Math.ceil(segH) + 1);
        c.fillStyle = '#6E4722';
        c.fillRect(Math.round(x - tw / 2), Math.round(y - 1), tw, 1);
      }
      var cx0 = sx + lean, cy0 = by - trunkH - 2;
      c.fillStyle = '#5C3A1E';
      c.fillRect(Math.round(cx0 - 3), Math.round(cy0), 3, 3);
      c.fillRect(Math.round(cx0 + 1), Math.round(cy0 + 1), 3, 3);
      var angs = [-2.75, -2.2, -1.55, -0.9, -0.35, 0.15];
      for (var fI = 0; fI < angs.length; fI++) {
        var sway = Math.sin(t * 0.022 * rate + ph + fI * 1.7) * 0.07;
        var a = angs[fI] + sway;
        var px0 = cx0, py0 = cy0;
        var L = h * 0.45, segs = 6, step = L / segs;
        for (var s2 = 0; s2 < segs; s2++) {
          px0 += Math.cos(a) * step; py0 += Math.sin(a) * step;
          a += 0.13;
          var lw = s2 < 2 ? 3 : 2;
          c.fillStyle = s2 % 2 ? '#3E8E4E' : '#57B36A';
          c.fillRect(Math.round(px0 - lw / 2), Math.round(py0 - lw / 2), lw, lw);
          if (s2 > 0) {
            c.fillStyle = '#2F7A40';
            c.fillRect(Math.round(px0 - lw / 2), Math.round(py0 + lw / 2), lw, 1);
          }
        }
      }
    }
    drawBushD(sx, by, h, ph) {
      var c = this.cx;
      var sway = Math.sin(this.tick * 0.02 + ph) * 0.8;
      var w = h * 1.7;
      for (var ry = 0; ry <= h; ry++) {
        var f = ry / h;
        var half = (w / 2) * Math.sqrt(1 - (1 - f) * (1 - f));
        var off = sway * (1 - f);
        c.fillStyle = f < 0.4 ? '#57B36A' : '#3E8E4E';
        c.fillRect(Math.round(sx - half + off), Math.round(by - h + ry), Math.max(1, Math.round(half * 2)), 1);
      }
      c.fillStyle = '#FF9A5C';
      c.fillRect(Math.round(sx - w * 0.22 + sway), Math.round(by - h * 0.55), 2, 2);
      c.fillRect(Math.round(sx + w * 0.16 + sway), Math.round(by - h * 0.35), 2, 2);
    }
    drawFernD(sx, by, h, ph, rate) {
      var c = this.cx, t = this.tick;
      var angs = [-2.5, -2.0, -1.57, -1.1, -0.65];
      for (var fI = 0; fI < angs.length; fI++) {
        var sway = Math.sin(t * 0.024 * rate + ph + fI * 1.3) * 0.06;
        var a = angs[fI] + sway;
        var px0 = sx, py0 = by;
        var segs = 5, step = h / segs;
        var dr = angs[fI] < -1.57 ? -0.11 : 0.11;
        for (var s2 = 0; s2 < segs; s2++) {
          px0 += Math.cos(a) * step; py0 += Math.sin(a) * step;
          a += dr;
          c.fillStyle = s2 % 2 ? '#3E8E4E' : '#5DBF4A';
          c.fillRect(Math.round(px0 - 1), Math.round(py0 - 1), 2, 2);
        }
      }
    }
    drawFlowerD(sx, by, h, ph) {
      var c = this.cx;
      var sway = Math.sin(this.tick * 0.026 + ph) * 1.2;
      var topX = sx + sway, topY = by - h;
      c.fillStyle = '#3E8E4E';
      for (var ry = 0; ry < h - 3; ry++) {
        var f = ry / h;
        c.fillRect(Math.round(sx + sway * f - 0.5), Math.round(by - ry - 1), 1, 1);
      }
      c.fillRect(Math.round(sx - 3), Math.round(by - h * 0.4), 3, 1);
      c.fillStyle = '#FF690F';
      c.fillRect(Math.round(topX - 2), Math.round(topY), 5, 3);
      c.fillRect(Math.round(topX - 1), Math.round(topY - 1), 3, 5);
      c.fillStyle = '#FFD34D';
      c.fillRect(Math.round(topX), Math.round(topY + 1), 1, 1);
    }
    drawStelaD(sx, by, h) {
      var c = this.cx;
      var w = Math.round(h * 0.55);
      var x = Math.round(sx - w / 2), y = Math.round(by - h);
      c.fillStyle = '#6E7A87'; c.fillRect(x - 1, y - 1, w + 2, h + 1);
      c.fillStyle = '#98A3AD'; c.fillRect(x, y, w, h - 1);
      c.fillStyle = '#B5BEC7'; c.fillRect(x, y, 2, h - 1);
      c.fillStyle = '#5C6670';
      for (var gy = 0; gy < 4; gy++) {
        var yy = y + 3 + gy * Math.max(4, Math.round((h - 8) / 4));
        if (yy > by - 4) break;
        c.fillRect(x + 3, yy, w - 6, 2);
        c.fillRect(x + 3 + (gy % 2) * 3, yy + 2, 2, 1);
      }
    }
    drawDecor() {
      for (var i = 0; i < this.decor.length; i++) {
        var d = this.decor[i];
        var sx = d.x - this.camX;
        if (sx < -60 || sx > VW + 60) continue;
        var by = d.y + 1;
        if (d.t === 'palm') this.drawPalm(sx, by, d.h, d.ph, d.rate);
        else if (d.t === 'bush') this.drawBushD(sx, by, d.h, d.ph);
        else if (d.t === 'fern') this.drawFernD(sx, by, d.h, d.ph, d.rate);
        else if (d.t === 'flower') this.drawFlowerD(sx, by, d.h, d.ph);
        else if (d.t === 'stela') this.drawStelaD(sx, by, d.h);
      }
    }

    drawPlayer(p) {
      if (p.deadT > 0 && Math.floor(p.deadT / 4) % 2 === 0) return;
      if (this.invulnT > 0 && Math.floor(this.tick / 4) % 2 === 0) return;
      /* personaje propio (hoja de 6 frames) */
      if (okImg(SPR.sheet)) { this.drawHeroSheet(p); return; }
      var img;
      if (this.state === 'msg') img = SPR.victory;
      else if (!p.ground) img = p.vy < 0 ? SPR.jump : SPR.peak;   /* subir ≠ caer */
      else if (Math.abs(p.vx) > 0.3) img = Math.floor(this.tick / CFG.anim.runFrame) % 2 ? SPR.run1 : SPR.run2;
      else if (p.landT > 0) img = SPR.land;                        /* aterrizaje */
      else img = SPR.idle;
      if (!okImg(img)) { this.legacyPlayer(p); return; }
      var h = this.state === 'msg' ? 34 : 27;
      var w = h * img.naturalWidth / img.naturalHeight;
      /* +3: hunde los pies hasta el borde visible del piso (las tapas
         redondeadas de la textura empiezan unos px más abajo) */
      var dx = p.x + PW / 2 - this.camX, dy = p.y + PH - h + 3;
      var c = this.cx;
      c.save();
      c.imageSmoothingEnabled = true;
      if (p.face < 0) { c.translate(dx, 0); c.scale(-1, 1); c.drawImage(img, -w / 2, dy, w, h); }
      else c.drawImage(img, dx - w / 2, dy, w, h);
      c.restore();
    }
    /* dibuja el personaje desde la hoja de 6 frames.
       La hoja mira hacia la IZQUIERDA de forma nativa. */
    drawHeroSheet(p) {
      var fi, sheet = SPR.sheet, dim = SHEET;
      var running = p.ground && Math.abs(p.vx) > 0.3;
      if (!p.ground) {
        fi = p.vy < 0 ? 2 : 4;                 /* subir / caer: poses del ciclo */
      } else if (running) {
        fi = Math.floor(this.tick / CFG.anim.runFrame) % 6;
      } else if (this.state === 'msg') {
        fi = Math.floor(this.tick / 10) % 6;   /* victoria: trota en el sitio */
      } else if (this.signT > 0 && okImg(SPR.idleSheet)) {
        sheet = SPR.idleSheet; dim = IDLE;     /* pose con llave: solo con el letrero */
        fi = Math.floor(this.tick / 15) % 8;   /* ciclo completo ~2 s (8×15 frames) */
      } else if (okImg(SPR.stillSheet)) {
        sheet = SPR.stillSheet; dim = STILL;   /* respiración: entra al quedarse quieto */
        fi = Math.floor(this.tick / 12) % 8;
      } else {
        fi = 0;
      }
      var fr = dim.frames[fi];
      var h = this.state === 'msg' ? 48 : 40;
      var w = h * dim.fw / dim.fh;
      var dx = p.x + PW / 2 - this.camX, dy = p.y + PH - h + 3;
      var c = this.cx;
      c.save();
      c.imageSmoothingEnabled = true;
      /* la hoja mira a la DERECHA de forma nativa → voltear al ir a la izquierda */
      if (p.face < 0) {
        c.translate(dx, 0); c.scale(-1, 1);
        c.drawImage(sheet, fr[0], fr[1], dim.fw, dim.fh, -w / 2, dy, w, h);
      } else {
        c.drawImage(sheet, fr[0], fr[1], dim.fw, dim.fh, dx - w / 2, dy, w, h);
      }
      c.restore();
    }
    /* letrero ¡CONTRATA YA! sobre el personaje (idle 3 s) */
    drawSign(p) {
      var c = this.cx;
      var dur = CFG.anim.signDur;
      var a = Math.max(0, Math.min(1, this.signT / 10, (dur - this.signT) / 10));
      var h = 38;
      var w = h * SIGN.fw / SIGN.fh;
      var cxp = Math.round(p.x + PW / 2 - this.camX);
      var bx = Math.round(Math.max(3, Math.min(VW - w - 3, cxp - w / 2)));
      /* el personaje mide ~40px sobre p.y+PH; el letrero va justo encima de la cabeza */
      var top = p.y + PH - 40;
      var by = Math.round(Math.max(2, top - h - 4 + Math.sin(this.tick * 0.08) * 1.5));
      var fi = Math.floor(this.tick / 4) % SIGN.frames.length;
      var fr = SIGN.frames[fi];
      c.save();
      c.globalAlpha = a;
      c.imageSmoothingEnabled = true;
      c.drawImage(SPR.sign, fr[0], fr[1], SIGN.fw, SIGN.fh, bx, by, w, h);
      c.restore();
    }
    legacyPlayer(p) {
      var x = p.x - 1, y = p.y;
      this.px(x + 2, y, 8, 3, COL.capC);
      this.px(x + 3, y + 3, 6, 3, COL.skin);
      this.px(x + 2, y + 6, 8, 4, COL.shirt);
      this.px(x + 3, y + 10, 2, 3, COL.pants);
      this.px(x + 7, y + 10, 2, 3, COL.pants);
    }

    drawEnemy(en) {
      var def = PIX[en.type];
      var box = this.enemyBox(en);
      var c = this.cx;
      if (en.dead && en.sq <= 0) return;
      if (en.b === 'pend' && !en.dead) {
        c.strokeStyle = 'rgba(235,235,235,0.85)'; c.lineWidth = 1;
        c.beginPath();
        c.moveTo(Math.round(en.x - this.camX), Math.round(en.y0 - 12));
        c.lineTo(Math.round(en.x - this.camX), Math.round(box.y + 3));
        c.stroke();
      }
      /* +2 en tierra: asienta los pies sobre el borde visible del piso */
      var gsink = (en.b === 'walk' || (en.b === 'hop' && en.phase === 0) || (en.b === 'bird' && en.phase === 0)) ? 2 : 0;
      var dx = Math.round(box.x - this.camX), dy = Math.round(box.y) + gsink;
      /* araña: hoja propia de 8 frames (vista superior, cuelga del hilo) */
      if (en.type === 'arana' && okImg(SPR.arana)) {
        var ah = en.h * 2.0;
        var aw = ah * ARANA.fw / ARANA.fh;
        var afi = Math.floor(en.t / 5) % ARANA.frames.length;
        var afr = ARANA.frames[afi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h / 2);
        if (en.dead) {
          var asf = Math.max(0, en.sq / 16);
          c.globalAlpha = asf;
          c.scale(Math.max(0.15, asf), Math.max(0.15, asf));
        }
        c.drawImage(SPR.arana, afr[0], afr[1], ARANA.fw, ARANA.fh, -aw / 2, -ah / 2, aw, ah);
        c.restore();
        return;
      }
      /* serpiente: hoja propia de 8 frames */
      if (en.type === 'serpiente' && okImg(SPR.snake)) {
        var sh = en.h * 1.35;
        var sw2 = sh * SNAKE.fw / SNAKE.fh;
        var lung = (en.def.lunge && en.lg > 0);
        if (lung) { sw2 *= 1.14; sh *= 0.92; }
        var sfi = Math.floor(en.t / 6) % SNAKE.frames.length;
        var sfr = SNAKE.frames[sfi];
        var scx = dx + box.w / 2, sby = dy + box.h;
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(scx, sby);
        if (en.dead) {
          var sf = Math.max(0, en.sq / 16);
          c.globalAlpha = sf;
          c.scale(1 + (1 - sf) * 0.35, Math.max(0.15, sf * 0.45));
        }
        /* nativa mira a la izquierda → voltear cuando va a la derecha */
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.snake, sfr[0], sfr[1], SNAKE.fw, SNAKE.fh, -sw2 / 2, -sh, sw2, sh);
        c.restore();
        return;
      }
      /* ogro: hoja propia de 8 frames (camina/persigue) */
      if (en.type === 'ogro' && okImg(SPR.ogro)) {
        var oh = en.h * 1.9;
        var ow = oh * OGRO.fw / OGRO.fh;
        var ofi = Math.floor(en.t / 6) % OGRO.frames.length;
        var ofr = OGRO.frames[ofi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var osf = Math.max(0, en.sq / 16);
          c.globalAlpha = osf;
          c.scale(1 + (1 - osf) * 0.35, Math.max(0.15, osf * 0.45));
        }
        if (en.dir < 0) c.scale(-1, 1);
        c.drawImage(SPR.ogro, ofr[0], ofr[1], OGRO.fw, OGRO.fh, -ow / 2, -oh, ow, oh);
        c.restore();
        return;
      }
      /* cocodrilo: hoja propia de 8 frames (camina/persigue) */
      if (en.type === 'cocodrilo' && okImg(SPR.cocodrilo)) {
        var dh = en.h * 1.35;
        var dw = dh * COCO.fw / COCO.fh;
        var dfi = Math.floor(en.t / 5) % COCO.frames.length;
        var dfr = COCO.frames[dfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var dsf = Math.max(0, en.sq / 16);
          c.globalAlpha = dsf;
          c.scale(1 + (1 - dsf) * 0.35, Math.max(0.15, dsf * 0.45));
        }
        if (en.dir < 0) c.scale(-1, 1);
        c.drawImage(SPR.cocodrilo, dfr[0], dfr[1], COCO.fw, COCO.fh, -dw / 2, -dh, dw, dh);
        c.restore();
        return;
      }
      /* abeja: hoja propia de 8 frames (vuelo) */
      if (en.type === 'abeja' && okImg(SPR.abeja)) {
        var eh = en.h * 1.7;
        var ew = eh * ABEJA.fw / ABEJA.fh;
        var efi = Math.floor(en.t / 3) % ABEJA.frames.length;
        var efr = ABEJA.frames[efi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var esf = Math.max(0, en.sq / 16);
          c.globalAlpha = esf;
          c.scale(1 + (1 - esf) * 0.35, Math.max(0.15, esf * 0.45));
        }
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.abeja, efr[0], efr[1], ABEJA.fw, ABEJA.fh, -ew / 2, -eh, ew, eh);
        c.restore();
        return;
      }
      /* bomba: trampa fija con mecha animada */
      if (en.type === 'bomba' && okImg(SPR.bomba)) {
        var bh = en.h * 1.4;
        var bw = bh * BOMBA.fw / BOMBA.fh;
        var bfi = Math.floor(en.t / 5) % BOMBA.frames.length;
        var bfr = BOMBA.frames[bfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var bsf = Math.max(0, en.sq / 16);
          c.globalAlpha = bsf;
          c.scale(1 + (1 - bsf) * 0.5, Math.max(0.15, bsf * 0.4));
        }
        c.drawImage(SPR.bomba, bfr[0], bfr[1], BOMBA.fw, BOMBA.fh, -bw / 2, -bh, bw, bh);
        c.restore();
        return;
      }
      /* cangrejo rojo: hoja propia de 8 frames (camina de lado) */
      if (en.type === 'cangrejorojo' && okImg(SPR.cangrejorojo)) {
        var xh = en.h * 1.45;
        var xw = xh * CRAB.fw / CRAB.fh;
        var xfi = Math.floor(en.t / 5) % CRAB.frames.length;
        var xfr = CRAB.frames[xfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var xsf = Math.max(0, en.sq / 16);
          c.globalAlpha = xsf;
          c.scale(1 + (1 - xsf) * 0.35, Math.max(0.15, xsf * 0.45));
        }
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.cangrejorojo, xfr[0], xfr[1], CRAB.fw, CRAB.fh, -xw / 2, -xh, xw, xh);
        c.restore();
        return;
      }
      /* coyote: hoja propia de 8 frames (camina/persigue) */
      if (en.type === 'coyote' && okImg(SPR.coyote)) {
        var yh = en.h * 1.85;
        var yw = yh * COYOTE.fw / COYOTE.fh;
        var yfi = Math.floor(en.t / 5) % COYOTE.frames.length;
        var yfr = COYOTE.frames[yfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var ysf = Math.max(0, en.sq / 16);
          c.globalAlpha = ysf;
          c.scale(1 + (1 - ysf) * 0.35, Math.max(0.15, ysf * 0.45));
        }
        if (en.dir >= 0) c.scale(-1, 1);
        /* el frame de 128px tiene ~23px transparentes bajo las patas (contenido hasta y=105):
           se baja el dibujo esa proporción para que el coyote pise el piso y no flote */
        var yPad = yh * (128 - 105) / 128;
        c.drawImage(SPR.coyote, yfr[0], yfr[1], COYOTE.fw, COYOTE.fh, -yw / 2, -yh + yPad, yw, yh);
        c.restore();
        return;
      }
      /* murciélago: hoja propia de 8 frames (vuelo) */
      if (en.type === 'murcielago' && okImg(SPR.murcielago)) {
        var mh = en.h * 1.6;
        var mw = mh * BAT.fw / BAT.fh;
        var mfi = Math.floor(en.t / 4) % BAT.frames.length;
        var mfr = BAT.frames[mfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var msf = Math.max(0, en.sq / 16);
          c.globalAlpha = msf;
          c.scale(1 + (1 - msf) * 0.35, Math.max(0.15, msf * 0.45));
        }
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.murcielago, mfr[0], mfr[1], BAT.fw, BAT.fh, -mw / 2, -mh, mw, mh);
        c.restore();
        return;
      }
      /* rana: hoja propia de 8 frames (salto) */
      if (en.type === 'rana' && okImg(SPR.rana)) {
        var rh = en.h * 1.42;
        var rw = rh * RANA.fw / RANA.fh;
        /* en el aire mantiene la pose extendida; en tierra recorre el ciclo */
        var rfi = en.phase === 1 ? 4 : Math.floor(en.t / 6) % RANA.frames.length;
        var rfr = RANA.frames[rfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var rsf = Math.max(0, en.sq / 16);
          c.globalAlpha = rsf;
          c.scale(1 + (1 - rsf) * 0.35, Math.max(0.15, rsf * 0.45));
        }
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.rana, rfr[0], rfr[1], RANA.fw, RANA.fh, -rw / 2, -rh, rw, rh);
        c.restore();
        return;
      }
      /* cuervo: hoja propia de 8 frames (ave) */
      if (en.type === 'cuervo' && okImg(SPR.cuervo)) {
        var ch = en.h * 1.35;
        var cw = ch * CUERVO.fw / CUERVO.fh;
        /* en vuelo aletea rápido; posado, aleteo lento */
        var cspd = en.phase === 1 ? 4 : 9;
        var cfi = Math.floor(en.t / cspd) % CUERVO.frames.length;
        var cfr = CUERVO.frames[cfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var csf = Math.max(0, en.sq / 16);
          c.globalAlpha = csf;
          c.scale(1 + (1 - csf) * 0.35, Math.max(0.15, csf * 0.45));
        }
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.cuervo, cfr[0], cfr[1], CUERVO.fw, CUERVO.fh, -cw / 2, -ch, cw, ch);
        c.restore();
        return;
      }
      /* alux: hoja propia de 8 frames (vista frontal) */
      if (en.type === 'alux' && okImg(SPR.alux)) {
        var ah = en.h * 1.1;
        var aw = ah * ALUX.fw / ALUX.fh;
        var afi = Math.floor(en.t / 7) % ALUX.frames.length;
        var afr = ALUX.frames[afi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var asf = Math.max(0, en.sq / 16);
          c.globalAlpha = asf;
          c.scale(1 + (1 - asf) * 0.35, Math.max(0.15, asf * 0.45));
        }
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.alux, afr[0], afr[1], ALUX.fw, ALUX.fh, -aw / 2, -ah, aw, ah);
        c.restore();
        return;
      }
      /* iguana: hoja propia de 8 frames */
      if (en.type === 'iguana' && okImg(SPR.iguana)) {
        var ih = en.h * 1.30;
        var iw = ih * IGUANA.fw / IGUANA.fh;
        var ifi = Math.floor(en.t / 6) % IGUANA.frames.length;
        var ifr = IGUANA.frames[ifi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          var isf = Math.max(0, en.sq / 16);
          c.globalAlpha = isf;
          c.scale(1 + (1 - isf) * 0.35, Math.max(0.15, isf * 0.45));
        }
        /* nativa mira a la izquierda → voltear cuando va a la derecha */
        if (en.dir >= 0) c.scale(-1, 1);
        c.drawImage(SPR.iguana, ifr[0], ifr[1], IGUANA.fw, IGUANA.fh, -iw / 2, -ih, iw, ih);
        c.restore();
        return;
      }
      /* enemigos vectoriales articulados (patas, colas, bocas, alas animadas) */
      var efn = EDRAW[en.type];
      if (efn) {
        var mover = en.b === 'walk' || en.b === 'hop' || en.b === 'fly' || en.b === 'bird';
        c.save();
        c.imageSmoothingEnabled = true;
        c.translate(dx + box.w / 2, dy + box.h);
        if (en.dead) {
          /* aplastado: se ensancha, se aplana y se desvanece */
          var f2 = Math.max(0, en.sq / 16);
          c.globalAlpha = f2;
          c.scale(1 + (1 - f2) * 0.35, Math.max(0.15, f2 * 0.45));
          efn(c, en, box.w, box.h);
          c.restore();
          return;
        }
        if (mover && en.dir < 0) c.scale(-1, 1);
        if (en.def.lunge && en.lg > 0) c.scale(1.14, 0.92);   /* estirón al embestir */
        efn(c, en, box.w, box.h);
        c.restore();
        return;
      }
      if (!def) { this.px(box.x, box.y, box.w, box.h, COL.car); return; }
      if (en.dead) {
        /* aplastado: se encoge y desvanece */
        var f = Math.max(0, en.sq / 16);
        c.globalAlpha = f;
        drawPix(c, def, 0, dx, dy + box.h * (1 - 0.35 * f), box.w, Math.max(2, box.h * 0.35 * f), false);
        c.globalAlpha = 1;
        return;
      }
      /* frame según comportamiento */
      var fi;
      if (en.type === 'paloma') fi = en.phase === 1 ? 2 + (Math.floor(en.t / 5) % 2) : Math.floor(en.t / 10) % 2;
      else if (en.type === 'alux' && en.mode === 1) fi = 2;
      else if (en.b === 'hop') fi = en.phase === 1 ? 1 : 0;
      else if (en.b === 'fall') fi = 0;
      else if (en.b === 'fly') fi = Math.floor(en.t / 6) % 2;
      else fi = Math.floor(en.t / 9) % 2;
      if (fi >= def.f.length) fi = 0;
      var flip = (en.b === 'walk' || en.b === 'hop' || en.b === 'fly' || en.b === 'bird') && en.dir < 0;
      var sw = box.w, shh = box.h, oy = 0;
      if (en.def.lunge && en.lg > 0) { sw = box.w * 1.18; shh = box.h * 0.9; oy = box.h - shh; }
      if (en.def.roll) {
        c.save();
        c.translate(dx + box.w / 2, dy + box.h / 2);
        c.rotate(Math.sin(en.t * 0.32) * 0.16);
        drawPix(c, def, fi, -box.w / 2, -box.h / 2, box.w, box.h, false);
        c.restore();
        return;
      }
      drawPix(c, def, fi, dx + (box.w - sw) / 2, dy + oy, sw, shh, flip);
    }

    drawKey(k) {
      if (k.got) return;
      var bob = Math.sin((this.tick + k.x) / 14) * 2;
      var c = this.cx;
      var cxk = Math.round(k.x + 4.5 - this.camX);
      var cyk = Math.round(k.y + bob) + 9;
      /* resplandor dorado pulsante detrás de la llave */
      var pulse = 0.6 + 0.3 * Math.sin(this.tick / 9 + k.x);
      var g = c.createRadialGradient(cxk, cyk, 1, cxk, cyk, 22);
      g.addColorStop(0, 'rgba(255,224,120,' + (0.55 * pulse).toFixed(2) + ')');
      g.addColorStop(0.5, 'rgba(255,200,60,' + (0.28 * pulse).toFixed(2) + ')');
      g.addColorStop(1, 'rgba(255,200,60,0)');
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = g;
      c.fillRect(cxk - 22, cyk - 22, 44, 44);
      c.restore();
      if (okImg(SPR.llaveAnim)) {
        var h = 26, w = h * KEY.fw / KEY.fh;
        var kfi = Math.floor(this.tick / 6) % KEY.frames.length;
        var kfr = KEY.frames[kfi];
        c.save();
        c.imageSmoothingEnabled = true;
        c.drawImage(SPR.llaveAnim, kfr[0], kfr[1], KEY.fw, KEY.fh, Math.round(cxk - w / 2), Math.round(k.y + bob - 6), w, h);
        c.restore();
      } else {
        this.px(k.x, k.y + bob, 5, 5, COL.key);
        this.px(k.x + 2, k.y + bob + 5, 2, 5, COL.key);
      }
    }
    drawBushes() {
      if (!okImg(SPR.arbusto) || !this.pits || !this.pits.length) return;
      var c = this.cx; c.save(); c.imageSmoothingEnabled = true;
      for (var i = 0; i < this.pits.length; i++) {
        var pit = this.pits[i];
        var sx = pit.x - this.camX;
        if (sx > VW || sx + pit.w < 0) continue;
        /* el arbusto llena el hueco a ras de piso: sobresale un poco de la cara
           naranja y su base se hunde hasta el fondo del piso, tapando el abismo */
        var overlap = 6;
        var bw = pit.w + overlap * 2;
        var bh = (VH - pit.y) + 18;
        c.drawImage(SPR.arbusto, Math.round(sx - overlap), Math.round(pit.y - 12), Math.round(bw), Math.round(bh));
      }
      c.restore();
    }
    drawSpikes() {
      if (!okImg(SPR.pinchos) || !this.spikes.length) return;
      var c = this.cx, S = SPR.pinchos, units = 11;
      var uw = S.naturalWidth / units;
      c.imageSmoothingEnabled = true;
      for (var i = 0; i < this.spikes.length; i++) {
        var sk = this.spikes[i];
        var x = sk.col * TILE - this.camX, y = (sk.row + 1) * TILE - 13;
        c.drawImage(S, (sk.col % units) * uw, 0, uw, S.naturalHeight,
          Math.round(x), Math.round(y), TILE, 13);
      }
    }
    drawGoal(g) {
      var c = this.cx;
      var floorTop = g.y + TILE;
      if (okImg(SPR.oficina)) {
        var h = 84, w = h * SPR.oficina.naturalWidth / SPR.oficina.naturalHeight;
        var doorCx = g.x + 9;
        var bx = Math.round(doorCx - w / 2 - this.camX);
        var by = Math.round(floorTop - h);
        c.imageSmoothingEnabled = true;
        c.drawImage(SPR.oficina, bx, by, w, h);
        return;
      }
      this.px(g.x + 2, g.y - 26, 3, 41, '#E4E7EB');
      for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++)
        this.px(g.x + 5 + c * 2.8, g.y - 26 + r * 2.9, 2.8, 2.9, (r + c) % 2 ? '#10161C' : '#fff');
      this.px(g.x - 1, g.y + 13, 11, 2, '#B24E08');
    }
    /* sedán del final: dibujo vectorial suavizado (alta calidad, mirando a la derecha).
       Misma huella y caja de colisión que la versión anterior. */
    drawCar(cr, withPlayer) {
      var c = this.cx;
      var x = Math.round(cr.x - this.camX), y = Math.round(cr.y);
      if (x > VW + 80 || x + 60 < -30) return;
      /* auto propio (hoja de 8 frames) */
      if (okImg(SPR.auto)) {
        var W = 66, H = W * AUTO.fh / AUTO.fw;
        var cxp = x + 19;               /* mismo centro que la versión vectorial */
        var by = y + 15;                /* ruedas sobre el piso */
        /* rueda gira: rápido al conducir, lento como premio en espera */
        var fi = Math.floor(this.tick / (withPlayer ? 2 : 5)) % AUTO.frames.length;
        var fr = AUTO.frames[fi];
        c.save();
        c.imageSmoothingEnabled = true;
        /* sombra en el piso */
        c.fillStyle = 'rgba(16,22,28,0.28)';
        c.beginPath(); c.ellipse(cxp, by - 1, W * 0.42, 2.4, 0, 0, 6.284); c.fill();
        /* nativa mira a la izquierda → voltear (conduce hacia la derecha) */
        c.translate(cxp, 0); c.scale(-1, 1);
        c.drawImage(SPR.auto, fr[0], fr[1], AUTO.fw, AUTO.fh, -W / 2, by - H, W, H);
        c.restore();
        return;
      }
      c.save();
      /* escala 1.45 con el punto de apoyo fijo: ruedas sobre el piso */
      var cs = 1.45;
      c.translate(x + 19 - 19 * cs, y + 15 - 10 * cs);
      c.scale(cs, cs);
      c.imageSmoothingEnabled = true;
      /* sombra en el piso */
      c.fillStyle = 'rgba(16,22,28,0.28)';
      c.beginPath(); c.ellipse(19, 9.6, 19, 2.2, 0, 0, 6.284); c.fill();
      /* carrocería: perfil con cajuela, techo y cofre */
      var g = c.createLinearGradient(0, -12, 0, 3);
      g.addColorStop(0, '#FF9A5C'); g.addColorStop(0.45, '#FF690F'); g.addColorStop(1, '#C24F06');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0.5, 2);
      c.lineTo(0.5, -3.4);
      c.quadraticCurveTo(1.2, -5.4, 4, -5.8);
      c.lineTo(9.5, -6);
      c.quadraticCurveTo(11.5, -11.6, 16.5, -12);
      c.lineTo(22.5, -12);
      c.quadraticCurveTo(26.5, -11.6, 28.2, -6.4);
      c.lineTo(33.5, -5.6);
      c.quadraticCurveTo(37.2, -5, 37.6, -2.6);
      c.lineTo(37.6, 2);
      c.quadraticCurveTo(37.6, 3, 36.4, 3);
      c.lineTo(1.6, 3);
      c.quadraticCurveTo(0.5, 3, 0.5, 2);
      c.closePath(); c.fill();
      /* faldón inferior */
      c.fillStyle = '#A84405';
      c.fillRect(1, 1.6, 36.4, 1.4);
      /* cristales con degradado de cielo */
      var wg = c.createLinearGradient(0, -11, 0, -6);
      wg.addColorStop(0, '#DDF1FB'); wg.addColorStop(1, '#9CCDE8');
      c.fillStyle = wg;
      c.beginPath();
      c.moveTo(12.2, -10.6); c.lineTo(16.8, -10.8); c.lineTo(16.8, -6.6); c.lineTo(10.6, -6.6);
      c.quadraticCurveTo(11, -9.2, 12.2, -10.6); c.closePath(); c.fill();
      c.beginPath();
      c.moveTo(18.6, -10.8); c.lineTo(23, -10.7);
      c.quadraticCurveTo(25.6, -10.2, 26.8, -6.8);
      c.lineTo(18.6, -6.6); c.closePath(); c.fill();
      /* brillo diagonal en cristales */
      c.globalAlpha = 0.5; c.fillStyle = '#FFFFFF';
      c.beginPath(); c.moveTo(13.4, -10.6); c.lineTo(15, -10.7); c.lineTo(12.2, -6.6); c.lineTo(10.9, -6.6); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(20.4, -10.8); c.lineTo(21.8, -10.8); c.lineTo(19.6, -6.6); c.lineTo(18.6, -6.6); c.closePath(); c.fill();
      c.globalAlpha = 1;
      /* línea de cintura, puertas y manijas */
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(1.4, -4.6); c.lineTo(36, -4.2); c.stroke();
      c.strokeStyle = 'rgba(120,45,4,0.8)';
      c.beginPath(); c.moveTo(17.6, -6.4); c.lineTo(17.4, 1.4); c.stroke();
      c.beginPath(); c.moveTo(26.9, -6.4); c.lineTo(26.7, 1.4); c.stroke();
      c.fillStyle = '#FFD9B8';
      c.fillRect(15.4, -3.8, 1.8, 0.8); c.fillRect(24.6, -3.8, 1.8, 0.8);
      /* faro delantero y calavera */
      c.fillStyle = '#FFE9A6';
      c.beginPath(); c.ellipse(36.6, -3.2, 1.1, 1.5, 0, 0, 6.284); c.fill();
      c.fillStyle = '#D93A3A';
      c.fillRect(0.6, -3.6, 1.2, 2.2);
      /* defensa cromada */
      c.fillStyle = '#E4E7EB';
      c.fillRect(0.2, 0.4, 37.8, 1);
      /* ruedas suavizadas con rin */
      var wxs = [8.5, 29.5];
      for (var wi = 0; wi < 2; wi++) {
        var wx = wxs[wi];
        c.fillStyle = '#10161C';
        c.beginPath(); c.arc(wx, 5.4, 4.6, 0, 6.284); c.fill();
        c.fillStyle = '#2A333D';
        c.beginPath(); c.arc(wx, 5.4, 3.4, 0, 6.284); c.fill();
        c.fillStyle = '#B8C1CA';
        c.beginPath(); c.arc(wx, 5.4, 1.9, 0, 6.284); c.fill();
        c.fillStyle = '#79838E';
        c.beginPath(); c.arc(wx, 5.4, 0.8, 0, 6.284); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.8;
        c.beginPath(); c.arc(wx, 5.4, 4.1, -2.4, -0.9); c.stroke();
      }
      if (withPlayer) {
        /* piloto asomado en el parabrisas */
        c.fillStyle = '#F5C9A6'; c.fillRect(20, -10.2, 3.4, 2.6);
        c.fillStyle = '#FF690F';
        c.beginPath(); c.moveTo(19.4, -10.2); c.quadraticCurveTo(21.6, -12.6, 24, -10.2); c.closePath(); c.fill();
      }
      c.restore();
    }
    drawHeart(x, y, on) {
      var c = this.cx;
      c.fillStyle = on ? '#FF5A5A' : 'rgba(16,22,28,0.55)';
      c.fillRect(x + 1, y, 2, 2); c.fillRect(x + 4, y, 2, 2);
      c.fillRect(x, y + 1, 7, 2);
      c.fillRect(x + 1, y + 3, 5, 1);
      c.fillRect(x + 2, y + 4, 3, 1);
      c.fillRect(x + 3, y + 5, 1, 1);
      if (on) { c.fillStyle = '#FFB3B3'; c.fillRect(x + 1, y + 1, 1, 1); }
    }
    drawParts() {
      var c = this.cx;
      for (var i = 0; i < this.parts.length; i++) {
        var p = this.parts[i];
        c.fillStyle = 'rgba(245,236,210,' + Math.min(1, p.t / 12).toFixed(2) + ')';
        c.fillRect(Math.round(p.x - this.camX), Math.round(p.y), 2, 2);
      }
    }

    drawExplosions() {
      if (!this.explosions || !this.explosions.length) return;
      var c = this.cx;
      for (var i = this.explosions.length - 1; i >= 0; i--) {
        var e = this.explosions[i];
        var fi = Math.floor((this.tick - e.start) / 3);
        if (fi >= EXPL.frames.length) { this.explosions.splice(i, 1); continue; }
        if (!okImg(SPR.explosion)) continue;
        var fr = EXPL.frames[fi];
        var sz = 42;
        c.save(); c.imageSmoothingEnabled = true;
        c.drawImage(SPR.explosion, fr[0], fr[1], EXPL.fw, EXPL.fh,
          Math.round(e.x - sz / 2 - this.camX), Math.round(e.y - sz / 2), sz, sz);
        c.restore();
      }
    }

    drawMenu() {
      var c = this.cx;
      var img = TEX.inicio;
      if (okImg(img)) {
        var s = Math.max(VW / img.naturalWidth, VH / img.naturalHeight);
        var w = img.naturalWidth * s, h = img.naturalHeight * s;
        c.save(); c.imageSmoothingEnabled = true;
        c.drawImage(img, (VW - w) / 2, (VH - h) / 2, w, h);
        c.restore();
        c.fillStyle = 'rgba(16,22,28,0.30)'; c.fillRect(0, 0, VW, VH);
      } else {
        c.fillStyle = COL.bg1; c.fillRect(0, 0, VW, VH);
      }
      this.drawClouds();
      if (okImg(SPR.logo)) {
        var lw = 188, lh = lw * SPR.logo.naturalHeight / SPR.logo.naturalWidth;
        c.save(); c.imageSmoothingEnabled = true;
        c.drawImage(SPR.logo, (VW - lw) / 2, 8, lw, lh);
        c.restore();
      } else {
        this.txt('CONSTRUAUTO', VW / 2, 22, 20, '#E8731A');
      }
      var stSize = 14, stY = 150;
      c.font = stSize + 'px "Press Start 2P", monospace';
      var stW = c.measureText('START').width;
      this._startBox = { x: VW / 2 - stW / 2 - 10, y: stY - 6, w: stW + 20, h: stSize + 14 };
      if (Math.floor(this.tick / 30) % 2 === 0)
        this.txt('START', VW / 2, stY, stSize, COL.accent);
      if (this.level > 0)
        this.txt('CONTINUAS EN EL NIVEL ' + (this.level + 1), VW / 2, 186, 6, COL.key);
    }

    drawMenuEnemies(baseY) {
      var c = this.cx;
      var list = [
        { s: SPR.alux, d: ALUX },
        { s: SPR.cuervo, d: CUERVO },
        { s: SPR.coyote, d: COYOTE },
        { s: SPR.rana, d: RANA },
        { s: SPR.abeja, d: ABEJA },
        { s: SPR.ogro, d: OGRO }
      ];
      var n = list.length, slot = VW / (n + 1);
      c.save(); c.imageSmoothingEnabled = true;
      for (var i = 0; i < n; i++) {
        var e = list[i];
        if (!okImg(e.s)) continue;
        var H = 30, W = H * e.d.fw / e.d.fh;
        if (W > 46) { W = 46; H = W * e.d.fh / e.d.fw; }
        var fi = Math.floor(this.tick / 6) % e.d.frames.length;
        var fr = e.d.frames[fi];
        var cx = slot * (i + 1);
        c.drawImage(e.s, fr[0], fr[1], e.d.fw, e.d.fh, Math.round(cx - W / 2), Math.round(baseY - H), W, H);
      }
      c.restore();
    }

    draw() {
      var c = this.cx, i;
      c.setTransform(2, 0, 0, 2, 0, 0);
      c.imageSmoothingEnabled = false;

      if (this.state === 'menu') {
        this.drawMenu();
        var rb0 = this.querySelector('.ca-restart');
        if (rb0) rb0.style.display = 'none';
        var dv0 = this.querySelector('.ca-dev');
        if (dv0) dv0.style.display = 'none';
        var pads0 = this.querySelector('.ca-pads');
        if (pads0) pads0.style.display = 'none';
        return;
      }

      if (this.state === 'cine') {
        this.drawCine();
        var rbc = this.querySelector('.ca-restart'); if (rbc) rbc.style.display = 'none';
        var dvc = this.querySelector('.ca-dev'); if (dvc) dvc.style.display = 'none';
        var padc = this.querySelector('.ca-pads'); if (padc) padc.style.display = 'none';
        return;
      }

      var bgW = this.drawBackdrop();
      this.drawClouds();
      this.drawFlamingos();
      this.drawGlints(bgW);
      this.drawDecor();
      this.drawTerrain();
      this.drawBushes();

      this.drawSpikes();
      if (this.goal) this.drawGoal(this.goal);
      if (this.car) this.drawCar(this.car, this.state === 'drive');
      for (i = 0; i < this.keys.length; i++) this.drawKey(this.keys[i]);
      for (i = 0; i < this.enemies.length; i++) this.drawEnemy(this.enemies[i]);
      if (this.state !== 'drive') this.drawPlayer(this.p);
      if (this.signT > 0 && this.state === 'play') this.drawSign(this.p);
      this.drawParts();
      this.drawExplosions();

      /* HUD */
      this.txt('NIVEL ' + (this.level + 1) + '/' + LEVELS.length, 8, 8, 9, COL.text, 'left');
      for (i = 0; i < 5; i++) this.drawHeart(9 + i * 10, 22, i < this.lives);
      var kt = (this.got || 0) + '/' + this.keys.length;
      if (okImg(SPR.llave)) {
        c.save(); c.imageSmoothingEnabled = true;
        var kh = 16, kw = kh * SPR.llave.naturalWidth / SPR.llave.naturalHeight;
        c.drawImage(SPR.llave, VW - 76, 5, kw, kh);
        c.restore();
      }
      this.txt(kt, VW - 58, 8, 9, COL.key, 'left');
      if (this.state === 'play' && this.levelT < 170)
        this.txt(LEVELCFG[this.level].name, VW / 2, 28, 8, COL.accent);
      if (this.level === 0 && this.tick < 400 && this.state === 'play')
        this.txt('JUNTA LAS LLAVES Y LLEGA A LA META', VW / 2, VH - 14, 7, COL.dim);
      if (this.needMsgT > 0)
        this.txt('¡TE FALTAN LLAVES!', VW / 2, 46, 9, COL.accent);
      if (this.state === 'msg') {
        c.fillStyle = 'rgba(16,22,28,0.7)'; c.fillRect(0, 0, VW, VH);
        this.txt('¡NIVEL ' + (this.level + 1) + ' COMPLETADO!', VW / 2, VH / 2 - 12, 12, COL.accent);
      }
      if (this.state === 'drive') {
        this.txt('¡LO LOGRASTE!', VW / 2, 40, 14, COL.accent);
      }
      if (this.state === 'gameover') {
        c.fillStyle = 'rgba(16,22,28,0.82)'; c.fillRect(0, 0, VW, VH);
        this.txt('GAME OVER', VW / 2, VH / 2 - 20, 20, '#FF5A5A');
        this.txt('SE ACABARON TUS VIDAS', VW / 2, VH / 2 + 8, 8, COL.dim);
      }
      if (this.paused) {
        c.fillStyle = 'rgba(16,22,28,0.55)'; c.fillRect(0, 0, VW, VH);
        this.txt('PAUSA', VW / 2, VH / 2 - 18, 16, COL.accent);
        this.txt('AJUSTA EL SONIDO Y CIERRA PARA SEGUIR', VW / 2, VH / 2 + 6, 6, COL.dim);
      }
      var rb = this.querySelector('.ca-restart');
      if (rb) rb.style.display = this.state === 'play' ? 'block' : 'none';
      var dv = this.querySelector('.ca-dev');
      if (dv) dv.style.display = this.state === 'play' ? 'block' : 'none';
      var pads = this.querySelector('.ca-pads');
      if (pads) pads.style.display = (this.state === 'play') ? 'flex' : 'none';
    }
  }

  customElements.define('ca-game', CAGame);
})();
