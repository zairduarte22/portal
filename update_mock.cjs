const fs = require('fs');

const json = fs.readFileSync('new_miembros.json', 'utf8');
const miembros = JSON.parse(json);

// Convert numeric strings to numbers, and cast to proper mock format if needed
const mockData = miembros.map(m => ({
    id: Number(m.id),
    razon_social: m.razon_social,
    acronimo: m.acronimo || '',
    rif: m.rif,
    fecha_ingreso: m.fecha_ingreso,
    tipo: m.tipo,
    direccion: m.direccion,
    hacienda: m.hacienda || '',
    hectareas: Number(m.hectareas) || 0,
    solvencia: m.solvencia,
    saldo_pendiente: Number(m.saldo_pendiente) || 0,
    ultimo_mes: m.ultimo_mes,
    correo: m.correo || '',
    telefono: m.telefono || '',
    tipo_explotacion: m.tipo_explotacion || 'Leche y Carne',
    tractores: Number(m.tractores) || 0,
    plantas_electricas: Number(m.plantas_electricas) || 0,
    convenio: Number(m.convenio) || 0,
    carnets_disponibles: Number(m.carnets_disponibles) || 0,
    cupo_gasoil: Number(m.cupo_gasoil) || 0,
    distribuidor_diesel: m.distribuidor_diesel || '',
    cantidad_animales: Number(m.cantidad_animales) || 0,
    produccion_leche_diaria: Number(m.produccion_leche_diaria) || 0,
    municipio: m.municipio || 'N/A',
    parroquia: m.parroquia || 'N/A'
}));

let mockFile = fs.readFileSync('resources/js/app/components/mockData.ts', 'utf8');

// Replace MIEMBROS_MOCK
const regex = /export const MIEMBROS_MOCK: Miembro\[\] = \[[\s\S]*?\];/;
const replacement = `export const MIEMBROS_MOCK: Miembro[] = ${JSON.stringify(mockData, null, 2)};`;

mockFile = mockFile.replace(regex, replacement);

fs.writeFileSync('resources/js/app/components/mockData.ts', mockFile);
console.log('mockData.ts updated');
