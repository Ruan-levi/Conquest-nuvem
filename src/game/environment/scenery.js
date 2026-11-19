import * as B from "@babylonjs/core/Legacy/legacy";
import { SCENIC_SPOTS } from "../interactions.js";

const pos = (x, y, z) => new B.Vector3(x, y, z);

/** Decoração do vale: usa os mesmos materiais compartilhados e evita novas luzes pesadas. */
export function buildAmbientScenery({ scene, box, cylinder, sphere, material, mats, isMobile, random }) {
  const lantern = material("Luz âmbar das lanternas", "#ffc879", "#d88c34");
  const flower = material("Flores do vale", "#ffdab8", "#643d54");
  const flowerBlue = material("Flores azuis", "#94dae0", "#356c7a");
  const water = material("Água sagrada da fonte", "#4aacc0", "#28677b");
  const flame = material("Brasa viva", "#ffb363", "#e47a25");
  const sign = material("Placa de informações", "#baa17b");
  const fireflies = [];
  const animated = [];

  // Balizadores e lanternas de estrada. A emissão ilumina o objeto sem
  // multiplicar PointLights e sombras em dispositivos móveis.
  const lanternPositions = [-9, -1, 12, 23, 35, 48, 61, 72];
  for (let i = 0; i < (isMobile ? 5 : lanternPositions.length); i++) {
    const z = lanternPositions[i];
    const bend = Math.sin(z * .135) * 2.8;
    const x = bend + (i % 2 ? 6.0 : -6.0);
    cylinder("Poste da trilha " + i, pos(x, 1.55, z), 3.1, .23, .20, mats.wood, 6);
    box("Suporte da lanterna " + i, pos(x, 3.07, z), [.86, .15, .72], mats.darkStone);
    sphere("Lanterna acesa " + i, pos(x, 3.3, z), .33, lantern, 8);
    cylinder("Cobertura da lanterna " + i, pos(x, 3.65, z), .4, .75, .2, mats.roof, 5);
  }

  // Flores silvestres e pedras da borda, afastadas do caminho principal.
  const blossoms = isMobile ? 55 : 165;
  for (let i = 0; i < blossoms; i++) {
    const z = -15 + random() * 108;
    const bend = Math.sin(z * .135) * 2.8;
    const x = bend + (random() > .5 ? 1 : -1) * (5.2 + random() * 23);
    sphere("Flor silvestre " + i, pos(x, .13 + random() * .13, z), .095 + random() * .06,
      random() > .52 ? flower : flowerBlue, 5);
  }
  for (let i = 0; i < (isMobile ? 22 : 44); i++) {
    const z = -11 + i * (92 / (isMobile ? 22 : 44));
    const bend = Math.sin(z * .135) * 2.8;
    const edge = i % 2 ? 4.0 : -4.0;
    sphere("Pedra da borda " + i, pos(bend + edge, .16, z), .28 + random() * .19, mats.stone, 5);
  }

  // Placa educativa — a leitura acontece pela tecla E no controlador.
  const board = SCENIC_SPOTS.find((spot) => spot.id === "village-board");
  for (const offset of [-.75, .75]) {
    box("Poste do mural", pos(board.x + offset, 1.35, board.z), [.16, 2.7, .16], mats.wood);
  }
  box("Painel da vila", pos(board.x, 2.1, board.z), [2.1, 1.12, .22], sign);
  box("Moldura superior do mural", pos(board.x, 2.7, board.z), [2.45, .18, .37], mats.wood);
  sphere("Sinal luminoso do mural", pos(board.x, 3.05, board.z), .19, lantern, 8);

  // Fonte de cura: existe visualmente sem interferir na colisão da campanha.
  const fountain = SCENIC_SPOTS.find((spot) => spot.id === "healing-fountain");
  cylinder("Base da fonte", pos(fountain.x, .23, fountain.z), .46, 3.6, 3.6, mats.stone, 16);
  const basin = cylinder("Água da fonte", pos(fountain.x, .5, fountain.z), .13, 3.0, 3.0, water, 16);
  cylinder("Coluna da fonte", pos(fountain.x, 1.02, fountain.z), .96, .64, .9, mats.stone, 8);
  sphere("Cristal da fonte", pos(fountain.x, 1.73, fountain.z), .31, lantern, 10);
  animated.push((elapsed) => { basin.position.y = .5 + Math.sin(elapsed * 2) * .025; });

  // Monolito da interseção e inscrições que flutuam sobre ele.
  const monolith = SCENIC_SPOTS.find((spot) => spot.id === "intersection-stone");
  cylinder("Pedestal matemático", pos(monolith.x, .3, monolith.z), .6, 2.8, 3.0, mats.darkStone, 8);
  box("Monolito antigo", pos(monolith.x, 1.7, monolith.z), [1.15, 2.25, .72], mats.stone, .32);
  const symbol = B.MeshBuilder.CreateTorus("Selo da interseção", {
    diameter: 1.4, thickness: .115, tessellation: 20
  }, scene);
  symbol.position = pos(monolith.x, 3.15, monolith.z);
  symbol.material = flowerBlue;
  animated.push((elapsed) => {
    symbol.rotation.y = elapsed * .32;
    symbol.position.y = 3.15 + Math.sin(elapsed * 1.4) * .16;
  });

  // Acampamento com pedras, lenha e brasa pulsante.
  const camp = SCENIC_SPOTS.find((spot) => spot.id === "traveler-camp");
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    sphere("Pedra da fogueira " + i,
      pos(camp.x + Math.cos(angle) * 1.1, .2, camp.z + Math.sin(angle) * 1.1),
      .32, mats.stone, 6);
  }
  for (let i = 0; i < 3; i++) {
    const log = cylinder("Lenha do viajante " + i, pos(camp.x, .3, camp.z), .26, .33, .33, mats.wood, 6);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = i * Math.PI / 3;
    log.scaling.y = 5.4;
  }
  const campFlame = B.MeshBuilder.CreateCylinder("Fogo do viajante", {
    height: 1.55, diameterTop: 0, diameterBottom: .8, tessellation: 7
  }, scene);
  campFlame.position = pos(camp.x, 1.08, camp.z);
  campFlame.material = flame;
  animated.push((elapsed) => {
    campFlame.scaling.y = .92 + Math.sin(elapsed * 7) * .14;
    campFlame.rotation.y += .006;
  });

  // Pontos de luz flutuantes: geometria simples, nenhuma luz extra.
  for (let i = 0; i < (isMobile ? 9 : 23); i++) {
    const z = -6 + random() * 88;
    const x = (random() - .5) * 36;
    const dot = sphere("Vagalume " + i, pos(x, 1.7, z), .075, i % 2 ? lantern : flowerBlue, 5);
    fireflies.push({ dot, x, y: 1.5 + random() * 2.5, z, phase: random() * Math.PI * 2 });
  }

  return {
    update(elapsed) {
      for (const updateObject of animated) updateObject(elapsed);
      for (const { dot, x, y, z, phase } of fireflies) {
        dot.position.set(
          x + Math.sin(elapsed * .48 + phase) * .6,
          y + Math.sin(elapsed * 1.3 + phase) * .38,
          z + Math.cos(elapsed * .43 + phase) * .6
        );
      }
    }
  };
}
