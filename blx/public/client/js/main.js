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

 // JavaScript Document

/*

TemplateMo 600 Prism Flux

https://templatemo.com/tm-600-prism-flux

*/


// Portfolio data for carousel

const portfolioData = [
    {
        id: 1,
        title: 'Trần Văn Tiến ',
        description: 'Huấn Luyện Viên , trọng tài quốc gia , đạt nhiều giải thưởng quốc tế và quốc gia.',
        image: 'client/images/tt-1.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ', 'Biểu Diễn']
    },
    {
        id: 2,
        title: 'Đoàn Tiến Tân ',
        description: 'Huấn Luyện Viên , trọng tài quốc gia , đạt nhiều giải thưởng quốc tế và quốc gia.',
        image: 'client/images/tt-2.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 3,
        title: 'Nguyễn Nhất Viết Lân ',
        description: 'Huấn Luyện Viên , trọng tài quốc gia , đạt nhiều giải thưởng quốc tế và quốc gia.',
        image: 'client/images/tt-3.jpg',
        tech: ['Đối Kháng ']
    },
    {
        id: 4,
        title: 'Hoàng Lyna Nguyễn ',
        description: 'Huấn Luyện Viên ',
        image: 'client/images/tt-4.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 5,
        title: 'Đào Nguyễn Minh Sang ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-5.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 6,
        title: 'Nguyễn Phú Vinh  ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-6.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 7,
        title: 'Bùi Minh Anh ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-7.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    },
    {
        id: 8,
        title: 'Lê Minh Gia Long ',
        description: 'Huấn Luyện Viên , Vận Đồng Viên Quyền ',
        image: 'client/images/tt-8.jpg',
        tech: ['Đối Kháng ', 'Quyền Pháp ']
    }
];

// Skills data
const skillsData = [
    { name: 'Đối Kháng ', icon: '🥊', level: 95, category: 'Đối Kháng' },
    { name: 'Quyền Pháp ', icon: '☯️', level: 90, category: 'Quyền Pháp' },
    { name: 'Biểu Diễn ', icon: '🤸‍♂️', level: 88, category: 'Biểu Diễn' },

];

// Scroll to section function
function scrollToSection (sectionId) {
    const section = document.getElementById(sectionId);
    const header = document.getElementById('header');
    if (section) {
        const headerHeight = header.offsetHeight;
        const targetPosition = section.offsetTop - headerHeight;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize particles for philosophy section
function initParticles () {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';

        // Start particles at random vertical positions throughout the section
        particle.style.top = Math.random() * 100 + '%';

        // Random animation delay for natural movement
        particle.style.animationDelay = Math.random() * 20 + 's';

        // Random animation duration for variety
        particle.style.animationDuration = (18 + Math.random() * 8) + 's';

        particlesContainer.appendChild(particle);
    }
}

// Initialize carousel
let currentIndex = 0;

function createCarouselItem (data, index) {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.dataset.index = index;

    const techBadges = data.tech.map(tech =>
        `<span class="tech-badge">${tech}</span>`
    ).join('');

    item.innerHTML = `
                <div class="card">
                    <div class="card-number">0${data.id}</div>
                    <div class="card-image">
                        <img src="${data.image}" alt="${data.title}">
                    </div>
                    <h3 class="card-title">${data.title}</h3>
                    <p class="card-description">${data.description}</p>
                    <div class="card-tech">${techBadges}</div>
                    <button class="card-cta" onclick="scrollToSection('about')">Explore</button>
                </div>
            `;

    return item;
}

function initCarousel () {
    // Re-query elements to ensure they exist
    const carouselEl = document.getElementById('carousel');
    const indicatorsEl = document.getElementById('indicators');

    if (!carouselEl || !indicatorsEl) {
        console.error('Carousel elements not found', {
            carousel: !!carouselEl,
            indicators: !!indicatorsEl
        });
        return;
    }

    console.log('Initializing carousel with', portfolioData.length, 'items');

    // Create carousel items
    portfolioData.forEach((data, index) => {
        const item = createCarouselItem(data, index);
        carouselEl.appendChild(item);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsEl.appendChild(indicator);
    });

    console.log('Carousel items created:', carouselEl.children.length);
    updateCarousel();
}

function updateCarousel () {
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const totalItems = items.length;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;

    items.forEach((item, index) => {
        // Calculate relative position
        let offset = index - currentIndex;

        // Wrap around for continuous rotation - fix logic
        // Normalize offset to range [-totalItems/2, totalItems/2)
        if (offset > totalItems / 2) {
            offset -= totalItems;
        } else if (offset <= -totalItems / 2) {
            offset += totalItems;
        }

        const absOffset = Math.abs(offset);
        const sign = offset < 0 ? -1 : 1;

        // Reset transform
        item.style.transform = '';
        item.style.opacity = '';
        item.style.zIndex = '';
        item.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

        // Adjust spacing based on screen size
        let spacing1 = 400;
        let spacing2 = 600;
        let spacing3 = 750;

        if (isMobile) {
            spacing1 = 280;
            spacing2 = 420;
            spacing3 = 550;
        } else if (isTablet) {
            spacing1 = 340;
            spacing2 = 520;
            spacing3 = 650;
        }

        if (absOffset === 0) {
            // Center item
            item.style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
            item.style.opacity = '1';
            item.style.zIndex = '10';
        } else if (absOffset === 1) {
            // Side items (immediate neighbors)
            const translateX = sign * spacing1;
            const rotation = isMobile ? 25 : 30;
            const scale = isMobile ? 0.88 : 0.85;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.8';
            item.style.zIndex = '5';
        } else if (absOffset === 2) {
            // Further side items
            const translateX = sign * spacing2;
            const rotation = isMobile ? 35 : 40;
            const scale = isMobile ? 0.75 : 0.7;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.5';
            item.style.zIndex = '3';
        } else if (absOffset === 3) {
            // Even further items
            const translateX = sign * spacing3;
            const rotation = isMobile ? 40 : 45;
            const scale = isMobile ? 0.65 : 0.6;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-450px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.3';
            item.style.zIndex = '2';
        } else if (absOffset === 4) {
            // Very far items - still show but more hidden
            const translateX = sign * (spacing3 + 150);
            const rotation = isMobile ? 45 : 50;
            const scale = isMobile ? 0.55 : 0.5;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-500px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.2';
            item.style.zIndex = '1';
        } else {
            // Hidden items (behind)
            item.style.transform = 'translate(-50%, -50%) translateZ(-600px) scale(0.4)';
            item.style.opacity = '0';
            item.style.zIndex = '0';
        }
    });

    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

function nextSlide () {
    currentIndex = (currentIndex + 1) % portfolioData.length;
    updateCarousel();
}

function prevSlide () {
    currentIndex = (currentIndex - 1 + portfolioData.length) % portfolioData.length;
    updateCarousel();
}

function goToSlide (index) {
    currentIndex = index;
    updateCarousel();
}

// Initialize hexagonal skills grid
function initSkillsGrid () {
    const skillsGrid = document.getElementById('skillsGrid');
    const categoryTabs = document.querySelectorAll('.category-tab');

    function displaySkills (category = 'all') {
        skillsGrid.innerHTML = '';

        const filteredSkills = category === 'all'
            ? skillsData
            : skillsData.filter(skill => skill.category === category);

        filteredSkills.forEach((skill, index) => {
            const hexagon = document.createElement('div');
            hexagon.className = 'skill-hexagon';
            hexagon.style.animationDelay = `${index * 0.1}s`;

            hexagon.innerHTML = `
                        <div class="hexagon-inner">
                            <div class="hexagon-content">
                                <div class="skill-icon-hex">${skill.icon}</div>
                                <div class="skill-name-hex">${skill.name}</div>
                                <div class="skill-level">
                                    <div class="skill-level-fill" style="width: ${skill.level}%"></div>
                                </div>
                                <div class="skill-percentage-hex">${skill.level}%</div>
                            </div>
                        </div>
                    `;

            skillsGrid.appendChild(hexagon);
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displaySkills(tab.dataset.category);
        });
    });

    displaySkills();
}

// Initialize everything when DOM is ready
function initializeApp () {
    // Initialize carousel first
    initCarousel();

    // Then set up event listeners after carousel is initialized
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Auto-rotate carousel
    setInterval(nextSlide, 5000);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Update carousel on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel();
        }, 250);
    });

    // Initialize other components
    initSkillsGrid();
    initParticles();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling and active navigation
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
});

