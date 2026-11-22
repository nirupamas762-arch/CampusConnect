document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const authContainer = document.getElementById('authNavContainer');
  const loginModal = document.getElementById('loginModal');
  const closeLoginBtn = document.getElementById('closeLoginBtn');
  const authForm = document.getElementById('authForm');
  const forgotForm = document.getElementById('forgotForm');
  const authModalTitle = document.getElementById('authModalTitle');
  const authModalDesc = document.getElementById('authModalDesc');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const toggleAuthModeBtn = document.getElementById('toggleAuthMode');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordContainer = document.getElementById('forgotPasswordLinkContainer');
  const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
  const emailGroup = document.getElementById('emailGroup');
  const toast = document.getElementById('toast');

  // Set date constraints: Minimum date is today (Prevents choosing past dates)
  const regDateField = document.getElementById('regDate');
  if (regDateField) {
    const today = new Date().toISOString().split('T')[0];
    regDateField.setAttribute('min', today);
  }

  // Toast Helper
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // Hamburger Toggle for Mobile
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('show');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navLinks.classList.remove('show');
      });
    });
  }

  // --- Auth Modal Mode: 'login', 'signup', or 'forgot' ---
  let authMode = 'login';

  function setAuthMode(mode) {
    authMode = mode;
    if (mode === 'signup') {
      authForm.style.display = 'flex';
      forgotForm.style.display = 'none';
      authModalTitle.textContent = "Create New Account";
      authModalDesc.textContent = "Register with a unique username, valid email, and secure password.";
      authSubmitBtn.textContent = "Create Account";
      toggleAuthModeBtn.innerHTML = "Already have an account? <strong>Login</strong>";
      forgotPasswordContainer.style.display = 'none';
      confirmPasswordGroup.style.display = 'block';
      emailGroup.style.display = 'block';
      document.getElementById('authEmail').required = true;
      document.getElementById('authConfirmPassword').required = true;
    } else if (mode === 'login') {
      authForm.style.display = 'flex';
      forgotForm.style.display = 'none';
      authModalTitle.textContent = "Login to Your Account";
      authModalDesc.textContent = "Enter your verified username and password to continue.";
      authSubmitBtn.textContent = "Login";
      toggleAuthModeBtn.innerHTML = "Don't have an account? <strong>Sign Up</strong>";
      forgotPasswordContainer.style.display = 'block';
      confirmPasswordGroup.style.display = 'none';
      emailGroup.style.display = 'none';
      document.getElementById('authEmail').required = false;
      document.getElementById('authConfirmPassword').required = false;
    } else if (mode === 'forgot') {
      authForm.style.display = 'none';
      forgotForm.style.display = 'flex';
      authModalTitle.textContent = "Reset Password";
      authModalDesc.textContent = "Verify your account username and email to create a new password.";
      toggleAuthModeBtn.innerHTML = "Remembered credentials? <strong>Login</strong>";
      forgotPasswordContainer.style.display = 'none';
    }
  }

  if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (authMode === 'login') setAuthMode('signup');
      else setAuthMode('login');
    });
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      setAuthMode('forgot');
    });
  }

  // Open & Close Auth Modal
  function openAuthModal(mode = 'login', customDesc = '') {
    setAuthMode(mode);
    if (customDesc) authModalDesc.textContent = customDesc;
    if (loginModal) loginModal.classList.add('active');
  }

  function closeAuthModal() {
    if (loginModal) loginModal.classList.remove('active');
    if (authForm) authForm.reset();
    if (forgotForm) forgotForm.reset();
  }

  if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeAuthModal);
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeAuthModal();
  });

  // --- Dynamic Navbar State (Login / Logout) ---
  function updateNavbarAuth() {
    if (!authContainer) return;
    const sessionUser = JSON.parse(localStorage.getItem('currentSession') || 'null');

    if (sessionUser) {
      authContainer.innerHTML = `
        <a href="profile.html" class="nav-user-link">
          <i class="fa-solid fa-circle-user"></i> ${sessionUser.username}
        </a>
        <button id="globalLogoutBtn" class="btn-secondary nav-logout-btn">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      `;

      document.getElementById('globalLogoutBtn').addEventListener('click', () => {
        localStorage.removeItem('currentSession');
        showToast('Logged out successfully!');
        setTimeout(() => { window.location.href = 'index.html'; }, 600);
      });
    } else {
      authContainer.innerHTML = `
        <button id="profileNavBtn" class="btn-orange nav-btn">
          <i class="fa-solid fa-user"></i> Profile
        </button>
      `;

      document.getElementById('profileNavBtn').addEventListener('click', () => {
        openAuthModal('login', 'Please log in to view and manage your profile.');
      });
    }
  }
  updateNavbarAuth();

  // --- Strict Account Authentication (Login & Signup) ---
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('authUsername').value.trim();
      const password = document.getElementById('authPassword').value;
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      if (authMode === 'signup') {
        const email = document.getElementById('authEmail').value.trim();
        const confirmPassword = document.getElementById('authConfirmPassword').value;

        if (password !== confirmPassword) {
          showToast('Passwords do not match! Please check.');
          return;
        }

        // Prevent taking existing username
        const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
        if (userExists) {
          showToast('Username already taken. Please choose another.');
          return;
        }

        // Prevent taking existing email
        const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          showToast('Email already registered. Please login instead.');
          return;
        }

        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));

        localStorage.setItem('currentSession', JSON.stringify({ username, email }));
        showToast(`Account created! Welcome, ${username}.`);
        closeAuthModal();
        processPendingBooking(newUser);
      } else {
        // Mode: Login
        const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!existingUser) {
          showToast('Account not found! Please create an account.');
          setAuthMode('signup');
          return;
        }

        if (existingUser.password !== password) {
          showToast('Incorrect password! Access denied.');
          return;
        }

        localStorage.setItem('currentSession', JSON.stringify({
          username: existingUser.username,
          email: existingUser.email
        }));

        showToast(`Welcome back, ${existingUser.username}!`);
        closeAuthModal();
        processPendingBooking(existingUser);
      }
    });
  }

  // --- Forgot Password Recovery Form ---
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('forgotUsername').value.trim();
      const email = document.getElementById('forgotEmail').value.trim();
      const newPassword = document.getElementById('forgotNewPassword').value;
      const confirmPassword = document.getElementById('forgotConfirmPassword').value;

      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match!');
        return;
      }

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userIndex = users.findIndex(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.email.toLowerCase() === email.toLowerCase()
      );

      if (userIndex === -1) {
        showToast('No account matches that username and email combination.');
        return;
      }

      // Update password
      users[userIndex].password = newPassword;
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      showToast('Password updated successfully! Please login.');
      setAuthMode('login');
    });
  }

  // Process any booking saved in memory after logging in
  function processPendingBooking(userObj) {
    const pending = sessionStorage.getItem('pendingBooking');
    if (pending) {
      const bookingData = JSON.parse(pending);
      bookingData.username = userObj.username;
      bookingData.email = userObj.email;

      const currentList = JSON.parse(localStorage.getItem('userBookings') || '[]');
      currentList.push(bookingData);
      localStorage.setItem('userBookings', JSON.stringify(currentList));
      sessionStorage.removeItem('pendingBooking');
    }

    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 700);
  }

  // Auto-Select Category on Registration Page via URL Query
  const regCategorySelect = document.getElementById('regCategory');
  if (regCategorySelect) {
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event') || params.get('cat');
    if (eventParam) {
      for (let i = 0; i < regCategorySelect.options.length; i++) {
        if (regCategorySelect.options[i].value.toLowerCase().includes(eventParam.toLowerCase())) {
          regCategorySelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  // Lock and populate attendee identity strictly from authenticated session
  const regNameInput = document.getElementById('regName');
  const regEmailInput = document.getElementById('regEmail');
  const authNotice = document.getElementById('authNotice');
  const lockedUserDisplay = document.getElementById('lockedUserDisplay');
  const sessionUser = JSON.parse(localStorage.getItem('currentSession') || 'null');

  if (sessionUser && regNameInput && regEmailInput) {
    regNameInput.value = sessionUser.username;
    regEmailInput.value = sessionUser.email;
    regNameInput.readOnly = true;
    regEmailInput.readOnly = true;
    if (authNotice && lockedUserDisplay) {
      lockedUserDisplay.textContent = `${sessionUser.username} (${sessionUser.email})`;
      authNotice.style.display = 'flex';
    }
  }

  // --- Registration Form Submission ---
  const regForm = document.getElementById('regForm');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const category = document.getElementById('regCategory').value;
      const eventDate = document.getElementById('regDate').value;

      // Systematic Date Validation: Today or Future Dates Only
      const selected = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        showToast('Invalid date! Events can only be booked for today or future dates.');
        return;
      }

      const activeSession = JSON.parse(localStorage.getItem('currentSession') || 'null');

      // Intercept if guest is not logged in
      if (!activeSession) {
        sessionStorage.setItem('pendingBooking', JSON.stringify({ category, eventDate }));
        openAuthModal('signup', 'Strict Authentication Required: Please create an account or login to confirm your booking.');
        return;
      }

      // Save strictly to the verified account
      const newBooking = {
        username: activeSession.username,
        email: activeSession.email,
        category: category,
        eventDate: eventDate
      };

      const currentList = JSON.parse(localStorage.getItem('userBookings') || '[]');
      currentList.push(newBooking);
      localStorage.setItem('userBookings', JSON.stringify(currentList));

      showToast(`Booking confirmed for ${category}! Opening profile...`);
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 800);
    });
  }

  // Contact Form
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fbName').value;
      showToast(`Thank you, ${name}! Your feedback has been received.`);
      feedbackForm.reset();
    });
  }

  // Details Modal logic in categories.html
  const detailsModal = document.getElementById('detailsModal');
  const closeDetailsBtn = document.getElementById('closeDetailsBtn');
  const detailsTitle = document.getElementById('detailsTitle');
  const detailsBody = document.getElementById('detailsBody');
  const detailsBookBtn = document.getElementById('detailsBookBtn');
  const detailTriggers = document.querySelectorAll('.modal-trigger');

  if (detailTriggers.length > 0 && detailsModal) {
    detailTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        const desc = btn.getAttribute('data-details');
        detailsTitle.textContent = title;
        detailsBody.textContent = desc;
        if (detailsBookBtn) {
          detailsBookBtn.href = `register.html?event=${encodeURIComponent(title)}`;
        }
        detailsModal.classList.add('active');
      });
    });
  }

  if (closeDetailsBtn && detailsModal) {
    closeDetailsBtn.addEventListener('click', () => detailsModal.classList.remove('active'));
  }
});