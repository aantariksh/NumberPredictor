// Call data retrieval functions only after firebase is loaded
firebase.auth().onAuthStateChanged((user) => {
    if(user){
        updateChart()
        screens()
        updateBasicInfo()
    }
})

/**
 * To return the count of games played in a week
 * @param {Number} weekNum Number of weeks before the current week
 * Eg. weekNum = 1 means last week and weekNum = 0 means current week
 * @returns {Array} Count per day of week, [Sun, Mon,... , Sat]
 */
async function getCountPerDayOfWeek(weekNum = 0){
    const date = new Date() //Current Date
    const currentWeek = getWeekNumber(date)
    const targetWeek = currentWeek - weekNum

    // const UID = 'OHatm0qKa2Rf3DFnAj1Vq64Fcn62'
    const UID = firebase.auth().currentUser.uid;
    var snapshot = await firebase.database().ref(`Teqmo/Stores/${UID}/payment/weeks/${targetWeek}/counter`).once('value')
    return snapshot.val()
}

/**
 * Fetches count data from firebase for current and last week and updates the graphs
 * Calculates the trend (growth or loss percentage) up till the current day of the week
 */
async function updateChart(){
    // Fetching data for two weeks
    var countThisWeek = await getCountPerDayOfWeek()
    var countLastWeek = await getCountPerDayOfWeek(1)
    
    // Updating the chart
    var updatingChart = $.HSCore.components.HSChartJS.init($('#updatingData'));
    updatingChart.data.datasets[0].data = countLastWeek
    updatingChart.data.datasets[1].data = countThisWeek
    updatingChart.update();

    // Calculating the trend compared to the current day of past week 
    var date = new Date()
    var day = date.getDay()
    var totalThisWeek = 0, totalLastWeek = 0
    for(i=0; i<=day; i++){
        totalThisWeek += countThisWeek[i]
        totalLastWeek += countLastWeek[i]
    }

    const increasePercentage = Math.ceil((totalThisWeek - totalLastWeek)*100/totalLastWeek)

    const countTrend = document.getElementById("countTrend")
    if(increasePercentage >= 0){
        countTrend.classList.add("text-success");
        countTrend.classList.remove("text-danger");
        countTrend.innerHTML = `<i class="tio-trending-up"></i> ${increasePercentage}%`
    } else {
        countTrend.classList.remove("text-success");
        countTrend.classList.add("text-danger");
        countTrend.innerHTML = `<i class="tio-trending-down"></i> ${increasePercentage}%`
    }
}

/**
 * Function to continuoasly monitor the screen status
 * Displays the number of screens along with their live status
 */
function screens(){
    const screenAvailable = 'onclick="unlockScreen(this.id)" class="btn btn-primary btn-pill mx-auto">Unlock Screen</button>'
    const screenBusy = `
    class="btn btn-soft-danger btn-pill" disabled>
        <span class="spinner-grow spinner-grow-sm mr-2" role="status" aria-hidden="true"></span>
        Screen in Use
    </button>`
    const screenDisabled = 'class="btn btn-soft-secondary btn-pill mx-auto" disabled>Screen Disabled</button>'
    const UID = firebase.auth().currentUser.uid;

    firebase.database().ref(`Teqmo/Stores/${UID}/screens`).on('value',(snapshot)=>{
        if(snapshot.exists()){
            document.getElementById('screenContainer').innerHTML = ''
            const data = snapshot.val()

            jQuery.each(data, function(screenID, settings) {
                if (settings) {
                    // console.log(screenID, settings)
                    if (!settings.loggedinStatus) {
                        var activityStatus = screenDisabled
                    } else if(settings.lockUnlock){
                        var activityStatus = screenAvailable
                    } else {
                        var activityStatus = screenBusy
                    }

                    if(settings.loggedinStatus){
                        var logInStatus = '<span class="badge badge-soft-success">Active</span>'
                    } else {
                        var logInStatus = '<span class="badge badge-soft-danger">Inctive</span>'
                    }

                    var card = `
                    <div class="col-sm-6 col-lg-3 mb-3 mb-lg-5">
                        <div class="card card-hover-shadow h-100">
                        <div class="card-body">
                            <h6 class="card-subtitle">Screen ID</h6>
                            <div class="row align-items-center gx-2 mb-1">
                                <div class="col-6">
                                    <span class="card-title h2"> TEQMO${screenID}</span>
                                </div>
                                <div class="col-6 text-center">
                                    <button type="button" id="${screenID}" ${activityStatus}
                                </div>
                            </div>
                            <h4>
                                <span class="text-body mr-1">Status</span>
                                ${logInStatus}
                            </h4>
                        </div>
                        </div>
                    </div>`

                    document.getElementById('screenContainer').innerHTML += card
                }
            });
        }
    });
}

/**
 * Unlocks the screen with the screen ID
 * Increments the count value
 * @param {Number} screenID 
 */
function unlockScreen(screenID){
    console.log(screenID);
    const UID = firebase.auth().currentUser.uid;
    firebase.database().ref(`Teqmo/Stores/${UID}/screens/${screenID}`).update({
        'lockStatus': SCREEN_UNLOCK
    });

    const date = new Date() //Current Date
    const day = date.getDay()
    const weekNum = getWeekNumber(date)
    const link = `Teqmo/Stores/${UID}/payment/weeks/${weekNum}/counter/${day}`

    // Increment value using Firebase transactions
    // Creates a new week, counter and day if not already present
    firebase.database().ref(link).transaction( (value) => {
        if (value === null) {
            return 1;
        } else if (typeof value === 'number') {
            return value + 1;
        } 
    });
}
