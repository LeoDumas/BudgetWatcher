import * as React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface AddTransactionProps {
    setIsTransactionModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddTransaction({ setIsTransactionModalVisible }: AddTransactionProps) {
    return (
        <TouchableOpacity
            onPress={() => setIsTransactionModalVisible(true)}
            activeOpacity={0.6}
            style={styles.addButton}
        >
            <MaterialIcons name="add-circle-outline" size={24} color="#007BFF" />
            <Text style={{ fontWeight: "700", color: "#007BFF", marginLeft: 5 }}>New Entry</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    addButton: {
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007BFF20",
        borderRadius: 15,
        marginBottom: 15,
    },
});