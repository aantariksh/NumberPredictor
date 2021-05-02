firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    updateBasicInfo();
    const userId = user.uid;
    const email = user.email;
    const creationTime =user.metadata.creationTime;
    readUserData(userId, email, creationTime);
  }
});

function readUserData(uid, email, creationTime) {
  var ref = firebase.database().ref("Teqmo/" + "Stores/" + uid + "/details");
  ref.on("value", (snapshot) => {
    const data = snapshot.val();
    // console.log(data.Phone)
    document.getElementById("headerName").innerHTML += data.ownerName ? data.ownerName : 'No Name'
    document.getElementById("headerStoreName").innerHTML = data.storeName ? data.storeName : 'No Store Name'
    document.getElementById("headerState").innerHTML = data.state ? data.state : ''
    document.getElementById("headerCity").innerHTML = data.city ? data.city : 'No City Name'
    document.getElementById("joinDate").innerHTML = 'Joined: ' + creationTime.substr(0,16)

    document.getElementById("name").value = data.ownerName ? data.ownerName : 'No Name'
    document.getElementById("email").value = email
    document.getElementById("phone").value = data.phone ? data.phone : 'No phone'

    document.getElementById("storeName").value = data.storeName ? data.storeName : 'No Store Name'
    document.getElementById("companyName").value = data.companyName ? data.companyName : 'No Company Name'
    
    document.getElementById("address").value = data.address ? data.address : 'No address'
    document.getElementById("city").value = data.city ? data.city : 'No city'
    document.getElementById("state").value = data.state ? data.state : 'No state'
    document.getElementById("zipCode").value = data.zipCode ? data.zipCode : 'No zipcode'
    
    //Button will be enabled, once all the data is loaded
    document.getElementById("save-changes-btn").disabled = false;

    });
}

function updateProfileDetails(){
    let name = document.getElementById("name").value
    let phone = document.getElementById("phone").value
    let storeName = document.getElementById("storeName").value
    let companyName = document.getElementById("companyName").value
    let address = document.getElementById("address").value
    let city = document.getElementById("city").value
    let state = document.getElementById("state").value
    let zipCode = document.getElementById("zipCode").value
    console.log(name,phone,storeName,companyName,address,city,state,zipCode);
    
    let user = firebase.auth().currentUser;
    const userId = user.uid;
    firebase.database().ref(`Teqmo/Stores/${userId}/details`).update({
        "ownerName": name,
        "phone": phone,
        "storeName": storeName,
        "companyName": companyName,
        "address": address,
        "city": city,
        "state": state,
        "zipCode": zipCode
    }, (error) => {
        if (error) {
            showFailError('Something went wrong, please try again later');
        } 
        else {
            Swal.fire({
                    icon: 'success',
                    text: `Details saved successfully!`,
                    allowOutsideClick: false
                })
                .then(function () {
                    location.reload();
                });
        }
    });
}

function checkPasswordValidity(password) {
    errors = [];
    if (password.length < 8) {
        errors.push("Your password must be at least 8 characters");
    }
    if (password.search(/[a-z]/i) < 0) {
        errors.push("Your password must contain at least one letter.");
    }
    if (password.search(/[0-9]/) < 0) {
        errors.push("Your password must contain at least one digit.");
    }
    if (errors.length > 0) {
        showFailError(errors.join("\n"));
        return false;
    }
    return true;
}

function updatePassword() {
    let currentPassword = document.getElementById('currentPassword').value;
    let newPassword = document.getElementById('newPassword').value;
    let confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showFailError('Please, Enter all the fields');
    } 
    else if(currentPassword == newPassword){
        showFailError('Current password matches with new password');
    }
    else if (newPassword != confirmNewPassword) {
        showFailError('Please, Enter correct confirmation password');
    } 
    else if (checkPasswordValidity(newPassword)) {
        let user = firebase.auth().currentUser;
        let credentials = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        
        user.reauthenticateWithCredential(credentials).then(function () {
            console.log('User Reauthenticated');
            
            user.updatePassword(newPassword).then(function () {
                Swal.fire({
                    icon: 'success',
                    text: `Password changed successfully!`,
                    allowOutsideClick: false
                })
                .then(function(){ 
                    location.reload();
                    }
                );
            }).catch(function (error) {
                showFailError(error.message);
            });

        }).catch(function (error) {
            showFailError(error.message);
        });
    }
}

function showFailError(msg) {
    let err = msg ? msg : 'Some error occured, Please try again later!'
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `${err}`,
        allowOutsideClick: false
    })
    .then(function(){ 
        location.reload();
        }
    );
}
