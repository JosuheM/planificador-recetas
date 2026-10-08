// Carga recetas de ejemplo y arma el plan semanal de un usuario ya registrado.
// Uso:  node seed.js tu@email.com
// Si el usuario ya tiene recetas, no hace nada (usa --reset para borrarlas y recargar).
require('dotenv').config();
const db = require('./src/db');

const email = process.argv[2];
const reset = process.argv.includes('--reset');

const R = {
  huevos: ['Huevos revueltos con tomate', 'Desayuno',
    [['huevo', 3, 'unidad'], ['tomate', 100, 'g'], ['cebolla', 50, 'g'], ['pan', 2, 'unidad'], ['aceite', 1, 'cda']],
    '1. Pica la cebolla y el tomate.\n2. Sofríe la cebolla 2 minutos y agrega el tomate.\n3. Añade los huevos batidos y revuelve hasta que cuajen.\n4. Sirve con pan.'],
  avena: ['Avena con plátano', 'Desayuno',
    [['avena', 60, 'g'], ['leche', 250, 'ml'], ['plátano', 1, 'unidad'], ['miel', 1, 'cda']],
    '1. Cocina la avena con la leche a fuego bajo 5 minutos.\n2. Sirve con el plátano en rodajas y la miel.'],
  tostadas: ['Tostadas con palta y huevo', 'Desayuno',
    [['pan', 2, 'unidad'], ['palta', 1, 'unidad'], ['huevo', 2, 'unidad'], ['limón', 1, 'unidad']],
    '1. Tuesta el pan.\n2. Aplasta la palta con limón y sal.\n3. Unta el pan y coloca encima los huevos fritos.'],
  arrozpollo: ['Arroz con pollo', 'Almuerzo',
    [['pollo', 500, 'g'], ['arroz', 200, 'g'], ['cebolla', 100, 'g'], ['zanahoria', 100, 'g'], ['arveja', 80, 'g'], ['aceite', 2, 'cda']],
    '1. Dora el pollo en trozos y reserva.\n2. Sofríe la cebolla y la zanahoria.\n3. Agrega el arroz, el pollo, las arvejas y 2 tazas de agua.\n4. Cocina tapado 20 minutos.'],
  lentejas: ['Lentejas guisadas', 'Almuerzo',
    [['lenteja', 250, 'g'], ['cebolla', 100, 'g'], ['zanahoria', 100, 'g'], ['papa', 200, 'g'], ['ajo', 2, 'unidad'], ['aceite', 1, 'cda']],
    '1. Remoja las lentejas 30 minutos.\n2. Sofríe cebolla y ajo, añade zanahoria y papa en cubos.\n3. Agrega las lentejas y agua; cocina 30 minutos.'],
  tallarines: ['Tallarines con salsa de tomate', 'Almuerzo',
    [['tallarín', 250, 'g'], ['tomate', 400, 'g'], ['cebolla', 80, 'g'], ['ajo', 2, 'unidad'], ['queso', 50, 'g'], ['aceite', 2, 'cda']],
    '1. Hierve los tallarines.\n2. Sofríe cebolla y ajo, agrega el tomate picado y cocina 15 minutos.\n3. Mezcla con la pasta y termina con queso rallado.'],
  pescado: ['Pescado al horno con papas', 'Almuerzo',
    [['pescado', 400, 'g'], ['papa', 400, 'g'], ['limón', 1, 'unidad'], ['ajo', 2, 'unidad'], ['aceite', 2, 'cda']],
    '1. Corta las papas en rodajas y colócalas en una fuente.\n2. Pon el pescado encima con ajo, limón y aceite.\n3. Hornea a 190 °C por 25 minutos.'],
  quinua: ['Ensalada de quinua', 'Vegetariano',
    [['quinua', 150, 'g'], ['tomate', 150, 'g'], ['pepino', 1, 'unidad'], ['cebolla', 50, 'g'], ['limón', 1, 'unidad'], ['palta', 1, 'unidad']],
    '1. Cocina la quinua 15 minutos y deja enfriar.\n2. Pica las verduras y mezcla con la quinua.\n3. Aliña con limón, sal y aceite; añade la palta al final.'],
  tortilla: ['Tortilla de verduras', 'Cena',
    [['huevo', 4, 'unidad'], ['papa', 150, 'g'], ['cebolla', 100, 'g'], ['zanahoria', 50, 'g'], ['aceite', 2, 'cda']],
    '1. Sofríe papa, cebolla y zanahoria en cubos pequeños.\n2. Bate los huevos, mézclalos con las verduras.\n3. Cocina por ambos lados en la sartén.'],
  sopa: ['Sopa de verduras', 'Cena',
    [['papa', 200, 'g'], ['zanahoria', 100, 'g'], ['cebolla', 100, 'g'], ['zapallo', 200, 'g'], ['fideo', 50, 'g']],
    '1. Pica todas las verduras.\n2. Cocínalas en 1 litro de agua 20 minutos.\n3. Añade los fideos y cocina 8 minutos más.'],
  sandwich: ['Sándwich de pollo', 'Cena',
    [['pollo', 200, 'g'], ['pan', 2, 'unidad'], ['tomate', 80, 'g'], ['palta', 1, 'unidad'], ['queso', 40, 'g']],
    '1. Cocina el pollo a la plancha y desmenúzalo.\n2. Arma el sándwich con palta, tomate y queso.'],
  crema: ['Crema de zapallo', 'Cena',
    [['zapallo', 500, 'g'], ['cebolla', 100, 'g'], ['leche', 200, 'ml'], ['papa', 100, 'g'], ['aceite', 1, 'cda']],
    '1. Sofríe la cebolla y agrega zapallo y papa en trozos.\n2. Cubre con agua y cocina 20 minutos.\n3. Licúa con la leche y calienta.'],
};

