import React, { useMemo } from 'react';
import { NormalizedReview } from '@/lib/types';
import { getReviewTimeseries, TimeseriesDatum } from '@/lib/analytics';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type Props = {
  reviews: NormalizedReview[];
  granularity?: 'day' | 'week' | 'month';
  onlyApproved?: boolean; // default true: common KPI
  height?: number; // chart height
};

const DEFAULT_HEIGHT = 260;

const AnalyticsChart: React.FC<Props> = ({
  reviews,
  granularity = 'day',
  onlyApproved = true,
  height = DEFAULT_HEIGHT,
}) => {
  const data: TimeseriesDatum[] = useMemo(() => {
    if (!reviews?.length) return [];
    return getReviewTimeseries(reviews, {
      granularity,
      statuses: onlyApproved ? ['approved'] : undefined,
    });
  }, [reviews, granularity, onlyApproved]);

  if (!data.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-900">
        No analytics data available.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Review Analytics</h2>
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {onlyApproved ? 'Approved' : 'All'} · {granularity}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" domain={[0, 5]} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'avgRating') return [Number(value).toFixed(2), 'Avg Rating'];
              return [value, 'Count'];
            }}
            labelFormatter={(label: string) => `Date: ${label}`}
          />
          <Bar
            yAxisId="right"
            dataKey="count"
            name="Count"
            barSize={18}
            fill="#93c5fd" /* Tailwind blue-300 */
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgRating"
            name="Avg Rating"
            stroke="#2563eb" /* Tailwind blue-600 */
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
