// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBFwJkHQHb4IuU0Xuloba3d9FSZayB1eqw",
    authDomain: "numberpredictor-prd.firebaseapp.com",
    databaseURL: "https://numberpredictor-prd-default-rtdb.firebaseio.com",
    projectId: "numberpredictor-prd",
    storageBucket: "numberpredictor-prd.appspot.com",
    messagingSenderId: "333354525993",
    appId: "1:333354525993:web:b8b713f2e609d9c545c338"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Only Login page is accessible to vistor who're not signed in
firebase.auth().onAuthStateChanged((user) => {
    if (user && window.location.href.includes('login.html')) {
        // Storing UID in local storage
        const UID = firebase.auth().currentUser.uid;
        localStorage.setItem('storeUID', UID);
        window.location.href = './select-screen.html'
    }
    else if (!user && !window.location.href.includes('login.html')) {
        window.location.href = './login.html'
    }

    // Logout Screen if logged out from Admin Screen
    if (user) {
        const screenId = localStorage.getItem('screenID');
        const UID = localStorage.getItem('storeUID');
        firebase.database().ref(`Teqmo/Stores/${UID}/screens/${screenId}/loggedinStatus`).on('value', snapshot => {
            let loggedinStatus = snapshot.val()
            if (!loggedinStatus) {
                logoutScreen()
            }
        })
    }
});  

// Login Function
function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
    })
    .catch((error) => {
        let errorMessage = error.message;
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `${errorMessage}`
        }).then(() => {
            window.location.reload()
        })
    });

    // Update the button description after click
    const button = document.getElementById('loginButton')
    button.disabled = true
    button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
}

// Remove screen Id from local storage and signout user
async function logoutScreen() {
    const screnId = localStorage.getItem('screenID');
    const UID = localStorage.getItem('storeUID');
    if(!UID || !screnId) {return}
    await firebase.database().ref(`Teqmo/Stores/${UID}/screens/${screnId}`).update({
        'lockStatus': 1,
        'loggedinStatus': 0
    });
    localStorage.removeItem('screenID')
    localStorage.removeItem('storeUID');
    logout();
}

// Logout Function
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href="index.html";
    }).catch((error) => {
        let errorMessage = error.message;
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `${errorMessage}`
        })
    });
}
