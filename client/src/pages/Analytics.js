import React, { useEffect, useMemo, useState } from 'react';
import './Admin.css';

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

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/analytics/summary?granularity=${granularity}`);
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

	const chart = useMemo(() => {
		if (!data || !data.timeline || data.timeline.length === 0) {
			return { max: 0, items: [] };
		}
		const max = Math.max(
			1,
			...data.timeline.map((d) => Math.max(d.pageviews || 0, d.clicks || 0))
		);
		const items = data.timeline.map((d) => ({
			label:
				granularity === 'day'
					? new Date(d.from).toLocaleDateString()
					: granularity === 'week'
					? `Wk of ${new Date(d.from).toLocaleDateString()}`
					: granularity === 'month'
					? new Date(d.from).toLocaleString(undefined, { month: 'short', year: 'numeric' })
					: new Date(d.from).getFullYear(),
			pageviews: d.pageviews || 0,
			clicks: d.clicks || 0,
		}));
		return { max, items };
	}, [data, granularity]);

	const pageviewsColor = '#3b82f6'; // blue-500
	const clicksColor = '#f97316'; // orange-500
	const gridColor = '#e5e7eb'; // gray-200

	const BarChart = () => {
		if (!chart.items.length) {
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
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
					<h2 style={{ margin: 0, fontSize: 18 }}>Timeline</h2>
					<div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
							<span style={{ width: 12, height: 12, background: pageviewsColor, borderRadius: 3, display: 'inline-block' }} />
							<span style={{ fontSize: 12, color: '#374151' }}>Pageviews</span>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
							<span style={{ width: 12, height: 12, background: clicksColor, borderRadius: 3, display: 'inline-block' }} />
							<span style={{ fontSize: 12, color: '#374151' }}>Clicks</span>
						</div>
					</div>
				</div>
				<div style={{ position: 'relative', height: 260, padding: '8px 8px 24px 8px' }}>
					{/* Grid lines */}
					{[0, 0.25, 0.5, 0.75, 1].map((g) => (
						<div
							key={g}
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								bottom: `${g * 100}%`,
								height: 1,
								background: gridColor,
								opacity: g === 0 ? 1 : 0.6,
							}}
						/>
					))}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 0,
							bottom: 24,
							display: 'flex',
							alignItems: 'flex-end',
							gap: 10,
							overflowX: 'auto',
							paddingBottom: 8,
						}}
					>
						{chart.items.map((it, idx) => {
							const pvH = Math.round((it.pageviews / chart.max) * 100);
							const clH = Math.round((it.clicks / chart.max) * 100);
							return (
								<div key={idx} style={{ minWidth: 40, flex: '0 0 auto', textAlign: 'center' }}>
									<div
										style={{
											display: 'flex',
											alignItems: 'flex-end',
											justifyContent: 'center',
											gap: 6,
											height: '100%',
										}}
										title={`${it.label}\nViews: ${it.pageviews}\nClicks: ${it.clicks}`}
									>
										<div
											style={{
												width: 14,
												height: `${pvH}%`,
												background: pageviewsColor,
												borderRadius: '4px 4px 0 0',
												boxShadow: '0 2px 6px rgba(59,130,246,0.3)',
											}}
										/>
										<div
											style={{
												width: 14,
												height: `${clH}%`,
												background: clicksColor,
												borderRadius: '4px 4px 0 0',
												boxShadow: '0 2px 6px rgba(249,115,22,0.3)',
											}}
										/>
									</div>
									<div style={{ marginTop: 8, fontSize: 10, color: '#374151' }}>
										{String(it.label).length > 10 ? String(it.label).slice(0, 10) + '…' : it.label}
									</div>
								</div>
							);
						})}
					</div>
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
							fetch(`/api/analytics/summary?${qs}`).then(r => r.json()).then(setData).finally(() => setLoading(false));
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

					<BarChart />

					{/* Tables removed per request; dashboard view only */}
				</>
			)}
		</div>
	);
}

export default Analytics;


