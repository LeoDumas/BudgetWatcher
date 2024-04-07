import React from 'react'
import { Button, View } from 'react-native'
import { useNavigation, NavigationProp } from '@react-navigation/native'

type Props = {}

const NavBar = (props: Props) => {
    const navigation = useNavigation();
    return (
        <View>
            <Button
                title='Stats'
                onPress={() => navigation.navigate('Stats')}
            />
        </View>
    )
}

export default NavBar