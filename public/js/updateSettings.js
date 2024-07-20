import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? 'http://127.0.0.1:3000/api/v3/users/updateMe'
        : 'http://127.0.0.1:3000/api/v3/users/updatemypassword';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    const msg =
      type === 'data'
        ? 'DATA updatd successfuly'
        : 'PASSWORD updatd successfuly';

    if (res.data.status === 'success') showAlert('success', msg);

    // if (res.data.status === 'success') {
    //   showAlert('success', 'Personal information updatd successfuly');
    //   window.setTimeout(() => {
    //     location.reload(true);
    //   }, 1500);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
