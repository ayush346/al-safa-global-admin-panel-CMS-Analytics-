const { connectToDatabase } = require('../_db');

function unitFromGranularity(g) {
  switch ((g || 'day').toLowerCase()) {
    case 'week': return 'week';
    case 'month': return 'month';
    case 'year': return 'year';
    case 'day':
    default: return 'day';
  }
}

function parseDate(s) {
  try { return s ? new Date(s) : null; } catch { return null; }
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const granularity = url.searchParams.get('granularity') || 'day';
    const fromQ = parseDate(url.searchParams.get('from'));
    const toQ = parseDate(url.searchParams.get('to'));
    const unit = unitFromGranularity(granularity);

    const { db } = await connectToDatabase();
    const match = {};
    if (fromQ) match.ts = { ...(match.ts || {}), $gte: fromQ };
    if (toQ) match.ts = { ...(match.ts || {}), $lte: toQ };

    // Timeline: pageviews, clicks, sessions per bucket
    const timelineAgg = [
      Object.keys(match).length ? { $match: match } : null,
      {
        $group: {
          _id: { $dateTrunc: { date: '$ts', unit } },
          pageviews: {
            $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] }
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] }
          },
          sessionsSet: { $addToSet: '$meta.sessionId' },
        }
      },
      {
        $project: {
          _id: 0,
          key: { $toString: '$_id' },
          from: '$_id',
          pageviews: 1,
          clicks: 1,
          sessions: { $size: '$sessionsSet' },
        }
      },
      { $sort: { from: 1 } },
    ].filter(Boolean);

    const totalsAgg = [
      Object.keys(match).length ? { $match: match } : null,
      {
        $group: {
          _id: null,
          totalPageviews: {
            $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] }
          },
          totalClicks: {
            $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] }
          },
        }
      },
      { $project: { _id: 0, totalPageviews: 1, totalClicks: 1 } },
    ].filter(Boolean);

    const sessionsAgg = [
      Object.keys(match).length ? { $match: match } : null,
      {
        $group: {
          _id: '$meta.sessionId',
          pages: {
            $sum: { $cond: [{ $eq: ['$type', 'pageview'] }, 1, 0] }
          },
          firstTs: { $min: '$ts' },
          lastTs: { $max: '$ts' },
        }
      },
      {
        $project: {
          _id: 0,
          pages: 1,
          durationSec: {
            $cond: [
              { $gt: ['$pages', 1] },
              { $divide: [{ $subtract: ['$lastTs', '$firstTs'] }, 1000] },
              0
            ]
          }
        }
      }
    ].filter(Boolean);

    const [timeline, totals, sessionDocs] = await Promise.all([
      db.collection('events').aggregate(timelineAgg).toArray(),
      db.collection('events').aggregate(totalsAgg).toArray(),
      db.collection('events').aggregate(sessionsAgg).toArray(),
    ]);

    const totalSessions = sessionDocs.length;
    const totalPagesInSessions = sessionDocs.reduce((a, s) => a + (s.pages || 0), 0);
    const singlePageSessions = sessionDocs.filter(s => (s.pages || 0) <= 1).length;
    const totalDurationSec = sessionDocs.reduce((a, s) => a + (s.durationSec || 0), 0);

    const response = {
      granularity,
      from: fromQ ? fromQ.toISOString() : null,
      to: toQ ? toQ.toISOString() : null,
      totalSessions,
      totalPageviews: totals[0]?.totalPageviews || 0,
      totalClicks: totals[0]?.totalClicks || 0,
      bounceRate: totalSessions ? singlePageSessions / totalSessions : 0,
      avgPagesPerSession: totalSessions ? totalPagesInSessions / totalSessions : 0,
      avgSessionDurationSec: totalSessions ? totalDurationSec / totalSessions : 0,
      timeline,
    };
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ message: 'Failed to summarize', error: String(e && e.message || e) });
  }
};



