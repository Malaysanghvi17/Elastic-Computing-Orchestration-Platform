import React, { useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import 'D:/AWT_project/clone2/Html-and-Terminal/Frontend/src/style.css'; 
import Navbar from './Components/navbar'
import Home from './pages/Home';
import CreatedVMs from './pages/Created_vms'
import Cmd from './pages/Cmd';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Createvm from './pages/Createvm';

function App() {
	const [light, setTheme] = useState(true);

	return (
		<React.Fragment>
			<button className="darkmode" onClick={(e) => {
				setTheme(!light);
				e.target.classList.toggle("dark-switch");
				e.target.textContent = light ? "Dark" : "Light";
			}}>
				{light ? "Dark" : "Light"}
			</button>

			<div className={`main ${light ? "light" : "dark"}`}>
				<Navbar />
				<Switch>
					<Route exact path='/' component={Home} />
					<Route exact path='/createvm' component={Createvm} />
					<Route exact path='/vmslist' component={CreatedVMs} />
					<Route exact path='/cmd' component={Cmd} />
					<Route exact path='/about' component={About} />
					<Route exact path='/login' component={Login} />
					<Route exact path='/signup' component={Signup} />
				</Switch>
			</div>
		</React.Fragment>
	);
}

export default App;