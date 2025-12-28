const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Ensure data directory exists (use persistent disk if provided)
const dataDir =
	process.env.ANALYTICS_DATA_DIR
		? path.resolve(process.env.ANALYTICS_DATA_DIR)
		: path.join(__dirname, '..', 'data');
const eventsFile = path.join(dataDir, 'analytics.jsonl');
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(eventsFile)) {
	fs.writeFileSync(eventsFile, '');
}

function appendEvent(event) {
	const line = JSON.stringify(event) + '\n';
	fs.appendFile(eventsFile, line, (err) => {
		if (err) {
			console.error('Failed to write analytics event:', err);
		}
	});
}

router.post('/track', (req, res) => {
	const { type, path: pagePath, element, text, meta } = req.body || {};
	const timestamp = new Date().toISOString();
	if (!type) {
		return res.status(400).json({ message: 'type is required' });
	}
	const event = {
		type,
		pagePath,
		element,
		text,
		meta: {
			clientId: meta?.clientId,
			sessionId: meta?.sessionId,
			device: meta?.device,
			loadTimeMs: meta?.loadTimeMs,
			ua: meta?.ua,
			width: meta?.width,
			height: meta?.height,
		},
		timestamp,
	};
	appendEvent(event);
	return res.status(204).end();
});

function parseLines() {
	const content = fs.readFileSync(eventsFile, 'utf8');
	const lines = content.split('\n').filter(Boolean);
	const events = [];
	for (const line of lines) {
		try {
			events.push(JSON.parse(line));
		} catch {
			// skip bad line
		}
	}
	return events;
}

function startOfDay(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}
function startOfWeek(date) {
	const d = new Date(date);
	const day = d.getDay(); // 0=Sun
	const diff = (day === 0 ? -6 : 1) - day; // start Monday
	d.setDate(d.getDate() + diff);
	d.setHours(0, 0, 0, 0);
	return d;
}
function startOfMonth(date) {
	const d = new Date(date);
	d.setDate(1);
	d.setHours(0, 0, 0, 0);
	return d;
}
function startOfYear(date) {
	const d = new Date(date);
	d.setMonth(0, 1);
	d.setHours(0, 0, 0, 0);
	return d;
}

function formatKey(date) {
	return new Date(date).toISOString();
}

router.get('/summary', (req, res) => {
	const granularity = (req.query.granularity || 'day').toLowerCase(); // day|week|month|year
	const fromQ = req.query.from ? new Date(req.query.from) : null;
	const toQ = req.query.to ? new Date(req.query.to) : null;
	const compare = String(req.query.compare || '0') === '1';
	const eventsAll = parseLines();

	// filter by range (inclusive)
	const events = eventsAll.filter(e => {
		const t = new Date(e.timestamp);
		if (fromQ && t < fromQ) return false;
		if (toQ && t > toQ) return false;
		return true;
	});

	const buckets = {};
	const sessionsByKey = {}; // bucketKey -> Set(sessionId)
	const sessionEvents = {}; // sessionId -> array of timestamps + count
	let totalPageviews = 0;
	let totalClicks = 0;
	let loadTimeTotal = 0;
	let loadTimeCount = 0;

	for (const e of events) {
		const t = new Date(e.timestamp);
		let start;
		switch (granularity) {
			case 'week':
				start = startOfWeek(t);
				break;
			case 'month':
				start = startOfMonth(t);
				break;
			case 'year':
				start = startOfYear(t);
				break;
			case 'day':
			default:
				start = startOfDay(t);
		}
		const key = formatKey(start);
		if (!buckets[key]) {
			buckets[key] = { pageviews: 0, clicks: 0, sessions: 0, from: start.toISOString() };
			sessionsByKey[key] = new Set();
		}
		if (e.type === 'pageview') {
			buckets[key].pageviews += 1;
			totalPageviews += 1;
			if (e.meta?.loadTimeMs) {
				loadTimeTotal += Number(e.meta.loadTimeMs) || 0;
				loadTimeCount += 1;
			}
		}
		if (e.type === 'click') {
			buckets[key].clicks += 1;
			totalClicks += 1;
		}
		const sid = e.meta?.sessionId;
		if (sid) {
			sessionsByKey[key].add(sid);
			if (!sessionEvents[sid]) sessionEvents[sid] = [];
			sessionEvents[sid].push(t.getTime());
		}
	}

	// finalize sessions per bucket
	for (const k of Object.keys(buckets)) {
		buckets[k].sessions = sessionsByKey[k].size;
	}

	// session metrics
	const sessionIds = Object.keys(sessionEvents);
	const sessionCounts = sessionIds.map(sid => {
		const arr = sessionEvents[sid].sort((a, b) => a - b);
		const pages = events.filter(e => e.meta?.sessionId === sid && e.type === 'pageview').length;
		const durationMs = arr.length > 1 ? (arr[arr.length - 1] - arr[0]) : 0;
		return { pages, durationMs };
	});
	const totalSessions = sessionIds.length;
	const totalPagesInSessions = sessionCounts.reduce((a, c) => a + c.pages, 0);
	const singlePageSessions = sessionCounts.filter(c => c.pages <= 1).length;
	const totalDurationMs = sessionCounts.reduce((a, c) => a + c.durationMs, 0);
	const bounceRate = totalSessions ? (singlePageSessions / totalSessions) : 0;
	const avgPagesPerSession = totalSessions ? (totalPagesInSessions / totalSessions) : 0;
	const avgSessionDurationSec = totalSessions ? (totalDurationMs / totalSessions / 1000) : 0;
	const avgPageLoadTimeMs = loadTimeCount ? (loadTimeTotal / loadTimeCount) : 0;

	// top clicks
	const clickTargets = {};
	for (const e of events) {
		if (e.type !== 'click') continue;
		const label = `${e.pagePath || ''} :: ${e.element || ''} :: ${String(e.text || '').slice(0, 60)}`;
		clickTargets[label] = (clickTargets[label] || 0) + 1;
	}
	const topClicks = Object.entries(clickTargets)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 20)
		.map(([label, count]) => ({ label, count }));

	const timeline = Object.entries(buckets)
		.map(([k, v]) => ({ ...v, key: k }))
		.sort((a, b) => new Date(a.from) - new Date(b.from));

	let previousTimeline = [];
	if (compare && (fromQ && toQ)) {
		const spanMs = toQ.getTime() - fromQ.getTime();
		const prevFrom = new Date(fromQ.getTime() - spanMs - 1);
		const prevTo = new Date(fromQ.getTime() - 1);
		const prev = eventsAll.filter(e => {
			const t = new Date(e.timestamp);
			return t >= prevFrom && t <= prevTo;
		});
		const prevBuckets = {};
		const prevSessionsByKey = {};
		for (const e of prev) {
			const t = new Date(e.timestamp);
			let start;
			switch (granularity) {
				case 'week':
					start = startOfWeek(t);
					break;
				case 'month':
					start = startOfMonth(t);
					break;
				case 'year':
					start = startOfYear(t);
					break;
				case 'day':
				default:
					start = startOfDay(t);
			}
			const key = formatKey(start);
			if (!prevBuckets[key]) {
				prevBuckets[key] = { sessions: 0, from: start.toISOString() };
				prevSessionsByKey[key] = new Set();
			}
			const sid = e.meta?.sessionId;
			if (sid) prevSessionsByKey[key].add(sid);
		}
		for (const k of Object.keys(prevBuckets)) {
			prevBuckets[k].sessions = prevSessionsByKey[k].size;
		}
		previousTimeline = Object.entries(prevBuckets)
			.map(([k, v]) => ({ ...v, key: k }))
			.sort((a, b) => new Date(a.from) - new Date(b.from));
	}

	return res.json({
		granularity,
		from: fromQ ? fromQ.toISOString() : null,
		to: toQ ? toQ.toISOString() : null,
		totalSessions,
		totalPageviews,
		totalClicks,
		bounceRate,
		avgPagesPerSession,
		avgSessionDurationSec,
		avgPageLoadTimeMs,
		timeline,
		previousTimeline,
		topClicks,
	});
});