// Plan: día (0 = lunes ... 6 = domingo) -> [desayuno, almuerzo, cena]
const PLAN = [
  ['huevos', 'arrozpollo', 'tortilla'],
  ['avena', 'lentejas', 'sopa'],
  ['tostadas', 'tallarines', 'sandwich'],
  ['huevos', 'pescado', 'crema'],
  ['avena', 'arrozpollo', 'tortilla'],
  ['tostadas', 'quinua', 'sopa'],
  ['huevos', 'lentejas', 'crema'],
];
const COMIDAS = ['desayuno', 'almuerzo', 'cena'];

async function main() {
  if (!email) {
    console.log('Uso: node seed.js tu@email.com [--reset]');
    process.exit(1);
  }
  const [u] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()]);
  if (!u.length) {
    console.log(`No existe un usuario con el email ${email}. Regístrate primero en la app.`);
    process.exit(1);
  }
  const uid = u[0].id;

  const [[{ n }]] = await db.query('SELECT COUNT(*) AS n FROM recetas WHERE usuario_id = ?', [uid]);
  if (n > 0 && !reset) {
    console.log(`Ya tienes ${n} recetas. Usa "node seed.js ${email} --reset" para reemplazarlas.`);
    process.exit(0);
  }
  if (reset) {
    await db.query('DELETE FROM recetas WHERE usuario_id = ?', [uid]); // cascada: ingredientes y plan
    await db.query('DELETE FROM lista_compras WHERE usuario_id = ?', [uid]);
  }

  const ids = {};
  for (const [clave, [nombre, categoria, ings, pasos]] of Object.entries(R)) {
    const [r] = await db.query(
      'INSERT INTO recetas (usuario_id, nombre, categoria, pasos) VALUES (?, ?, ?, ?)',
      [uid, nombre, categoria, pasos]
    );
    ids[clave] = r.insertId;
    await db.query('INSERT INTO ingredientes_receta (receta_id, nombre, cantidad, unidad) VALUES ?', [
      ings.map(([nom, cant, uni]) => [r.insertId, nom, cant, uni]),
    ]);
  }

  for (let dia = 0; dia < 7; dia++) {
    for (let k = 0; k < 3; k++) {
      await db.query(
        `INSERT INTO plan_semanal (usuario_id, dia, comida, receta_id) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE receta_id = VALUES(receta_id)`,
        [uid, dia, COMIDAS[k], ids[PLAN[dia][k]]]
      );
    }
  }

  console.log(`Listo: ${Object.keys(R).length} recetas creadas y plan semanal completo (21 comidas).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
