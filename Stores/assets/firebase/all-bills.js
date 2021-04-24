// Call data retrieval functions only after firebase is loaded
firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showAllPastBills()
        updateBasicInfo()
    }
})

/**
 * Fetches all the sales related data for All the weeks present in Database
 * Passes the array to the update function which loads the data on table and initialises it
  Table - [startDate,endDate,statusLine,total,invoice]
 */
async function showAllPastBills(){
    const UID = firebase.auth().currentUser.uid;

    const snapshot = await firebase.database().ref(`Teqmo/Stores/${UID}/payment`).once('value')
    const data = snapshot.val()
    var dataSet = []

    jQuery.each(data.weeks, function(weekNum, details) {
        if (details && weekNum!="start") {
            let startDate = getDateFromWeek(weekNum,0);
            let endDate = getDateFromWeek(weekNum,1);
            let total = details.sales ? details.sales : 'N/A';
            let statusLine;
            if (details.billStatus == 2) {
              statusLine = `<span class="badge badge-soft-success">
                              <span class="legend-indicator bg-success"></span>Paid
                            </span>`
            }
            else if (details.billStatus == 1) {
              statusLine = `<span class="badge badge-soft-warning">
                              <span class="legend-indicator bg-warning"></span>Pending
                            </span>`
            }
            else {
              statusLine = `<span class="badge badge-soft-secondary">
                              <span class="legend-indicator bg-secondary"></span>Not Generated
                            </span>`
            }
            var invoice = `<a class="btn btn-sm btn-white" href="invoice.html?weekID=${weekNum}">
                                <i class="tio-receipt-outlined mr-1"></i> Invoice</a>`
            var temp = [startDate,endDate,statusLine,total,invoice]
            dataSet.unshift(temp)
        }
      })
      updateDataTable(dataSet)
}

// INITIALIZATION OF DATATABLES
function updateDataTable(dataSet){
    var datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
      data: dataSet,
      columns: [
          { title: "Start Date" },
          { title: "End Date" },
          { title: "Payment Status" },
          { title: "Total $ " },
          { title: "Invoice" }
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