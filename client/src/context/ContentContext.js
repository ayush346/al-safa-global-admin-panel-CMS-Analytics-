import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import contentData from '../content.json';

const ContentContext = createContext({ content: contentData });

// Defined outside the component so it's stable and linter-friendly
function mergeDeep(target, source) {
	if (!source) return target;
	if (Array.isArray(source)) {
		// If source is an array of objects of the form { text: "..." }, normalize to primitives.
		const allTextObjects = source.every((item) => item && typeof item === 'object' && 'text' in item);
		if (allTextObjects) {
			return source.map((item) => item && typeof item === 'object' ? item.text : item);
		}
		// If the target is an array of primitives (strings/numbers),
		// and the source is an array of objects with { text }, normalize to primitives.
		if (Array.isArray(target) && target.length > 0) {
			const targetIsPrimitiveArray = typeof target[0] !== 'object' || target[0] === null;
			if (targetIsPrimitiveArray) {
				return source.map((item) => {
					if (item && typeof item === 'object' && 'text' in item) {
						return item.text;
					}
					return item;
				});
			}
		}
		// Otherwise, replace with source as-is (arrays are authoritative)
		return [...source];
	}
	const output = Array.isArray(target) ? [...target] : { ...target };
	Object.keys(source).forEach(key => {
		const srcVal = source[key];
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
}

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
	}, [API_BASE]);

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


