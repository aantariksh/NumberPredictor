firebase.auth().onAuthStateChanged((user) => {
    if(user) {
        const UID = localStorage.getItem('storeUID');
        if (!UID) {
            localStorage.setItem('storeUID', user.uid);
        }
        loadScreens()
    }
}); 

// Load and display the status of Store Owner's screen
// Allow selecting only those screens which aren't already in use!
function loadScreens(){
    // Check if screen ID already set
    const screenID = localStorage.getItem('screenID')
    if (screenID) {
        window.location.href="./video-loop.html"
    }
    const UID = localStorage.getItem('storeUID');

    firebase.database().ref(`Teqmo/Stores/${UID}/screens`).on('value', (snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('mainCard').innerHTML = ''

            const data = snapshot.val()
            jQuery.each(data, function(screenID, settings) {
                if (settings) {
                    console.log(screenID, settings)
                    var isDisabled = settings.loggedinStatus ? 'disabled' : ''
                    var newButton = `<div class="btn btn-primary btn-lg btn-block mb-3 ${isDisabled}" id="${screenID}" onclick="setScreenID(this.id)">
                        Screen ${screenID}</div>`
                    document.getElementById('mainCard').innerHTML += newButton
                }
            });
        }
    });
}

// Set screen ID on LOCAL STORAGE
function setScreenID(id) {
    const UID = localStorage.getItem('storeUID');
    localStorage.setItem('screenID', id)
    firebase.database().ref(`Teqmo/Stores/${UID}/screens/${id}`).update({
        'loggedinStatus': 1
    });
    window.location.href="./video-loop.html"
}
