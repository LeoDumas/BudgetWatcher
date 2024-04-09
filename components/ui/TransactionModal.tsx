import * as React from 'react';
import { Button, Text, TextInput, View, Modal, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Card from "./Card";
import { useSQLiteContext } from "expo-sqlite/next";
import { Category, Transaction } from "../../types";

interface TransactionModalProps {
    isVisible: boolean;
    setIsTransactionModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    insertTransaction(transaction: Transaction): Promise<void>;
    categories: Category[];
}

export default function TransactionModal({ isVisible, setIsTransactionModalVisible, insertTransaction, categories: propCategories }: TransactionModalProps) {
    const [isAddingTransaction, setIsAddingTransaction] = React.useState<boolean>(false);
    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [typeSelected, setTypeSelected] = React.useState<string>("");
    const [amount, setAmount] = React.useState<string>("");
    const [description, setDescription] = React.useState<string>("");
    const [category, setCategory] = React.useState<string>("Expense");
    const [categoryId, setCategoryId] = React.useState<number>(1);
    const db = useSQLiteContext();
    const [modalCategories, setModalCategories] = React.useState<Category[]>([]);

    React.useEffect(() => {
        setModalCategories(propCategories);
    }, [propCategories]);

    async function handleSave() {
        console.log({
        amount: Number(amount),
        description,
        category_id: categoryId,
        date: new Date().getTime() / 1000,
        type: category as "Expense" | "Income",
        });

        // @ts-ignore
        await insertTransaction({
        amount: Number(amount),
        description,
        category_id: categoryId,
        date: new Date().getTime() / 1000,
        type: category as "Expense" | "Income",
        });
        setAmount("");
        setDescription("");
        setCategory("Expense");
        setCategoryId(1);
        setCurrentTab(0);
        setIsAddingTransaction(false);
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isAddingTransaction}
            onRequestClose={() => { setIsAddingTransaction(false) }}
        >
            <Card>
                <TextInput
                    placeholder="$Amount"
                    style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
                    keyboardType="numeric"
                    onChangeText={(text) => {
                        // Remove any non-numeric characters before setting the state
                        const numericValue = text.replace(/[^0-9.]/g, "");
                        setAmount(numericValue);
                    }}
                />

                <TextInput
                    placeholder="Description"
                    style={{ marginBottom: 15 }}
                    onChangeText={setDescription}
                />

                <Text style={{ marginBottom: 6 }}>Select an entry type</Text>

                <SegmentedControl
                    values={["Expense", "Income"]}
                    style={{ marginBottom: 15 }}
                    selectedIndex={0}
                    onChange={(event) => {
                        setCurrentTab(event.nativeEvent.selectedSegmentIndex);
                    }}
                />

                <Picker
                    selectedValue={category}
                    onValueChange={(itemValue: string, itemIndex: number) => { // Specify types for itemValue and itemIndex
                        setCategory(itemValue);
                        setCategoryId(modalCategories[itemIndex].id);
                    }}
                >
                    {modalCategories.map((cat) => (
                        <Picker.Item
                            key={cat.name}
                            label={cat.name}
                            value={cat.name}
                        />
                    ))}
                </Picker>
            </Card>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                <Button
                    title="Cancel"
                    color="red"
                    onPress={() => setIsAddingTransaction(false)}
                />
                <Button title="Save" onPress={handleSave} />
            </View>
        </Modal>
    )
}
