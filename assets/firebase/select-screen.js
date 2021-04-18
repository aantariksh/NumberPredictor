firebase.auth().onAuthStateChanged((user) => {
    if(user) {
        loadScreens()
    }
}); 

function loadScreens(){
    const sID = localStorage.getItem('screenID')
    if (sID) {
        window.location.href="./video-loop.html"
    }

    const UID = firebase.auth().currentUser.uid;
    firebase.database().ref(`Teqmo/Stores/${UID}/screens`).on('value', (snapshot) => {
        if(snapshot.exists()){
            document.getElementById('mainCard').innerHTML = ''
            const data = snapshot.val()
            jQuery.each(data, function(screenID, settings) {
                if (settings) {
                    console.log(screenID, settings)
                    var isDisabled = settings.loggedinStatus ? 'disabled' : ''
                    var div = `<div class="btn btn-primary btn-lg btn-block mb-3 ${isDisabled}" id="${screenID}" onclick="setScreenID(this.id)">
                        Screen ${screenID}</div>`
                    document.getElementById('mainCard').innerHTML += div
                }
            });
        }
    });
}

function setScreenID(id){
    const UID = firebase.auth().currentUser.uid;
    localStorage.setItem('screenID', id)
    firebase.database().ref(`Teqmo/Stores/${UID}/screens/${id}`).update({
        'loggedinStatus': 1
    });
    window.location.href="./video-loop.html"
}

function play(){
    var id = localStorage.getItem('screenID');
    const UID = firebase.auth().currentUser.uid;

    if(id){
        firebase.database().ref(`Teqmo/Stores/${UID}/screens/${id}/lockStatus`).once('value',(snapshot)=>{
            var status = snapshot.val()
            if(status){
                document.getElementById('status').innerHTML = 'Please pay to play!'
            } else{
                console.log('ok')
                document.getElementById('stop').style.display = "block"
                document.getElementById('status').innerHTML = 'You can play!'
            }
        })
    }
}

function stop(){
    const UID = firebase.auth().currentUser.uid;
    firebase.database().ref(`Teqmo/Stores/${UID}/screens/${id}`).update({
        'lockStatus': 1
    });
    document.getElementById('stop').style.display = "none"
    document.getElementById('status').innerHTML = 'Please pay to play!'
}
