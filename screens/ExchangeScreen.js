import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import MyHeader from '../components/MyHeader';

import db from '../config';
import firebase from 'firebase';

export default class ExchangeScreen extends Component{
    constructor(){
    super();
        this.state={
            emailId: firebase.auth().currentUser.email,
            itemName : '',
            itemStatus: '',
            description : '',
            userDocId: '',
            docId: '',
            exchangeId: '',
            IsExchangeRequestActive: ''
        }
    }

    createUniqueId() {
        return Math.random().toString(36).substring(7);
    }

    addItem = (itemName, description) => {
        var emailId = this.state.emailId
        db.collection("exchange_requests").add({
            "email_Id" : emailId,
            "item_name" : itemName,
            "description" : description,
            "exchange_id": this.createUniqueId(),
            "item_status": "requested",
            "date": firebase.firestore.FieldValue.serverTimestamp()
        })

        this.getAllRequests();

        db.collection('users')
        .where("emailId", "==", emailId)
        .get()
        .then()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                db.collection('users').doc(doc.id).update({
                    IsExchangeRequestActive: true
                })
            })
        })
        
        this.setState({
            itemName : '',
            description : ''
        })

        return Alert.alert(
            'Item ready to exchange',
            '',
            [
                {text: Ok, onPress : () => {
                    this.props.navigation.navigate('HomeScreen')
                }}
            ]
        );
    }

    getIsExchangeRequestActive = async () => {
        db.collection('users')
        .where("emailId", '==', this.state.emailId)
        .onSnapshot( querySnapshot => {
            querySnapshot.forEach( doc => {
                this.setState({
                    IsExchangeRequestActive: doc.data().IsExchangeRequestActive,
                    userDocId: doc.id
                })
            })
        })
    }

    getAllRequests = async () => {
        var exchangeRequest = db.collection('exchange_requests')
        .where("email_Id", "==", this.state.emailId)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                if(doc.data().item_status !== "received"){
                    this.setState({
                        exchangeId: doc.data().exchange_id,
                        itemName: doc.data().item_name,
                        itemStatus: doc.data().item_status,
                        docId: doc.id
                    })
                }
            })
        })
    }

    receivedItem = (itemName) => {
        var userId = this.state.emailId
        var exchangeId = this.state.exchangeId
        db.collection('received_items').add({
            "user_id": userId,
            "item_name": itemName,
            "exchange_id": exchangeId,
            "item_status": "received",

        })
    }

    updateExchangeRequestStatus = () => {
        //updating the book status after receiving the book
        db.collection('exchange_requests').doc(this.state.docId)
            .update({
                item_status: 'recieved'
            })

        //getting the  doc id to update the users doc
        db.collection('users')
        .where('emailId', '==', this.state.emailId)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                //updating the doc
                db.collection('users').doc(doc.id)
                .update({
                    IsExchangeRequestActive: false
                })
            })
        })
    }

    sendNotification = () => {
        db.collection('users').where('emailId', '==', this.state.emailId)
        .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    var firstName = doc.data().first_name
                    var lastName = doc.data().last_name
                    db.collection('all_notifications').where('exchangeId', '==', this.state.exchangeId).get()
                        .then((snapshot) => {
                            snapshot.forEach((doc) => {
                                var donorId = doc.data().donor_id
                                var itemName = doc.data().item_name
                                db.collection('all_notifications').add({
                                    "targeted_user_id": donorId,
                                    "message": firstName + " " + lastName + " received the item " + itemName,
                                    "notification_status": "unread",
                                    "item_name": itemName
                                })
                            })
                        })
                })
            })
    }


    componentDidMount(){
        this.getIsExchangeRequestActive();
        this.getAllRequests();
    }

    render(){
        if(this.state.IsExchangeRequestActive == false){
            return (
                <View style={{ flex: 1 }}>
                    <MyHeader title="Add Item" navigation={this.props.navigation}/>
                    <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <TextInput
                            style={styles.box}
                            placeholder={"Item Name"}
                            onChangeText={(text) => {
                                this.setState({
                                    itemName: text
                                })
                            }}
                            value={this.state.itemName}
                        />
                        <TextInput
                            multiline
                            numberOfLines={4}
                            style={[styles.box, { height: 100 }]}
                            placeholder={"Description"}
                            onChangeText={(text) => {
                                this.setState({
                                    description: text
                                })
                            }}
                            value={this.state.description}
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => { this.addItem(this.state.itemName, this.state.description) }}
                        >
                            <Text style={styles.buttonText}> Add Item </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            )
        }
        else{
            return(
                //Status Screen
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={styles.statusText}>
                            <Text> Item Name =</Text>
                            <Text> {this.state.itemName} </Text>
                        </View>
                        <View style={styles.statusText}>
                            <Text>
                                Item Status
                            </Text>
                            <Text>
                                {this.state.itemStatus}
                            </Text>
                        </View>
                        <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            this.sendNotification();
                            this.updateExchangeRequestStatus();
                            this.receivedItem(this.state.itemName);
                        }}
                        >
                        <Text> I received the Item </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    box: {
        width: "75%",
        height: 35,
        alignSelf: 'center',
        borderColor: '#ffab91',
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 20,
        padding: 10
    },
    button: {
        width: "75%",
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
        backgroundColor: "#ff5722",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 16,
    },
    buttonText: {
        color: '#ffff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    statusButton: {
        borderWidth: 1, 
        borderColor: 'orange', 
        backgroundColor: "orange", 
        width: 300, 
        alignSelf: 'center', 
        alignItems: 'center', 
        height: 30, 
        marginTop: 30
    },
    statusText: {
        borderColor: "orange", 
        borderWidth: 2, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 10, 
        margin: 10
    }
})