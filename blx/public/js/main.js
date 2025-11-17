$(document).ready(function(){
  $('#slick-calendar').slick({
    infinite: true,
    speed: 300,
    slidesToShow: 11,
    slidesToScroll: 1,
    prevArrow: $('#prev-calendar'),
    responsive: [{
      breakpoint: 1024,
      settings: {
        slidesToShow: 11,
        slidesToScroll: 1,

      }
    }, {
      breakpoint: 835,
      settings: {
        slidesToShow: 8,
        slidesToScroll: 1,
        infinite: true,

      }
    }, {
      breakpoint: 600,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: true,

      }
    }]
  });
  $(".btn-eye").click(function(){
      $(this).toggleClass("active");
      $(".hide-text-balance").toggleClass("active");
  });
  // Show or hide the back-to-top button
  $(window).scroll(function(){
    if ($(this).scrollTop() > 60) {
      $('.back-to-top').fadeIn();
    } else {
      $('.back-to-top').fadeOut();
    }
  });

  // Scroll to top when the button is clicked
  $('.back-to-top').click(function(){
    $('html, body').animate({scrollTop : 0},100);
    return false;
  });
});
$("#eye-hidden-pin").click(function () {
  $(this).toggleClass("hidden");
  $(".block-current-pin").toggleClass("hidden-pin");
});

// SELECT_TIME_DEPOSIT
$("#select_time_deposit").on('change',function(){
  if($(this).find('option:selected').text()=="Select")
      $("#button_disabled_deposit").attr('disabled',true)
  else
      $("#button_disabled_deposit").attr('disabled',false)
}).trigger("change");

// ACTIVEBTN
function activebtn() {
  if(document.getElementById("textsend").value==="") { 
           document.getElementById('button_disabled').disabled = true; 
       } else { 
           document.getElementById('button_disabled').disabled = false;
       }
}

// CONTROL-NUMBER
+function ($) {
  $('.minus').click(function () {
      var $input = $(this).parent().find('input');
      var count = parseInt($input.val()) - 1;
      count = count < 1 ? 1 : count;
      $input.val(count);
      $input.change();
      return false;
  });
  $('.plus').click(function () {
      var $input = $(this).parent().find('input');
      $input.val(parseInt($input.val()) + 1);
      $input.change();
      return false;
  });
}(jQuery);
$(document).ready(function(){
  
// Show the button when the user scrolls down 100px from the top of the document
  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('#backToTop').fadeIn();
    } else {
      $('#backToTop').fadeOut();
    }
  });

  // When the user clicks on the button, scroll to the top of the document
  $('#backToTop').click(function() {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
  });

//play/pause on double click on the video
  $('video').on('click', function (e) {
    if (this.paused) {
      this.play();
    }else{
      this.pause();
    }
  });

//play/pause of the video when the modal opens/closes.
  $('.open-box').on('show.bs.modal', function() { //show modal event for an element which has class 'modal'
    var id = $(this).attr('id'); //saves in the var the ID value of the opened modal
    var video = document.getElementById(id).querySelectorAll("video"); //Find the element 'video' inside of the modal defined by the ID previosly saved

    $(video)[0].play(); //plays what we saved on 'video' variable
  });

  $('.open-box').on('hidden.bs.modal', function() { //show modal event for an element which has class 'modal'
    var id = $(this).attr('id');//saves in the var the ID value of the closed modal
    var video = document.getElementById(id).querySelectorAll("video");//Find the element 'video' inside of the modal defined by the ID previosly saved

    $(video)[0].pause(); //pauses the video
    $(video)[0].currentTime = 0; //rests the video to 0 for have it from the beging when the user opens the modal again
  });
// Lấy tên file HTML
  var path = window.location.pathname;
  var fileName = path.split("/").pop();

  // Lấy phần tên file trước dấu "."
  var fileNameWithoutExtension = fileName.split(".")[0];

  // Đưa tên file vào nội dung của div
  $('#fileName').text(fileNameWithoutExtension);
// slider
  $('.responsive').slick({
    // dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [{
      breakpoint: 1024,
      settings: {
        slidesToShow: 8,
        slidesToScroll: 1,
        // centerMode: true,

      }
    }, {
      breakpoint: 835,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,

      }
    }, {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,

      }
    }, {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
      }
    }, {
      breakpoint: 320,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
      }
    }]
  });
