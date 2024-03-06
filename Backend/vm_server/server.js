const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 7500;

app.use(cors());
app.use(express.json());

app.post('/api/create-vm', async (req, res) => {
    try {
        var { name, type, iso, ram, hardDriveSpace, networkAdapter } = req.body;

        // Specify the path for VM-related files in the D drive
        const dDrivePath = 'D:/VirtualBox VMs/';
        if(iso == "puppylinux"){
            iso = "D:/puppy_linux_vmbox/puppy_linux_iso/fossapup64-9.5.iso"
        }
        // Create VM
        const createVMCommand = `VBoxManage createvm --name "${name}" --register --basefolder "${dDrivePath}"`;
        exec(createVMCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing create VM command:', error.message);
                res.status(500).send('Error executing create VM command');
                return;
            }

            // Modify VM settings
            const modifyVMCommand = `VBoxManage modifyvm "${name}" --memory ${ram} --acpi on --boot1 dvd --ostype "linux" --nic1 ${networkAdapter}`;
            exec(modifyVMCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error executing modify VM command:', error.message);
                    res.status(500).send('Error executing modify VM command');
                    return;
                }

                // Attach storage
                const createHDCommand = `VBoxManage createhd --filename "${dDrivePath}${name}.vdi" --size ${hardDriveSpace}`;
                const storageCtlCommand = `VBoxManage storagectl "${name}" --name "IDE Controller" --add ide`;
                const storageAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium "${dDrivePath}${name}.vdi"`;
                const isoAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 1 --device 0 --type dvddrive --medium ${iso}`;

                exec(createHDCommand, () => {
                    exec(storageCtlCommand, () => {
                        exec(storageAttachCommand, () => {
                            exec(isoAttachCommand, () => {
                                console.log('VM created successfully:', stdout);
                                res.status(200).send('VM created successfully');
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

app.post('/api/start-vm', async (req, res) => {
    try {
        const { name } = req.body;

        // Start VM in headless mode
        const startVMCommand = `VBoxHeadless --startvm "${name}" --vrde off`;
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
