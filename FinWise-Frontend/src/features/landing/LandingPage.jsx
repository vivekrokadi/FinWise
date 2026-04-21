import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/hooks/useAuth'
import { useEffect } from 'react'
import {
  Brain, ShieldCheck, BarChart2, Wallet, Receipt,
  Bell, TrendingUp, ArrowRight, CheckCircle2,
  ChevronRight, Sparkles, PieChart, Target,
  Lock, Zap, Globe, Star
} from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    color: 'bg-purple-100 text-purple-600',
    title: 'AI-Powered Insights',
    desc: 'Google Gemini analyses your spending patterns and delivers personalised financial advice, investment suggestions, and tax-saving tips — all in real time.'
  },
  {
    icon: BarChart2,
    color: 'bg-blue-100 text-blue-600',
    title: 'Smart Analytics',
    desc: 'Interactive charts show your 6-month income vs expense trend and category breakdown so you always know where your money is going.'
  },
  {
    icon: Target,
    color: 'bg-green-100 text-green-600',
    title: 'Budget Tracking',
    desc: 'Set monthly budgets per category. FinWise alerts you by email when you approach or exceed your limit — before it\'s too late.'
  },
  {
    icon: Receipt,
    color: 'bg-orange-100 text-orange-600',
    title: 'Receipt Scanner',
    desc: 'Snap a receipt and AI extracts the amount, merchant, date, and category automatically. Review and save in one tap.'
  },
  {
    icon: Bell,
    color: 'bg-yellow-100 text-yellow-600',
    title: 'Email Notifications',
    desc: 'Real-time budget alerts and a weekly financial report delivered to your inbox every week, with savings rate and budget health at a glance.'
  },
  {
    icon: Wallet,
    color: 'bg-teal-100 text-teal-600',
    title: 'Multi-Account Support',
    desc: 'Manage savings, current, investment, and credit card accounts in one place. All balances update automatically with every transaction.'
  }
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create your account',
    desc: 'Sign up in seconds. Add your bank accounts with their current balances to get started.',
    color: 'bg-blue-600'
  },
  {
    step: '02',
    title: 'Log your transactions',
    desc: 'Add income, expenses, investments, and taxes. Use dropdowns for categories or scan a receipt with AI.',
    color: 'bg-purple-600'
  },
  {
    step: '03',
    title: 'Set your budgets',
    desc: 'Create monthly budgets per category with custom alert thresholds. We\'ll notify you before you overspend.',
    color: 'bg-green-600'
  },
  {
    step: '04',
    title: 'Get AI insights',
    desc: 'Let Gemini AI analyse your data and suggest where to cut, where to invest, and how to save on taxes.',
    color: 'bg-orange-600'
  }
]


const STATS = [
  { value: '4',     label: 'Account Types' },
  { value: '40+',   label: 'Transaction Categories' },
  { value: 'AI',    label: 'Powered Insights' },
  { value: '100%',  label: 'Secure & Private' }
]

// ── Components ─────────────────────────────────────────────────────────────────

const Navbar = ({ onLogin, onRegister }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">FinWise</span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <a href="#features"    className="hover:text-blue-600 transition">Features</a>
        <a href="#how-it-works"className="hover:text-blue-600 transition">How it works</a>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onLogin}
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition px-3 py-1.5"
        >
          Log in
        </button>
        <button
          onClick={onRegister}
          className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Get Started
        </button>
      </div>
    </div>
  </nav>
)

const FeatureCard = ({ icon: Icon, color, title, desc }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
)

