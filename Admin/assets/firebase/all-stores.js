firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showAllStores()
        updateBasicInfo()
    }
})

async function showAllStores() {
  let listAllStores = [];
  let storeName, email, commission, phoneNo, sales;

  const snapshot = await firebase.database().ref("Teqmo/Stores").once("value");
  const data = snapshot.val()
  console.log(data)
  if (data) {
    jQuery.each(data, function(storeUID, storeInfo) {
      if (storeInfo) {
        console.log(storeUID, storeInfo)
        storeName = storeInfo.details.storeName ? storeInfo.details.storeName : 'No Name';
        email = storeInfo.details.email ? storeInfo.details.email : 'No Email';
        phoneNo = storeInfo.details.phone ? storeInfo.details.phone : 'No Phone';
        sales = storeInfo.payment.totalSales ? storeInfo.payment.totalSales : 'No Data';
        commission = storeInfo.payment.totalCommission ? storeInfo.payment.totalCommission : 'No Data';

        let nameHTML = `<a class="d-flex align-items-center" href="./store-details.html?storeUID=${storeUID}">
                            <div class="ml-3">
                              <span class="h5 text-hover-primary">${storeName}</span>
                            </div>
                        </a>`;
        let linkToStore =`<a class="btn btn-sm btn-white" href="./store-details.html?storeUID=${storeUID}"  >
                            More Details
                          </a>`;

        let tableRow = [nameHTML, email, phoneNo, sales, commission, linkToStore];
        listAllStores.unshift(tableRow);
      }
    })
  } else {
    console.log("No store exists");
  }

  updateDataTable(listAllStores);
}

// INITIALIZATION OF DATATABLES
function updateDataTable(dataSet){
  console.log(dataSet);
  let datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
    data: dataSet,
    columns: [
        { title: "Store Name" },
        { title: "Email" },
        { title: "Phone" },
        { title: "Sales" },
        { title: "Commission" },
        { title: "View Store" }
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