import { assert } from 'chai';

// Extraemos la lógica de cálculo exacta que usamos en UpdateRent.jsx
function calculateUpdate(currentRent, indicesStrArr, depositMultiplier) {
  let newRent = currentRent;
  indicesStrArr.forEach(indexVal => {
    const percentage = Number(indexVal);
    newRent = newRent * (percentage / 100 + 1);
  });

  const oldDeposit = currentRent * depositMultiplier;
  const newDeposit = newRent * depositMultiplier;

  return {
    oldRent: currentRent,
    newRent: parseFloat(newRent.toFixed(2)),
    oldDeposit: parseFloat(oldDeposit.toFixed(2)),
    newDeposit: parseFloat(newDeposit.toFixed(2)),
    diffDeposit: parseFloat((newDeposit - oldDeposit).toFixed(2)),
  };
}

// Escenario del usuario (basado en la captura de pantalla inicial)
// Alquiler inicial: $500.000
// Multiplicador de depósito: 1.5 (Mes y medio)
// Índices (3 meses): Ene 1.2%, Feb 2.1%, Mar 3.0%

try {
  console.log("Iniciando Verificación de Cálculos...");
  const resultado = calculateUpdate(500000, ['1.2', '2.1', '3.0'], 1.5);
  
  console.log("Resultado obtenido:", resultado);

  assert.strictEqual(resultado.newRent, 532124.78, "Error en el cálculo del nuevo alquiler");
  assert.strictEqual(resultado.newDeposit, 798187.17, "Error en el cálculo del nuevo depósito");
  assert.strictEqual(resultado.diffDeposit, 48187.17, "Error en el cálculo de la diferencia de depósito (esperado 48187.17 vs real)");

  console.log("✅ Todos los cálculos coinciden exactamente con la captura de referencia del usuario.");
} catch (error) {
  console.error("❌ Falló la verificación matemática:");
  console.error(error.message);
  process.exit(1);
}
