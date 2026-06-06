"use client";
import { TrophyIcon, ClockIcon, ChartBarIcon, ArrowPathIcon, UserIcon, ArrowTrendingUpIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {/* Top 3 Podium Skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {/* Second Place Skeleton */}
        <div className="order-1 pt-10">
          <div className="bg-slate-800/90 rounded-t-lg p-5 border border-slate-700/50">
            <div className="flex justify-center">
              <div className="bg-slate-700 rounded-full w-16 h-16 -mt-12"></div>
            </div>
            <div className="h-5 bg-slate-700 rounded w-3/4 mx-auto mt-2"></div>
            <div className="flex justify-center space-x-4 mt-3">
              <div className="h-4 bg-slate-700 rounded w-16"></div>
              <div className="h-4 bg-slate-700 rounded w-16"></div>
            </div>
            <div className="h-8 bg-slate-700 mt-4"></div>
          </div>
        </div>

        {/* First Place Skeleton */}
        <div className="order-0">
          <div className="bg-slate-800/90 rounded-t-lg p-5 border border-slate-700/50">
            <div className="flex justify-center">
              <div className="bg-slate-700 rounded-full w-20 h-20 -mt-14"></div>
            </div>
            <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto mt-2"></div>
            <div className="flex justify-center space-x-4 mt-3">
              <div className="h-4 bg-slate-700 rounded w-16"></div>
              <div className="h-4 bg-slate-700 rounded w-16"></div>
            </div>
            <div className="h-16 bg-slate-700 mt-4"></div>
          </div>
        </div>

        {/* Third Place Skeleton */}
        <div className="order-2 pt-14">
          <div className="bg-slate-800/90 rounded-t-lg p-5 border border-slate-700/50">
            <div className="flex justify-center">
              <div className="bg-slate-700 rounded-full w-14 h-14 -mt-10"></div>
            </div>
            <div className="h-5 bg-slate-700 rounded w-3/4 mx-auto mt-2"></div>
            <div className="flex justify-center space-x-4 mt-3">
              <div className="h-4 bg-slate-700 rounded w-16"></div>
              <div className="h-4 bg-slate-700 rounded w-16"></div>
            </div>
            <div className="h-4 bg-slate-700 mt-4"></div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-800/90 rounded-xl overflow-hidden border border-slate-700/30">
        <div className="overflow-x-auto">
          {/* Desktop Table Skeleton */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-slate-700 rounded w-16"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-slate-700 rounded w-24"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-slate-700 rounded w-16"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded w-16"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Skeleton */}
          <div className="block sm:hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-32"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                  <div className="h-4 bg-slate-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
