import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import { AppStackNavigator } from './AppStackNavigator';
import ExchangeScreen from '../screens/ExchangeScreen';

export const AppTabNavigator = createBottomTabNavigator({
    HomeScreen: {
        screen: AppStackNavigator,
        navigationOptions: {
            tabBarIcon: <Image source={require("../assets/home-icon.png")} style={{ width: 20, height: 20 }} />,
            tabBarLabel: "HomeScreen",
        }
    },
    BookRequest: {
        screen: ExchangeScreen,
        navigationOptions: {
            tabBarIcon: <Image source={require("../assets/ads-icon.png")} style={{ width: 20, height: 20, }} />,
            tabBarLabel: "Exchange",
        }
    }
});