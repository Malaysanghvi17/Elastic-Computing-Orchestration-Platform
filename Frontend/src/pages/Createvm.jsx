// Home.js
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

function Createvm() {
  const [vmName, setVmName] = useState('');
  const [vmType, setVmType] = useState('linux');
  const [isoImage, setIsoImage] = useState('ubuntu');
  const [ram, setRam] = useState(1024);
  const [hardDriveSpace, setHardDriveSpace] = useState(10);
  const [networkAdapter, setNetworkAdapter] = useState('bridged');
  const [processorCores, setProcessorCores] = useState(1);
  const [isVMStarted, setIsVMStarted] = useState(false);
  const history = useHistory();
  var userid = 1;

  const handleSubmit = async () => {
    const vmData = {
      name: vmName,
      type: vmType,
      iso: isoImage,
      ram,
      hardDriveSpace,
      cpus: processorCores,
      networkAdapter,
    };
    let authtoken = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:7400/api/create-vm', vmData
      , {
        headers: {
          'auth-token': authtoken,
        },
      });
      console.log('Server Response:', response.data);
      setIsVMStarted(true);
    } catch (error) {
      console.error('Error sending VM data to the server:', error);
    }
  };

  return (
    <div className="page" style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '10px', margin: '10px' }}>
      <div>
        <h3 style={{ fontSize: '35px', color: 'black' }}>Create a Virtual Machine</h3>
        <br />
        <form>
          <label style={{ marginBottom: '5px', color: 'black', fontSize: '18px' }}>
            Name of VM:
            <input
              type="text"
              value={vmName}
              onChange={(e) => setVmName(e.target.value)}
              style={{ borderRadius: '5px', margin: '5px', padding: '2px', fontSize: '16px' }}
            />
          </label>
          <br />
          <br />
          
          <label style={{ marginBottom: '5px', color: 'black', fontSize: '18px' }}>
            Type of VM:
            <select value={vmType} onChange={(e) => setVmType(e.target.value)} style={{ borderRadius: '5px', margin: '5px', padding: '2px', fontSize: '16px' }}>
              <option value="linux">Linux</option>
              {/* Add other options as needed */}
            </select>
          </label>
          <br />
          <br />
          
          <label style={{ marginBottom: '5px', color: 'black', fontSize: '18px' }}>
            ISO Image:
            <select
              value={isoImage}
              onChange={(e) => setIsoImage(e.target.value)}
              style={{ borderRadius: '5px', margin: '10px', padding: '2px', fontSize: '16px' }}
            >
              <option value="puppylinux">puppylinux</option>
              <option value="raspbian os">raspbian os</option>
              <option value="ubuntu">Ubuntu</option>
              {/* Add other ISO options as needed */}
            </select>
          </label>
          <br />
          <br />
          
          <label style={{ marginBottom: '5px', color: 'black', fontSize: '18px' }}>
            RAM Allocated (MB):
            <input
              type="range"
              min={1024}
              max={4096}
              step={1}
              value={ram}
              onChange={(e) => setRam(Number(e.target.value))}
              style={{ borderRadius: '5px', margin: '10px', padding: '2px', fontSize: '16px' }}
            />
            {ram} GB
          </label>
          <br />
          <br />
          
          <label style={{ marginBottom: '5px', color: 'black', fontSize: '18px' }}>
            Virtual Hard Drive Space (GB):
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={hardDriveSpace}
              onChange={(e) => setHardDriveSpace(Number(e.target.value))}
              style={{ borderRadius: '5px', margin: '10px', padding: '2px', fontSize: '16px' }}
            />
            {hardDriveSpace} GB
          </label>
          <br />
          <br />
          
          <label style={{ marginBottom: '5px', color: 'black', fontSize: '18px' }}>
            Number of Processor Cores:
            <input
              type="range"
              min={1}
              max={4}
              step={1}
              value={processorCores}
              onChange={(e) => setProcessorCores(Number(e.target.value))}
              style={{ borderRadius: '5px', margin: '10px', padding: '2px', fontSize: '16px' }}
            />
            {processorCores} Cores
          </label>
          <br />
          <br />
          
          <label style={{ marginBottom: '5px', color: 'black', fontSize: '18px' }}>
            Network Adapter:
            <select
              value={networkAdapter}
              onChange={(e) => setNetworkAdapter(e.target.value)}
              style={{ borderRadius: '5px', margin: '10px', padding: '2px', fontSize: '16px' }}
            >
              <option value="bridged">Bridged</option>
              <option value="nat">NAT</option>
              {/* Add other network adapter options as needed */}
            </select>
          </label>
          <br />
          <br />
          
          <button type="button" onClick={handleSubmit} style={{ fontSize: '18px' }}>
            Create VM
          </button>
          <br />
          <br />
          
        </form>
      </div>
    </div>
  );
}

export default Createvm;
