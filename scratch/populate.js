import { createClient } from '@base44/sdk';
import fs from 'fs';
import path from 'path';

// Parse .env.local manualmente para evitar dependências extras
let appId = '69dcfbe0d71ae63799fc0859';
let appBaseUrl = 'https://base44.app';

try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts[0] && parts[0].trim() === 'VITE_BASE44_APP_ID') {
      appId = parts[1].trim();
    }
    if (parts[0] && parts[0].trim() === 'VITE_BASE44_APP_BASE_URL') {
      appBaseUrl = parts[1].trim();
    }
  }
} catch (e) {
  console.log("Aviso: Não foi possível ler o arquivo .env.local, usando valores padrão.");
}

console.log("Configurando cliente Base44...");
console.log("App ID:", appId);
console.log("Base URL / Server URL:", appBaseUrl);

// Definimos serverUrl como o appBaseUrl para que o Node.js resolva a URL absoluta
const base44 = createClient({
  appId,
  serverUrl: appBaseUrl,
  requiresAuth: false,
  appBaseUrl
});

async function importar() {
  try {
    const jsonPath = path.resolve('src/data/catalogo-acervo.json');
    const produtos = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    console.log(`Lendo ${produtos.length} produtos do catálogo local...`);
    
    console.log("Buscando produtos existentes no banco...");
    const backendProducts = await base44.entities.Product.list("-created_date", 500);
    console.log(`Encontrados ${backendProducts.length} produtos existentes.`);
    
    let criados = 0;
    let atualizados = 0;

    for (const prod of produtos) {
      const match = backendProducts.find(p => p.name === prod.name);
      if (match) {
        // Atualiza
        await base44.entities.Product.update(match.id, prod);
        atualizados++;
      } else {
        // Cria
        await base44.entities.Product.create(prod);
        criados++;
      }
    }
    
    console.log(`\nImportação concluída!`);
    console.log(`- Criados: ${criados}`);
    console.log(`- Atualizados: ${atualizados}`);
  } catch (error) {
    console.error("Erro na importação:", error);
  }
}

importar();
