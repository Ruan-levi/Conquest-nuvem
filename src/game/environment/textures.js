import * as B from "@babylonjs/core/Legacy/legacy";

// Texturas procedurais geradas no navegador: nenhum asset externo nem licença.
// Os desenhos são determinísticos e pequenos para caber também em dispositivos móveis.
function seeded(seed) {
  let value = seed >>> 0;
  return () => ((value = (1664525 * value + 1013904223) >>> 0) / 4294967296);
}

function createTexture(scene, name, draw, uScale = 1, vScale = 1, size = 256) {
  const texture = new B.DynamicTexture(name, size, scene, false);
  const ctx = texture.getContext();
  draw(ctx, size, seeded(name.length * 439 + 17));
  texture.update();
  texture.wrapU = B.Texture.WRAP_ADDRESSMODE;
  texture.wrapV = B.Texture.WRAP_ADDRESSMODE;
  texture.uScale = uScale;
  texture.vScale = vScale;
  return texture;
}

function flecks(ctx, size, random, count, colors, minWidth = 1, maxWidth = 5) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(random() * colors.length)];
    const width = minWidth + random() * (maxWidth - minWidth);
    ctx.fillRect(random() * size, random() * size, width, 1 + random() * width * .45);
  }
}

export function applyNaturalTextures(scene, mats, mobile = false) {
  const resolution = mobile ? 128 : 256;
  const grass = createTexture(scene, "grass-ground", (ctx, s, random) => {
    ctx.fillStyle = "#496e4f";
    ctx.fillRect(0, 0, s, s);
    flecks(ctx, s, random, 900, ["#548659", "#355843", "#739069", "#6b8150", "#3e6651"], 1, 6);
    for (let i = 0; i < 210; i++) {
      const x = random() * s, y = random() * s;
      ctx.strokeStyle = random() > .6 ? "#8ea976" : "#325746";
      ctx.lineWidth = .6;
      ctx.beginPath();
      ctx.moveTo(x, y + 3);
      ctx.lineTo(x - 1 + random() * 2, y - 3 - random() * 3);
      ctx.stroke();
    }
  }, 12, 18, resolution);

  const path = createTexture(scene, "earth-path", (ctx, s, random) => {
    ctx.fillStyle = "#9c8668";
    ctx.fillRect(0, 0, s, s);
    flecks(ctx, s, random, 1100, ["#a99370", "#76694f", "#baa384", "#8c7557"], 1, 7);
    for (let i = 0; i < 46; i++) {
      ctx.fillStyle = random() > .4 ? "#b7ae93" : "#787767";
      ctx.beginPath();
      ctx.ellipse(random() * s, random() * s, 1.4 + random() * 4, 1 + random() * 2.2, random(), 0, Math.PI * 2);
      ctx.fill();
    }
  }, 2, 1, resolution);

  const masonry = createTexture(scene, "village-stone", (ctx, s, random) => {
    ctx.fillStyle = "#4f5f5c";
    ctx.fillRect(0, 0, s, s);
    const height = s / 8, width = s / 5;
    for (let row = 0; row < 8; row++) {
      for (let col = -1; col <= 5; col++) {
        const shift = row % 2 ? width / 2 : 0;
        const x = col * width + shift + 1.5, y = row * height + 1.5;
        const shade = Math.floor(115 + random() * 33);
        ctx.fillStyle = "rgb(" + shade + "," + (shade + 8) + "," + (shade + 4) + ")";
        ctx.fillRect(x, y, width - 3, height - 3);
        ctx.fillStyle = "rgba(37,47,45,.13)";
        ctx.fillRect(x + 3, y + 3, width * .6, 2);
      }
    }
    flecks(ctx, s, random, 270, ["#a1aaa0", "#596b67", "#c0b8a1"], 1, 3);
  }, 1.5, 1.5, resolution);

  const planks = createTexture(scene, "timber-grain", (ctx, s, random) => {
    ctx.fillStyle = "#76523b";
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += s / 6) {
      ctx.fillStyle = "#513728";
      ctx.fillRect(x, 0, 2, s);
      ctx.fillStyle = "#916846";
      ctx.fillRect(x + 3, 0, 1, s);
    }
    for (let i = 0; i < 190; i++) {
      const x = random() * s, y = random() * s;
      ctx.strokeStyle = random() < .5 ? "rgba(32,21,15,.3)" : "rgba(208,161,114,.25)";
      ctx.lineWidth = 1 + random();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x - 3, y + 8, x + 4, y + 13, x + random() * 3, y + 23);
      ctx.stroke();
    }
  }, 1, 1, resolution);

  const tiles = createTexture(scene, "terracotta-roof", (ctx, s, random) => {
    ctx.fillStyle = "#4d3f39";
    ctx.fillRect(0, 0, s, s);
    const w = s / 8, h = s / 10;
    for (let row = 0; row < 10; row++) {
      for (let col = -1; col <= 8; col++) {
        const shade = Math.floor(105 + random() * 39);
        ctx.fillStyle = "rgb(" + (shade + 19) + "," + Math.floor(shade * .62) + "," + Math.floor(shade * .53) + ")";
        ctx.fillRect(col * w + (row % 2 ? w / 2 : 0) + 1.5, row * h + 1.5, w - 3, h - 3);
        ctx.fillStyle = "rgba(255,225,185,.1)";
        ctx.fillRect(col * w + (row % 2 ? w / 2 : 0) + 3, row * h + 3, w - 6, 2);
      }
    }
  }, 2, 2, resolution);

  const water = createTexture(scene, "river-ripples", (ctx, s, random) => {
    ctx.fillStyle = "#206d79";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 160; i++) {
      const x = random() * s, y = random() * s;
      ctx.strokeStyle = random() > .4 ? "rgba(114,205,205,.42)" : "rgba(13,48,65,.35)";
      ctx.lineWidth = .5 + random() * 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 6, y - 2, x + 13 + random() * 22, y);
      ctx.stroke();
    }
  }, 2, 16, resolution);

  mats.grass.diffuseTexture = grass;
  mats.path.diffuseTexture = path;
  mats.stone.diffuseTexture = masonry;
  mats.wood.diffuseTexture = planks;
  mats.roof.diffuseTexture = tiles;
  return {
    water,
    update(elapsed) { water.uOffset = (elapsed * .009) % 1; }
  };
}
