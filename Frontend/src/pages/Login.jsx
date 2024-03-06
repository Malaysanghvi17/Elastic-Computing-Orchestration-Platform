import React, { useState } from 'react';
import { user_login } from '../context/middleware'


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlelogin = (event) => {

    user_login(event, email, password); //call this function from middleware.js for api request
    // Clear the input fields
    setEmail('');
    setPassword('');
  }



  const onChangeHandler = (event) => {
    console.log('on change handler');

    if (event.target.id === 'exampleInputEmail1') {
      setEmail(event.target.value);
    } else if (event.target.id === 'exampleInputPassword1') {
      setPassword(event.target.value);
    }
  };

  return (
    <>
      <form style={{ border: '1px solid #ccc', borderRadius: "5px", padding: '10px', margin: '10px'}}>
        <br />
        <br />
        <h2>Login</h2>
        <br />
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
          <input type="email" className="form-control" id="exampleInputEmail1" value={email} onChange={onChangeHandler} aria-describedby="emailHelp" />
          <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
          <input type="password" className="form-control" id="exampleInputPassword1" value={password} onChange={onChangeHandler} />
        </div>
        <div className="mb-3 form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1" />
          <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
        </div>
        <button type="submit" className="btn btn-primary" onClick={handlelogin}>Login</button>
      </form>
    </>
  );
}

export default Login;
