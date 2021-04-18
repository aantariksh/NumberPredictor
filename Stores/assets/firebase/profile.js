firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    var userId = user.uid;
    var email = user.email;
    readUserData(userId, email);
  }
});

function readUserData(uid, email) {
  var ref = firebase.database().ref("Teqmo/" + "Stores/" + uid + "/details");
  ref.on("value", (snapshot) => {
    const data = snapshot.val();
    // console.log(data.Phone)
    document.getElementById("name").innerHTML += " " + data.ownerName ? data.ownerName : 'No Name'
    document.getElementById("headerName").innerHTML += data.ownerName ? data.ownerName : 'No Name'
    document.getElementById("email").innerHTML += " " + email
    document.getElementById("storeHeader").innerHTML = data.storeName ? data.storeName : 'No Store Name'
    document.getElementById("store").innerHTML +=" " +  data.storeName ? data.storeName : 'No Store Name'
    document.getElementById("company").innerHTML += " " + data.companyName ? data.companyName : 'No Company Name'
    document.getElementById("contact").innerHTML +=" " +  data.phone
    document.getElementById("address").innerHTML +=" " +  data.address
    document.getElementById("zipcode").innerHTML += " " + data.zipCode
    document.getElementById("cityState").innerHTML +=" " +  data.city + ", " + data.state;
  });
}