module.exports = router;

// Demo data seeding (for development/testing)
router.post('/seed', (req, res) => {
	try {
		const days = Math.max(1, Math.min(90, parseInt(req.query.days || '14', 10)));
		const reset = String(req.query.reset || '0') === '1';
		if (reset) {
			fs.writeFileSync(eventsFile, '');
		}
		const now = new Date();
		const pages = ['/', '/about', '/divisions', '/contact', '/quote'];
		const devices = ['desktop', 'mobile', 'tablet'];
		const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
		for (let d = days - 1; d >= 0; d--) {
			const base = new Date(now);
			base.setDate(now.getDate() - d);
			base.setHours(9, 0, 0, 0);
			// sessions
			const sessionsToday = rand(30, 120);
			const sessionIds = Array.from({ length: sessionsToday }, () => Math.random().toString(36).slice(2));
			for (const sid of sessionIds) {
				const clientId = Math.random().toString(36).slice(2);
				const device = devices[rand(0, devices.length - 1)];
				// 1-5 pageviews per session
				const pv = rand(1, 5);
				let t = new Date(base);
				for (let i = 0; i < pv; i++) {
					const pagePath = pages[rand(0, pages.length - 1)];
					t = new Date(t.getTime() + rand(5, 600) * 1000);
					appendEvent({
						type: 'pageview',
						pagePath,
						element: null,
						text: null,
						meta: {
							clientId,
							sessionId: sid,
							device,
							loadTimeMs: rand(800, 3500),
							ua: 'demo',
							width: device === 'desktop' ? 1440 : device === 'tablet' ? 1024 : 390,
							height: device === 'desktop' ? 900 : 800,
						},
						timestamp: new Date(t).toISOString(),
					});
					// clicks during session
					const clicks = rand(0, 3);
					for (let c = 0; c < clicks; c++) {
						const clickT = new Date(t.getTime() + rand(2, 120) * 1000);
						appendEvent({
							type: 'click',
							pagePath,
							element: 'BUTTON',
							text: ['Get Quote', 'Learn More', 'Contact', 'Submit'][rand(0, 3)],
							meta: {
								clientId,
								sessionId: sid,
								device,
							},
							timestamp: clickT.toISOString(),
						});
					}
				}
			}
		}
		return res.json({ ok: true, days, reset });
	} catch (e) {
		console.error('Seed failed:', e);
		return res.status(500).json({ message: 'Seed failed' });
	}
});


