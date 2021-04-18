firebase.auth().onAuthStateChanged((user) => {
    if(user){
        updateBasicInfo()
    }
})

/**
 * Count Per Day of Current Week, from [Sun, Mon,... , Sat]
 * Current WeekNumber is calculated from current date 
 * @returns {Array} countPerDay Count per day of week, 0th pos:Sunday, ..., 6th pos:Saturday
 */
async function getCountPerDayOfWeek(weekNum = 0){
    const date = new Date() //Current Date
    const currentWeek = getWeekNumber(date)
    const targetWeek = currentWeek - weekNum

    // const UID = 'OHatm0qKa2Rf3DFnAj1Vq64Fcn62'
    const UID = firebase.auth().currentUser.uid;
    var snapshot = await firebase.database().ref(`Teqmo/Stores/${UID}/Payment/Weeks/${targetWeek}/counter`).once('value')
    return snapshot.val()
}

async function updateChart(){
    var countThisWeek = await getCountPerDayOfWeek()
    var countLastWeek = await getCountPerDayOfWeek(1)
    
    var updatingChart = $.HSCore.components.HSChartJS.init($('#updatingData'));
    updatingChart.data.datasets[0].data = countThisWeek
    updatingChart.data.datasets[1].data = countLastWeek
    updatingChart.update();

    const totalThisWeek = countThisWeek.reduce((a, b) => a + b, 0)
    const totalLastWeek = countLastWeek.reduce((a, b) => a + b, 0)
    const increasePercentage = Math.ceil((totalThisWeek - totalLastWeek)*100/totalLastWeek)

    const countTrend = document.getElementById("countTrend")
    if(increasePercentage > 0){
        countTrend.classList.add("text-success");
        countTrend.classList.remove("text-danger");
        countTrend.innerHTML = `<i class="tio-trending-up"></i> ${increasePercentage}%`
    } else {
        countTrend.classList.remove("text-success");
        countTrend.classList.add("text-danger");
        countTrend.innerHTML = `<i class="tio-trending-down"></i> ${increasePercentage}%`
    }
}
