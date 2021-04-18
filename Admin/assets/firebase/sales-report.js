$(document).on('ready', function () {
    // INITIALIZATION OF NAVBAR VERTICAL NAVIGATION
    var sidebar = $('.js-navbar-vertical-aside').hsSideNav();
    // INITIALIZATION OF UNFOLD
    $('.js-hs-unfold-invoker').each(function () {
        var unfold = new HSUnfold($(this)).init();
    });
    // =======================================================

    
})

firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showSalesReport()
    }
})

/**
 * Gives all the sales related data for All the weeks present in Database
 * @returns {Array of JSON Objects} Each JSON contains data for each week  
 */
function showSalesReport(){
    const UID = firebase.auth().currentUser.uid;
    // const UID = 'OHatm0qKa2Rf3DFnAj1Vq64Fcn62'

    firebase.database().ref(`Teqmo/Stores/${UID}/Payment`).on('value',(snapshot)=>{
        if(snapshot.exists()){
            const data = snapshot.val()
            document.getElementById('tableBody').innerHTML = ''
            jQuery.each(data.Weeks, function(weekNum, details) {
                // console.log(weekNum, details)
                if(weekNum!=0){
                    let startDate = getDateFromWeek(weekNum,0);
                    let endDate = getDateFromWeek(weekNum,1);
                    let count = details.counter.reduce((a, b) => a + b, 0)
                    let sales = details.sales;
                    let commission = details.commission;
    
                    var row = `<tr>
                    <td>${startDate}</td>
                    <td>${endDate}</td>
                    <td>${count}</td>
                    <td>$ ${sales}</td>
                    <td>$ ${commission}</td>
                    <td>30%</td>
                    <td>$ ${sales - commission}</td>
                    </tr>`
                    document.getElementById('tableBody').innerHTML += row
                }
            });
        }
    })
}