const StepCard = ({ step, title, desc, color, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
        {step}
      </div>
      {!isLast && <div className="w-0.5 bg-gray-200 flex-1 my-2" />}
    </div>
    <div className="pb-8">
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate   = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect authenticated users straight to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) return null // Brief flash prevention

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Navbar ── */}
      <Navbar
        onLogin={()    => navigate('/login')}
        onRegister={()  => navigate('/register')}
      />

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/60 to-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Take control of your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              finances
            </span>
            {' '}with AI
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            FinWise is an AI-powered personal finance manager that tracks your spending,
            alerts you on budget breaches, scans receipts, and gives you Gemini-powered
            insights — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-blue-200 text-base"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition text-base"
            >
              Log in to your account
            </button>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {['No credit card required', 'Free to use', 'Secure & private'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Dashboard preview ── */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Fake browser bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md h-6 mx-4 flex items-center px-3">
                <span className="text-xs text-gray-400">finwise.app/dashboard</span>
              </div>
            </div>

            {/* Dashboard mockup content */}
            <div className="p-6 bg-gray-50">
              {/* Top stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total Balance', value: '₹1,24,500', color: 'text-gray-900' },
                  { label: 'Income (30d)',  value: '₹45,000',  color: 'text-green-600' },
                  { label: 'Expenses (30d)',value: '₹18,320',  color: 'text-red-500' },
                  { label: 'Budget Used',   value: '41%',      color: 'text-purple-600' }
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Bar chart mockup */}
                <div className="md:col-span-2 bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-3">6-Month Trend</p>
                  <div className="flex items-end gap-2 h-24">
                    {[
                      { inc: 65, exp: 40 },
                      { inc: 70, exp: 55 },
                      { inc: 60, exp: 35 },
                      { inc: 80, exp: 60 },
                      { inc: 75, exp: 45 },
                      { inc: 90, exp: 50 }
                    ].map((m, i) => (
                      <div key={i} className="flex-1 flex items-end gap-0.5">
                        <div className="flex-1 bg-green-400 rounded-t" style={{ height: `${m.inc}%` }} />
                        <div className="flex-1 bg-red-300 rounded-t"   style={{ height: `${m.exp}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-sm bg-green-400 inline-block"/>Income</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><span className="w-2 h-2 rounded-sm bg-red-300 inline-block"/>Expense</span>
                  </div>
                </div>

                {/* Pie mockup */}
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Expense Breakdown</p>
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-20 h-20 rounded-full border-8 border-blue-500 relative">
                      <div className="absolute inset-0 rounded-full" style={{
                        background: 'conic-gradient(#3B82F6 0% 35%, #10B981 35% 60%, #F59E0B 60% 78%, #EF4444 78% 100%)'
                      }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {[
                      { name: 'Food',     color: 'bg-blue-500',   pct: '35%' },
                      { name: 'Transport',color: 'bg-green-500',  pct: '25%' },
                      { name: 'Shopping', color: 'bg-yellow-500', pct: '18%' },
                      { name: 'Other',    color: 'bg-red-400',    pct: '22%' }
                    ].map(({ name, color, pct }) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-gray-500">{name}</span>
                        </div>
                        <span className="text-gray-700 font-medium">{pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-4 -right-4 hidden md:flex bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Savings Rate</p>
              <p className="text-xs text-green-600 font-bold">+24% this month</p>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 hidden md:flex bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">AI Insight</p>
              <p className="text-xs text-gray-500">3 new recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-blue-600 mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Features</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to manage money</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Built for students and professionals who want to take financial control without complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">How it works</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Up and running in 4 steps</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              No complicated setup. Go from zero to fully tracked finances in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Steps */}
            <div className="space-y-0">
              {HOW_IT_WORKS.map((step, i) => (
                <StepCard key={step.step} {...step} isLast={i === HOW_IT_WORKS.length - 1} />
              ))}
            </div>

            {/* Visual panel */}
            <div className="space-y-4">
              {/* AI insight card mockup */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-200" />
                  <span className="text-sm font-semibold text-purple-100">AI-Generated Insights</span>
                </div>
                <div className="space-y-3">
                  {[
                    'You\'re saving 24% of your income — great! Consider moving surplus into an SIP for compounding growth.',
                    'Food spending accounts for 35% of expenses. Setting a ₹5,000 cap could save ₹1,200/month.',
                    'You have ₹1.2L in 80C investments. Max out remaining ₹30K before March 31 for full tax benefit.'
                  ].map((text, i) => (
                    <div key={i} className="flex gap-3 bg-white/10 rounded-lg p-3">
                      <span className="w-5 h-5 bg-white/20 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-purple-50 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget alert mockup */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">Budget Alert — Food</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      You've used 82% of your ₹5,000 food budget. Only ₹900 remaining for this month.
                    </p>
                    <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-8 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to take control of your money?
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Join FinWise and start making smarter financial decisions with AI by your side.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition shadow-xl text-base"
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:border-white transition text-base"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">FinWise</span>
        </div>
        <p className="text-xs text-gray-500">
          AI-Powered Personal Finance Management
        </p>
      </footer>

    </div>
  )
}

export default LandingPage