//click to copy
  $(".copy-button").click(function() {
    let element = $($(this).data('copyid'));
    let copyText;

    if (element.is("input") || element.is("textarea")) {
      copyText = element.val();
    } else {
      copyText = element.text();
    }
    copyToClipboard(copyText);
  });
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }
// Iterate over each .sparkline element
  $('.sparkline-up').each(function () {
    // Get data from the data-values attribute
    var data = $(this).data('values');
    // Convert string to array if needed
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    // Initialize sparkline with the extracted data
    $(this).sparkline(data, {
      type: 'line',
      fillColor: '#09BE8B4F',
      spotColor: false,
      minSpotColor: false,
      lineColor: '#09be8b',
      width: '200',
      height: '30',
      maxSpotColor: false
    });
  });
  $('.sparkline-down').each(function () {
    // Get data from the data-values attribute
    var data = $(this).data('values');
    // Convert string to array if needed
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    // Initialize sparkline with the extracted data
    $(this).sparkline(data, {
      type: 'line',
      fillColor: '#D335354C',
      spotColor: false,
      minSpotColor: false,
      lineColor: '#D33535',
      width: '200',
      height: '30',
      maxSpotColor: false
    });
  });

  $(".start-countdown").click(function () {
    $(this).text("Resend OTP Code").attr("disabled", true);
    $(".otp-message").css("display", "block");
    $(".countdown").each(function () {
      let countdownElement = $(this);
      let timeLeft = parseInt(countdownElement.attr("data-time"));

      countdownElement.text(timeLeft);

      // Clear any existing countdown to avoid overlap
      clearInterval(countdownElement.data("interval"));

      // Set new interval
      let countdown = setInterval(function () {
        timeLeft--;
        countdownElement.text(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdown);
          // countdownElement.text("Time's up!");
          $(".start-countdown").removeAttr("disabled");
          $(".otp-message").css("display", "none");
        }
      }, 1000);

      // Save the interval ID so it can be cleared later if needed
      countdownElement.data("interval", countdown);
    });
  });
});
//active-link
jQuery(function ($) {
  var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
  $('.nav-menu li a').each(function () {
    if (this.href === path) {
      $(this).addClass('active');
    }
  });
});
jQuery(function ($) {
  var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
  $('.nav-menu-top li a').each(function () {
    if (this.href === path) {
      $(this).addClass('active');
    }
  });
});
// Function to simulate typing effect for each element with the class .typed-text
function typeEffect(element, text, speed) {
  var index = 0;
  var typing = setInterval(function() {
    // Append the next character to the element
    $(element).append(text[index++]);

    // If reached the end of the text, clear the interval
    if (index === text.length) {
      clearInterval(typing);
    }
  }, speed);
}

// Function to delay and then start typing effect for each element
function startTyping() {
  var speed = 30; // Speed of typing in milliseconds
  var delay = 500; // Delay between each line in milliseconds

  // Iterate over each element with the class .typed-text
  $('.typed-text').each(function(index) {
    var text = $(this).data('text'); // Get the text from the data-text attribute

    // Delay before starting typing effect for each line
    setTimeout(function() {
      typeEffect(this, text, speed); // Call the typeEffect function for each element
    }.bind(this), index * delay); // Apply delay based on index of the element
  });
}

// Call the startTyping function to begin the typing effect
startTyping();

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

function countdown(timeInSeconds) {
  var timer = timeInSeconds, hours, minutes, seconds;
  var intervalId = setInterval(function () {

    hours = parseInt((timer / 3600) % 24, 10);
    minutes = parseInt((timer / 60) % 60, 10);
    seconds = parseInt(timer % 60, 10);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // console.log(hours + ":" + minutes + ":" + seconds);

    if (--timer < 0) {
      clearInterval(intervalId);
      // console.log("Countdown Finished.");
    }
  }, 1000);
}

countdown(5000); // Count down from 5000 seconds

