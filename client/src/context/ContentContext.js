import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import contentData from '../content.json';
import { useEditMode } from './EditModeContext';
import { draftStore } from '../utils/draftStore';

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

// Normalize images to { url, alt } consistently
function ensureImage(value) {
	if (!value) return { url: '', alt: '' };
	if (typeof value === 'string') return { url: value, alt: '' };
	if (typeof value === 'object') {
		const url = typeof value.url === 'string' ? value.url : '';
		const alt = typeof value.alt === 'string' ? value.alt : '';
		return { url, alt };
	}
	return { url: '', alt: '' };
}

const imageLikeKeys = new Set([
	'image','logo','banner','bannerImage','mainImage','footerImage','companyImage','socialImage','brandImage','iconImage'
]);

// Ensure base structure exists to avoid undefined access
function baseSkeleton() {
	return {
		site: { name: '', tagline: '', logo: { url: '', alt: '' } },
		seo: { title: '', description: '', keywords: '', socialImage: { url: '', alt: '' } },
		nav: [],
		hero: {
			bannerImage: { url: '', alt: '' },
			titlePrefix: '',
			brandHighlight: '',
			subtitle: '',
			paragraphs: [],
			primaryCta: { label: '', href: '' },
			secondaryCta: { label: '', href: '' },
			mainImage: { url: '', alt: '' },
			stats: []
		},
		home: {
			aboutPreview: {
				title: '',
				paragraphs: [],
				floatingWords: [],
				companyImage: { url: '', alt: '' }
			},
			sections: {
				divisions: { title: '', subtitle: '' },
				features: { title: '', subtitle: '' }
			},
			features: [],
			divisions: []
		},
		about: {
			heroTitle: '',
			heroSubtitle: '',
			introParagraph: '',
			vision: '',
			mission: '',
			values: [],
			services: [],
			sectorSolutions: [],
			valueAddedServices: [],
			brands: [],
			why: []
		},
		divisions: [],
		contact: {
			heroTitle: '',
			heroSubtitle: '',
			email: '',
			phone: '',
			addressLines: [],
			businessHours: [],
			serviceAreas: [],
			benefits: [],
			partnershipText: ''
		},
		forms: {
			divisionsOptions: [],
			inquiryTypes: []
		},
		footer: {
			emails: [],
			phones: [],
			locationText: '',
			quickLinks: [],
			services: [],
			footerImage: { url: '', alt: '' },
			legal: ''
		}
	};
}

// Recursively normalize content to guarantee predictable structures
function normalizeNode(node, key) {
	if (node === null || node === undefined) {
		return undefined;
	}
	// images by key hint
	if (typeof key === 'string' && imageLikeKeys.has(key)) {
		return ensureImage(node);
	}
	if (Array.isArray(node)) {
		return node.map((item) => normalizeNode(item));
	}
	if (typeof node === 'object') {
		const out = {};
		Object.keys(node).forEach((k) => {
			// preserve control flags
			if (k === '_disabled') {
				out[k] = !!node[k];
				return;
			}
			out[k] = normalizeNode(node[k], k);
			// Default arrays/objects if undefined slipped through
			if (out[k] === undefined) {
				// If key name hints at image, enforce image object
				if (imageLikeKeys.has(k)) {
					out[k] = { url: '', alt: '' };
				}
			}
		});
		return out;
	}
	// primitives remain as-is; strings rule is enforced at consumption via ??
	return node;
}

function normalizeContent(input) {
	// Merge onto base skeleton to fill all required paths
	const mergedOnSkeleton = mergeDeep(baseSkeleton(), input || {});
	// Walk to ensure image shapes and nested defaults
	const normalized = normalizeNode(mergedOnSkeleton);
	// Final: force arrays to at least [] for known array paths
	const ensureArray = (obj, path) => {
		const parts = path.split('.');
		let cur = obj;
		for (let i = 0; i < parts.length - 1; i++) {
			cur[parts[i]] = cur[parts[i]] || {};
			cur = cur[parts[i]];
		}
		const last = parts[parts.length - 1];
		if (!Array.isArray(cur[last])) cur[last] = [];
	};
	[
		'nav',
		'hero.paragraphs',
		'hero.stats',
		'home.aboutPreview.paragraphs',
		'home.aboutPreview.floatingWords',
		'home.features',
		'home.divisions',
		'about.values',
		'about.services',
		'about.sectorSolutions',
		'about.valueAddedServices',
		'about.brands',
		'about.why',
		'divisions',
		'contact.addressLines',
		'contact.businessHours',
		'contact.serviceAreas',
		'contact.benefits',
		'forms.divisionsOptions',
		'forms.inquiryTypes',
		'footer.emails',
		'footer.phones',
		'footer.quickLinks',
		'footer.services'
	].forEach((p) => ensureArray(normalized, p));
	return normalized;
}

export function ContentProvider({ children }) {
	const [overrides, setOverrides] = useState(null);
	const API_BASE = process.env.REACT_APP_API_BASE || '';
	const { isEditMode } = useEditMode();
	const [draftOverrides, setDraftOverrides] = useState(() => draftStore.readAll());

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

	// Sync draft overrides in edit mode from session storage
	useEffect(() => {
		if (!isEditMode) return;
		const onUpdate = () => {
			setDraftOverrides(draftStore.readAll());
		};
		window.addEventListener('asg:draft-updated', onUpdate);
		// initial pull
		onUpdate();
		return () => window.removeEventListener('asg:draft-updated', onUpdate);
	}, [isEditMode]);

	const merged = useMemo(() => {
		let base = mergeDeep(contentData, overrides);
		if (isEditMode && draftOverrides) {
			base = mergeDeep(base, draftOverrides);
		}
		return normalizeContent(base);
	}, [overrides, isEditMode, draftOverrides]);
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


