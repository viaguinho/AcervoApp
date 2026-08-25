import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import localCatalog from '@/data/catalogo-acervo.json';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const baseApi = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: import.meta.env.PROD ? 'https://base44.app' : '',
  requiresAuth: false,
  appBaseUrl
});

// Mapeamento de IDs conhecidos para garantir compatibilidade de rotas e destaques no frontend
const KNOWN_IDS = {
  "Monkey Shoulder": "69ddaa4ccb2b09770cbf8dbb",
  "Volcán Tequila Blanco": "69dda9a0cb2b09770cbf8d7a",
  "Volcán de mi Tierra Tequila Blanco": "69dda9a0cb2b09770cbf8d7a",
  "Patrón XO Cafe": "69dda9a0cb2b09770cbf8d79",
  "Patron XO Cafe": "69dda9a0cb2b09770cbf8d79",
  "Talisker 10 Anos": "69ddaa4ccb2b09770cbf8dbd",
  "El Pisco Calavera": "69dda94ccb2b09770cbf8d49",
  "Hennessy Very Special": "6a0dc3499ad1b7ea7552d5c1",
};

const getLocalProducts = () => {
  return localCatalog.map((item, index) => {
    const knownId = KNOWN_IDS[item.name];
    const slugId = item.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const id = knownId || `prod-${slugId || index}`;
    return {
      id,
      created_date: new Date(Date.now() - index * 3600000).toISOString(),
      updated_date: new Date().toISOString(),
      ...item
    };
  });
};

const productEntityProxy = new Proxy(baseApi.entities?.Product || {}, {
  get(target, prop) {
    if (prop === 'list' || prop === 'filter') {
      return async (...args) => {
        try {
          if (target[prop]) {
            const res = await target[prop](...args);
            if (Array.isArray(res) && res.length > 0) {
              return res;
            }
          }
        } catch (err) {
          console.warn('[apiClient] Sem conexão backend Base44. Carregando catálogo local:', err.message);
        }
        return getLocalProducts();
      };
    }
    if (prop === 'get') {
      return async (id, ...args) => {
        try {
          if (typeof target[prop] === 'function') {
            const res = await target[prop](id, ...args);
            if (res) return res;
          }
        } catch (err) {
          // fallback
        }
        const local = getLocalProducts();
        return local.find(p => p.id === id) || local[0] || null;
      };
    }
    return Reflect.get(target, prop);
  }
});

export const api = new Proxy(baseApi, {
  get(target, prop) {
    if (prop === 'entities') {
      const entities = target.entities || {};
      return new Proxy(entities, {
        get(entityTarget, entityProp) {
          if (entityProp === 'Product') {
            return productEntityProxy;
          }
          return Reflect.get(entityTarget, entityProp);
        }
      });
    }
    return Reflect.get(target, prop);
  }
});
