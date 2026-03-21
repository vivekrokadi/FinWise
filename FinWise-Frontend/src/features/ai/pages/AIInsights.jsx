import { useState } from 'react'
import { Brain, TrendingUp, TrendingDown, Wallet, Calendar, Sparkles } from 'lucide-react'
import { useGenerateInsights, useInvestmentSuggestions } from '../hooks/useAI'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../../utils/formatters'

const AIInsights = () => {
  const [period, setPeriod] = useState('month')
  const [riskTolerance, setRiskTolerance] = useState('MODERATE')
  const [investmentAmount, setInvestmentAmount] = useState(1000)
  
  const insightsMutation = useGenerateInsights()
  const investmentMutation = useInvestmentSuggestions()

  const generateInsights = () => {
    insightsMutation.mutate({ period })
  }

  const generateSuggestions = () => {
    investmentMutation.mutate({ riskTolerance, investmentAmount })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-600 mt-1">
          Get personalized financial recommendations powered by AI
        </p>
      </div>

      {/* Period Selector */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Select Analysis Period</h2>
        <div className="flex flex-wrap gap-2">
          {['week', 'month', 'quarter', 'year', 'all'].map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
          <Button
            variant="primary"
            onClick={generateInsights}
            isLoading={insightsMutation.isPending}
            leftIcon={<Brain className="h-4 w-4" />}
            className="ml-auto"
          >
            Generate Insights
          </Button>
        </div>
      </Card>

      {/* Insights Display */}
      {insightsMutation.data && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Financial Insights</h2>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p className={`text-xl font-bold ${
                    insightsMutation.data.summary.netIncome >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(insightsMutation.data.summary.netIncome)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(insightsMutation.data.summary.totalIncome)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(insightsMutation.data.summary.totalExpenses)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>

          {/* AI Insights */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">AI-Generated Insights</h3>
            </div>
            <div className="space-y-3">
              {insightsMutation.data.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Investment Suggestions Section */}
      <div className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Investment Suggestions</h2>
        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Tolerance
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <Button
              variant="primary"
              onClick={generateSuggestions}
              isLoading={investmentMutation.isPending}
            >
              Get Investment Suggestions
            </Button>
          </div>
        </Card>

        {/* Investment Suggestions Results */}
        {investmentMutation.data && (
          <div className="mt-4 space-y-3">
            {investmentMutation.data.suggestions.map((suggestion, index) => (
              <Card key={index}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{suggestion.type}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        suggestion.risk === 'LOW' 
                          ? 'bg-green-100 text-green-700'
                          : suggestion.risk === 'MODERATE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {suggestion.risk} Risk
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{suggestion.suggestion}</p>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <span>Potential Return: {suggestion.potentialReturn}</span>
                      <span>Suggested: {formatCurrency(suggestion.amount)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIInsights