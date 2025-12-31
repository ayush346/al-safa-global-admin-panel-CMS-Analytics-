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
		<div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'vertical' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
				<h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Performance Dashboard</h2>
				<div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
					<label style={{ fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
						<span style={{ whiteSpace: 'nowrap' }}>From</span>
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
							style={{ padding: '6px 8px' }}
						/>
					</label>
					<select
						className="form-input"
						style={{ maxWidth: 160 }}
						value={granularity}
						onChange={(e) => setGranularity(e.target.value)}
					>
						{ranges.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
					</select>
					<div style={{ display: 'flex', gap: 8 }}>
						{ranges.map(r => (
							<button
								key={r.key}
								className="btn btn-secondary"
								style={{ opacity: r.key === granularity ? 1 : 0.6 }}
								onClick={() => setGranularity(r.key)}
							>
								{r.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{loading && <div style={{ padding: 16 }}>Loading…</div>}
			{error && <div className="alert alert-error" style={{ margin: '0 20px 12px' }}>{error}</div>}

			<div style={{ flex: 1, minHeight: 0, padding: '0 8px 8px' }}>
				{graphData.length === 0 ? (
					<div style={{ padding: 16, color: '#6b7280' }}>
						No analytics yet. Browse the site and click elements to generate data.
					</div>
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={graphData} margin={{ top: 10, right: 24, left: 8, bottom: 8 }}>
							<CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
							<XAxis dataKey="label" tick={{ fontSize: 12 }} />
							<YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
							<Tooltip
								formatter={(value, name) => [value, name === 'pageviews' ? 'Pageviews' : 'Clicks']}
								contentStyle={{ borderRadius: 8 }}
							/>
							<Legend />
							<Line type="monotone" dataKey="pageviews" stroke={pageviewsColor} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
							<Line type="monotone" dataKey="clicks" stroke={clicksColor} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}

export default Analytics;


