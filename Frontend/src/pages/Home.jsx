// Home.js
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

function CmdAnime() {
  return (
    <div className="cmd-anime" style={{ borderRadius: '10px', padding: '5px', margin: '10px' }}>
      <div className="draw">
        <h6>&gt; echo hello, hi </h6>
        <h6>&gt; hello, hi</h6>
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="welcome" style={{ borderRadius: '10px', padding: '5px', margin: '10px' }}>
      <div className="center">
        <h3>Welcome to &gt; Run</h3>
        <p>Control your server using the terminal</p>
        <Link to="/createvm">
          <button className="btn btn-primary">
            Get Started &nbsp;
            <i className="fa fa-arrow-right"></i>
          </button>
        </Link>
      </div>
    </div>
  );
}

function Home() {
   return (
    <div className="page">
      <CmdAnime />
      <Welcome />
    </div>
  );
}

export default Home;
