import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const VMList = () => {
  const [vms, setVMs] = useState([]);
  let authtoken = localStorage.getItem('token');
  const history = useHistory();
  useEffect(() => {
    const fetchVMs = async () => {
      try {
        const response = await axios.get('http://localhost:7400/api/list-vms', {
          headers: {
            'auth-token': authtoken,
          },
        });
        console.log(response);
        setVMs(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching VM list:', error.message);
      }
    };

    fetchVMs();
  }, [authtoken]);

  const startVM = async (name) => {
    try {
      await axios.post(
        'http://localhost:7400/api/start-vm',
        { name },
        {
          headers: {
            'auth-token': authtoken,
          },
        }
      );
      history.push('/cmd');
    } catch (error) {
      console.error('Error starting VM:', error.message);
    }
  };

  const stopVM = async (name) => {
    try {
      console.log('VM Name:', name);
      await axios.post(
        'http://localhost:7400/api/stop-vm',
        { name },
        {
          headers: {
            'auth-token': authtoken,
          },
        }
      );
      // Refresh the VM list after stopping the VM
      // You may want to implement this based on your backend response structure
    } catch (error) {
      console.error('Error stopping VM:', error.message);
    }
  };

  const deleteVM = async (name) => {
    try {
      await axios.post(
        'http://localhost:7400/api/delete-vm',
        { name },
        {
          headers: {
            'auth-token': authtoken,
          },
        }
      );
      window.location.reload();
    } catch (error) {
      console.error('Error deleting VM:', error.message);
    }
  };

  return (
    <div>
      <h2 style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', margin: '10px', marginLeft: '10px' }}>VM List</h2>
      {vms.map((vm) => (
        <div key={vm.name} style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px', margin: '10px' }}>
          <h3>{vm.name}</h3>
          <p>Guest os type: {vm.GuestOs}</p>
          <p>CPU: {vm.cpus}</p>
          <p>RAM: {vm.memory}</p>
          <p>Storage: {vm.storage}</p>
          <p>ssh port: {vm.sshport}</p>
          <p>MAC Address: {vm.macaddress1}</p>
          {/* Add more details as needed */}
          <button onClick={() => startVM(vm.name)} style={{ border: '3px solid black', padding: '2px', margin: '5px', marginLeft: '0px' }}>Start</button>
          <button onClick={() => stopVM(vm.name)} style={{ border: '3px solid black', padding: '2px', margin: '5px', marginLeft: '0px' }}>Stop</button>
          <button onClick={() => deleteVM(vm.name)} style={{ border: '3px solid black', padding: '2px', margin: '5px', marginLeft: '0px' }}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default VMList;


// // VMList.js
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const VMList = () => {
//   const [vms, setVMs] = useState([]);

//   useEffect(() => {
//     // Fetch the list of VMs from the server
//     const fetchVMs = async () => {
//       try {
//         const response = await axios.get('http://localhost:7500/api/list-vms');
//         console.log(response)
//         setVMs(response.data);
//       } catch (error) {
//         console.error('Error fetching VM list:', error.message);
//       }
//     };

//     fetchVMs();
//   }, []);

//   const startVM = async (name) => {
//     try {
//       await axios.post('http://localhost:7500/api/start-vm', { name });
//       // Refresh the VM list after starting the VM
//       // You may want to implement this based on your backend response structure
//     } catch (error) {
//       console.error('Error starting VM:', error.message);
//     }
//   };

//   const stopVM = async (name) => {
//     try {
//       await axios.post('http://localhost:7500/api/stop-vm', { name });
//       // Refresh the VM list after stopping the VM
//       // You may want to implement this based on your backend response structure
//     } catch (error) {
//       console.error('Error stopping VM:', error.message);
//     }
//   };

//   const deleteVM = async (name) => {
//     try {
//       await axios.post('http://localhost:7500/api/delete-vm', { name });
//       // Refresh the VM list after deleting the VM
//       // You may want to implement this based on your backend response structure
//     } catch (error) {
//       console.error('Error deleting VM:', error.message);
//     }
//   };

//   return (
//     <div>
//       <h2 style={{ border: '1px solid #ccc', padding: '10px', borderRadius: "5px", margin: '10px', marginLeft: '10px' }}>VM List</h2>
//       {vms.map((vm) => (
//         <div key={vm.name} style={{ border: '1px solid #ccc', borderRadius: "5px", padding: '10px', margin: '10px' }}>
//           <h3>{vm.name}</h3>
//           <p>CPU: {vm.cpus}</p>
//           <p>RAM: {vm.memory}</p>
//           <p>Bridge Adapter: {vm.bridgeadapter1}</p>
//           <p>MAC Address: {vm.macaddress1}</p>
//           {/* Add more details as needed */}
//           <button onClick={() => startVM(vm.name)} style={{ border: '3px solid black', padding: '2px', margin: '5px', marginLeft: '0px' }}>Start</button>
//           <button onClick={() => stopVM(vm.name)} style={{ border: '3px solid black', padding: '2px', margin: '5px' , marginLeft: '0px' }}>Stop</button>
//           <button onClick={() => deleteVM(vm.name)} style={{ border: '3px solid black', padding: '2px', margin: '5px' , marginLeft: '0px' }}>Delete</button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default VMList;
