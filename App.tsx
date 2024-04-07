import { ActivityIndicator, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system'
import { Asset } from 'expo-asset'
import { Suspense, useEffect, useState } from 'react';
import { SQLiteProvider } from 'expo-sqlite/next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types'

// Screen
import Home from './screens/Home';
import Stats from './screens/Stats';

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Load the local database
const loadDB = async() =>{
    const dbName = "budgetDB.db";
    const dbAsset = require("./assets/budgetDB.db");
    const dbUri = Asset.fromModule(dbAsset).uri;
    const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    if (!fileInfo.exists) {
        await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}SQLite`,
        {intermediates: true}
    );

        await FileSystem.downloadAsync(dbUri, dbFilePath);
    }
}

export default function App() {
    const [dbLoaded, setDbLoaded] = useState<boolean>(false)

    useEffect (() => {
        loadDB()
        .then(() => setDbLoaded(true))
        .catch((e) => console.error(e));
    }, []);

    if (!dbLoaded) return(
        <View style={{flex:1}}>
            <ActivityIndicator size={"large"} />
            <Text>Loading ...</Text>
        </View>
        )

    return (
        <NavigationContainer>
            <Suspense
                fallback={
                <View style={{flex:1}}>
                    <ActivityIndicator size={"large"} />
                    <Text>Loading ...</Text>
                </View>
                }
            >
                {/* SQLiteProvider allows children components to have access to the databse */}
                <SQLiteProvider
                useSuspense={true}
                databaseName="budgetDB.db"
                >
                    <RootStack.Navigator initialRouteName='Home'>
                        <RootStack.Screen
                            name='Home'
                            component={Home}
                            options={{
                                headerTitle : "BudgetWatcher",
                                headerLargeTitle: true,
                            }}
                        />
                        <RootStack.Screen
                            name="Stats"
                            component={Stats}
                        />
                    </RootStack.Navigator>
                </SQLiteProvider>
            </Suspense>
        </NavigationContainer>
    );
}
