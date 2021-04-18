// Call data retrieval functions only after firebase is loaded
firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showSalesReport()
        updateCounts()
        updateBasicInfo()
    }
})

/**
 * Fetches all the sales related data for All the weeks present in Database
 * Passes the array to the update function which loads the data on table and initialises it
 */
async function showSalesReport(){
    const UID = firebase.auth().currentUser.uid;
    // const UID = 'OHatm0qKa2Rf3DFnAj1Vq64Fcn62'

    const snapshot = await firebase.database().ref(`Teqmo/Stores/${UID}/payment`).once('value')
    const data = snapshot.val()
    var dataSet = []
    jQuery.each(data.weeks, function(weekNum, details) {
        // console.log(weekNum, details)
        if(details){
            let startDate = getDateFromWeek(weekNum,0);
            let endDate = getDateFromWeek(weekNum,1);
            let count = details.counter.reduce((a, b) => a + b, 0)
            let sales = details.sales;
            let commission = details.commission;
            let rate = "50 %";
            let profit = sales-commission;

            let row = [startDate, endDate, count, sales, commission, rate, profit]
            dataSet.push(row)
        }
    })
    updateDataTable(dataSet)
}

// INITIALIZATION OF DATATABLES
function updateDataTable(dataSet){
    // Sample Data to be received (Number of items in each row should match the columns)
    // var dataSet = [
    //     ["Sun Apr 11, 2021", "Sat Apr 17, 2021", "200", "$ 200", "$ 100", "50%", "$ 100"],
    //     ["Sun Apr 18, 2021", "Sat Apr 24, 2021", "100", "$ 100", "$ 50", "50%", "$ 50"]
    // ]

    var datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
      data: dataSet,
      columns: [
          { title: "Start Date" },
          { title: "End Date" },
          { title: "Play Count" },
          { title: "Total Sales" },
          { title: "Commission" },
          { title: "Commission Rate" },
          { title: "Profit" }
      ],
      language: {
        zeroRecords: '<div class="text-center p-4">' +
            '<img class="mb-3" src="./assets/svg/illustrations/sorry.svg" alt="Image Description" style="width: 7rem;">' +
            '<p class="mb-0">No data to show</p>' +
            '</div>'
      }
    });

    // Initialise search on table
    $('#datatableSearch').on('mouseup', function (e) {
      var $input = $(this),
        oldValue = $input.val();

      if (oldValue == "") return;

      setTimeout(function(){
        var newValue = $input.val();

        if (newValue == ""){
          // Gotcha
          datatable.search('').draw();
        }
      }, 1);
    });
}

/**
 * Updates the count cards on page load 
 */
function updateCounts(){
  const UID = firebase.auth().currentUser.uid
  const link = `Teqmo/Stores/${UID}/payment`

  firebase.database().ref(link).once('value', (snapshot)=>{
    const data = snapshot.val()
    if(data){
      const totalCommission = data.totalCommission
      const totalSales = data.totalSales
      const profit = totalSales - totalCommission
      var totalCount = 0
      jQuery.each(data.weeks, (weekNum, details) => {
        if(details){
          var weekCount = details.counter.reduce((a, b) => a + b, 0)
          totalCount += weekCount
        }
      })

      document.getElementById('totalCount').innerHTML = totalCount
      document.getElementById('totalCommission').innerHTML = '$ '+ totalCommission
      document.getElementById('totalSales').innerHTML = '$ '+ totalSales
      document.getElementById('profit').innerHTML = '$ '+ profit
    }
  })
}