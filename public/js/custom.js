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

$(function(){
    var selectBase = $('#baseFood').selectpicker();
    var selectSpec = $('#specFood').selectpicker();

    selectBase.on('shown.bs.select', function (e) {
     //alert('shown');
    });
 
    selectBase.on('changed.bs.select', function (e) {
        selectSpec.prop('disabled', false);
        options = "<option value=test> test </option>";
        selectSpec.empty().append(options);
        selectSpec.selectpicker('refresh');
    });
 });


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