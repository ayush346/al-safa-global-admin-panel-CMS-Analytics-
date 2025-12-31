import React, { useEffect, useMemo, useState } from 'react';
import './Admin.css';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
} from 'recharts';

const ranges = [
	{ key: 'day', label: 'Daily' },
	{ key: 'week', label: 'Weekly' },
	{ key: 'month', label: 'Monthly' },
	{ key: 'year', label: 'Yearly' },
];

function Analytics() {
	const [granularity, setGranularity] = useState('day');
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const API_BASE = process.env.REACT_APP_API_BASE || '';

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${API_BASE}/api/analytics/summary?granularity=${granularity}`);
				if (!res.ok) throw new Error('Failed to load analytics');
				const json = await res.json();
				setData(json);
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [granularity]);

	const graphData = useMemo(() => {
		if (!data || !data.timeline || data.timeline.length === 0) return [];
		return data.timeline.map((d) => ({
			label:
				granularity === 'day'
					? new Date(d.from).toLocaleDateString()
					: granularity === 'week'
					? `Wk of ${new Date(d.from).toLocaleDateString()}`
					: granularity === 'month'
					? new Date(d.from).toLocaleString(undefined, { month: 'short', year: 'numeric' })
					: String(new Date(d.from).getFullYear()),
			pageviews: d.pageviews || 0,
			clicks: d.clicks || 0,
		}));
	}, [data, granularity]);

	const pageviewsColor = '#3b82f6'; // blue-500
	const clicksColor = '#f97316'; // orange-500
	const LineChartCard = () => {
		if (!graphData.length) {
			return (
				<div style={{ padding: 16, color: '#6b7280' }}>
					No analytics yet. Browse the site and click elements to generate data.
				</div>
			);
		}
		return (
			<div
				className="card"
				style={{
					padding: 16,
					borderRadius: 8,
					border: '1px solid #e5e7eb',
					background: '#fff',
				}}
			>
				<h2 style={{ margin: '0 0 12px 0', fontSize: 18 }}>Timeline</h2>
				<div style={{ height: 320 }}>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={graphData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
							<CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
							<XAxis dataKey="label" tick={{ fontSize: 12 }} />
							<YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
							<Tooltip
								formatter={(value, name) => [value, name === 'pageviews' ? 'Pageviews' : 'Clicks']}
							/>
							<Legend />
							<Line type="monotone" dataKey="pageviews" stroke={pageviewsColor} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
							<Line type="monotone" dataKey="clicks" stroke={clicksColor} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		);
	};

	return (
		<div className="admin-container">
			<h1 className="admin-title">Performance Dashboard</h1>
			<p className="admin-subtitle">View for a specific date range</p>

			<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
				<label style={{ fontSize: 14, color: '#374151' }}>
					From:{' '}
					<input
						type="date"
						onChange={(e) => {
							const from = e.target.value ? new Date(e.target.value) : null;
							if (!from) return;
							const to = new Date();
							const qs = `from=${from.toISOString()}&to=${to.toISOString()}&granularity=${granularity}&compare=1`;
							setLoading(true);
							fetch(`${API_BASE}/api/analytics/summary?${qs}`).then(r => r.json()).then(setData).finally(() => setLoading(false));
						}}
					/>
				</label>
				<div style={{ marginLeft: 'auto' }} />
				<select
					className="form-input"
					style={{ maxWidth: 160 }}
					value={granularity}
					onChange={(e) => setGranularity(e.target.value)}
				>
					{ranges.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
				</select>
			</div>

			<div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
				{ranges.map(r => (
					<button
						key={r.key}
						className="btn btn-secondary"
						style={{ opacity: r.key === granularity ? 1 : 0.7 }}
						onClick={() => setGranularity(r.key)}
					>
						{r.label}
					</button>
				))}
			</div>

			{loading && <p>Loading…</p>}
			{error && <p className="alert alert-error">{error}</p>}

			{data && (
				<>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
						<div className="stat-card" style={{ borderLeft: `4px solid ${pageviewsColor}` }}>
							<h3 style={{ marginBottom: 6 }}>Pageviews</h3>
							<p style={{ fontSize: 28, margin: 0, color: '#111827' }}>{data.totalPageviews ?? 0}</p>
							<p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#6b7280' }}>Since tracking started</p>
						</div>
						<div className="stat-card" style={{ borderLeft: `4px solid ${clicksColor}` }}>
							<h3 style={{ marginBottom: 6 }}>Clicks</h3>
							<p style={{ fontSize: 28, margin: 0, color: '#111827' }}>{data.totalClicks ?? 0}</p>
							<p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#6b7280' }}>Since tracking started</p>
						</div>
						<div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
							<h3 style={{ marginBottom: 6 }}>Sessions</h3>
							<p style={{ fontSize: 28, margin: 0, color: '#111827' }}>{data.totalSessions ?? 0}</p>
							<p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#6b7280' }}>Unique sessions</p>
						</div>
					</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16, marginBottom: 16 }}>
						<div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
							<h3 style={{ marginBottom: 6 }}>Bounce Rate</h3>
							<p style={{ fontSize: 28, margin: 0, color: '#111827' }}>{((data.bounceRate || 0) * 100).toFixed(1)}%</p>
							<p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#6b7280' }}>Single-page sessions</p>
						</div>
						<div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
							<h3 style={{ marginBottom: 6 }}>Pages / Session</h3>
							<p style={{ fontSize: 28, margin: 0, color: '#111827' }}>{(data.avgPagesPerSession || 0).toFixed(2)}</p>
							<p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#6b7280' }}>Average per session</p>
						</div>
						<div className="stat-card" style={{ borderLeft: '4px solid #06b6d4' }}>
							<h3 style={{ marginBottom: 6 }}>Avg. Session Duration</h3>
							<p style={{ fontSize: 28, margin: 0, color: '#111827' }}>
								{(() => {
									const s = Math.round(data.avgSessionDurationSec || 0);
									const m = Math.floor(s / 60), ss = s % 60;
									return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
								})()}
							</p>
							<p style={{ margin: '6px 0 0 0', fontSize: 12, color: '#6b7280' }}>mm:ss</p>
						</div>
					</div>

					<LineChartCard />

					{/* Tables removed per request; dashboard view only */}
				</>
			)}
		</div>
	);
}

export default Analytics;


