#!/usr/bin/env node
// Actualiza descripciones faltantes o placeholder usando `productos_raw.json`
// Uso:
//   node scripts/updateDescriptions.js --dry-run   (solo muestra cambios)
//   node scripts/updateDescriptions.js             (aplica cambios)
// Empareja por nombre (ignora mayúsculas, espacios extras) y toma la descripción más larga.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Product = require('../models/Product');

const DRY_RUN = process.argv.includes('--dry-run');

function normalizeName(name = '') {
  return String(name)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(\d+LB|X\d+|[0-9]+g|[0-9]+lb)$/i, '') // quita sufijos de tamaño comunes si estuvieran en el nombre
    .trim()
    .toLowerCase();
}

async function loadRawDescriptions() {
  const rawPath = path.resolve(__dirname, '../productos_raw.json');
  const content = fs.readFileSync(rawPath, 'utf8');
  const data = JSON.parse(content);
  const map = new Map();
  for (const item of data) {
    const n = normalizeName(item.name);
    const desc = (item.description || '').trim();
    if (!desc) continue;
    // Guardar la descripción más larga por nombre
    const existing = map.get(n);
    if (!existing || desc.length > existing.length) {
      map.set(n, desc);
    }
  }
  return map;
}

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI no definido en .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, {});
  console.log('✅ Conectado a MongoDB');

  const rawMap = await loadRawDescriptions();
  console.log(`📥 Descripciones en JSON: ${rawMap.size}`);

  // Productos candidatos: descripción vacía, muy corta o placeholder
  const candidates = await Product.find({});
  let updates = 0;
  let skipped = 0;
  const planned = [];

  for (const p of candidates) {
    const current = (p.description || '').trim();
    const isPlaceholder = /descripcion pendiente|pendiente/i.test(current) || current.length < 20;
    if (!isPlaceholder) {
      skipped++;
      continue;
    }
    const key = normalizeName(p.name);
    const newDesc = rawMap.get(key);
    if (!newDesc) {
      continue; // sin match
    }
    planned.push({ id: p._id.toString(), name: p.name, from: current, to: newDesc.slice(0, 120) + (newDesc.length > 120 ? '…' : '') });
    if (!DRY_RUN) {
      p.description = newDesc;
      await p.save();
      updates++;
    } else {
      updates++;
    }
  }

  if (DRY_RUN) {
    console.log('\n💡 DRY RUN: Cambios que se aplicarían:');
    planned.slice(0, 30).forEach(c => {
      console.log(`• ${c.name} (${c.id}) => ${c.to}`);
    });
    if (planned.length > 30) console.log(`… (${planned.length - 30} más)`);
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Productos revisados: ${candidates.length}`);
  console.log(`   Con descripción placeholder/corta: ${updates}`);
  console.log(`   Saltados (ya ok): ${skipped}`);
  console.log(`   ${DRY_RUN ? 'No se guardaron cambios (dry-run).' : 'Descripciones actualizadas.'}`);

  await mongoose.disconnect();
  console.log('\n✅ Finalizado');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  mongoose.disconnect();
  process.exit(1);
});
