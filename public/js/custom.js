// // to get current year
// function getYear() {
//     var currentDate = new Date();
//     var currentYear = currentDate.getFullYear();
//     document.querySelector("#displayYear").innerHTML = currentYear;
// }

// getYear();

// isotope js
$(window).on('load', function () {
    $('.filters_menu li').click(function () {
        $('.filters_menu li').removeClass('active');
        $(this).addClass('active');

        var data = $(this).attr('data-filter');
        $grid.isotope({
            filter: data
        })
    });

    var $grid = $(".grid").isotope({
        itemSelector: ".all",
        percentPosition: false,
        masonry: {
            columnWidth: ".all"
        }
    })
});

// // nice select
// $(document).ready(function() {
//     $('select').niceSelect();
//   });

// /** google_map js **/
// function myMap() {
//     var mapProp = {
//         center: new google.maps.LatLng(40.712775, -74.005973),
//         zoom: 18,
//     };
//     var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
// }

// client section owl carousel
$(".client_owl-carousel").owlCarousel({
    loop: true,
    margin: 0,
    dots: false,
    nav: true,
    navText: [],
    autoplay: true,
    autoplayHoverPause: true,
    navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>'
    ],
    responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        },
        1000: {
            items: 2
        }
    }
});

/*$(function(){
    var selectBase = $('#base-select').selectpicker();
    var selectSpec = $('#category-select').selectpicker();

    selectBase.on('shown.bs.select', function (e) {
     //alert('shown');
    });
 
    selectBase.on('changed.bs.select', function (e) {
        //selectSpec.prop('disabled', false);
        //options = "<option value=test> test </option>";
        //selectSpec.empty().append(options);
        selectSpec.selectpicker('refresh');
    });
 });*/


/*$('#searchButton').click(function(){
    setTimeout(function() {
        $("#baseFood").selectpicker("toggle");
      }, 100);
});*/

document.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#loginEmail').value;
    const password = document.querySelector('#loginPassword').value;

    const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        // Başarılı giriş durumunda

        // div elementine erişim
        const myDiv = document.querySelector('#login-success-error');

        // tüm sınıf adlarını kaldır
        const classes = myDiv.classList;
        while (classes.length > 0) {
        classes.remove(classes.item(0));
        }
        myDiv.classList.add('text-success');
        myDiv.innerHTML = data.message;
        setTimeout(() => {
            window.location.href = '/';
          }, 2000); // 2 saniye bekle
        //$('#exampleModal').modal('hide');
    } else {
        // Başarısız giriş durumunda
        document.querySelector('#login-success-error').classList.remove();
        document.querySelector('#login-success-error').classList.add('text-danger');
        document.querySelector('#login-success-error').innerHTML = data.message;
    }
});

document.querySelector('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.querySelector('#name').value;
    const surname = document.querySelector('#surname').value;
    const email = document.querySelector('#registerEmail').value;
    const password = document.querySelector('#registerPassword').value;
    
    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
        // Successful registration
        const myDiv = document.querySelector('#register-success-error');
        const classes = myDiv.classList;
        while (classes.length > 0) {
            classes.remove(classes.item(0));
        }
        myDiv.classList.add('text-success');
        myDiv.innerHTML = data.message;
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } else {
        // Failed registration
        document.querySelector('#register-success-error').classList.remove();
        document.querySelector('#register-success-error').classList.add('text-danger');
        document.querySelector('#register-success-error').innerHTML = data.message;
    }
});


