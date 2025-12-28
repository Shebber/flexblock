export const segmentMap = {
  // --- ZIFFERN ---
  "0": {A:1,B:1,C:1,D:1,E:1,F:1,G:0},
  "1": {A:0,B:1,C:1,D:0,E:0,F:0,G:0},
  "2": {A:1,B:1,C:0,D:1,E:1,F:0,G:1},
  "3": {A:1,B:1,C:1,D:1,E:0,F:0,G:1},
  "4": {A:0,B:1,C:1,D:0,E:0,F:1,G:1},
  "5": {A:1,B:0,C:1,D:1,E:0,F:1,G:1},
  "6": {A:1,B:0,C:1,D:1,E:1,F:1,G:1},
  "7": {A:1,B:1,C:1,D:0,E:0,F:0,G:0},
  "8": {A:1,B:1,C:1,D:1,E:1,F:1,G:1},
  "9": {A:1,B:1,C:1,D:1,E:0,F:1,G:1},

  // --- ALPHABET A–Z ---
  "A": {A:1,B:1,C:1,D:0,E:1,F:1,G:1},
  "B": {A:0,B:0,C:1,D:1,E:1,F:1,G:1},   // wie b
  "C": {A:1,B:0,C:0,D:1,E:1,F:1,G:0},
  "D": {A:0,B:1,C:1,D:1,E:1,F:0,G:1},   // wie d
  "E": {A:1,B:0,C:0,D:1,E:1,F:1,G:1},
  "F": {A:1,B:0,C:0,D:0,E:1,F:1,G:1},

  "G": {A:1,B:0,C:1,D:1,E:1,F:1,G:1},
  "H": {A:0,B:1,C:1,D:0,E:1,F:1,G:1},
  "I": {A:0,B:1,C:1,D:0,E:0,F:0,G:0},   // wie 1
  "J": {A:0,B:1,C:1,D:1,E:1,F:0,G:0},
  "K": {A:1,B:1,C:0,D:1,E:1,F:1,G:1},   // näherungsweise
  "L": {A:0,B:0,C:0,D:1,E:1,F:1,G:0},

  "M": {A:1,B:1,C:1,D:0,E:1,F:1,G:0},   // Annäherung
  "N": {A:0,B:1,C:1,D:0,E:1,F:1,G:1},
  "O": {A:1,B:1,C:1,D:1,E:1,F:1,G:0},
  "P": {A:1,B:1,C:0,D:0,E:1,F:1,G:1},
  "Q": {A:1,B:1,C:1,D:1,E:0,F:1,G:1},   // kleine Variation
  "R": {A:1,B:1,C:0,D:0,E:1,F:1,G:1},   // wie P, aber lesbar

  "S": {A:1,B:0,C:1,D:1,E:0,F:1,G:1},
  "T": {A:1,B:1,C:1,D:0,E:0,F:0,G:0},
  "U": {A:0,B:1,C:1,D:1,E:1,F:1,G:0},
  "V": {A:0,B:1,C:1,D:1,E:1,F:1,G:0},   // wie U (bestmöglich)
  "W": {A:0,B:1,C:1,D:1,E:1,F:1,G:0},   // identisch mit U/V in 7-Segment
  "X": {A:0,B:1,C:1,D:0,E:1,F:1,G:1},   // wie H
  "Y": {A:0,B:1,C:1,D:0,E:0,F:1,G:1},   // wie 4 unten offen
  "Z": {A:1,B:1,C:0,D:1,E:1,F:0,G:1},   // wie 2

  // --- SPEZIALZEICHEN ---
  " ": {A:0,B:0,C:0,D:0,E:0,F:0,G:0},
  ".": {A:0,B:0,C:0,D:0,E:0,F:0,G:0},  // optionaler Punkt
  "-": {A:0,B:0,C:0,D:0,E:0,F:0,G:1},
  "_": {A:0,B:0,C:0,D:1,E:0,F:0,G:0},

  // Fallback
  "DEFAULT": {A:0,B:0,C:0,D:0,E:0,F:0,G:0}
};
