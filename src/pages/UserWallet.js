import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, ChevronLeft,
  CreditCard, TrendingUp, TrendingDown, Calendar, Clock,
  CheckCircle, XCircle, AlertCircle, Loader2, Copy,
  Eye, EyeOff, Gift, Zap, Shield, DollarSign, History
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .fd { font-family: 'Playfair Display', Georgia, serif; }
    .fs { font-family: 'DM Sans', system-ui, sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .animate-fadeUp { animation: fadeUp 0.5s ease forwards; }
    .animate-slideInRight { animation: slideInRight 0.5s ease forwards; }
    .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @media (max-width: 640px) {
      button, .cursor-pointer { -webkit-tap-highlight-color: transparent; }
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION CARD
// ─────────────────────────────────────────────────────────────────────────────
const TransactionCard = ({ transaction }) => {
  const getTypeConfig = () => {
    switch (transaction.type) {
      case "credit":
        return {
          icon: TrendingUp,
          color: "text-green-600",
          bg: "bg-green-50",
          label: "Credited",
          borderColor: "border-green-200"
        };
      case "debit":
        return {
          icon: TrendingDown,
          color: "text-red-600",
          bg: "bg-red-50",
          label: "Debited",
          borderColor: "border-red-200"
        };
      case "refund":
        return {
          icon: RefreshCw,
          color: "text-blue-600",
          bg: "bg-blue-50",
          label: "Refund",
          borderColor: "border-blue-200"
        };
      case "cashback":
        return {
          icon: Gift,
          color: "text-purple-600",
          bg: "bg-purple-50",
          label: "Cashback",
          borderColor: "border-purple-200"
        };
      default:
        return {
          icon: CreditCard,
          color: "text-gray-600",
          bg: "bg-gray-50",
          label: "Transaction",
          borderColor: "border-gray-200"
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;
  const isCredit = transaction.type === "credit" || transaction.type === "refund" || transaction.type === "cashback";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = () => {
    switch (transaction.status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <CheckCircle size={10} /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
            <Clock size={10} /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            <XCircle size={10} /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-xl border ${config.borderColor} hover:shadow-md transition-all duration-300`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={config.color} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900 fs text-sm">{transaction.description}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500 fs">{formatDate(transaction.createdAt)}</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className={`text-xs font-medium ${config.color} fs`}>
                    {config.label}
                  </span>
                  {getStatusBadge()}
                </div>
                {transaction.referenceId && (
                  <p className="text-[10px] text-gray-400 fs mt-1">
                    Ref: {transaction.referenceId}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-base font-bold ${isCredit ? "text-green-600" : "text-red-600"} fd`}>
                  {isCredit ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 fs">
                  Balance: ₹{transaction.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  bgColor = "bg-gray-100"
}) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon size={18} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-500 fs uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-gray-900 fd">{value}</p>
        {subValue && (
          <p className="text-[10px] text-gray-400 fs">{subValue}</p>
        )}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WALLET PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function UserWallet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const [balanceVisibleForUserWallet, setBalanceVisibleForUserWallet] = useState(() => {
    const saved = localStorage.getItem("balanceVisibleforUserWallet");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleBalanceVisibility = () => {
    setBalanceVisibleForUserWallet((prev) => {
      const newValue = !prev;
      localStorage.setItem("balanceVisibleforUserWallet", JSON.stringify(newValue));
      return newValue;
    });
  };

  // Get userId from sessionStorage
  const getUserId = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      return user?.id || null;
    } catch {
      return null;
    }
  };

  const userId = getUserId();
  const API_BASE = "http://31.97.228.17:4077";

  // Helper function to show toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Copy wallet ID to clipboard
  const copyWalletId = () => {
    if (walletData?.data?.user?.id) {
      navigator.clipboard.writeText(walletData.data.user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch wallet data
  const fetchWalletData = async () => {
    if (!userId) {
      setLoading(false);
      showToast("User not found. Please login again.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/wallet/${userId}`);
      const data = await response.json();

      if (data.success) {
        setWalletData(data);
      } else {
        showToast(data.message || "Failed to load wallet data", "error");
      }
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      showToast("Failed to load wallet data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load wallet data on mount
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get transaction icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit": return <ArrowUpRight size={14} className="text-green-600" />;
      case "debit": return <ArrowDownLeft size={14} className="text-red-600" />;
      case "refund": return <RefreshCw size={14} className="text-blue-600" />;
      case "cashback": return <Gift size={14} className="text-purple-600" />;
      default: return <CreditCard size={14} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <Loader2 size={32} className="sm:w-10 sm:h-10 animate-spin mx-auto mb-4 text-black" />
            <p className="text-gray-500 fs text-sm sm:text-base">Loading your wallet...</p>
          </div>
        </div>
      </>
    );
  }

  const wallet = walletData?.data?.wallet;
  const summary = walletData?.data?.summary;
  const stats = walletData?.data?.stats;
  const transactions = walletData?.data?.transactions?.data || [];
  const user = walletData?.data?.user;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <Styles />

        {/* Hero Section */}
        <div className="relative overflow-hidden pb-6 sm:pb-8 bg-gradient-to-r from-black to-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-white transition-colors mb-4 sm:mb-6 fs text-xs sm:text-sm group"
            >
              <ChevronLeft size={14} className="sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="fd font-black text-white text-2xl sm:text-3xl md:text-4xl flex items-center gap-3">
                  <Wallet size={28} className="sm:w-8 sm:h-8" />
                  My Wallet
                </h1>
                <p className="text-gray-400 fs text-xs sm:text-sm mt-1">
                  Manage your wallet balance and transactions
                </p>
              </div>
              <button
                onClick={fetchWalletData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors fs text-xs sm:text-sm"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 relative z-10">

          {/* Balance Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 fs">Available Balance</p>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 fd">
                    {balanceVisibleForUserWallet
                      ? formatCurrency(wallet?.balance || 0)
                      : "••••••"}
                  </h2>

                  <button
                    onClick={toggleBalanceVisibility}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {balanceVisibleForUserWallet ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
                {wallet?.isActive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2">
                    <CheckCircle size={10} /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-2">
                    <XCircle size={10} /> Inactive
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {user && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs text-gray-500 fs">ID:</span>
                    <span className="text-xs font-medium text-gray-700 fs">
                      {user.id.slice(0, 8)}...{user.id.slice(-4)}
                    </span>
                    <button
                      onClick={copyWalletId}
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copied ? (
                        <CheckCircle size={12} className="text-green-600" />
                      ) : (
                        <Copy size={12} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 fs">Secured Wallet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard
              icon={TrendingUp}
              label="Total Credits"
              value={formatCurrency(summary?.totalCredits || 0)}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={TrendingDown}
              label="Total Debits"
              value={formatCurrency(summary?.totalDebits || 0)}
              color="text-red-600"
              bgColor="bg-red-50"
            />
            <StatCard
              icon={RefreshCw}
              label="Refunds"
              value={summary?.typeBreakdown?.refund || 0}
              subValue="Transactions"
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={History}
              label="Total Transactions"
              value={summary?.totalTransactions || 0}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
          </div>

          {/* Today & Monthly Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800 fs">Today's Activity</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 fs">Credits</p>
                  <p className="text-sm font-bold text-green-600">+₹{stats?.today?.credits || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 fs">Debits</p>
                  <p className="text-sm font-bold text-red-600">-₹{stats?.today?.debits || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 fs">Net</p>
                  <p className={`text-sm font-bold ${(stats?.today?.net || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{stats?.today?.net || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-800 fs">This Month</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 fs">Credits</p>
                  <p className="text-sm font-bold text-green-600">+₹{stats?.thisMonth?.credits || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 fs">Debits</p>
                  <p className="text-sm font-bold text-red-600">-₹{stats?.thisMonth?.debits || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 fs">Net</p>
                  <p className={`text-sm font-bold ${(stats?.thisMonth?.net || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{stats?.thisMonth?.net || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 fd">Transaction History</h3>
                  <p className="text-xs text-gray-500 fs">
                    {transactions.length} transactions found
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 fs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Credit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Debit</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Refund</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Cashback</span>
                  </div>
                </div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Wallet size={36} className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 fd mb-2">No transactions yet</h3>
                <p className="text-gray-500 fs text-xs sm:text-sm">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <TransactionCard key={transaction._id} transaction={transaction} />
                ))}
              </div>
            )}

            {/* Pagination Info */}
            {transactions.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 fs">
                  <span>
                    Showing {transactions.length} of {walletData?.data?.transactions?.pagination?.total || 0} transactions
                  </span>
                  {walletData?.data?.transactions?.pagination && (
                    <div className="flex items-center gap-2">
                      <span>
                        Page {walletData.data.transactions.pagination.page} of {walletData.data.transactions.pagination.pages}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-6 sm:mt-8 text-center text-[10px] text-gray-400 fs">
            <p>Wallet transactions are secured and encrypted. All amounts are in Indian Rupees (₹).</p>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slideInRight">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${toast.type === "success" ? "bg-black text-white" : "bg-red-500 text-white"
              }`}>
              {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-medium">{toast.message}</p>
              <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
                <XCircle size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}