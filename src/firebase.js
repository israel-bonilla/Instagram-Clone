import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBYgvmMMcr-BnJEiT3Dz3N5RJQ1Hq5LukY",
    authDomain: "ig-clone-st1.firebaseapp.com",
    projectId: "ig-clone-st1",
    storageBucket: "ig-clone-st1.appspot.com",
    messagingSenderId: "738497132211",
    appId: "1:738497132211:web:582096b6ee7970b69922c6",
    measurementId: "G-2LQET4FN96"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };