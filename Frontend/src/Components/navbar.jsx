import React from 'react'
import {NavLink} from 'react-router-dom'

class Navbar extends React.Component {
    render() {
        return (
            <div className="nav" >
                <div className="subdiv">
                    <span className="logo" title="> Run" > &gt;&nbsp;Run</span>
                    <span className="navlink">
                        <NavLink exact className="link" activeClassName="active" to="/">Home</NavLink>
                        <NavLink exact className="link" activeClassName="active" to="/createvm">Create vms</NavLink>
                        <NavLink exact className="link" activeClassName="active" to="/vmslist">your Vms</NavLink>
                        <NavLink className="link" activeClassName="active" to="/cmd">Terminal</NavLink>
                        <NavLink className="link" activeClassName="active" to="/about">About</NavLink>
                        <NavLink className="link" activeClassName="active" to="/login">Login</NavLink>
                        <NavLink className="link" activeClassName="active" to="/signup">Signup</NavLink>
                    </span>
                </div>
            </div>
        );
    }
}

export default Navbar;
