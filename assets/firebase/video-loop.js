function checkLockStatus() {
    const UID =  sessionStorage.getItem('storeUID');
    const screenID = localStorage.getItem('screenID')
    // console.log(UID, screenID)
    if (!UID || !screenID) { 
        showFailError() 
        return
    }

    firebase.database().ref(`Teqmo/Stores/${UID}/screens/${screenID}/lockStatus`).once('value', (snapshot) => {
        var status = snapshot.val()
        if (status == 0) {
            location.href = './terms.html'
        } else {
            showFailError('Please pay at counter first!')
        }
    })
}

function showFailError(msg) {
    let err = msg ? msg : 'Please try again later!'
    alert(err)
}