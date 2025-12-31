import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import contentData from '../content.json';

const ContentContext = createContext({ content: contentData });

export function ContentProvider({ children }) {
	const [overrides, setOverrides] = useState(null);
	const API_BASE = process.env.REACT_APP_API_BASE || '';

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			try {
				const res = await fetch(`${API_BASE}/api/cms/content?pagePath=${encodeURIComponent('_global')}&variant=published`);
				if (!res.ok) return;
				const json = await res.json();
				if (!cancelled) setOverrides(json?.data?.overrides || null);
			} catch {}
		};
		load();
		return () => { cancelled = true; };
	}, []);

	const mergeDeep = (target, source) => {
		if (!source) return target;
		// If source is an array, replace entirely (lists are authoritative from CMS)
		if (Array.isArray(source)) {
			return [...source];
		}
		const output = Array.isArray(target) ? [...target] : { ...target };
		Object.keys(source).forEach(key => {
			const srcVal = source[key];
			// Skip null/undefined/empty-string overrides so we don't wipe defaults
			const isEmptyScalar = srcVal === null || srcVal === undefined || (typeof srcVal === 'string' && srcVal.trim() === '');
			if (isEmptyScalar) {
				return;
			}
			if (Array.isArray(srcVal)) {
				output[key] = [...srcVal];
			} else if (srcVal && typeof srcVal === 'object') {
				output[key] = mergeDeep(output[key] || {}, srcVal);
			} else {
				output[key] = srcVal;
			}
		});
		return output;
	};

	const merged = useMemo(() => mergeDeep(contentData, overrides), [overrides]);
	const value = useMemo(() => ({ content: merged }), [merged]);
	return (
		<ContentContext.Provider value={value}>
			{children}
		</ContentContext.Provider>
	);
}

export function useContent() {
	return useContext(ContentContext).content || contentData;
}


