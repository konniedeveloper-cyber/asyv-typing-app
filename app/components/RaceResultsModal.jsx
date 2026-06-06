'use client';

export default function RaceResultsModal({ results, isOpen, onRestart }) {
  if (!isOpen || !results || results.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Winner Announcement */}
        {results[0] && (
          <div className="p-8 bg-gradient-to-r from-yellow-500/20 to-emerald-500/20 border-b border-slate-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">
                Race Complete!
              </h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                {results[0].userImage && (
                  <img
                    src={results[0].userImage}
                    alt={results[0].userName}
                    className="w-16 h-16 rounded-full border-4 border-yellow-400"
                  />
                )}
                <div>
                  <p className="text-3xl font-bold text-slate-100">
                    {results[0].userName}
                  </p>
                  <p className="text-xl text-emerald-400 font-bold">
                    {Math.round(results[0].wpm)} WPM • {Math.round(results[0].rawWpm || 0)} Raw • {results[0].accuracy}% Accuracy
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Rankings */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Final Rankings</h2>
          <div className="space-y-4 mb-8">
            {results.map((result, idx) => (
              <div
                key={result.userId}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  idx === 0
                    ? 'bg-gradient-to-r from-yellow-500/20 to-emerald-500/20 border border-yellow-500/30'
                    : idx === 1
                    ? 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/30'
                    : idx === 2
                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                    : 'bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`text-3xl font-bold w-12 ${
                      idx === 0
                        ? 'text-yellow-400'
                        : idx === 1
                        ? 'text-slate-300'
                        : idx === 2
                        ? 'text-orange-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    {result.userImage && (
                      <img
                        src={result.userImage}
                        alt={result.userName}
                        className="w-10 h-10 rounded-full border-2 border-slate-600"
                      />
                    )}
                    <div>
                      <p className="font-bold text-slate-200">{result.userName}</p>
                      {idx === 0 && (
                        <p className="text-yellow-400 text-sm font-medium">🏆 Champion</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">
                    {Math.round(result.wpm)} WPM
                  </p>
                  <p className="text-sm text-blue-400 font-medium">
                    {Math.round(result.rawWpm || 0)} Raw
                  </p>
                  <p className="text-slate-400">{result.accuracy}% Accuracy</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-lg transition-all"
          >
            Race Again
          </button>
        </div>
      </div>
    </div>
  );
}
