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
};

// Define el orden en que se llenarán las posiciones
export const ordenPosiciones = {
    '4-3-3': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MC1', 'MC2', 'MC3', 'ED', 'DC', 'EI'],
    '4-4-2': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MD', 'MC1', 'MC2', 'MI', 'DC1', 'DC2'],
    '4-2-3-1': ['POR', 'LTD', 'DFC1', 'DFC2', 'LTI', 'MCD1', 'MCD2', 'MD', 'MCO', 'MI', 'DC'],
    // ...
};
