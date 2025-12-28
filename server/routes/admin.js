const express = require('express');
const { commitFileToGithub } = require('../utils/github');

const router = express.Router();

function requireAdminToken(req, res, next) {
	const header = req.get('x-admin-token');
	if (!header || header !== process.env.ADMIN_SAVE_TOKEN) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	next();
}

router.post('/save', requireAdminToken, async (req, res) => {
	try {
		const { filePath, content, message } = req.body || {};
		if (!filePath || typeof content !== 'string') {
			return res.status(400).json({ message: 'filePath and content are required' });
		}

		const owner = process.env.GITHUB_REPO_OWNER;
		const repo = process.env.GITHUB_REPO_NAME;
		const branch = process.env.GITHUB_REPO_BRANCH || 'main';
		const token = process.env.GITHUB_TOKEN;

		if (!owner || !repo || !token) {
			return res.status(500).json({ message: 'GitHub configuration missing on server' });
		}

		const result = await commitFileToGithub({
			owner,
			repo,
			branch,
			filePath,
			content,
			message: message || `chore: admin save ${filePath}`,
			token,
		});

		return res.status(200).json({ ok: true, result });
	} catch (e) {
		console.error('Admin save failed:', e);
		return res.status(500).json({ message: 'Save failed', error: String(e && e.message || e) });
	}
});

module.exports = router;