function onBaseSelectChange() {
    const baseSelect = document.getElementById("base-select");
    const selectedBaseIds = [...baseSelect.selectedOptions].map(option => option.value); // get an array of selected base food IDs
  
    if (selectedBaseIds.length > 0) {
      const categorySelect = document.getElementById("category-select");
      const foodSelect = document.getElementById("food-select");
  
      // disable the category and food selects while loading new data
      categorySelect.disabled = true;
      foodSelect.disabled = true;
  
      // send an AJAX request to get the categories for the selected base foods
      fetch(`/base/${selectedBaseIds.join(",")}/categories`)
        .then(response => response.json())
        .then(categories => {
          // populate the category select with the retrieved categories
          categorySelect.innerHTML = `${categories.map(category => `<option data-icon="${category.icon || "fa-solid fa-fork-knife"}" value="${category._id}">${category.name}</option>`).join("")}`;
          // enable the category select
          categorySelect.disabled = false;
          $('#category-select').selectpicker('destroy');
          $('#category-select').selectpicker('render');
        })
        .catch(error => console.log(error));
    }else if(selectedBaseIds.length == 0){
        const categorySelect = document.getElementById("category-select");
        const foodSelect = document.getElementById("food-select");
        categorySelect.disabled = true;
        $('#category-select').selectpicker('destroy');
        $('#category-select').selectpicker('render');
        foodSelect.disabled = true;
        $('#food-select').selectpicker('destroy');
        $('#food-select').selectpicker('render');
    }
  }
  


  function onCategorySelectChange() {

    const baseSelect = document.getElementById("base-select");
    const selectedBaseIds = [...baseSelect.selectedOptions].map(option => option.value); // get an array of selected base food IDs

    const categorySelect = document.getElementById("category-select");
    const selectedCategoryIds = [...categorySelect.selectedOptions].map(option => option.value); // get an array of selected base food IDs


    if (selectedCategoryIds.length > 0) {
    const foodSelect = document.getElementById("food-select");

    // disable the category and food selects while loading new data
    //categorySelect.disabled = true;
    foodSelect.disabled = true;

    // send an AJAX request to get the categories for the selected base foods
    fetch(`/category/${selectedCategoryIds.join(",")}/${selectedBaseIds.join(",")}/foods`)
      .then(response => response.json())
      .then(foods => {
        // populate the category select with the retrieved categories
        foodSelect.innerHTML = `${foods.map(food => `<option value="${food._id}">${food.name}</option>`).join("")}`;

        // enable the category select
        foodSelect.disabled = false;
        $('#food-select').selectpicker('destroy');
        $('#food-select').selectpicker('render');
      })
      .catch(error => console.log(error));
    }else if(selectedCategoryIds.length == 0){
        const categorySelect = document.getElementById("category-select");
        const foodSelect = document.getElementById("food-select");
        foodSelect.disabled = true;
        $('#food-select').selectpicker('destroy');
        $('#food-select').selectpicker('render');
    }
  }


  //restoran yorum kutusu auto-size
  $("textarea").each(function () {
    this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
   }).on("input", function () {
    this.style.height = 0;
    this.style.height = (this.scrollHeight) + "px";
   });

   function submitRating(event) {
    const tasteRating = document.getElementsByName("taste"); // get all radio buttons with name "taste"
    const speedRating = document.getElementsByName("speed");
    const priceRating = document.getElementsByName("price");
    let selectedTasteRating = false;
    let selectedSpeedRating = false;
    let selectedPriceRating = false;
    for (let i = 0; i < tasteRating.length; i++) {
        if (tasteRating[i].checked) {
            selectedTasteRating = true;
            break;
        }
    }
    for (let i = 0; i < speedRating.length; i++) {
        if (speedRating[i].checked) {
            selectedSpeedRating = true;
            break;
        }
    }
    for (let i = 0; i < priceRating.length; i++) {
        if (priceRating[i].checked) {
            selectedPriceRating = true;
            break;
        }
    }
    if (!selectedTasteRating || !selectedSpeedRating || !selectedPriceRating) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.classList.add('alert', 'alert-danger');
        errorMessage.innerHTML = "En az 1 yıldız puanı vermelisiniz."; // display error message
        event.preventDefault();
        return false;
    }
    else{
        const errorMessage = document.getElementById("error-message");
        errorMessage.classList.remove('alert','alert-danger')
        errorMessage.innerHTML = ""; // display error message
    }
    return true;
}