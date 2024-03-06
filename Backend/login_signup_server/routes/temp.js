function parseVmInfo(vminfoOutput, property) {
    // Regular expression to match the property and extract the value
    const regex = new RegExp(`${property}:\\s*([^\\n]+)`);
  
    // Match the property in the vminfoOutput
    const match = vminfoOutput.match(regex);
  
    // If the property is found
    if (match && match[1]) {
      return match[1].trim();
    } else {
      // Property not found
      return null;
    }
  }
  
  // Example usage:
  const vminfoOutput = `
  Name:                        testvm3
  Encryption:     disabled
  Groups:                      /
  Guest OS:                    Ubuntu (64-bit)
  UUID:                        1955581b-48d3-44a4-9360-b3e626c4ce16
  Config file:                 D:\\VirtualBox VMs\\testvm3\\testvm3.vbox
  Snapshot folder:             D:\\VirtualBox VMs\\testvm3\\Snapshots
  Log folder:                  D:\\VirtualBox VMs\\testvm3\\Logs
  Hardware UUID:               1955581b-48d3-44a4-9360-b3e626c4ce16
  Memory size:                 2048MB
  Page Fusion:                 disabled
  VRAM size:                   16MB
  CPU exec cap:                100%
  HPET:                        disabled
  CPUProfile:                  host
  Chipset:                     piix3
  Firmware:                    BIOS
  `;
  
  const propertyToFind = "Guest OS";
  
  const result = parseVmInfo(vminfoOutput, propertyToFind);
  
  if (result !== null) {
    console.log(`${propertyToFind}: ${result}`);
  } else {
    console.log(`${propertyToFind} not found in vminfoOutput`);
  }
  