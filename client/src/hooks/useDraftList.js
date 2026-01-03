import { useEffect, useMemo, useState } from 'react';
import { draftStore } from '../utils/draftStore';

export function useDraftList(path, initialList, serialize, deserialize) {
	const ser = useMemo(() => (typeof serialize === 'function' ? serialize : (x) => x), [serialize]);
	const deser = useMemo(() => (typeof deserialize === 'function' ? deserialize : (x) => x), [deserialize]);

	const readInitial = () => {
		const stored = draftStore.getPath(path);
		if (Array.isArray(stored)) {
			try {
				return stored.map(deser);
			} catch {
				return Array.isArray(initialList) ? initialList : [];
			}
		}
		return Array.isArray(initialList) ? initialList : [];
	};

	const [list, setList] = useState(readInitial);

	useEffect(() => {
		try {
			const payload = Array.isArray(list) ? list.map(ser) : [];
			draftStore.setPath(path, payload);
		} catch {}
	}, [list, path, ser]);

	useEffect(() => {
		const onUpdate = () => {
			const stored = draftStore.getPath(path);
			if (Array.isArray(stored)) {
				try {
					const next = stored.map(deser);
					setList(next);
				} catch {}
			}
		};
		if (typeof window !== 'undefined') {
			window.addEventListener('asg:draft-updated', onUpdate);
		}
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('asg:draft-updated', onUpdate);
			}
		};
	}, [path, deser]);

	return [list, setList];
}


