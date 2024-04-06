// Define types for Categories and Transactions

export interface Category {
    id: number;
    name: string;
    type: 'Expense' | 'Income';
}

export interface Transaction {
    id: number;
    category_id: number;
    amount: number;
    date: number;
    description: string | null;
    type: 'Expense' | 'Income';
}

export interface TransactionsByMonth{
    totalExpenses: number;
    totalIncome: number;
}