$.fn.extend({
  treed: function (o) {

    var openedClass = 'glyphicon-minus-sign';
    var closedClass = 'glyphicon-plus-sign';

    if (typeof o != 'undefined'){
      if (typeof o.openedClass != 'undefined'){
        openedClass = o.openedClass;
      }
      if (typeof o.closedClass != 'undefined'){
        closedClass = o.closedClass;
      }
    };

    //initialize each of the top levels
    var tree = $(this);
    tree.addClass("tree");
    tree.find('li').has("ul").each(function () {
      var branch = $(this); //li with children ul
      branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
      branch.addClass('branch');
      branch.on('click', function (e) {
        if (this == e.target) {
          var icon = $(this).children('i:first');
          icon.toggleClass(openedClass + " " + closedClass);
          $(this).children().children().toggle();
        }
      })
      branch.children().children().toggle();
    });
    //fire event from the dynamically added icon
    tree.find('.branch .indicator').each(function(){
      $(this).on('click', function () {
        $(this).closest('li').click();
      });
    });
    //fire event to open branch if the li contains an anchor instead of text
    tree.find('.branch>a').each(function () {
      $(this).on('click', function (e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
    });
    //fire event to open branch if the li contains a button instead of text
    tree.find('.branch>button').each(function () {
      $(this).on('click', function (e) {
        $(this).closest('li').click();
        e.preventDefault();
      });
    });
  }
});

//Initialization of treeviews
const API_URL = 'https://restcountries.com/v3.1/all';

document.addEventListener('DOMContentLoaded', () => {
  const languageInput = document.getElementById('language');
  const languageList = document.getElementById('languageList');

  // Fetch danh sách ngôn ngữ
  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const languages = [...new Set(
        data.flatMap(country => Object.values(country.languages || {}))
      )].sort((a, b) => a.localeCompare(b));

      // Render danh sách radio
      languages.forEach(language => {
        const li = document.createElement('li');
        li.innerHTML = `
        <label for="${language}">${language}</label>
        <input type="radio" id="${language}" name="languageOption" value="${language}" class="form-check-input me-3 text-end" />
        `;
        languageList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error fetching languages:', error);
    });

  // Lắng nghe khi người dùng chọn radio
  languageList.addEventListener('change', function (e) {
    if (e.target && e.target.matches('input[type="radio"]')) {
      languageInput.value = e.target.value;
    }
  });
});

const emailInput = document.getElementById('emails');
const submitBtn = document.getElementById('submitBtn');

// function isValidEmail(email) {
//   return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
// }

// emailInput.addEventListener('input', () => {
//   const email = emailInput.value.trim();

//     if (isValidEmail(email)) {
//         emailInput.classList.remove('is-invalid');
//         submitBtn.disabled = false;
//     } else {
//         emailInput.classList.add('is-invalid');
//         submitBtn.disabled = true;
//     }
// });

document.addEventListener("DOMContentLoaded", () => {
    const isdSelect = document.getElementById("isdCodeSelect");

    fetch("https://restcountries.com/v3.1/all")
      .then(response => response.json())
      .then(data => {
        // Sắp xếp theo tên quốc gia
        const countries = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );

        countries.forEach(country => {
          if (country.idd && country.idd.root) {
            const root = country.idd.root;
            const suffixes = country.idd.suffixes || [];

            suffixes.forEach(suffix => {
              const code = root + suffix;
              const option = document.createElement("option");
              option.value = code;
              option.textContent = `${code} (${country.name.common})`;
              isdSelect.appendChild(option);
            });

            // Nếu không có suffix, vẫn thêm root
            if (suffixes.length === 0) {
              const option = document.createElement("option");
              option.value = root;
              option.textContent = `${root} (${country.name.common})`;
              isdSelect.appendChild(option);
            }
          }
        });
      })
      .catch(error => {
        console.error("Error fetching ISD codes:", error);
        const errorOption = document.createElement("option");
        errorOption.textContent = "Failed to load ISD codes";
        errorOption.disabled = true;
        isdSelect.appendChild(errorOption);
      });
  });

  const offcanvas = document.getElementById("txdetail");
  const statusBlock = document.getElementById("statusblock");
  const statusText = document.getElementById("statustext");

  offcanvas.addEventListener('shown.bs.offcanvas', () => {
    statusBlock.innerHTML = `
      <div class="spinner-custom"></div>
      
      <p class="text-muted">You can manage your traction in activity</p>
    `;
    statustext.textContent = "Pending";
    statustext.classList.remove("text-success");
    statustext.classList.add("text-warning");

    setTimeout(() => {
      statusBlock.innerHTML = `
        <img src=".//client/images/success.png" alt="Success" class="img-fluid mx-auto d-block" style="width: 80px; height: 80px;">
        <h5 class="fw-bold text-success mt-3">Send Success</h5>
        <p class="text-muted">Your transaction has been confirmed on the blockchain</p>
      `;
      statustext.textContent = "Success";
      statustext.classList.remove("text-warning");
      statustext.classList.add("text-success");
    }, 5000);
  });

 