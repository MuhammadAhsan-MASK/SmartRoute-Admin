// Firebase Configuration
// Connected to the same Firebase project as your Flutter locationdemo app
const firebaseConfig = {
    apiKey: "AIzaSyCQWtiNZrZe0ojJUR6exwAulivKPOyyNkU",
    authDomain: "locationapp-ebf35.firebaseapp.com",
    projectId: "locationapp-ebf35",
    storageBucket: "locationapp-ebf35.firebasestorage.app",
    messagingSenderId: "407572452605",
    appId: "1:407572452605:web:467255526bb8d266f49a94",
    databaseURL: "https://locationapp-ebf35-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database(); // Initialized Realtime Database instead of Firestore

// Export services to the global 'window' object 
// so they can be accessed by other script files (users.js, dashboard.js, etc.)
window.auth = auth;
window.database = database;
