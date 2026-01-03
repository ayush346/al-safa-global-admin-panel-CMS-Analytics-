// Lightweight draft store persisted in sessionStorage for edit mode
// Provides nested path set/get and emits 'asg:draft-updated' on writes

const STORAGE_KEY = 'asg:draft-overrides';

function readRoot() {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function writeRoot(root) {
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(root));
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new Event('asg:draft-updated'));
		}
	} catch {}
}

function setByPath(obj, path, value) {
	if (!path) return;
	const parts = String(path).split('.');
	let cur = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		const key = parts[i];
		if (!cur[key] || typeof cur[key] !== 'object') cur[key] = {};
		cur = cur[key];
	}
	cur[parts[parts.length - 1]] = value;
}

function getByPath(obj, path) {
	if (!path) return undefined;
	const parts = String(path).split('.');
	let cur = obj;
	for (let i = 0; i < parts.length; i++) {
		const key = parts[i];
		if (!cur || typeof cur !== 'object' || !(key in cur)) return undefined;
		cur = cur[key];
	}
	return cur;
}

function deleteByPath(obj, path) {
	if (!path) return;
	const parts = String(path).split('.');
	let cur = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		const key = parts[i];
		if (!cur || typeof cur !== 'object') return;
		cur = cur[key];
	}
	if (cur && typeof cur === 'object') {
		delete cur[parts[parts.length - 1]];
	}
}

export const draftStore = {
	readAll() {
		return readRoot();
	},
	getPath(path, defaultValue) {
		const root = readRoot();
		const v = getByPath(root, path);
		return v === undefined ? defaultValue : v;
	},
	setPath(path, value) {
		const root = readRoot();
		setByPath(root, path, value);
		writeRoot(root);
	},
	removePath(path) {
		const root = readRoot();
		deleteByPath(root, path);
		writeRoot(root);
	},
	clear() {
		try {
			sessionStorage.removeItem(STORAGE_KEY);
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new Event('asg:draft-updated'));
			}
		} catch {}
	}
};


