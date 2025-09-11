import React from 'react';
import { PropertyStats } from '@/lib/types';
import { Minus, MoveDownRight, MoveUpRight } from 'lucide-react';

interface PropertyOverviewProps {
  properties: PropertyStats[];
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({ properties }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-900">
        No property data available.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Property Overview</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Property
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Total Reviews
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Avg Rating
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Approved
              </th>
              <th
                scope="col"
                className="px-4 py-2 text-right text-xs font-medium text-gray-900 uppercase tracking-wider"
              >
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {properties.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                  <a href={`/property/${p.id}`} className="text-blue-600 hover:underline">
                    {p.name}
                  </a>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900">
                  {p.totalReviews}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900">
                  {p.averageRating != null ? p.averageRating.toFixed(1) : '-'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900">
                  {p.approvedReviews ?? 0}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900 flex items-center justify-end">
                  {p.recentTrend === 'stable' && <Minus color="#9CA3AF" />}
                  {p.recentTrend === 'up' && <MoveUpRight color="#01782c" />}
                  {p.recentTrend === 'down' && <MoveDownRight color="#ff0000" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyOverview;
