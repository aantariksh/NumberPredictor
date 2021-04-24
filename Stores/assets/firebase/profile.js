firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
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
    document.getElementById("joinDate").innerHTML = creationTime.substr(0,16)

    document.getElementById("name").value = data.ownerName ? data.ownerName : 'No Name'
    document.getElementById("email").value = email
    document.getElementById("phone").value = data.phone

    document.getElementById("storeName").value = data.storeName ? data.storeName : 'No Store Name'
    document.getElementById("companyName").value = data.companyName ? data.companyName : 'No Company Name'
    
    document.getElementById("address").value = data.address
    document.getElementById("cityState").value = data.city + ", " + data.state
    document.getElementById("zipCode").value = data.zipCode
  });
}
