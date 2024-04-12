const express = require('express');
const { exec } = require('child_process');
const vmschema = require('../models/vmschema');
const User = require('../models/user');
const fetchuser = require('../middleware/fetchuser');
const { execSync } = require('child_process');
const { parse } = require('path');

const router = express.Router();

router.post('/create-vm', fetchuser, async (req, res) => {
    try {
        const { name, iso, ram, hardDriveSpace, cpus } = req.body;
        // Specify the path for VM-related files in the D drive
        const dDrivePath = 'D:/VirtualBox VMs/';
        let sourceVMName = '';

        if (iso === 'puppylinux') {
            sourceVMName = '21BCP312_Puppy_Linux Full Clone';
        } else if (iso === 'ubuntu') {
            sourceVMName = 'ubuntu_server';
        } else if (iso === 'raspbian os') {
            sourceVMName = 'Raspberry_pi_virtual_machine';
        }

        // Check the last registered VM to determine the starting value for vmPort
        const lastVM = await vmschema.findOne({}).sort({ vmPort: -1 });
        let startingPort = 22;

        if (lastVM) {
            startingPort = lastVM.vmPort + 1;
        }

        // Increment the vmPort value for each new VM
        const vmPort = startingPort;

        // Clone VM
        const cloneVMCommand = `VBoxManage clonevm "${sourceVMName}" --name "${name}" --register --basefolder "${dDrivePath}"`;
        exec(cloneVMCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing clone VM command:', error.message);
                res.status(500).send('Error executing clone VM command');
                return;
            }

            // Modify cloned VM settings
            const modifyVMCommand = `VBoxManage modifyvm "${name}" --memory ${ram} --cpus ${cpus} --acpi on --ostype "linux" --nic1 nat`;
            exec(modifyVMCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing modify VM command:', error.message);
                    res.status(500).send('Error executing modify VM command');
                    return;
                }

                // Attach storage to cloned VM
                const createHDCommand = `VBoxManage createhd --filename "${dDrivePath}${name}.vdi" --size ${hardDriveSpace*1000}`;
                const storageCtlCommand = `VBoxManage storagectl "${name}" --name "IDE Controller" --add ide`;
                const storageAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium "${dDrivePath}${name}.vdi"`;
                const isoAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 1 --device 0 --type dvddrive --medium ${iso}`;

                exec(createHDCommand, () => {
                    exec(storageCtlCommand, () => {
                        exec(storageAttachCommand, () => {
                            exec(isoAttachCommand, () => {
                                // Port forwarding
                                const portForwardingCommand = `VBoxManage modifyvm "${name}" --natpf1 "ssh,tcp,,${vmPort},,22"`;
                                exec(portForwardingCommand, async (pfError, pfStdout, pfStderr) => {
                                    if (pfError) {
                                        console.error('Error executing port forwarding command:', pfError.message);
                                        res.status(500).send('Error executing port forwarding command');
                                        return;
                                    }

                                    // Save VM details to the database
                                    const vmscha = new vmschema({
                                        user: req.user.id,
                                        vmName: name,
                                        vmPort: vmPort,
                                    });

                                    const savedVM = await vmscha.save();

                                    console.log('VM created and registered successfully:', savedVM);
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

// Function to parse VM info output and extract a specific property
function parseVmInfo(vmInfoOutput, property) {
    const regex = new RegExp(`${property}=(.+)`);
    const match = vmInfoOutput.match(regex);
    return match ? match[1].trim() : null;
}



router.get('/list-vms', fetchuser, async (req, res) => {
    try {
        console.log(req.user.id);
        const vmsList = await vmschema.find({ user: req.user.id });
        console.log(vmsList)
        // Fetch additional details for each VM using "VBoxManage showvminfo"
        const detailedVmsList = await Promise.all(
            vmsList.map(async (vmsList) => {
                const showVMInfoCommand = `VBoxManage showvminfo "${vmsList.vmName}" --machinereadable`;
                const vmInfoOutput = execSync(showVMInfoCommand, { encoding: 'utf-8' });
                // Parse the output to extract relevant details
                return {
                    name: vmsList.vmName,
                    GuestOs: parseVmInfo(vmInfoOutput, 'ostype'),
                    cpus: parseVmInfo(vmInfoOutput, 'cpus'),
                    memory: parseVmInfo(vmInfoOutput, 'memory'),
                    bridgeadapter1: parseVmInfo(vmInfoOutput, 'bridgeadapter1'),
                    macaddress1: parseVmInfo(vmInfoOutput, 'macaddress1'),
                    // Add more properties as needed
                };
            })
        );

        res.status(200).json(detailedVmsList);
    } catch (error) {
        console.error('Error fetching VM list:', error.message);
        res.status(500).send('Error fetching VM list');
    }
});

router.post('/stop-vm', fetchuser, async (req, res) => {
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

router.post('/delete-vm', fetchuser, async (req, res) => {
    try {
        const { name } = req.body;

        // Implement logic to delete the VM with the given name
        const deleteVMCommand = `VBoxManage unregistervm "${name}" --delete`;
        exec(deleteVMCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing delete VM command:', error.message);
                res.status(500).send('Error executing delete VM command');
                return;
            }

            // Remove VM from the database
            await vmschema.findOneAndDelete({ user: req.user.id, vmName: name }); // Update field name to vmName

            console.log('VM deleted successfully:', stdout);
            res.status(200).send('VM deleted successfully');
        });
    } catch (error) {
        console.error('Error processing delete VM request:', error.message);
        res.status(500).send('Error processing delete VM request');
    }
});


router.post('/start-vm', fetchuser, async (req, res) => {
    try {
        const { name } = req.body;
        console.log('Received VM Name:', name);
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

module.exports = router;
