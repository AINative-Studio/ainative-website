'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Search, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type CreditTransaction = {
  id: string;
  type: 'purchase' | 'usage' | 'refund' | 'adjustment';
  amount: number;
  balance_after: number;
  created_at: string;
  description?: string;
};

// Mock data for demo mode
const mockTransactions: CreditTransaction[] = [
  {
    id: 'tx_1',
    type: 'purchase',
    amount: 5000,
    balance_after: 10000,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Monthly credit purchase'
  },
  {
    id: 'tx_2',
    type: 'usage',
    amount: -250,
    balance_after: 9750,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'API usage'
  },
  {
    id: 'tx_3',
    type: 'usage',
    amount: -500,
    balance_after: 9250,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    description: 'AI model inference'
  },
  {
    id: 'tx_4',
    type: 'adjustment',
    amount: 100,
    balance_after: 9350,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    description: 'Promotional credit'
  }
];

export default function CreditHistoryClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    const fetchCreditTransactions = async () => {
      try {
        setIsLoading(true);

        // Check for auth token
        const token = typeof window !== 'undefined' ? (
          localStorage.getItem('access_token') ||
          localStorage.getItem('auth_token')
        ) : null;

        if (!token) {
          // Use demo data
          setTransactions(mockTransactions);
          return;
        }

        // In a real implementation, fetch from API here
        // For now, use demo data
        setTransactions(mockTransactions);

      } catch (error) {
        console.error('Error fetching credit transactions:', error);
        setTransactions(mockTransactions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreditTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getTransactionDescription = (transaction: CreditTransaction) => {
    try {
      const amount = Math.abs(transaction.amount);
      const formattedAmount = amount.toLocaleString();

      switch (transaction.type) {
        case 'purchase':
          return `Purchase - ${formattedAmount} credits`;
        case 'usage':
          return `Used ${formattedAmount} credits`;
        case 'refund':
          return `Refund - ${formattedAmount} credits`;
        case 'adjustment':
          return `Adjustment - ${formattedAmount} credits`;
        default:
          return transaction.description || 'Credit transaction';
      }
    } catch {
      return 'Credit transaction';
    }
  };

  const filteredTransactions = (Array.isArray(transactions) ? transactions : [])
    .filter(tx =>
      getTransactionDescription(tx).toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(tx.created_at).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortDirection === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 md:px-6 pt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-[#4B6FED]" />
          <h1 className="text-2xl font-bold text-white">Credit History</h1>
        </div>
        <p className="text-gray-400">
          Your history of add-on credit purchases, auto refills, and awards.
        </p>
      </div>

      <motion.div
        className="rounded-lg border border-gray-800 bg-[#161B22] shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-gray-800 bg-[#1A1F29] flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="bg-[#0D1117] text-white border border-gray-700 rounded-md p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-[#4B6FED]/30 focus:border-[#4B6FED]/70"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 bg-[#0D1117] border border-gray-700 rounded-md px-3 py-2 text-gray-300 hover:bg-[#161B22] transition-colors"
            >
              Sort by date
              <ChevronsUpDown className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1 bg-[#0D1117] border border-gray-700 rounded-md px-3 py-2 text-gray-300 hover:bg-[#161B22] transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredTransactions.length > 0 ? (
              <>
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{getTransactionDescription(tx)}</p>
                      <p className="text-gray-400 text-sm">{formatDate(tx.created_at)}</p>
                    </div>
                    <div className={`text-right ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <p className="font-medium">
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-xs opacity-75">
                        Balance: {tx.balance_after.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions found</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <div className="text-sm text-gray-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded text-sm disabled:opacity-50 text-gray-400 bg-[#1A1F29]">
              Previous
            </button>
            <button className="px-3 py-1 rounded text-sm bg-[#4B6FED] text-white">
              1
            </button>
            <button className="px-3 py-1 rounded text-sm disabled:opacity-50 text-gray-400 bg-[#1A1F29]">
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
