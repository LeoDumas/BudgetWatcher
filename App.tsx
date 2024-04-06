import { ActivityIndicator, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system'
import { Asset } from 'expo-asset'
import { Suspense, useEffect, useState } from 'react';
import { SQLiteProvider } from 'expo-sqlite/next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from './screens/Home';

const Stack = createNativeStackNavigator();

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
          <Stack.Navigator>
            <Stack.Screen
              name='Home'
              component={Home}
              options={{
                headerTitle : "BudgetWatcher",
                headerLargeTitle: true,
              }}
            />
          </Stack.Navigator>
        </SQLiteProvider>
      </Suspense>
    </NavigationContainer>
  );
}