import axios from 'axios';
// import { useNavigate } from 'react-router';
const host = "http://localhost:7400";



export const user_login = async (event, email, password) => {
  event.preventDefault();

  console.log('Analyse button clicked');

  try {
    const response = await fetch(`${host}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const { success, authtoken } = await response.json();
    console.log(authtoken);
    console.log(success);

    if (success) {
      localStorage.setItem('token', authtoken);
      console.log("user authenticated!")
      alert("user authenticated, login successful!");
      window.location.reload();
      window.location.assign('/')
    } else {
      alert("invalid credentials!");
      console.log("invalid credentials!")
      throw new Error('Form submission failed.');
    }
  } catch (error) {
    console.error(error);
  }
};



export const user_signin = async (event, name, email, password) => {
  event.preventDefault();

  console.log('Analyse button clicked');

  try {
    const response = await fetch('http://localhost:7400/api/auth/createuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const { success, authtoken } = await response.json();
    console.log(authtoken);
    console.log(success);

    if (success) {
      localStorage.setItem('token', authtoken);
      console.log("user signedin!")
      alert("Signin Successful!");
      window.location.reload();
      window.location.assign('/')
    } else {
      console.log("email already exist!")
      throw new Error('Form submission failed.');
    }
  } catch (error) {
    console.error(error);
  }
};



export const fetchUser = async (authtoken) => {
  try {
    const response = await axios.post(
      'http://localhost:7400/api/auth/getuser',
      {},
      {
        headers: {
          'auth-token': authtoken,
        },
      }
    );
    console.log(response.data.name)
    return response.data.name;
  } catch (error) {
    console.error(error);
  }
};

