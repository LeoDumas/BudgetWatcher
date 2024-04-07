import { Text, View, StyleSheet } from 'react-native'
import React from 'react'
import { Category, Transaction } from '../types'
import Card from './ui/Card';
import { AntDesign } from "@expo/vector-icons"
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import { CategoriesColors, CategoriesEmojies} from '../constants'

interface TransactionsListItemType{
    transaction : Transaction;
    categoryInfo : Category | undefined;
}

const TransactionsListItem:React.FC<TransactionsListItemType> = (
    {transaction, categoryInfo}
) => {
    // Conditionnal rendering dpending if it's an expense or a income
    const iconName = transaction.type === "Expense" ? "minuscircle" : "pluscircle";
    const color = transaction.type === "Expense" ? "red" : "green";
    const categoryColor = CategoriesColors[categoryInfo?.name ?? "Default"];
    const emoji = CategoriesEmojies[categoryInfo?.name ?? "Default"];
    return (
        <Card>
            <Amount amount={transaction.amount} color={color} iconName={iconName} />
            <CategoryItem
                categoryColor={categoryColor}
                categoryInfo={categoryInfo}
                emoji={emoji}
            />
            <TransactionInfo date={transaction.date} description={transaction.description} id={transaction.id}/>
        </Card>
    )
}

// Components for ListItem

function TransactionInfo({id, date, description}:{
    id: number;
    date: number;
    description?: string | null;
}){
    return(
        <View style={{flexGrow: 1, gap: 6, flexShrink: 1}}>
            {/* Conditionnal rendering to avoid strange blank spot */}
            { description ?
                <Text style={{fontSize:16, fontWeight:"bold"}}>{description}</Text>
            : ""}
            <Text style={{fontSize: 12, color: "gray"}}>
                {new Date(date*1000).toDateString()}
                {` - N°${id}`}
            </Text>
        </View>
    );
}

function CategoryItem({categoryColor, categoryInfo, emoji}: {
    categoryColor : string;
    categoryInfo : Category | undefined;
    emoji: string;
}){
    return(
        <View style={[styles.categoryContainer, {backgroundColor : categoryColor + "40"},
        ]}>
            <Text style={styles.categoryText}>
                {emoji} {categoryInfo?.name}
            </Text>
        </View>
    );
}

function Amount({iconName, color, amount}: {
    iconName : "minuscircle" | "pluscircle";
    color: string;
    amount:number;
}) {
    return(
        <View style={styles.row}>
            <AntDesign name={iconName} size={18} color={color} />
            <AutoSizeText
                fontSize={32}
                mode={ResizeTextMode.max_lines}
                numberOfLines={1}
                style={[styles.amount, {maxWidth: "80%", color: color}]}
            >
                ${amount}
            </AutoSizeText>
        </View>
    );
}

const styles = StyleSheet.create({
    amount:{
        fontSize: 32,
        fontWeight: "800"
    },
    row:{
        flexDirection : "row",
        alignItems:"center",
        gap:6,
    },
    categoryContainer: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical : 6,
        marginVertical: 6,
        alignSelf: "flex-start",
    },
    categoryText: {
        fontSize:12,
    }
})

export default TransactionsListItem