// Update active navigation on scroll
function updateActiveNav () {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href').substring(1);
                if (href === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Animated counter for stats
function animateCounter (element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const counter = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Intersection Observer for stats animation
const statsSection = document.querySelector('.stats-section');

if (statsSection) {
    // Adjust threshold for mobile devices
    const isMobile = window.innerWidth <= 768;
    const observerOptions = {
        threshold: isMobile ? 0.2 : 0.5, // Lower threshold for mobile
        rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(number => {
                    if (!number.classList.contains('animated')) {
                        number.classList.add('animated');
                        animateCounter(number);
                    }
                });
                // Unobserve after animation to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(statsSection);

    // Fallback: Trigger animation on scroll for mobile if Intersection Observer fails
    let hasAnimated = false;
    function checkStatsVisibility () {
        if (hasAnimated) return;

        const rect = statsSection.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        // Check if section is visible (at least 20% visible on mobile, 50% on desktop)
        const visibilityThreshold = isMobile ? 0.2 : 0.5;
        const isVisible = rect.top < windowHeight * (1 - visibilityThreshold) &&
            rect.bottom > windowHeight * visibilityThreshold;

        if (isVisible) {
            const statNumbers = statsSection.querySelectorAll('.stat-number');
            statNumbers.forEach(number => {
                if (!number.classList.contains('animated')) {
                    number.classList.add('animated');
                    animateCounter(number);
                }
            });
            hasAnimated = true;
        }
    }

    // Check on scroll and initial load
    window.addEventListener('scroll', checkStatsVisibility, { passive: true });
    checkStatsVisibility(); // Check immediately on load
}

// ============================================
// FORM SUBMISSION - GỬI EMAIL VỚI NODE.JS
// ============================================
// Form sẽ gửi dữ liệu đến endpoint /api/contact trên server Node.js
// Server sẽ xử lý và gửi email đến địa chỉ đã cấu hình

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message')
        };

        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;

        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';

        try {
            console.log('Sending form data to /api/contact');
            console.log('Form data:', data);

            // Send form data to Node.js backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);

            // Parse response
            const result = await response.json();

            console.log('Response result:', result);

            // Check if successful
            if (response.ok && result.success) {
                // Show success message
                alert(`Cảm ơn ${data.name}! Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi trong vòng 24 giờ.`);

                // Reset form
                contactForm.reset();
            } else {
                // Handle errors
                throw new Error(result.message || 'Không thể gửi email. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });

            // Show error message
            let errorMsg = 'Có lỗi xảy ra khi gửi tin nhắn.\n\n';

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMsg += 'Vấn đề: Không thể kết nối đến server.\n';
                errorMsg += 'Giải pháp: Vui lòng kiểm tra kết nối internet và đảm bảo server đang chạy.';
            } else {
                errorMsg += error.message || 'Vui lòng thử lại sau hoặc liên hệ trực tiếp qua email/điện thoại.';
            }

            alert(errorMsg);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Loading screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden');
    }, 1500);
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});