export const segment14Map = {
  // --- ZAHLEN ---
  "0": {A:1,B:1,C:1,D:1,E:1,F:1,G1:0,G2:0,I1:0,I2:0,J:1,K:0,L:0,M:0,N:1}, // Mit Slash (N) für Techno-Look
  "1": {A:0,B:1,C:1,D:0,E:0,F:0,G1:0,G2:0,I1:0,I2:0,J:0,K:0,L:0,M:0,N:1}, // Mit schrägem Hals oben
  "2": {A:1,B:1,C:0,D:1,E:1,F:0,G1:1,G2:1,I1:0,I2:0,J:1,K:0,L:0,M:0,N:0},
  "3": {A:1,B:1,C:1,D:1,E:0,F:0,G1:1,G2:1,I1:0,I2:0,J:1,K:0,L:0,M:0,N:0},
  "4": {A:0,B:1,C:1,D:0,E:0,F:1,G1:1,G2:1,I1:0,I2:0,J:0,K:0,L:0,M:0,N:0},
  "5": {A:1,B:0,C:1,D:1,E:0,F:1,G1:1,G2:1,I1:0,I2:0,J:1,K:0,L:0,M:0,N:0},
  "6": {A:1,B:0,C:1,D:1,E:1,F:1,G1:1,G2:1,I1:0,I2:0,J:1,K:0,L:0,M:0,N:0},
  "7": {A:1,B:1,C:1,D:0,E:0,F:0,G1:0,G2:0,I1:0,I2:0,J:0,K:0,L:0,M:0,N:1}, // Schräger Strich
  "8": {A:1,B:1,C:1,D:1,E:1,F:1,G1:1,G2:1,I1:0,I2:0,J:1,K:0,L:0,M:0,N:0},
  "9": {A:1,B:1,C:1,D:1,E:0,F:1,G1:1,G2:1,I1:0,I2:0,J:1,K:0,L:0,M:0,N:0},

  // --- BUCHSTABEN ---
  "A": {A:1,B:1,C:1,E:1,F:1,G1:1,G2:1,J:0},
  "B": {A:1,B:1,C:1,E:0,F:0,G1:1,G2:1,J:1,I1:1,I2:1}, // "B" wie digital
  "C": {A:1,B:0,C:0,E:1,F:1,G1:0,G2:0,J:1},
  "D": {A:1,B:1,C:1,E:0,F:0,G1:0,G2:0,J:1,I1:1,I2:1},
  "E": {A:1,B:0,C:0,E:1,F:1,G1:1,G2:0,J:1},
  "F": {A:1,B:0,C:0,E:1,F:1,G1:1,G2:0,J:0},
  "G": {A:1,B:0,C:1,E:1,F:1,G1:0,G2:1,J:1},
  "H": {A:0,B:1,C:1,E:1,F:1,G1:1,G2:1,J:0},
  "I": {A:1,B:0,C:0,E:0,F:0,G1:0,G2:0,J:1,I1:1,I2:1}, // Serifen I
  "J": {A:0,B:1,C:1,E:1,F:0,G1:0,G2:0,J:1},
  
  // Verbesserte Diagonalen:
  "K": {E:1,F:1,G1:1,N:1,L:1}, // K: Vertikal links, kleiner Arm oben rechts (N), Bein unten rechts (L)
  "L": {E:1,F:1,J:1},
  "M": {E:1,F:1,B:1,C:1,M:1,N:1}, // M: Wände + Diagonale oben zur Mitte
  "N": {E:1,F:1,B:1,C:1,M:1,L:1}, // N: Wände + Diagonale quer durch (M links oben + L rechts unten passt meist am besten)
  "O": {A:1,B:1,C:1,E:1,F:1,J:1},
  "P": {A:1,B:1,C:0,E:1,F:1,G1:1,G2:1,J:0},
  "Q": {A:1,B:1,C:1,E:1,F:1,J:1,L:1}, // O mit kleinem Schwanz unten rechts
  "R": {A:1,B:1,C:0,E:1,F:1,G1:1,G2:1,L:1}, // P mit schrägem Bein
  "S": {A:1,B:0,C:1,E:0,F:1,G1:1,G2:1,J:1},
  "T": {A:1,B:0,C:0,E:0,F:0,I1:1,I2:1,J:0},
  "U": {B:1,C:1,E:1,F:1,J:1},
  
  // Sauberes V (Trichterform)
  "V": {F:1, B:1, K:1, L:1}, // Links oben, Rechts oben, schräg zur Mitte unten

  "W": {E:1, F:1, B:1, C:1, K:1, L:1}, // Wände + Diagonale unten zur Mitte
  "X": {M:1,N:1,K:1,L:1}, // Nur das Kreuz
  "Y": {M:1,N:1,I2:1}, // Y-Form oben, Strich unten
  "Z": {A:1,N:1,K:1,J:1}, // Oben, Diagonale quer, Unten

  // --- SONDERZEICHEN ---
  " ": {},
  ".": {J:0}, // Ggf Punkt hinzufügen in SVG wenn gewünscht
  "-": {G1:1,G2:1}
};