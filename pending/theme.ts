// Design tokens da Medusa
// Paleta sensory-friendly: neutros quentes + verde-sálvia suave
// Baseado em pesquisa de design para neurodivergentes

export const colors = {
  bg:             '#F2F0EB', // fundo principal — creme/palha
  surface:        '#FDFCFA', // superfícies elevadas — quase branco
  border:         '#DDD8CE', // divisores sutis
  inputBg:        '#F8F6F1', // fundo do input

  textPrimary:    '#2E2A24', // texto principal — cinza escuro quente (não preto puro)
  textSecondary:  '#7A7268', // texto secundário
  textMuted:      '#A8A097', // timestamps, labels

  accent:         '#6B8F71', // verde-sálvia — ações principais
  accentLight:    '#DDE8DE', // verde-sálvia claro — balão do usuário
  accentPressed:  '#567260', // estado pressed do botão

  assistantBg:    '#FDFCFA', // fundo do balão da Medusa
  userBg:         '#DDE8DE', // fundo do balão do usuário

  danger:         '#B85C4A', // ações destrutivas (reset)
  dangerLight:    '#F5E8E5',

  overlay:        'rgba(46, 42, 36, 0.4)', // modais / overlays
};

export const typography = {
  fontFamily:     undefined,   // System font (San Francisco no iOS)
  sizeXS:         12,
  sizeSM:         14,
  sizeMD:         16,
  sizeLG:         18,
  sizeXL:         22,
  size2XL:        28,
  lineHeightBase: 24,
  lineHeightLoose: 28,
  weightRegular:  '400' as const,
  weightMedium:   '500' as const,
  weightSemibold: '600' as const,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  full: 999,
};

export const shadow = {
  sm: {
    shadowColor: '#2E2A24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};
