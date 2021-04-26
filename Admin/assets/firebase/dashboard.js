firebase.auth().onAuthStateChanged( async (user) => {
    if(user){
        const UID = user.uid;
        const snapshot = await firebase.database().ref(`Teqmo/Stores`).once('value')
        const data = snapshot.val()
        updateChart(data)
        updateBasicInfo()
        updateStatistics(data)
    }
})

/**
 * Updates the count cards on page load 
 */
 function updateCounts(weeks, totalCommission, totalSales){
    const profit = (totalSales - totalCommission).toFixed(2)
    var totalCount = 0
    jQuery.each(weeks, (weekNum, details) => {
      if(details && weekNum!="start"){
        var weekCount = details.counter.reduce((a, b) => a + b, 0)
        totalCount += weekCount
      }
    })
  
    document.getElementById('totalCount').innerHTML = totalCount
    document.getElementById('totalCommission').innerHTML = '$ '+ totalCommission
    document.getElementById('totalSales').innerHTML = '$ '+ totalSales
    document.getElementById('profit').innerHTML = '$ '+ profit
  }

function updateStatistics(data) {
    let storeCount = 0,
        totalPlays = 0,
        totalCommission = 0,
        totalSales = 0;

    jQuery.each(data, (storeUID, storeInfo) => {
        storeCount++;
        totalCommission += parseFloat(storeInfo.payment.totalCommission);
        totalSales += parseFloat(storeInfo.payment.totalSales);
        var totalCount = 0;
        let weeks = storeInfo.payment.weeks;
        jQuery.each(weeks, (weekNum, details) => {
            if (details && weekNum != "start") {
                var weekCount = details.counter.reduce((a, b) => a + b, 0)
                totalCount += weekCount
            }
        })

        totalPlays += totalCount;
    });
    totalCommission = totalCommission.toFixed(2); //toFixed() converts a number into String 
    totalSales = totalSales.toFixed(2);
    document.getElementById('total-stores').innerHTML = storeCount;
    document.getElementById('total-plays').innerHTML = totalPlays;
    document.getElementById('total-commission').innerHTML = '$ ' + totalCommission;
    document.getElementById('total-sales').innerHTML = '$ ' + totalSales;
}

/**
 * Count Per Day of Current Week, from [Sun, Mon,... , Sat]
 * Current WeekNumber is calculated from current date 
 * @returns {Array} countPerDay Count per day of week, 0th pos:Sunday, ..., 6th pos:Saturday
 */
async function getSumOfCountPerDayOfWeek(data, weekNum = 0) {
    const date = new Date() //Current Date
    const currentWeek = getWeekNumber(date)
    const targetWeek = currentWeek - weekNum
    console.log(weekNum)
    let sumOfCount = [0, 0, 0, 0, 0, 0, 0];

    jQuery.each(data, (storeUID, storeInfo) => {
        let weeks = storeInfo.payment.weeks;
        jQuery.each(weeks, (weekNum, details) => {
            if (details && weekNum == targetWeek) {
                let weekCount = details.counter;
                for (let i = 0; i < 7; i++) {
                    sumOfCount[i] += weekCount[i];
                }
            }
        })
    });

    return sumOfCount
}

async function updateChart(data){
    var countThisWeek = await getSumOfCountPerDayOfWeek(data,0)
    var countLastWeek = await getSumOfCountPerDayOfWeek(data,1)
    
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
