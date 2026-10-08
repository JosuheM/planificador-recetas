export const META = {
  Desayuno: { emoji: '🍳', clase: 'desayuno' },
  Almuerzo: { emoji: '🍲', clase: 'almuerzo' },
  Cena: { emoji: '🌙', clase: 'cena' },
  Postre: { emoji: '🍰', clase: 'postre' },
  Snack: { emoji: '🍿', clase: 'snack' },
  Vegetariano: { emoji: '🥗', clase: 'vegetariano' },
  General: { emoji: '🍽️', clase: 'general' },
};

export const meta = (cat) => META[cat] || META.General;
