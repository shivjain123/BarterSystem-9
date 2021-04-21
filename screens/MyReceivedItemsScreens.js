import React, { Component } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { List } from 'react-native-paper';
import MyHeader from '../components/MyHeader.js'
import firebase from 'firebase';
import db from '../config.js'

export default class MyReceivedItemsScreen extends Component {
    static navigationOptions = { header: null };

    constructor() {
        super()
        this.state = {
            userId: firebase.auth().currentUser.email,
            allBarters: []
        }
        this.requestRef = null
    }


    getAllBarters = () => {
        this.requestRef = db.collection("all_Barters").where("donor_id", '==', this.state.userId)
            .onSnapshot((snapshot) => {
                var allBarters = snapshot.docs.map(document => document.data());
                this.setState({
                    allBarters: allBarters,
                });
            })
    }

    keyExtractor = (item, index) => index.toString()

    renderItem = ({ item, i }) => (
        <List.Item
            key={i}
            title={item.item_name}
            subtitle={"Requested By : " + item.requested_by + "\nStatus : " + item.request_status}
            leftElement={(props) => 
                <Icon 
                    name="book" 
                    type="font-awesome" 
                    color='#696969' 
                />
            }
            titleStyle={{ 
                color: 'black', 
                fontWeight: 'bold' 
            }}
            bottomDivider
        />
    )


    componentDidMount() {
        this.getAllBarters()
    }

    componentWillUnmount() {
        this.requestRef();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MyHeader navigation={this.props.navigation} title="My Received Items" />
                <View style={{ flex: 1 }}>
                    {
                        this.state.allBarters.length === 0
                            ? (
                                <View style={styles.subtitle}>
                                    <Text style={{ fontSize: 20 }}>List of all Received Items</Text>
                                </View>
                            )
                            : (
                                <FlatList
                                    keyExtractor={this.keyExtractor}
                                    data={this.state.allBarters}
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
        },
        elevation: 16
    },
    subtitle: {
        flex: 1,
        fontSize: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }
})