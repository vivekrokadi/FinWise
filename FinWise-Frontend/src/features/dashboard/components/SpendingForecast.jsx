// FinWise-Frontend/src/features/dashboard/components/SpendingForecast.jsx
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Brain,
  Info,
  PieChart as PieChartIcon,
  TrendingDown,
  Target
} from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { apiClient } from '../../../api/client.js';
import { 
  API_ROUTES, 
  SEVERITY_LEVELS, 
  CHART_COLORS,
  DEFAULT_COLORS 
} from '../../../utils/constants.js';

/**
 * SpendingForecast Component
 * Displays AI-powered spending predictions, anomaly detection, and insights
 */
export function SpendingForecast() {
  const [monthsAhead, setMonthsAhead] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ==========================================
  // FETCH SPENDING PREDICTION
  // ==========================================
  const {
    data: forecast,
    isLoading: forecastLoading,
    error: forecastError,
    refetch: refetchForecast
  } = useQuery({
    queryKey: ['spending-forecast', monthsAhead],
    queryFn: async () => {
      try {
        console.log('🔮 Fetching ML prediction for', monthsAhead, 'months...');
        const result = await apiClient.get(
          `${API_ROUTES.ML_PREDICT}?monthsAhead=${monthsAhead}`
        );
        console.log('✅ Forecast received:', result);
        return result;
      } catch (err) {
        console.error('❌ Forecast error:', err);
        throw err;
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 2,
    enabled: true
  });

  // ==========================================
  // FETCH ANOMALIES DETECTION
  // ==========================================
  const { 
    data: anomalies,
    isLoading: anomaliesLoading 
  } = useQuery({
    queryKey: ['anomalies'],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching anomaly detection...');
        const result = await apiClient.get(`${API_ROUTES.ML_ANOMALIES}?threshold=2.5`);
        console.log('✅ Anomalies received:', result);
        return result;
      } catch (err) {
        console.warn('⚠️ Anomaly fetch failed:', err);
        return { anomalies: [], statistics: {} };
      }
    },
    staleTime: 300000,
    retry: 1,
    enabled: true
  });

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (forecastLoading) {
    return (
      <Card className="p-8 flex items-center justify-center gap-4">
        <Zap className="animate-spin text-blue-600" size={40} />
        <div>
          <p className="text-lg font-semibold text-gray-900">
            Training ML Model...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Analyzing your spending patterns
          </p>
        </div>
      </Card>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (forecastError) {
    console.error('Forecast error details:', forecastError);
    return (
      <Card className="p-6 border-l-4 border-red-500 bg-red-50">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <p className="text-red-900 font-semibold text-lg">
              Error Loading Predictions
            </p>
            <p className="text-red-700 text-sm mt-2">
              {forecastError?.message || 'Failed to load spending predictions'}
            </p>
            <p className="text-red-600 text-xs mt-2 font-mono bg-red-100 p-3 rounded overflow-auto">
              {forecastError?.toString()}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => refetchForecast()}
                leftIcon={<RefreshCw size={16} />}
                variant="secondary"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ==========================================
  // DATA VALIDATION
  // ==========================================
  const hasData = forecast?.success && !forecast?.isDefault;
  const transactionCount = forecast?.transactionCount || 0;

  // Not enough data
  if (!hasData && transactionCount < 10) {
    const needed = Math.max(0, 10 - transactionCount);
    return (
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-start gap-4">
          <Info className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <p className="text-blue-900 font-semibold text-lg">
              More Data Needed for Predictions
            </p>
            <p className="text-blue-700 text-sm mt-2">
              You have <strong>{transactionCount}</strong> transaction{transactionCount !== 1 ? 's' : ''}. 
              We need at least <strong>10 transactions</strong> to show accurate ML-powered predictions.
            </p>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-blue-600">
                  Progress
                </span>
                <span className="text-xs font-semibold text-blue-900">
                  {transactionCount}/10
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((transactionCount / 10) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <p className="text-blue-600 text-xs mt-3 font-medium">
              ✨ Add {needed} more transaction{needed !== 1 ? 's' : ''} to unlock AI predictions
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // ==========================================
  // PREPARE CHART DATA
  // ==========================================
  const forecastData = [
    {
      month: 'This Month',
      amount: forecast?.nextMonthPrediction || 0,
      type: 'current'
    },
    ...(forecast?.monthlyForecast?.map((f, i) => ({
      month: `Month +${f.month}`,
      amount: f.predictedAmount,
      type: 'forecast'
    })) || [])
  ];

  const categoryChartData = forecast?.categoryBreakdown?.filter(
    cat => cat.predictedAmount > 0
  ) || [];

  // ==========================================
  // RENDER: SUCCESS STATE
  // ==========================================
  return (
    <div className="space-y-6">
      {/* ========== MAIN FORECAST CARD ========== */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-lg shadow-2xl overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur">
                <Brain size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">AI Spending Forecast</h3>
                <p className="text-indigo-100 text-sm mt-1">
                  Based on {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right bg-white bg-opacity-10 backdrop-blur px-4 py-3 rounded-lg">
              <p className="text-xs font-medium text-indigo-100 uppercase tracking-wide">
                Predicted Spending
              </p>
              <p className="text-4xl font-bold mt-1">
                ₹{Math.round(forecast?.nextMonthPrediction || 0).toLocaleString()}
              </p>
              <p className="text-indigo-200 text-xs mt-2 font-semibold">
                {forecast?.confidence}% Confidence
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex gap-2 flex-wrap">
            {[1, 3, 6].map(months => (
              <button
                key={months}
                onClick={() => setMonthsAhead(months)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  monthsAhead === months
                    ? 'bg-white text-indigo-600 shadow-lg scale-105'
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
              >
                {months} Month{months > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== TREND CHART ========== */}
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Spending Trend
              </h4>
              <p className="text-xs text-gray-500">
                Next {monthsAhead} month{monthsAhead > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <RefreshCw
            className="cursor-pointer text-gray-400 hover:text-gray-600 transition"
            size={20}
            onClick={() => refetchForecast()}
          />
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={forecastData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #3B82F6',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              formatter={val => [
                `₹${Math.round(val).toLocaleString()}`,
                'Spending'
              ]}
              labelStyle={{ color: '#1f2937' }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{
                fill: '#3B82F6',
                r: 6,
                strokeWidth: 2,
                stroke: '#fff'
              }}
              activeDot={{
                r: 8,
                fill: '#1D4ED8'
              }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ========== CATEGORY BREAKDOWN ========== */}
      {categoryChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="text-green-600" size={20} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Spending by Category
                </h4>
                <p className="text-xs text-gray-500">Next month prediction</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '11px' }}
                  tickFormatter={val => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #10B981',
                    borderRadius: '8px'
                  }}
                  formatter={val => `₹${Math.round(val).toLocaleString()}`}
                />
                <Bar
                  dataKey="predictedAmount"
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="text-purple-600" size={20} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Category Breakdown
              </h4>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {categoryChartData.map((category, index) => (
                <div
                  key={category.category}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.category ? null : category.category
                    )
                  }
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCategory === category.category
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS.CATEGORICAL[index % 8]
                        }}
                      />
                      <p className="font-semibold text-gray-900 capitalize">
                        {category.category}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-600">Predicted</p>
                      <p className="text-xl font-bold text-blue-600">
                        ₹{Math.round(
                          category.predictedAmount
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Historical Avg</p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{Math.round(
                          parseFloat(category.historicalAvg)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (parseFloat(category.percentage) / 100) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== ANOMALIES DETECTION ========== */}
      {anomalies?.anomalies && anomalies.anomalies.length > 0 && (
        <Card className="p-6 border-l-4 border-red-500 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">
                Unusual Spending Detected
              </h4>
              <p className="text-xs text-gray-600">
                {anomalies.anomalies.length} transaction{anomalies.anomalies.length > 1 ? 's' : ''} identified
              </p>
            </div>
            <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
              ⚠️ {anomalies.anomalies.length}
            </span>
          </div>

          <div className="space-y-3">
            {anomalies.anomalies.slice(0, 6).map(anomaly => {
              const severity =
                Object.values(SEVERITY_LEVELS).find(
                  s => s.value === anomaly.severity
                ) || SEVERITY_LEVELS.LOW;

              return (
                <div
                  key={anomaly.id}
                  className="p-4 rounded-lg border-l-4 transition-all hover:shadow-md"
                  style={{
                    borderColor: severity.color,
                    backgroundColor: severity.bgColor
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {anomaly.description}
                        </p>
                        <span
                          className="text-xs font-bold px-2 py-1 rounded text-white"
                          style={{ backgroundColor: severity.color }}
                        >
                          {severity.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {anomaly.reason}
                      </p>
                      <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                        <span className="capitalize">{anomaly.category}</span>
                        <span>•</span>
                        <span>
                          {new Date(anomaly.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-2xl font-bold"
                        style={{ color: severity.color }}
                      >
                        ₹{anomaly.amount.toLocaleString()}
                      </p>
                      <div className="w-20 h-2 bg-gray-300 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${anomaly.riskScore}%`,
                            backgroundColor: severity.color
                          }}
                        />
                      </div>
                      <p
                        className="text-xs font-semibold mt-1"
                        style={{ color: severity.color }}
                      >
                        Risk: {anomaly.riskScore}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {anomalies.anomalies.length > 6 && (
            <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm border-t border-gray-300 pt-4">
              View all {anomalies.anomalies.length} alerts →
            </button>
          )}
        </Card>
      )}

      {/* ========== STATISTICS ========== */}
      {anomalies?.statistics && Object.keys(anomalies.statistics).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Spending Statistics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Average Spending
                  </p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    ₹{Math.round(
                      anomalies.statistics.mean
                    ).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="text-blue-300" size={32} />
              </div>
            </Card>

            {/* Variation */}
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">
                    Std Deviation
                  </p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">
                    ₹{Math.round(
                      anomalies.statistics.stdDev
                    ).toLocaleString()}
                  </p>
                </div>
                <AlertCircle className="text-yellow-300" size={32} />
              </div>
            </Card>

            {/* Minimum */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                    Minimum
                  </p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    ₹{anomalies.statistics.min.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="text-green-300" size={32} />
              </div>
            </Card>

            {/* Maximum */}
            <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                    Maximum
                  </p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    ₹{anomalies.statistics.max.toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="text-red-300" size={32} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========== INSIGHTS ========== */}
      {forecast?.success && (
        <Card className="p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex items-start gap-4">
            <Brain className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                📊 Key Insights
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span className="text-sm text-gray-700">
                    Your predicted spending for next month is{' '}
                    <strong>₹{Math.round(forecast.nextMonthPrediction).toLocaleString()}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span className="text-sm text-gray-700">
                    <strong>{forecast.categoryBreakdown?.[0]?.category}</strong> is your
                    highest spending category at{' '}
                    <strong>{forecast.categoryBreakdown?.[0]?.percentage}%</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span className="text-sm text-gray-700">
                    Model confidence: <strong>{forecast.confidence}%</strong> based on{' '}
                    <strong>{transactionCount} transactions</strong>
                  </span>
                </li>
                {anomalies?.anomalies?.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span className="text-sm text-gray-700">
                      Found <strong>{anomalies.anomalies.length} unusual</strong> spending{' '}
                      transaction{anomalies.anomalies.length > 1 ? 's' : ''}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SpendingForecast;