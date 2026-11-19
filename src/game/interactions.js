/** Interações opcionais de exploração — não alteram a progressão das missões. */
export const SCENIC_SPOTS = Object.freeze([
  {
    id: "village-board", label: "Mural da Vila", x: -4.3, z: -2.8,
    message: "📜 União (A ∪ B): reúne todos os elementos que pertencem a A, a B ou a ambos."
  },
  {
    id: "healing-fountain", label: "Fonte de Liora", x: 5.2, z: 2.8,
    message: "💧 A água da fonte restaurou 20 pontos de vida!",
    healing: 20
  },
  {
    id: "intersection-stone", label: "Pedra dos Conjuntos", x: 7.5, z: 29.8,
    message: "✦ Interseção (A ∩ B): contém somente os elementos comuns aos dois conjuntos."
  },
  {
    id: "traveler-camp", label: "Fogueira do Viajante", x: 7.8, z: 43,
    message: "🔥 Complemento de A: todos os elementos do universo U que não pertencem a A."
  }
]);

export function nearbyScenicSpot(position, radius = 3.2) {
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.z)) return null;
  let nearest = null;
  let minDistance = radius;
  for (const spot of SCENIC_SPOTS) {
    const distance = Math.hypot(spot.x - position.x, spot.z - position.z);
    if (distance <= minDistance) {
      nearest = spot;
      minDistance = distance;
    }
  }
  return nearest;
}

export function inspectScenicSpot(state, spot) {
  if (!state || !spot || !SCENIC_SPOTS.some((entry) => entry.id === spot.id)) {
    return { type: "none", message: "" };
  }
  if (!spot.healing) return { type: "lore", message: spot.message };

  if (!Array.isArray(state.visitedSpots)) state.visitedSpots = [];
  if (state.visitedSpots.includes(spot.id)) {
    return { type: "used", message: "💧 Você já usou esta fonte nesta jornada." };
  }
  if (state.health >= 100) {
    return { type: "full", message: "💧 Sua vida está cheia. Volte se precisar de ajuda." };
  }
  const amount = Math.min(spot.healing, Math.max(0, 100 - state.health));
  state.health += amount;
  state.visitedSpots.push(spot.id);
  return { type: "healed", message: `💧 Fonte de Liora: +${amount} pontos de vida!` };
}
