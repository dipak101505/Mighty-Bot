document.addEventListener('DOMContentLoaded', () => {
  // Show login form by default
  new Promise((resolve, reject) => {
    chrome.storage.local.get(['authToken'], function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  })
    .then((result) => {
      console.log(result);
      if (result.authToken) {
        showForm('logout-form');
      } else {
        showForm('login-form');
      }
    })
    .catch((error) => {
      console.error('Error retrieving authToken:', error.message);
      showForm('login-form');
    });

  // Add event listeners for form toggles
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('register-form');
  });

  document.getElementById('show-recover').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('password-recovery-form');
  });

  document
    .getElementById('show-login-from-register')
    .addEventListener('click', (e) => {
      e.preventDefault();
      showForm('login-form');
    });

  document
    .getElementById('show-login-from-recover')
    .addEventListener('click', (e) => {
      e.preventDefault();
      showForm('login-form');
    });

  // Form submission handlers
  document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    fetch('https://35.208.215.114/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify JSON data
      },
      body: JSON.stringify({ email, password }), // Send data in the body
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.userId) {
          chrome.storage.local.set({ authToken: data.token }, function () {
            console.log('Value is set');
          });

          localStorage.setItem('authToken', data.token);
          const forms = document.querySelectorAll('.form-container');
          forms.forEach((form) => (form.style.display = 'none'));
          showForm('logout-form');
          document.getElementById('login-email').value = '';
          document.getElementById('login-password').value = '';
          error.style.display = 'none';
          // Redirect or show logged-in user interface
        } else {
          error.textContent = data.message;
          error.style.display = 'block';
          setTimeout(() => {
            error.style.display = 'none';
          }, 2000);
        }
      })
      .catch(() => {
        error.textContent = 'An error occurred during login.';
        error.style.display = 'block';
        setTimeout(() => {
          error.style.display = 'none';
        }, 2000);
      });
  });

  document.getElementById('register').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const error = document.getElementById('signup-error');
    if (password !== confirmPassword) {
      error.textContent = 'Passwords do not match!';
      error.style.display = 'block';
      return;
    }

    fetch('https://35.208.215.114/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify JSON data
      },
      body: JSON.stringify({ email, password }), // Send data in the body
    })
      .then((data) => data.json())
      .then((Data) => {
        console.log(Data);
        if (Data.userId) {
          document.getElementById('register-email').value = '';
          document.getElementById('register-password').value = '';
          document.getElementById('confirm-password').value = '';
          showForm('login-form');
        } else {
          error.textContent = data.message;
          error.style.display = 'block';
          setTimeout(() => {
            error.style.display = 'none';
          }, 2000);
        }
      })
      .catch(() => {
        error.textContent = 'Error while registration!';
        error.style.display = 'block';
        document.getElementById('register-password').value = '';
        document.getElementById('confirm-password').value = '';
        setTimeout(() => {
          error.style.display = 'none';
        }, 2000);
      });
  });

  document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();

    chrome.storage.local.remove('authToken', function () {
      if (chrome.runtime.lastError) {
        console.error(
          'Error clearing authToken:',
          chrome.runtime.lastError.message
        );
      } else {
        console.log('authToken cleared from local storage');
        localStorage.removeItem('authToken');

        showForm('login-form');
      }
    });
  });

  document.getElementById('logs').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `https://mightybot.web.app/` });
  });

  document
    .getElementById('recover-password')
    .addEventListener('submit', (e) => {
      e.preventDefault();
      // Handle password recovery
      alert('Password recovery form submitted');
    });
});

function showForm(formId) {
  const forms = document.querySelectorAll('.form-container');
  forms.forEach((form) => (form.style.display = 'none'));
  document.getElementById(formId).style.display = 'block';
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'pageLoaded') {
    chrome.storage.local.get(['authToken'], function (result) {
      if (chrome.runtime.lastError) {
        console.error(
          'Error retrieving authToken:',
          chrome.runtime.lastError.message
        );
        return;
      }

      if (result.authToken) {
        fetch(
          `https://35.208.215.114/save/${encodeURIComponent(message.url)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${result.authToken}`, // Add auth token to header
            },
          }
        );
        console.log('Auth token retrieved:', result.authToken);
      } else {
        console.log('Auth token not found in local storage.');
      }
    });

    return true;
  }
});
