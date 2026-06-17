const isNode = typeof window === 'undefined';
const storage = isNode ? {
	_data: new Map(),
	getItem(key) { return this._data.get(key) || null; },
	setItem(key, value) { this._data.set(key, value); },
	removeItem(key) { this._data.delete(key); }
} : window.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		// @ts-ignore
		appId: import.meta.env.VITE_BASE44_APP_ID,
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: window.location.href,
		// @ts-ignore
		functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || 'v1',
		// @ts-ignore
		appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
	}
}


export const appParams = {
	...getAppParams()
}
