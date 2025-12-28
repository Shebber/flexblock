import colors from "../data/backplateColors.json";

export function getAvailableBackplateColors() {
  return colors.colors.filter(c => c.enabled);
}


export function getAllBackplateColors() {
  return colors.colors;
}
