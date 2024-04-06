import * as React from "react";
import { ScrollView, StyleSheet, Text, TextStyle } from "react-native";
import { Category, Transaction, TransactionsByMonth } from "../types";
import { useSQLiteContext } from "expo-sqlite/next";
import TransactionList from "../components/TransactionsList";
import Card from "../components/ui/Card";
import AddTransaction from "../components/AddTransaction";

export default function Home() {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [transactionsByMonth, setTransactionsByMonth] =
        React.useState<TransactionsByMonth>({
        totalExpenses: 0,
        totalIncome: 0,
        });

    const db = useSQLiteContext();

    // Make sure that all the data in the app are the same a those in the db
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

        const transactionsByMonth = await db.getAllAsync<TransactionsByMonth>(
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

    // Remove transaction from databse
    async function deleteTransaction(id: number) {
        db.withTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
        await getData();
        });
    }

    // Insert transaction inside the database
    async function insertTransaction(transaction: Transaction) {
        db.withTransactionAsync(async () => {
        await db.runAsync(
            `
            INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (?, ?, ?, ?, ?);
        `,
            [
            transaction.category_id,
            transaction.amount,
            transaction.date,
            transaction.description,
            transaction.type,
            ]
        );
        await getData();
        });
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 15, paddingVertical: 170 }}>
            <AddTransaction insertTransaction={insertTransaction} />
            <TransactionSummary
                totalExpenses={transactionsByMonth.totalExpenses}
                totalIncome={transactionsByMonth.totalIncome}
                transactions={transactions}
            />
            <TransactionList
                categories={categories}
                transactions={transactions}
                deleteTransaction={deleteTransaction}
            />
        </ScrollView>
    );
}

function TransactionSummary({
    totalIncome,
    totalExpenses,
    transactions,
}: TransactionsByMonth & { transactions: Transaction[] }) {
    // Calculate total income, expenses, and savings from all transactions
    const totalIncomeAllTime = transactions.reduce((acc, curr) => {
        return curr.type === 'Income' ? acc + curr.amount : acc;
    }, 0);

    const totalExpensesAllTime = transactions.reduce((acc, curr) => {
        return curr.type === 'Expense' ? acc + curr.amount : acc;
    }, 0);

    const savingsAllTime = totalIncomeAllTime - totalExpensesAllTime;

    // Function to determine the style based on the value (positive or negative)
    const getMoneyTextStyle = (value: number): TextStyle => ({
        fontWeight: "bold",
        color: value < 0 ? "#ff4500" : "#2e8b57", // Red for negative, custom green for positive
    });

    // Helper function to format monetary values
    const formatMoney = (value: number) => {
        const absValue = Math.abs(value).toFixed(2);
        return `${value < 0 ? "-" : ""}$${absValue}`;
    };

    return (
        <ScrollView horizontal>
            <Card style={styles.container}>
                <Text style={styles.periodTitle}>Summary for Current Month</Text>
                <Text style={styles.summaryText}>
                    Income:{" "}
                    <Text style={getMoneyTextStyle(totalIncome)}>
                        {formatMoney(totalIncome)}
                    </Text>
                </Text>
                <Text style={styles.summaryText}>
                    Expenses:{" "}
                    <Text style={getMoneyTextStyle(totalExpenses)}>
                        {formatMoney(totalExpenses)}
                    </Text>
                </Text>
                <Text style={styles.summaryText}>
                    Savings:{" "}
                    <Text style={getMoneyTextStyle(totalIncome - totalExpenses)}>
                        {formatMoney(totalIncome - totalExpenses)}
                    </Text>
                </Text>
            </Card>

            <Card style={styles.container}>
                <Text style={styles.periodTitle}>Summary for All Time</Text>
                <Text style={styles.summaryText}>
                    Income:{" "}
                    <Text style={getMoneyTextStyle(totalIncomeAllTime)}>
                        {formatMoney(totalIncomeAllTime)}
                    </Text>
                </Text>
                <Text style={styles.summaryText}>
                    Expenses:{" "}
                    <Text style={getMoneyTextStyle(totalExpensesAllTime)}>
                        {formatMoney(totalExpensesAllTime)}
                    </Text>
                </Text>
                <Text style={styles.summaryText}>
                    Savings:{" "}
                    <Text style={getMoneyTextStyle(savingsAllTime)}>
                        {formatMoney(savingsAllTime)}
                    </Text>
                </Text>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        paddingBottom: 7,
        marginRight : 15,
    },
    periodTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    summaryText: {
        fontSize: 18,
        color: "#333",
        marginBottom: 10,
    },
});