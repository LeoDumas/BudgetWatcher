import { View, Text, TouchableOpacity } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
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
                        onLongPress={()=>deleteTransaction(transaction.id)}
                    >
                        <TransactionsListItem transaction={transaction} categoryInfo={categCurrentItem}/>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default TransactionsList