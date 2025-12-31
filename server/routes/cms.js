const express = require('express');
const CmsVersion = require('../models/CmsVersion');

const router = express.Router();

function optionalAdminAuth(req, res, next) {
	const expected = process.env.ADMIN_SAVE_TOKEN;
	if (!expected) return next();
	const header = req.get('x-admin-token');
	if (!header || header !== expected) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	next();
}

// Save a named version (draft)
router.post('/save', optionalAdminAuth, async (req, res) => {
	try {
		const { pagePath, label, data, author } = req.body || {};
		if (!pagePath || !label || !data) {
			return res.status(400).json({ message: 'pagePath, label and data are required' });
		}
		// Deep merge helper
		const deepMerge = (base, patch) => {
			if (!patch) return base || {};
			const out = { ...(base || {}) };
			for (const k of Object.keys(patch)) {
				const pv = patch[k];
				if (pv && typeof pv === 'object' && !Array.isArray(pv)) {
					out[k] = deepMerge(out[k], pv);
				} else {
					out[k] = pv;
				}
			}
			return out;
		};
		// Merge structured overrides with last version for this pagePath
		let mergedOverrides = data.overrides || undefined;
		if (data.overrides) {
			const last = await CmsVersion.findOne({ pagePath }).sort({ createdAt: -1 }).lean();
			const prev = last?.data?.overrides || {};
			mergedOverrides = deepMerge(prev, data.overrides);
		}
		const doc = await CmsVersion.create({
			pagePath,
			label,
			author,
			data: {
				htmlMain: data.htmlMain || '',
				htmlFooter: data.htmlFooter || '',
				overrides: mergedOverrides,
			},
			published: false,
		});
		return res.status(201).json({ ok: true, version: doc });
	} catch (e) {
		console.error('CMS save error', e);
		return res.status(500).json({ message: 'Save failed', error: String(e && e.message || e) });
	}
});

// List versions for a page
router.get('/versions', optionalAdminAuth, async (req, res) => {
	try {
		const pagePath = req.query.pagePath;
		if (!pagePath) return res.status(400).json({ message: 'pagePath is required' });
		const docs = await CmsVersion.find({ pagePath }).sort({ createdAt: -1 }).limit(50).lean();
		return res.json({ ok: true, versions: docs });
	} catch (e) {
		console.error('CMS versions error', e);
		return res.status(500).json({ message: 'List failed', error: String(e && e.message || e) });
	}
});

// Restore a version (creates a new draft copy from a previous version)
router.post('/restore', optionalAdminAuth, async (req, res) => {
	try {
		const { versionId, label, author } = req.body || {};
		if (!versionId) return res.status(400).json({ message: 'versionId is required' });
		const src = await CmsVersion.findById(versionId);
		if (!src) return res.status(404).json({ message: 'Version not found' });
		const doc = await CmsVersion.create({
			pagePath: src.pagePath,
			label: label || `Restore: ${src.label}`,
			author,
			data: src.data,
			published: false,
		});
		return res.status(201).json({ ok: true, version: doc });
	} catch (e) {
		console.error('CMS restore error', e);
		return res.status(500).json({ message: 'Restore failed', error: String(e && e.message || e) });
	}
});

// Publish a version
router.post('/publish', optionalAdminAuth, async (req, res) => {
	try {
		const { versionId, author } = req.body || {};
		if (!versionId) return res.status(400).json({ message: 'versionId is required' });
		const v = await CmsVersion.findById(versionId);
		if (!v) return res.status(404).json({ message: 'Version not found' });
		v.published = true;
		v.publishedAt = new Date();
		v.publishedBy = author || 'admin';
		await v.save();
		return res.json({ ok: true, version: v });
	} catch (e) {
		console.error('CMS publish error', e);
		return res.status(500).json({ message: 'Publish failed', error: String(e && e.message || e) });
	}
});

// Get content for a page (variant: published | draft)
router.get('/content', async (req, res) => {
	try {
		const pagePath = req.query.pagePath;
		const variant = req.query.variant || 'published';
		if (!pagePath) return res.status(400).json({ message: 'pagePath is required' });
		let doc;
		if (variant === 'draft') {
			doc = await CmsVersion.findOne({ pagePath }).sort({ createdAt: -1 }).lean();
		} else {
			doc = await CmsVersion.findOne({ pagePath, published: true }).sort({ publishedAt: -1 }).lean();
		}
		if (!doc) return res.json({ ok: true, data: { htmlMain: '', htmlFooter: '', overrides: {} } });
		return res.json({ ok: true, data: doc.data, version: doc });
	} catch (e) {
		console.error('CMS content error', e);
		return res.status(500).json({ message: 'Content fetch failed', error: String(e && e.message || e) });
	}
});

module.exports = router;


