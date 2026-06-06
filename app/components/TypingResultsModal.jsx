'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, ShareIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Filler } from 'chart.js';
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, Filler);

// AnimatedCounter component for number count-up animations
const AnimatedCounter = ({ value, duration = 1200, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null) return;

    const startValue = 0;
    const targetValue = parseInt(value) || 0;
    if (targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = Date.now();
    let animationId;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const eased = 1 - (1 - progress) * (1 - progress);
      
      const current = Math.floor(startValue + (targetValue - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  return <>{displayValue}{suffix}</>;
};

const TypingResultsModal = ({ isOpen, stats, session, onRestart, onClose, theme = 'dark' }) => {
  if (!isOpen || !stats) return null;

  // Prepare WPM history for chart
  const wpmHistory = stats.wpmHistory && stats.wpmHistory.length > 0 
    ? stats.wpmHistory 
    : Array(stats.time || 30).fill(stats.wpm);
  
  const chartData = {
    labels: wpmHistory.map((_, i) => i),
    datasets: [
      {
        label: 'WPM',
        data: wpmHistory,
        borderColor: '#fbbf24', // amber/yellow like Monkey Type
        backgroundColor: 'rgba(251, 191, 36, 0.05)',
        tension: 0.45, // smooth curves
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fbbf24',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5,
        fill: true,
      },
    ],
  };

  // Calculate dynamic y-axis range for WPM
  const minWpm = Math.max(0, Math.min(...wpmHistory) - 20);
  const maxWpm = Math.max(...wpmHistory, 60) + 20;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fbbf24',
        bodyColor: '#fbbf24',
        borderColor: '#64748b',
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return context.parsed.y + ' WPM';
          }
        }
      },
    },
    elements: {
      line: { borderWidth: 2.5 },
      point: { radius: 0 },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(51, 65, 85, 0.5)',
          lineWidth: 0.5,
          drawBorder: false,
        },
        ticks: {
          font: { size: 11, weight: 'normal', family: "'Monaco', 'Menlo', monospace" },
          color: '#94a3b8',
          padding: 8,
          maxRotation: 0,
          minRotation: 0,
        },
        border: { display: false },
      },
      y: {
        min: Math.max(0, minWpm),
        max: maxWpm,
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(51, 65, 85, 0.6)',
          lineWidth: 1,
          drawBorder: false,
        },
        ticks: {
          font: { size: 12, weight: 'normal', family: "'Monaco', 'Menlo', monospace" },
          color: '#94a3b8',
          padding: 8,
          stepSize: Math.max(20, Math.ceil((maxWpm - Math.max(0, minWpm)) / 4 / 10) * 10),
        },
        border: { display: false },
      },
    },
    layout: {
      padding: { left: 0, right: 0, top: 20, bottom: 0 }
    }
  };

  // Calculate consistency percentage
  const wpmValues = wpmHistory.filter(v => v > 0);
  const avgWpm = wpmValues.length > 0 ? wpmValues.reduce((a, b) => a + b) / wpmValues.length : 0;
  const variance = wpmValues.length > 0 
    ? wpmValues.reduce((sum, val) => sum + Math.pow(val - avgWpm, 2), 0) / wpmValues.length 
    : 0;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, Math.round(100 - (stdDev / avgWpm) * 100));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`rounded-2xl w-full max-w-7xl shadow-2xl overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} animate-zoom-in`} style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}`}>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Results</h2>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex gap-12">
            {/* Left Stats Panel */}
            <div className="flex flex-col justify-center min-w-[150px]">
              <div className="mb-8">
                <div className="text-7xl font-bold text-amber-400 mb-2">
                  <AnimatedCounter value={stats.wpm} duration={1200} />
                </div>
                <div className="text-sm uppercase tracking-wider text-slate-400 font-semibold">wpm</div>
              </div>
              
              <div className="mb-8">
                <div className="text-6xl font-bold text-emerald-400 mb-2">
                  <AnimatedCounter value={stats.accuracy} duration={1200} suffix="%" />
                </div>
                <div className="text-sm uppercase tracking-wider text-slate-400 font-semibold">acc</div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">test type</div>
                  <div className="text-slate-200 font-medium">{stats.testType || 'time 30'}</div>
                  <div className="text-sm text-slate-400">{stats.language || 'english'}</div>
                </div>
              </div>
            </div>

            {/* Center Graph */}
            <div className="flex-1">
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700" style={{ height: '340px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
              <div className={`text-xs mt-3 text-center font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Seconds
              </div>
            </div>

            {/* Right Stats Panel */}
            <div className="flex flex-col justify-center min-w-[140px]">
              <div className="space-y-6">
                <div>
                  <div className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">raw</div>
                  <div className="text-2xl font-bold text-amber-400">
                    <AnimatedCounter value={stats.rawWpm || stats.wpm} duration={1200} />
                  </div>
                </div>

                <div>
                  <div className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">characters</div>
                  <div className="text-2xl font-bold text-blue-400">
                    <AnimatedCounter value={stats.characters || 0} duration={1400} />
                  </div>
                </div>

                <div>
                  <div className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">consistency</div>
                  <div className="text-2xl font-bold text-purple-400">
                    <AnimatedCounter value={consistency} duration={1300} suffix="%" />
                  </div>
                </div>

                <div>
                  <div className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-1">time</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    <AnimatedCounter value={stats.time || 30} duration={800} suffix="s" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className={`p-6 border-t ${theme === 'dark' ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'} flex justify-center gap-4`}>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>
          <button
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-8 rounded-lg transition-all duration-200"
          >
            <ShareIcon className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-zoom-in {
          animation: zoomIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TypingResultsModal;
