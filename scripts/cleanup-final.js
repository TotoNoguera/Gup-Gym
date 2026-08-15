#!/usr/bin/env node
/**
 * LIMPIEZA FINAL - VÍA ENDPOINT ADMIN
 */

const readline = require('readline');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function callAPI(path, body) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (err) {
          resolve({ status: res.statusCode, data: null });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function cleanup() {
  try {
    console.log('\n🔍 VERIFICACIÓN FINAL DE DATOS...\n');

    // 1. ANALIZAR
    console.log('📋 Analizando datos...');
    const analyzeRes = await callAPI('/api/admin/cleanup-qa', { action: 'analyze' });

    if (analyzeRes.status === 401) {
      console.log('❌ ERROR: No autorizado. Asegúrate de estar autenticado en el navegador.');
      console.log('   Abre http://localhost:3000 en el navegador y haz login');
      process.exit(1);
    }

    if (analyzeRes.status !== 200) {
      console.log(`❌ ERROR: Status ${analyzeRes.status}`);
      console.log(analyzeRes.data);
      process.exit(1);
    }

    const { socio, totalPagos, pagoReal, pagosQA } = analyzeRes.data;

    console.log('✅ ANÁLISIS COMPLETADO\n');

    console.log('✅ SOCIO ENCONTRADO:');
    console.log(`   ID: ${socio.id}`);
    console.log(`   ${socio.nombre} ${socio.apellido} | ${socio.email}\n`);

    console.log(`📋 PAGOS ENCONTRADOS: ${totalPagos}\n`);

    if (!pagoReal) {
      console.log('⚠️  ADVERTENCIA: No se encontró pago real de $1.222\n');
    } else {
      console.log(`✅ PAGO REAL IDENTIFICADO:`);
      console.log(`   ID: ${pagoReal.id}`);
      console.log(`   Monto: $${pagoReal.monto}`);
      console.log(`   Método: ${pagoReal.metodo}\n`);
    }

    console.log(`🔴 PAGOS DE QA IDENTIFICADOS: ${pagosQA.length}\n`);

    pagosQA.forEach((p, i) => {
      console.log(`[${i + 1}] ID: ${p.id}`);
      console.log(`    Monto: $${p.monto}`);
      console.log(`    Método: ${p.metodo}\n`);
    });

    if (pagosQA.length !== 5) {
      console.log(`⚠️  ADVERTENCIA: Se esperaban 5 pagos QA, pero se encontraron ${pagosQA.length}`);
      const cont = await prompt('¿Continuar de todas formas? (s/n): ');
      if (cont.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada');
        process.exit(1);
      }
    }

    // 2. CONFIRMACIÓN
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  ÚLTIMA OPORTUNIDAD PARA CANCELAR');
    console.log('='.repeat(60));
    console.log('\nVA A ELIMINAR ESTOS PAGOS DE QA:');
    pagosQA.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.id} ($${p.monto})`);
    });
    console.log('\nVA A PRESERVAR:');
    console.log(`  - Socio: ${socio.nombre} ${socio.apellido}`);
    if (pagoReal) {
      console.log(`  - Pago real: ${pagoReal.id} ($${pagoReal.monto})`);
    }

    const confirm = await prompt('\n¿CONFIRMAR ELIMINACIÓN? (escribir "SI"): ');
    if (confirm !== 'SI') {
      console.log('\n❌ Operación cancelada');
      process.exit(1);
    }

    // 3. EJECUTAR
    console.log('\n🗑️  EJECUTANDO ELIMINACIÓN...\n');
    const executeRes = await callAPI('/api/admin/cleanup-qa', { action: 'execute' });

    if (executeRes.status !== 200) {
      console.log(`❌ ERROR: Status ${executeRes.status}`);
      console.log(executeRes.data);
      process.exit(1);
    }

    const { deletedCount, pagosRestantes } = executeRes.data;

    console.log(`✅ SE ELIMINARON ${deletedCount} PAGOS DE QA\n`);

    // 4. VERIFICAR
    console.log('🔍 VERIFICACIÓN POST-ELIMINACIÓN...\n');
    console.log(`Pagos restantes: ${pagosRestantes.length}\n`);

    pagosRestantes.forEach((p, i) => {
      console.log(`[${i + 1}] ID: ${p.id}`);
      console.log(`    Monto: $${p.monto}`);
      console.log(`    Método: ${p.metodo}\n`);
    });

    if (pagosRestantes.length === 1 && pagoReal && pagosRestantes[0].id === pagoReal.id) {
      console.log('✅ CORRECTO: Solo queda el pago real');
    } else if (pagosRestantes.length === 0) {
      console.log('⚠️  ADVERTENCIA: No quedan pagos');
    } else {
      console.log('⚠️  ADVERTENCIA: Hay pagos inesperados');
    }

    console.log('\n✅ LIMPIEZA COMPLETADA\n');
    console.log('Próximos pasos:');
    console.log('  1. Recargar el navegador en http://localhost:3000/socios');
    console.log('  2. npm run build');
    console.log('  3. git status');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

cleanup();
