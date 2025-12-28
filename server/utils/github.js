const path = require('path');

// Dynamic import for node-fetch (ESM)
const fetchDynamic = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function buildGithubHeaders(token) {
	return {
		'Authorization': `Bearer ${token}`,
		'Accept': 'application/vnd.github+json',
		'Content-Type': 'application/json',
		'User-Agent': 'al-safa-global-backend',
	};
}

async function getFileSha({ owner, repo, branch, filePath, token }) {
	const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`;
	const res = await fetchDynamic(url, { headers: buildGithubHeaders(token) });
	if (res.status === 404) return null; // new file
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitHub get contents failed: ${res.status} ${text}`);
	}
	const json = await res.json();
	return json && json.sha ? json.sha : null;
}

async function putFile({ owner, repo, branch, filePath, content, message, token, sha }) {
	const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;
	const body = {
		message: message || `chore: update ${filePath}`,
		content: Buffer.from(content, 'utf8').toString('base64'),
		branch,
		sha: sha || undefined,
	};
	const res = await fetchDynamic(url, {
		method: 'PUT',
		headers: buildGithubHeaders(token),
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitHub put contents failed: ${res.status} ${text}`);
	}
	return res.json();
}

function isPathAllowed(filePath) {
	// Restrict writes to client content and public assets only
	const normalized = filePath.replace(/\\/g, '/');
	return normalized.startsWith('client/src/') || normalized.startsWith('client/public/');
}

async function commitFileToGithub({ owner, repo, branch, filePath, content, message, token }) {
	if (!isPathAllowed(filePath)) {
		throw new Error('Path not allowed for write');
	}
	const sha = await getFileSha({ owner, repo, branch, filePath, token });
	return await putFile({ owner, repo, branch, filePath, content, message, token, sha });
}

module.exports = {
	commitFileToGithub,
	isPathAllowed,
};


