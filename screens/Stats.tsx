import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite/next';
import { PieChart } from '../components/ui/PieChart';
import { Category, Transaction } from '../types';
import { CategoriesColors } from '../constants';

export default function Stats() {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [transactionsByMonth, setTransactionsByMonth] = React.useState<{
        totalExpenses: number;
        totalIncome: number;
    }>({
        totalExpenses: 0,
        totalIncome: 0,
    });

    const db = useSQLiteContext();

    // Make sure that all the data are updated
    React.useEffect(() => {
        db.withTransactionAsync(async () => {
            await getData();
        });
    }, [db]);

    // Get all transaction in decreasing order from new to old transaction (based on transaction's date)
    async function getData() {
        const result = await db.getAllAsync<Transaction>(
            `SELECT * FROM Transactions ORDER BY date DESC;`
        );
        setTransactions(result);

        const categoriesResult = await db.getAllAsync<Category>(
            `SELECT * FROM Categories;`
        );
        setCategories(categoriesResult);

        const now = new Date();
        // Set to the first day of the current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Get the first day of the next month, then subtract one millisecond to get the end of the current month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

        // Convert to Unix timestamps (seconds)
        const startOfMonthTimestamp = Math.floor(startOfMonth.getTime() / 1000);
        const endOfMonthTimestamp = Math.floor(endOfMonth.getTime() / 1000);

        const transactionsByMonth = await db.getAllAsync<{
            totalExpenses: number;
            totalIncome: number;
        }>(
            `
            SELECT
                COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
                COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
            FROM Transactions
            WHERE date >= ? AND date <= ?;
            `,
            [startOfMonthTimestamp, endOfMonthTimestamp]
        );
        setTransactionsByMonth(transactionsByMonth[0]);
    }

    const expenseData: { name: string; value: number; color: string }[] = categories.map(category => {
        const categoryTransactions = transactions.filter(transaction => transaction.category_id === category.id && transaction.type === "Expense");
        return {
            name: category.name,
            value: categoryTransactions.length,
            color: CategoriesColors[category.name] || '#000000',
        };
    });

    const incomeData: { name: string; value: number; color: string }[] = categories.map(category => {
        const categoryTransactions = transactions.filter(transaction => transaction.category_id === category.id && transaction.type === "Income");
        return {
            name: category.name,
            value: categoryTransactions.length,
            color: CategoriesColors[category.name] || '#000000',
        };
    });

    // Filter out categories with zero presence in the pie chart data
    const usedExpenseCategories = expenseData.filter(category => category.value > 0);
    const usedIncomeCategories = incomeData.filter(category => category.value > 0);

    return (
        <ScrollView horizontal>
            <View style={styles.container}>
                <Text style={styles.title}>Expenses</Text>
                <PieChart width={400} height={400} data={expenseData} />
                <View style={[styles.legend, styles.legendContainer]}>
                    {usedExpenseCategories.map((category, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                            <Text style={styles.legendText}>{category.name}: {category.value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.container}>
                <Text style={styles.title}>Income</Text>
                <PieChart width={400} height={400} data={incomeData} />
                <View style={[styles.legend, styles.legendContainer]}>
                    {usedIncomeCategories.map((category, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                            <Text style={styles.legendText}>{category.name}: {category.value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
    },
    legendContainer: {
        width: 200, // Adjust the width as needed
    },
    legend: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 5,
    },
    legendColor: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 5,
    },
    legendText: {
        fontSize: 16,
    },
});
