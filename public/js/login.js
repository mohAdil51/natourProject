const loginFn = async (email, password) => {
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
      alert('Logged in successfuly!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  loginFn(email, password);
});
