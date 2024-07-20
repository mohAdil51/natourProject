import { loginFn, logOut } from './login';
import { displayLocations } from './mapBox';
import { updateSettings } from './updateSettings';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');
const loginForm = document.querySelector('.form-login');
const userUpdateData = document.querySelector('.form-user-data');
const userUpdatePass = document.querySelector('.form-user-settings');

// DELEGETION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayLocations(locations);
}

if (logOutBtn) logOutBtn.addEventListener('click', logOut);

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginFn(email, password);
  });
}

if (userUpdateData) {
  userUpdateData.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    updateSettings({ name, email }, 'data');
  });
}

if (userUpdatePass) {
  userUpdatePass.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.save--new--password').textContent = 'Updating...';

    const password = document.getElementById('password-current').value;
    const newpassword = document.getElementById('password').value;
    const newconfirmPassword =
      document.getElementById('password-confirm').value;

    // we can not use "value" to change the content of HTML element, for that we use innerHTML or textContent
    // we said await only for it to finish, so we can do other stuff
    await updateSettings(
      { password, newpassword, newconfirmPassword },
      'password'
    );
    document.querySelector('.save--new--password').textContent =
      'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
