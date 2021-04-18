firebase.auth().onAuthStateChanged((user) => {
    if(user){
        updateBasicInfo()
    }
})

var secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");

//updates confirmation page based on user inputs.
function confirmpage() {
    // First Page
    document.getElementById("fullName2").innerHTML = document.getElementById('fullName').value;
    document.getElementById("email2").innerHTML = document.getElementById('email').value;
    document.getElementById("phone2").innerHTML = document.getElementById('phone').value;
    document.getElementById("sn").innerHTML = document.getElementById('storeName').value;
    document.getElementById("cn").innerHTML = document.getElementById('companyName').value;

    // Second Page
    document.getElementById("ns").innerHTML = document.getElementById('screenLabel').value;
    document.getElementById("city2").innerHTML = document.getElementById('cityLabel').value;
    document.getElementById("state2").innerHTML = document.getElementById('stateLabel').value;
    document.getElementById("addr1").innerHTML = document.getElementById('addressLine1Label').value;
    document.getElementById("addr2").innerHTML = document.getElementById('addressLine2Label').value;
    document.getElementById("zc").innerHTML = document.getElementById('zipCodeLabel').value;
}

//Signup using secondary authentication. 
//Signup using email and password.
function signUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    secondaryApp.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        var user = userCredential.user;
        var UID = user.uid;

        user.sendEmailVerification().then(function(){
            console.log("Verification Email sent to user");
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode, errorMessage);
        });
        
        var updates = {
            details: {
                ownerName: document.getElementById('fullName').value,
                storeName: document.getElementById('storeName').value,
                companyName: document.getElementById('companyName').value,
                state: document.getElementById('stateLabel').value,
                city: document.getElementById('cityLabel').value,
                zipcode: document.getElementById('zipCodeLabel').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                address: document.getElementById('addressLine1Label').value + " " + document.getElementById('addressLine2Label').value
            },
            screens: {},
            payment: {
                totalCommission: 0,
                totalSales: 0,
                weeks: {start: getWeekNumber(new Date())}
            }
        };

        for (let i=0; i<document.getElementById('screenLabel').value; i++) {
            updates.screens[i] = {lockStatus: 1, loggedinStatus: 0}
        }
        // console.log(updates)
        firebase.database().ref(`Teqmo/Stores/${UID}`).set(updates);
        $('#successMessageContent').show();
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        swal(errorMessage)
        $('#failureMessageContent').show();
    });
}

//To check password length and show an alert.
function checkpass()
{
    var password =  document.getElementById('password').value;
    var confirmPassword =  document.getElementById('confirmPassword').value;
    if (password.length<8) {
        alert("Password length should be minimum 8 characters")
        location.reload();
    }
    if (password != confirmPassword) {
        alert("Passwords don't match, please try again!")
        location.reload();
    }
}
