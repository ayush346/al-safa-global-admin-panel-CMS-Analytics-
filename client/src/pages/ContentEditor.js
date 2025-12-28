import React, { useState } from 'react';
import contentData from '../content.json';

function ContentEditor() {
	const [jsonText, setJsonText] = useState(JSON.stringify(contentData, null, 2));
	const [status, setStatus] = useState(null);
	const [adminToken, setAdminToken] = useState('');

	const handleSave = async () => {
		setStatus('saving');
		try {
			// Validate JSON
			const parsed = JSON.parse(jsonText);
			const res = await fetch('/api/admin/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-admin-token': adminToken
				},
				body: JSON.stringify({
					filePath: 'client/src/content.json',
					content: JSON.stringify(parsed, null, 2),
					message: 'content: update content.json from ContentEditor'
				})
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Save failed');
			}
			setStatus('saved');
		} catch (e) {
			console.error(e);
			setStatus('error');
		}
	};

	return (
		<div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
			<h1>Content JSON Editor</h1>
			<p>Paste your admin token and edit the JSON. Click Save to commit to GitHub.</p>
			<div style={{ marginBottom: 12 }}>
				<input
					type="password"
					placeholder="Admin token (x-admin-token)"
					value={adminToken}
					onChange={(e) => setAdminToken(e.target.value)}
					style={{ width: '100%', padding: 8 }}
				/>
			</div>
			<textarea
				value={jsonText}
				onChange={(e) => setJsonText(e.target.value)}
				rows={28}
				style={{ width: '100%', fontFamily: 'monospace', fontSize: 14, lineHeight: 1.4, padding: 12 }}
			/>
			<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
				<button className="btn btn-primary" onClick={handleSave} disabled={status === 'saving'}>
					{status === 'saving' ? 'Saving...' : 'Save to GitHub'}
				</button>
				{status === 'saved' && <span style={{ color: 'green' }}>Saved!</span>}
				{status === 'error' && <span style={{ color: 'red' }}>Error saving. Check token or JSON.</span>}
			</div>
		</div>
	);
}

export default ContentEditor;


