import React, { Component } from 'react'
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import {Icon} from 'react-native-elements';
import {List} from 'react-native-paper';
import MyHeader from '../components/MyHeader.js';
import firebase from 'firebase';
import db from '../config.js';

export default class MyBartersScreen extends Component{
    static navigationOptions = {header: null};

    constructor(){
        super();
        this.state={
            userId: firebase.auth().currentUser.email,
            allBarters: [],
            userName: ""
        }
        this.requestRef = null;
    }

    getUserDetails = async (userId) => {
        db.collection("users").where('emailId', '==', userId).get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    console.log(doc.data().first_name);
                    this.setState({
                        userName: doc.data().first_name + " " + doc.data().last_name
                    })
                })
            })
    }

    getAllBarters = async () => { 
        this.requestRef = db.collection("all_Barters")
        .where("donor_id", '==', this.state.userId)
        .onSnapshot((snapshot) => { 
            var allBarters = [] 
            snapshot.docs.map((doc) => { 
                var barters = doc.data() 
                barters["doc_id"] = doc.id 
                allBarters.push(barters) 
            }); 
            this.setState({ 
                allBarters: allBarters, 
            }); 
        }) 
    }

    getNotifications = async () => {
        this.requestRef = db.collection("all_notifications")
            .where("notification_status", "==", "unread")
            .where("targeted_user_id", '==', this.state.userId)
            .onSnapshot((snapshot) => {
                var allNotifications = []
                snapshot.docs.map((doc) => {
                    var notification = doc.data()
                    notification["doc_id"] = doc.id
                    allNotifications.push(notification)
                });
                this.setState({
                    allNotifications: allNotifications
                });
            })
    }

    sendNotification = (itemDetails, requestStatus) => {
        var exchangeId = itemDetails.exchange_id
        var donorId = itemDetails.donor_id
        db.collection("all_notifications")
            .where("exchangeId", "==", exchangeId)
            .where("donor_id", "==", donorId)
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    var message = ""
                    if (requestStatus === "Item Sent") {
                        message = this.state.userName + " sent you the item"
                    } else {
                        message = this.state.userName + " has shown interest in sending the item"
                    }
                    db.collection("all_notifications").doc(doc.id).update({
                        "message": message,
                        "notification_status": "unread",
                        "date": firebase.firestore.FieldValue.serverTimestamp()
                    })
                });
            })
    }

    sendItem = (itemDetails) => {
        if (itemDetails.request_status === "Item Sent") {
            var requestStatus = "Donor Interested"
            db.collection("all_Barters").doc(itemDetails.doc_id).update({
                "request_status": "Donor Interested"
            })
            this.sendNotification(itemDetails, requestStatus)
        }
        else {
            var requestStatus = "Item Sent"
            db.collection("all_Barters").doc(itemDetails.doc_id).update({
                "request_status": "Item Sent"
            })
            this.sendNotification(itemDetails, requestStatus)
        }
    }


    keyExtractor = (item, index) => index.toString();

    renderItem = ({ item, i }) => (
        <List.Item
            key={i}
            title={item.item_name}
            titleStyle={{ color: 'black', fontWeight: 'bold' }}
            subtitle={"Requested By : " + item.requested_by + "\nStatus : " + item.request_status}
            left={(props) =>
                <Icon 
                    name="book" 
                    type="font-awesome" 
                    color='#696969' 
                />
            }
            right={(props) =>
                <TouchableOpacity 
                    style={[
                        styles.button,
                        {
                            backgroundColor: item.request_status === "Item Sent" ? "green" : "#ff5722"
                        }
                    ]}
                    onPress={() => {
                        this.sendItem(item);
                    }}
                >
                    <Text style={{ color: '#ffff' }}>{
                        item.request_status === "Item Sent" ? "Item Sent" : "Send Item"
                    }</Text>
                </TouchableOpacity>
            }
            bottomDivider
        />
    )

    componentDidMount() {
        this.getUserDetails(this.state.userId)
        this.getAllBarters()
    }

    componentWillUnmount() {
        this.requestRef();
    }

    render(){
        return(
            <View style={{ flex: 1 }}>
                <MyHeader navigation={this.props.navigation} title="My Barters" />
                <View style={{ flex: 1 }}>
                    {
                    this.state.allBarters.length === 0
                        ? (
                            <View style={styles.subtitle}>
                                <Text style={{ fontSize: 20 }}>List of all Barters</Text>
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
