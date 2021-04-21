import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { List } from 'react-native-paper';
import MyHeader from '../components/MyHeader';

import firebase from 'firebase';
import db from '../config'

export default class HomeScreen extends Component {
    constructor() {
        super()
        this.state = {
            userId: firebase.auth().currentUser.email,
            allRequests: []
        }
        this.requestRef = null
    }

    getAllRequests = () => {
        this.requestRef = db.collection("exchange_requests")
            .onSnapshot((snapshot) => {
                var allRequests = snapshot.docs.map((doc) => doc.data())
                console.log(allRequests)
                this.setState({ allRequests: allRequests })
            })
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item, i }) => {
        console.log(item.item_name);
        return (
            <List.Item
            key={i}
            title={item.item_name}
            description={item.description}
            right={(props) => 
                <TouchableOpacity style={styles.button}
                onPress={()=>{
                    this.props.navigation.navigate('ReceiverDetails', {
                        "details": item
                    })
                }}
                >
                    <Text style={{ color: '#ffff' }}>View</Text>
                </TouchableOpacity>
            }
            bottomDivider
            />
        )
    }

    componentDidMount() {
        this.getAllRequests()
    }

    componentWillUnmount() {
        this.requestRef();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MyHeader title="Barter App" />
                <View style={{ flex: 1 }}>
                    {
                        this.state.allRequests.length === 0
                            ? (
                                <View style={{ flex: 1, fontSize: 20, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 20 }}>List of all Barter</Text>
                                </View>
                            )
                            : (
                                <FlatList
                                    keyExtractor={this.keyExtractor}
                                    data={this.state.allRequests}
                                    renderItem={this.renderItem}
                                />
                            )
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        width: 100,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#ff5722",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        }
    }
})
