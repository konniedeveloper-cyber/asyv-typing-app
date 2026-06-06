  "use client";
import { useState, useEffect } from 'react';
import { TrophyIcon, ClockIcon, ChartBarIcon, ArrowPathIcon, UserIcon, ArrowTrendingUpIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import TrueFocus from '../pro/TrueFocus';
import SkeletonLoader from '../components/SkeletonLoader';

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [maleScores, setMaleScores] = useState([]);
  const [femaleScores, setFemaleScores] = useState([]);
  const [filteredScores, setFilteredScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    filterScoresByGender();
  }, [maleScores, femaleScores, genderFilter]);

  const filterScoresByGender = () => {
    if (genderFilter === 'all') {
      setFilteredScores([...maleScores, ...femaleScores]);
    } else if (genderFilter === 'male') {
      setFilteredScores(maleScores);
    } else if (genderFilter === 'female') {
      setFilteredScores(femaleScores);
    }
  };

  const fetchScores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scores');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }
      
      const scoresData = data.data || [];
      const uniqueUserScores = processUniqueHighestScores(scoresData);
      
      // Split by gender and take top 20 of each
      const males = uniqueUserScores
        .filter(score => score.user?.gender?.toLowerCase() === 'male')
        .slice(0, 20);
      
      const females = uniqueUserScores
        .filter(score => score.user?.gender?.toLowerCase() === 'female')
        .slice(0, 20);
      
      setScores(uniqueUserScores);
      setMaleScores(males);
      setFemaleScores(females);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message || 'Failed to fetch scores');
      setScores([]);
      setMaleScores([]);
      setFemaleScores([]);
      setLoading(false);
    }
  };

  const processUniqueHighestScores = (allScores) => {
    const userMap = new Map();
    
    allScores.forEach(score => {
      const username = (score.user?.username || '').trim().toLowerCase();
      if (username) {
        if (!userMap.has(username) || score.wpm > userMap.get(username).wpm) {
          userMap.set(username, {
            ...score,
            name: score.user?.username || 'Anonymous',
            gender: score.user?.gender,
            image: score.user?.image,
          });
        }
      }
    });
    
    return Array.from(userMap.values())
      .sort((a, b) => b.wpm - a.wpm);
  };

  const handleStartNewTest = () => {
    router.push('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-rose-500 text-center">
          <p className="text-xl font-semibold">Error loading leaderboard</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchScores}
            className="mt-4 px-4 py-2 bg-emerald-500 text-slate-900 rounded-lg hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl text-slate-100 flex items-center justify-center gap-3 mb-2">
            <RocketLaunchIcon className="w-10 h-10 text-emerald-500 animate-bounce" />
            <TrueFocus />
          </h1>
          <p className="text-slate-400 mt-2">Top speeds and highest accuracy</p>
          
          {/* Gender Filter Buttons */}
          <div className="flex justify-center gap-3 mt-6 mb-6 flex-wrap">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                genderFilter === 'all'
                  ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                genderFilter === 'male'
                  ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                genderFilter === 'female'
                  ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Female
            </button>
          </div>
          
          <button
            onClick={handleStartNewTest}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-900 
                     rounded-lg hover:bg-emerald-600 transition-all font-medium shadow-lg shadow-emerald-500/30"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Take Another Test
          </button>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : filteredScores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No scores available for this filter. Be the first to set a record!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Winners Podium */}
            {filteredScores.length >= 1 && (
              <div className="grid grid-cols-3 gap-4 mb-12 items-end">
                {/* Second Place */}
                {filteredScores.length >= 2 && (
                  <div className="order-1">
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-t-2xl p-6 border-2 border-slate-600/50 text-center transform transition-all hover:translate-y-1 hover:border-emerald-500/50">
                      <div className="flex justify-center">
                        <div className="relative">
                          {filteredScores[1].user?.image ? (
                            <img
                              src={filteredScores[1].user.image}
                              alt={filteredScores[1].name}
                              className="w-20 h-20 rounded-full -mt-14 border-4 border-slate-800 shadow-lg object-cover"
                            />
                          ) : (
                            <div className="bg-slate-400 rounded-full w-20 h-20 flex items-center justify-center -mt-14 border-4 border-slate-800 shadow-lg">
                              <UserIcon className="w-10 h-10 text-slate-900" />
                            </div>
                          )}
                          <div className="absolute -top-2 right-0 bg-slate-400 rounded-full p-2 border-2 border-slate-800">
                            <TrophyIcon className="w-5 h-5 text-slate-900" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-300 mt-4 truncate">{filteredScores[1].name}</h3>
                      {filteredScores[1].user?.gender && (
                        <p className="text-xs text-emerald-400 capitalize mt-1">
                          {filteredScores[1].user.gender === 'male' ? '♂ Male' : '♀ Female'}
                        </p>
                      )}
                      <div className="flex justify-center space-x-4 mt-3">
                        <div className="text-sm text-slate-400">
                          <ClockIcon className="w-4 h-4 inline mr-1" />
                          <span className="font-medium text-slate-300">{filteredScores[1].wpm} WPM</span>
                        </div>
                        <div className="text-sm text-slate-400">
                          <ChartBarIcon className="w-4 h-4 inline mr-1" />
                          <span className="font-medium text-slate-300">{Math.round(filteredScores[1].accuracy)}%</span>
                        </div>
                      </div>
                      <div className="h-8 bg-slate-700 mt-4 mb-2 rounded"></div>
                    </div>
                    <div className="text-center text-lg font-bold text-slate-400">2ND</div>
                  </div>
                )}

                {/* First Place */}
                <div className={`${filteredScores.length >= 2 ? 'order-0' : ''}`}>
                  <div className="bg-gradient-to-br from-yellow-600/20 to-slate-900/90 rounded-t-2xl p-6 border-2 border-yellow-500/50 text-center transform transition-all hover:translate-y-1">
                    <div className="flex justify-center">
                      <div className="relative">
                        {filteredScores[0].user?.image ? (
                          <img
                            src={filteredScores[0].user.image}
                            alt={filteredScores[0].name}
                            className="w-24 h-24 rounded-full -mt-16 border-4 border-slate-800 shadow-lg object-cover"
                          />
                        ) : (
                          <div className="bg-yellow-500 rounded-full w-24 h-24 flex items-center justify-center -mt-16 border-4 border-slate-800 shadow-lg">
                            <UserIcon className="w-12 h-12 text-slate-900" />
                          </div>
                        )}
                        <div className="absolute -top-2 right-0 bg-yellow-500 rounded-full p-3 border-2 border-slate-800">
                          <TrophyIcon className="w-6 h-6 text-slate-900" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-500 mt-4 truncate">{filteredScores[0].name}</h3>
                    {filteredScores[0].user?.gender && (
                      <p className="text-xs text-yellow-400 capitalize mt-1">
                        {filteredScores[0].user.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </p>
                    )}
                    <div className="flex justify-center space-x-4 mt-3">
                      <div className="text-sm text-slate-400">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        <span className="font-medium text-yellow-500">{filteredScores[0].wpm} WPM</span>
                      </div>
                      <div className="text-sm text-slate-400">
                        <ChartBarIcon className="w-4 h-4 inline mr-1" />
                        <span className="font-medium text-yellow-500">{Math.round(filteredScores[0].accuracy)}%</span>
                      </div>
                    </div>
                    <div className="h-16 bg-yellow-900/30 mt-4 mb-2 rounded"></div>
                  </div>
                  <div className="text-center text-2xl font-bold text-yellow-500">1ST</div>
                </div>

                {/* Third Place */}
                {filteredScores.length >= 3 && (
                  <div className="order-2">
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-t-2xl p-6 border-2 border-amber-700/50 text-center transform transition-all hover:translate-y-1 hover:border-emerald-500/50">
                      <div className="flex justify-center">
                        <div className="relative">
                          {filteredScores[2].user?.image ? (
                            <img
                              src={filteredScores[2].user.image}
                              alt={filteredScores[2].name}
                              className="w-20 h-20 rounded-full -mt-14 border-4 border-slate-800 shadow-lg object-cover"
                            />
                          ) : (
                            <div className="bg-amber-700 rounded-full w-20 h-20 flex items-center justify-center -mt-14 border-4 border-slate-800 shadow-lg">
                              <UserIcon className="w-10 h-10 text-slate-900" />
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1 bg-amber-600 rounded-full p-2 border-2 border-slate-800">
                            <TrophyIcon className="w-5 h-5 text-slate-900" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-300 mt-4 truncate">{filteredScores[2].name}</h3>
                      {filteredScores[2].user?.gender && (
                        <p className="text-xs text-emerald-400 capitalize mt-1">
                          {filteredScores[2].user.gender === 'male' ? '♂ Male' : '♀ Female'}
                        </p>
                      )}
                      <div className="flex justify-center space-x-4 mt-3">
                        <div className="text-sm text-slate-400">
                          <ClockIcon className="w-4 h-4 inline mr-1" />
                          <span className="font-medium text-slate-300">{filteredScores[2].wpm} WPM</span>
                        </div>
                        <div className="text-sm text-slate-400">
                          <ChartBarIcon className="w-4 h-4 inline mr-1" />
                          <span className="font-medium text-slate-300">{Math.round(filteredScores[2].accuracy)}%</span>
                        </div>
                      </div>
                      <div className="h-6 bg-slate-700 mt-4 mb-2 rounded"></div>
                    </div>
                    <div className="text-center text-lg font-bold text-amber-700">3RD</div>
                  </div>
                )}
              </div>
            )}

            {/* Remaining Top Scores */}
            {filteredScores.length > 3 && (
              <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30 backdrop-blur">
                <div className="overflow-x-auto">
                  {/* Mobile View */}
                  <div className="block sm:hidden">
                    {filteredScores.slice(3).map((score, index) => (
                      <div key={`${score.id}-${index}`} className="p-4 border-b border-slate-700/50 hover:bg-emerald-500/10 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-sm font-semibold text-slate-300">
                            {index + 4}
                          </span>
                          {score.user?.image ? (
                            <img src={score.user.image} alt={score.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-emerald-400" />
                            </div>
                          )}
                          <span className="font-medium text-slate-300 truncate">{score.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm ml-11">
                          <div>
                            <span className="text-slate-500">WPM:</span>
                            <span className="ml-2 text-emerald-400 font-semibold">{score.wpm}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Accuracy:</span>
                            <span className="ml-2 text-blue-400 font-semibold">{Math.round(score.accuracy)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <table className="w-full hidden sm:table">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-900/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          <div className="flex items-center gap-2">
                            <ArrowTrendingUpIcon className="w-4 h-4" />
                            Rank
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            Name
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">
                          <div className="flex items-center gap-2 justify-end">
                            <ClockIcon className="w-4 h-4" />
                            WPM
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">
                          <div className="flex items-center gap-2 justify-end">
                            <ChartBarIcon className="w-4 h-4" />
                            Accuracy
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {filteredScores.slice(3).map((score, index) => (
                        <tr key={`${score.id}-${index}`} className="hover:bg-emerald-500/10 transition-colors">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50 font-semibold text-slate-300">
                              {index + 4}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {score.user?.image ? (
                                <img src={score.user.image} alt={score.name} className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-emerald-400" />
                                </div>
                              )}
                              <span className="font-medium text-slate-300 truncate">{score.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-emerald-400 font-bold">{score.wpm}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-blue-400 font-bold">{Math.round(score.accuracy)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}