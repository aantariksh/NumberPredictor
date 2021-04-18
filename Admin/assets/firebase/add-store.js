var secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");

//updates confirmation page based on user inputs.
function confirmpage() {
    document.getElementById("fn").innerHTML = document.getElementById('firstNameLabel').value + " " + document.getElementById('lastNameLabel').value;
    document.getElementById("email").innerHTML = document.getElementById('emailLabel').value;
    document.getElementById("phone").innerHTML = document.getElementById('phoneLabel').value;
    document.getElementById("sn").innerHTML = document.getElementById('storeLabel').value;
    document.getElementById("ns").innerHTML = document.getElementById('screenLabel').value;
    document.getElementById("cn").innerHTML = document.getElementById('companyLabel').value;
    document.getElementById("city").innerHTML = document.getElementById('cityLabel').value;
    document.getElementById("state").innerHTML = document.getElementById('stateLabel').value;
    document.getElementById("addr1").innerHTML = document.getElementById('addressLine1Label').value;
    document.getElementById("addr2").innerHTML = document.getElementById('addressLine2Label').value;
    document.getElementById("zc").innerHTML = document.getElementById('zipCodeLabel').value;
    document.getElementById("at").innerHTML = $("input[type='radio'][name='userAccountTypeRadio']:checked").val();
}

//Signup using secondary authentication. 
//Signup using email and password.
function signUp() {
    var email = document.getElementById('emailLabel').value;
    var password = document.getElementById('passwordLabel').value;

    secondaryApp.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
        var user = userCredential.user;
        var UID = user.uid;
        console.log(UID)
        //check whether store owner or agent account is created
        if ($("input[type='radio'][name='userAccountTypeRadio']:checked").val() === 'StoreOwner') {
            //Adding branch details of new store in database
            var updates = {
                details: {
                    ownerName: document.getElementById('firstNameLabel').value + " " + document.getElementById('lastNameLabel').value,
                    storeName: document.getElementById('storeLabel').value,
                    companyName: document.getElementById('companyLabel').value,
                    state: document.getElementById('stateLabel').value,
                    city: document.getElementById('cityLabel').value,
                    zipcode: document.getElementById('zipCodeLabel').value,
                    phone: document.getElementById('phoneLabel').value,
                    email: document.getElementById('emailLabel').value,
                    address: document.getElementById('addressLine1Label').value + " " + document.getElementById('addressLine2Label').value
                },
                screens: {},
                payment: {
                    totalCommission: 0,
                    totalSales: 0,
                    weeks: {start: getWeekNumber(new Date(getFormattedDate(new Date())))}
                }
            };

            for (let i=0; i<document.getElementById('screenLabel').value; i++) {
                updates.screens[i] = {lockStatus: 1, loggedinStatus: 0}
            }
            console.log(updates)
            firebase.database().ref(`Teqmo/Stores/${UID}`).set(updates);
            $('#successMessageContent').show();
        } else {
            // TODO: Update for Agents
            // var newPostKey = firebase.database().ref().child('Teqmo/' + 'Agents/').push().key;
            // var updates = {};
            // updates['Teqmo/' + 'Agents/' + user.uid] = 'Hello'; 
            // return firebase.database().ref().update(updates);
        }
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        swal(errorMessage)
        $('#failureMessageContent').show();
    });
}


//Temperory function to check password length and show an alert.
function checkpass()
{
    var password =  document.getElementById('passwordLabel').value;
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

//function to take input of number of screens only if the account created is of storeowner
function screenDiv() {
    if ($("input[type='radio'][name='userAccountTypeRadio']:checked").val() ==="StoreOwner") {
        $("#screens").show();
        $("#ns").show();
        $("#nsdt").show();
    } else {
        $("#screens").hide();
        $("#ns").hide();
        $("#nsdt").hide();
    }
}

//function to take input of store name only if the account created is of storeowner
function storeNameInput() {
    if ($("input[type='radio'][name='userAccountTypeRadio']:checked").val() ==="StoreOwner") {
        $("#strName").show();
        $("#sn").show();
        $("#sndt").show();
    } else {
        $("#strName").hide();
        $("#sn").hide();
        $("#sndt").hide();
    }
}
