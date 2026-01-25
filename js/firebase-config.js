// Firebase Configuration
// Uses the configuration from js/config.js (not version controlled)
const firebaseConfig = window.API_CONFIG;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database(); // Initialized Realtime Database instead of Firestore

// Export services to the global 'window' object 
// so they can be accessed by other script files (users.js, dashboard.js, etc.)
window.auth = auth;
window.database = database;
