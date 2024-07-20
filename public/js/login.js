import axios from 'axios';
import { showAlert } from './alert';

export const loginFn = async (email, password) => {
  try {
    console.log(`Logging in with email: ${email}, password: ${password}`);
    const res = await axios({
      // here we send our request
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v3/users/login',
      data: {
        email,
        password,
      },
      headers: {
        'Content-Security-Policy':
          "connect-src 'self' https://cdnjs.cloudflare.com",
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfuly!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v3/users/logout',
    });

    if (res.data.status === 'success') location.assign('/');
  } catch (err) {
    showAlert('error', 'Logging out faild, please try again!');
  }
};
