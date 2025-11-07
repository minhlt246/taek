$(document).ready(function () {
  function toggleError(condition, errorElement) {
    
    errorElement.show();
  
    if (condition) {
      errorElement.removeClass('error').addClass('success');
    } else {
      errorElement.removeClass('success').addClass('error');
    }
  }
  

  function validatePassword(form) {
    const passwordInput = form.find('.password-input');
    const validateBorder = form.find('.validate');
    const password = passwordInput.val();

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    const isValidLength = password.length > 10;

    toggleError(isValidLength, form.find('.error-length'));
    toggleError(hasLowerCase, form.find('.error-lowercase'));
    toggleError(hasUpperCase, form.find('.error-uppercase'));
    toggleError(hasNumber, form.find('.error-number'));
    toggleError(hasSpecialChar, form.find('.error-specialchar'));

    const isValid = hasUpperCase && hasLowerCase && hasSpecialChar && hasNumber && isValidLength;

    if (isValid) {
      validateBorder.removeClass('border-red');
    } else {
      validateBorder.addClass('border-red');
    }
    return isValid;
  }

  function checkPasswordMatch(form) {
    const password = form.find('.password-input').val();
    const confirmPassword = form.find('.confirm-password-input').val();
    const errorMatchElement = form.find('.error-match');

    if (password === confirmPassword && password !== '') {
      errorMatchElement.text('Passwords match').removeClass('error').addClass('success').show();
      return true;
    } else {
      errorMatchElement.text('Passwords do not match').removeClass('success').addClass('error').show();
      return false;
    }
  }

  function updateConfirmButtonState(form) {
    const isPasswordValid = validatePassword(form);
    const isPasswordMatch = checkPasswordMatch(form);
    const password = form.find('.password-input').val().trim();
    const confirmPassword = form.find('.confirm-password-input').val().trim();
    const confirmButton = form.find('.confirm-button');

    if (isPasswordValid && isPasswordMatch && password && confirmPassword) {
      confirmButton.prop('disabled', false);
    } else {
      confirmButton.prop('disabled', true);
    }
  }

  $('.password-block').each(function () {
    const form = $(this);

    form.find('.confirm-button').prop('disabled', true);

    form.find('.password-input').on('input', function () {
      validatePassword(form);
      updateConfirmButtonState(form);
    });

    form.find('.confirm-password-input').on('input', function () {
      checkPasswordMatch(form);
      updateConfirmButtonState(form);
    });

    form.on('submit', function (e) {
      const isPasswordValid = validatePassword(form);
      const isPasswordMatch = checkPasswordMatch(form);

      if (!isPasswordValid || !isPasswordMatch) {
        e.preventDefault();
        form.find('.validation-failure-message')
          .text('Passwords do not match or do not meet requirements.')
          .addClass('error')
          .removeClass('success')
          .show();
      } else {
        form.find('.validation-failure-message')
          .text('Password successfully validated.')
          .addClass('success')
          .removeClass('error')
          .show();
      }
    });
  });

  // Toggle password visibility
  $('.toggle-password').on('click', function () {
    var passwordField = $(this).closest('.input-group').find('.password-field');
    var passwordFieldType = passwordField.attr('type');
    var icon = $(this).find('i');

    if (passwordFieldType === 'password') {
      passwordField.attr('type', 'text');
      icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      passwordField.attr('type', 'password');
      icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
  });
});
$(document).ready(function () {
  const correctPassword = 'Test@1234';
  const input = $('#login-password');
  const msg = $('.validation-failure-message');
  const confirmBtn = $('.confirm-button');
  const inputGroup = $('.input-group.validate');

  function validatePassword() {
    const val = input.val().trim();
    if (!val) {
      inputGroup.removeClass('success').addClass('error');
      msg.removeClass('success').addClass('error').text('Please enter your password');
      confirmBtn.addClass('disabled').attr('disabled', true);
    } else if (val === correctPassword) {
      inputGroup.removeClass('error').addClass('success');
      msg.removeClass('error').addClass('success').text('Password is correct');
      confirmBtn.removeClass('disabled').attr('disabled', false);
    } else {
      inputGroup.removeClass('success').addClass('error');
      msg.removeClass('success').addClass('error').text('Incorrect password');
      confirmBtn.addClass('disabled').attr('disabled', true);
    }
  }

  input.on('input', validatePassword);

  // Toggle password visibility
  $('.toggle-passwords').on('click', function () {
    var passwordField = $(this).closest('.input-group').find('.password-field');
    var passwordFieldType = passwordField.attr('type');
    var icon = $(this).find('i');

    if (passwordFieldType === 'password') {
      passwordField.attr('type', 'text');
      icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      passwordField.attr('type', 'password');
      icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
  });
});
document.getElementById('submitBtn').addEventListener('click', function () {
      const emailInput = document.getElementById('email');
      const email = emailInput.value.trim();
      const feedback = emailInput.nextElementSibling;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

      if (!email || !emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        return;
      }

      emailInput.classList.remove('is-invalid');

      // Mở offcanvas
      const offcanvas = new bootstrap.Offcanvas('#Verifymail');
      offcanvas.show();
    });


