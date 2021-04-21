import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyBosP3sXbsPkjEFzxLKt1b4vRtecsfh-lg",
  authDomain: "barter-system-edde2.firebaseapp.com",
  projectId: "barter-system-edde2",
  storageBucket: "barter-system-edde2.appspot.com",
  messagingSenderId: "262658398655",
  appId: "1:262658398655:web:9eea0dc233788b5268a90a"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

export default firebase.firestore();