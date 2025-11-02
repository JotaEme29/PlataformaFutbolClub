// src/config/formaciones.js

// Coordenadas (top, left) en porcentaje para cada posición en el campo.
// 'POR' = Portero, 'DFC' = Defensa Central, 'LAT' = Lateral, 'MC' = Mediocentro, etc.

export const formaciones = {
  '4-3-3': {
    POR: { top: '90%', left: '50%' },
    LTD: { top: '75%', left: '85%' },
    DFC1: { top: '78%', left: '65%' },
    DFC2: { top: '78%', left: '35%' },
    LTI: { top: '75%', left: '15%' },
    MC1: { top: '50%', left: '70%' },
    MC2: { top: '55%', left: '50%' },
    MC3: { top: '50%', left: '30%' },
    ED: { top: '25%', left: '80%' },
    DC: { top: '20%', left: '50%' },
    EI: { top: '25%', left: '20%' },
  },
  '4-4-2': {
    POR: { top: '90%', left: '50%' },
    LTD: { top: '75%', left: '85%' },
    DFC1: { top: '78%', left: '65%' },
    DFC2: { top: '78%', left: '35%' },
    LTI: { top: '75%', left: '15%' },
    MD: { top: '50%', left: '80%' },
    MC1: { top: '55%', left: '60%' },
    MC2: { top: '55%', left: '40%' },
    MI: { top: '50%', left: '20%' },
    DC1: { top: '25%', left: '60%' },
    DC2: { top: '25%', left: '40%' },
  },
  // ¡NUEVO! Añade este bloque completo
  '4-2-3-1': {
    POR: { top: '90%', left: '50%' },
    LTD: { top: '75%', left: '85%' },
    DFC1: { top: '78%', left: '65%' },
    DFC2: { top: '78%', left: '35%' },
    LTI: { top: '75%', left: '15%' },
    MCD1: { top: '60%', left: '60%' }, // Mediocentro Defensivo
    MCD2: { top: '60%', left: '40%' }, // Mediocentro Defensivo
    MD: { top: '40%', left: '80%' },   // Mediapunta Derecho
    MCO: { top: '35%', left: '50%' },   // Mediapunta Central
    MI: { top: '40%', left: '20%' },   // Mediapunta Izquierdo
    DC: { top: '15%', left: '50%' },    // Delantero Centro
  },
  '3-5-2': {
    POR: { top: '90%', left: '50%' },
    DFC1: { top: '78%', left: '70%' }, // DFC Derecho
    DFC2: { top: '80%', left: '50%' }, // Libero/Central
    DFC3: { top: '78%', left: '30%' }, // DFC Izquierdo
    MD: { top: '50%', left: '85%' },   // Carrilero Derecho
    MC1: { top: '55%', left: '65%' },
    MC2: { top: '60%', left: '50%' },
    MC3: { top: '55%', left: '35%' },
    MI: { top: '50%', left: '15%' },   // Carrilero Izquierdo
    DC1: { top: '20%', left: '60%' },
    DC2: { top: '20%', left: '40%' },
  },
  '4-1-4-1': {
    POR: { top: '90%', left: '50%' },
    LTD: { top: '75%', left: '85%' },
    DFC1: { top: '78%', left: '65%' },
    DFC2: { top: '78%', left: '35%' },
    LTI: { top: '75%', left: '15%' },
    MCD: { top: '60%', left: '50%' }, // Pivote defensivo
    MD: { top: '45%', left: '80%' },
    MC1: { top: '40%', left: '60%' },
    MC2: { top: '40%', left: '40%' },
    MI: { top: '45%', left: '20%' },
    DC: { top: '15%', left: '50%' },
  },
  '3-4-3': {
    POR: { top: '90%', left: '50%' },
    DFC1: { top: '78%', left: '70%' },
    DFC2: { top: '80%', left: '50%' },
    DFC3: { top: '78%', left: '30%' },
    MD: { top: '50%', left: '80%' },
    MC1: { top: '55%', left: '60%' },
    MC2: { top: '55%', left: '40%' },
    MI: { top: '50%', left: '20%' },
    ED: { top: '20%', left: '85%' },
    DC: { top: '15%', left: '50%' },
    EI: { top: '20%', left: '15%' },
  },
  '5-4-1': {
    POR: { top: '90%', left: '50%' },
    LTD: { top: '75%', left: '90%' }, // Carrilero
    DFC1: { top: '78%', left: '70%' },
    DFC2: { top: '80%', left: '50%' },
    DFC3: { top: '78%', left: '30%' },
    LTI: { top: '75%', left: '10%' }, // Carrilero
    MD: { top: '50%', left: '75%' },
    MC1: { top: '55%', left: '60%' },
    MC2: { top: '55%', left: '40%' },
    MI: { top: '50%', left: '25%' },
    DC: { top: '25%', left: '50%' },
  },
  '4-3-2-1': { // Árbol de Navidad
    POR: { top: '90%', left: '50%' },
    LTD: { top: '75%', left: '85%' },
    DFC1: { top: '78%', left: '65%' },
    DFC2: { top: '78%', left: '35%' },
    LTI: { top: '75%', left: '15%' },
    MC1: { top: '55%', left: '70%' }, // Interior Derecho
    MC2: { top: '60%', left: '50%' }, // Pivote
    MC3: { top: '55%', left: '30%' }, // Interior Izquierdo
    MP1: { top: '35%', left: '60%' }, // Mediapunta Derecho
    MP2: { top: '35%', left: '40%' }, // Mediapunta Izquierdo
    DC: { top: '15%', left: '50%' },
  },
};

// Define el orden en que se llenarán las posiciones
export const ordenPosiciones = {
    '4-3-3': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MC1', 'MC2', 'MC3', 'ED', 'DC', 'EI'], // Orden: Def, Med, Del
    '4-4-2': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MD', 'MC1', 'MC2', 'MI', 'DC1', 'DC2'], // Orden: Def, Med, Del
    '4-2-3-1': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MCD1', 'MCD2', 'MD', 'MCO', 'MI', 'DC'], // Orden: Def, Pivotes, Mediapuntas, Del
    '3-5-2': ['POR', 'DFC1', 'DFC2', 'DFC3', 'MD', 'MC1', 'MC2', 'MC3', 'MI', 'DC1', 'DC2'], // Orden: Def, Med, Del
    '4-1-4-1': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MCD', 'MD', 'MC1', 'MC2', 'MI', 'DC'], // Orden: Def, Pivote, Interiores, Del
    '3-4-3': ['POR', 'DFC1', 'DFC2', 'DFC3', 'MD', 'MC1', 'MC2', 'MI', 'ED', 'DC', 'EI'], // Orden: Def, Med, Del
    '5-4-1': ['POR', 'LTD', 'DFC1', 'DFC2', 'DFC3', 'LTI', 'MD', 'MC1', 'MC2', 'MI', 'DC'], // Orden: Def, Med, Del
    '4-3-2-1': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MC1', 'MC2', 'MC3', 'MP1', 'MP2', 'DC'], // Orden: Def, Med, Mediapuntas, Del
};
