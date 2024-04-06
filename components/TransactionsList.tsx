import { View, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { Category, Transaction } from '../types'
import TransactionsListItem from './TransactionsListItem'

interface TransactionsListType{
    transactions : Transaction[],
    categories : Category[],
    // setTransactions : Dispatch<SetStateAction<Transaction[]>>,
    deleteTransaction: (id:number) => Promise<void>,
}

const TransactionsList:React.FC<TransactionsListType> = ({
    transactions, categories, deleteTransaction,
}) => {
    const handleLongPress = (transactionId: number) => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => deleteTransaction(transactionId), // Call onDelete function when Delete is pressed
                    style: 'destructive',
                },
            ]
        );
    };
    return (
        <View style={{ gap: 16}}>
            {transactions.map((transaction) => {
                const categCurrentItem = categories.find(
                    (category) => category.id === transaction.category_id
                )
                return(
                    <TouchableOpacity
                        key={transaction.id}
                        activeOpacity={0.7}
                        // onLongPress={()=>deleteTransaction(transaction.id)}
                        onLongPress={()=>handleLongPress(transaction.id)}
                    >
                        <TransactionsListItem transaction={transaction} categoryInfo={categCurrentItem}/>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default TransactionsList