const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
var virtualbox = require('virtualbox');
const app = express();
const PORT = 7500;
const { execSync } = require('child_process');
app.use(cors());
app.use(express.json());

app.post('/api/create-vm', async (req, res) => {
    try {
        var { name, type, iso, ram, hardDriveSpace, cpus, networkAdapter } = req.body;
        // Specify the path for VM-related files in the D drive
        const dDrivePath = 'D:/VirtualBox VMs/';
        let sourceVMName = '';
        if (iso === "puppylinux") {
            sourceVMName = "21BCP312_Puppy_Linux Full Clone";
        } else if (iso === "ubuntu") {
            sourceVMName = "ubuntu_server";
        } else if (iso === "raspbian os") {
            sourceVMName = "Raspberry_pi_virtual_machine";
        }

        // Clone VM
        const cloneVMCommand = `VBoxManage clonevm "${sourceVMName}" --name "${name}" --register --basefolder "${dDrivePath}"`;
        exec(cloneVMCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing clone VM command:', error.message);
                res.status(500).send('Error executing clone VM command');
                return;
            }

            // Modify cloned VM settings
            const modifyVMCommand = `VBoxManage modifyvm "${name}" --memory ${ram} --cpus ${cpus} --acpi on --ostype "linux" --nic1 ${networkAdapter}`;
            exec(modifyVMCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing modify VM command:', error.message);
                    res.status(500).send('Error executing modify VM command');
                    return;
                }

                // Attach storage to cloned VM
                const createHDCommand = `VBoxManage createhd --filename "${dDrivePath}${name}.vdi" --size ${hardDriveSpace}`;
                const storageCtlCommand = `VBoxManage storagectl "${name}" --name "IDE Controller" --add ide`;
                const storageAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium "${dDrivePath}${name}.vdi"`;
                const isoAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 1 --device 0 --type dvddrive --medium ${iso}`;

                exec(createHDCommand, () => {
                    exec(storageCtlCommand, () => {
                        exec(storageAttachCommand, () => {
                            exec(isoAttachCommand, () => {
                                // Register VM
                                const registerVMCommand = `VBoxManage registervm "${dDrivePath}${name}/${name}.vbox"`;
                                exec(registerVMCommand, (error, stdout, stderr) => {
                                    if (error) {
                                        console.error('Error executing register VM command:', error.message);
                                        res.status(500).send('Error executing register VM command');
                                        return;
                                    }

                                    console.log('VM created and registered successfully:', stdout);
                                    res.status(200).send('VM created and registered successfully');
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error processing VM creation request:', error.message);
        res.status(500).send('Error processing VM creation request');
    }
});



// app.post('/api/create-vm', async (req, res) => {
//     try {
//         var { name, type, iso, ram, hardDriveSpace, cpus, networkAdapter } = req.body;
//         // Specify the path for VM-related files in the D drive
//         console.log(req.body)
//         const dDrivePath = 'D:/VirtualBox VMs/';
//         let sourceVMName = '';
//         if (iso === "puppylinux") {
//             sourceVMName = "21BCP312_Puppy_Linux Full Clone";
//         }
//         else if (iso === "ubuntu") {
//             sourceVMName = "ubuntu_server";
//             console.log(sourceVMName);
//         }
//         else if (iso === "raspbian os") {
//             sourceVMName = "Raspberry_pi_virtual_machine";
//             console.log(sourceVMName);
//         }
//         // Clone VM
//         const cloneVMCommand = `VBoxManage clonevm "${sourceVMName}" --name "${name}" --register --basefolder "${dDrivePath}"`;
//         exec(cloneVMCommand, (error, stdout, stderr) => {
//             if (error) {
//                 console.error('Error executing clone VM command:', error.message);
//                 res.status(500).send('Error executing clone VM command');
//                 return;
//             }

//             // Modify cloned VM settings
//             const modifyVMCommand = `VBoxManage modifyvm "${name}" --memory ${ram} --cpus ${cpus} --acpi on --ostype "linux" --nic1 ${networkAdapter}`;
//             exec(modifyVMCommand, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error('Error executing modify VM command:', error.message);
//                     res.status(500).send('Error executing modify VM command');
//                     return;
//                 }
//                 console.log('VM created successfully:', stdout);
                
//                 // Attach storage to cloned VM
//                 const createHDCommand = `VBoxManage createhd --filename "${dDrivePath}${name}.vdi" --size ${hardDriveSpace}`;
//                 const storageCtlCommand = `VBoxManage storagectl "${name}" --name "IDE Controller" --add ide`;
//                 const storageAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium "${dDrivePath}${name}.vdi"`;
//                 const isoAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 1 --device 0 --type dvddrive --medium ${iso}`;

//                 exec(createHDCommand, () => {
//                     exec(storageCtlCommand, () => {
//                         exec(storageAttachCommand, () => {
//                             exec(isoAttachCommand, () => {
//                                 console.log('VM created successfully:', stdout);
//                                 res.status(200).send('VM created successfully');
//                             });
//                         });
//                     });
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Error processing VM creation request:', error.message);
//         res.status(500).send('Error processing VM creation request');
//     }
// });


// Function to parse VM info output and extract a specific property
function parseVmInfo(vmInfoOutput, property) {
    const regex = new RegExp(`${property}=(.+)`);
    const match = vmInfoOutput.match(regex);
    return match ? match[1].trim() : null;
}

app.get('/api/list-vms', async (req, res) => {
    try {
        // Execute the "VBoxManage list vms" command to get a list of VMs
        const listVMsCommand = 'VBoxManage list vms';
        const vmListOutput = execSync(listVMsCommand, { encoding: 'utf-8' });

        // Split the output into lines and extract VM names
        const vmNames = vmListOutput.split('\n').map(line => {
            const match = line.match(/"([^"]+)"/);
            return match ? match[1] : null;
        }).filter(Boolean);

        // Fetch additional details for each VM using "VBoxManage showvminfo"
        const vmsList = vmNames.map(vmName => {
            const showVMInfoCommand = `VBoxManage showvminfo "${vmName}" --machinereadable`;
            const vmInfoOutput = execSync(showVMInfoCommand, { encoding: 'utf-8' });

            // Parse the output to extract relevant details
            const details = {
                name: vmName,
                cpus: parseVmInfo(vmInfoOutput, 'cpus'),
                memory: parseVmInfo(vmInfoOutput, 'memory'),
                bridgeadapter1: parseVmInfo(vmInfoOutput, 'bridgeadapter1'),
                macaddress1: parseVmInfo(vmInfoOutput, 'macaddress1'),
                // Add more properties as needed
            };
            console.log(details);
            return details;
        });

        res.status(200).json(vmsList);
    } catch (error) {
        console.error('Error fetching VM list:', error.message);
        res.status(500).send('Error fetching VM list');
    }
});

app.post('/api/stop-vm', async (req, res) => {
    try {
        const { name } = req.body;

        // Implement logic to stop the VM with the given name
        const stopVMCommand = `VBoxManage controlvm "${name}" poweroff`;
        exec(stopVMCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing stop VM command:', error.message);
                res.status(500).send('Error executing stop VM command');
                return;
            }

            console.log('VM stopped successfully:', stdout);
            res.status(200).send('VM stopped successfully');
        });
    } catch (error) {
        console.error('Error processing stop VM request:', error.message);
        res.status(500).send('Error processing stop VM request');
    }
});

app.post('/api/delete-vm', async (req, res) => {
    try {
        const { name } = req.body;

        // Implement logic to delete the VM with the given name
        const deleteVMCommand = `VBoxManage unregistervm "${name}" --delete`;
        exec(deleteVMCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing delete VM command:', error.message);
                res.status(500).send('Error executing delete VM command');
                return;
            }

            console.log('VM deleted successfully:', stdout);
            res.status(200).send('VM deleted successfully');
        });
    } catch (error) {
        console.error('Error processing delete VM request:', error.message);
        res.status(500).send('Error processing delete VM request');
    }
});

app.post('/api/start-vm', async (req, res) => {
    try {
        const { name } = req.body;

        // Start VM
        const startVMCommand = `VBoxManage startvm "${name}" --type headless`;
        exec(startVMCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing start VM command:', error.message);
                res.status(500).send('Error executing start VM command');
                return;
            }

            console.log('VM started successfully:', stdout);
            res.status(200).send('VM started successfully');
        });
    } catch (error) {
        console.error('Error processing start VM request:', error.message);
        res.status(500).send('Error processing start VM request');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
