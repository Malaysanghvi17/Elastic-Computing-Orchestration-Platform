const express = require('express');
const cors = require('cors');
const vbox = require('virtualbox');

const app = express();
const PORT = 7500;

app.use(cors());
app.use(express.json());

app.post('/api/create-vm', async (req, res) => {
    try {
        const { name, type, iso, ram, hardDriveSpace, networkAdapter } = req.body;

        // Specify the path for VM-related files in the D drive
        const dDrivePath = 'D:/VirtualBox VMs/';
        if (iso == "puppylinux") {
            var sourceVMName = "21BCP312_Puppy_Linux Full Clone";
        }

        // Clone VM using virtualbox library
        vbox.clone(sourceVMName, name, function (error) {
            if (error) {
                console.error('Error executing clone VM command:', error.message);
                res.status(500).send('Error executing clone VM command');
                return;
            }

            // Modify cloned VM settings (you may need to adjust this part)
            vbox.modify(name, {
                memory: ram,
                acpi: true,
                boot1: 'dvd',
                ostype: 'linux',
                nic1: networkAdapter,
            }, function (error) {
                if (error) {
                    console.error('Error executing modify VM command:', error.message);
                    res.status(500).send('Error executing modify VM command');
                    return;
                }

                // Attach storage to cloned VM (you may need to adjust this part)
                vbox.storagectl(name, 'IDE Controller', 'add', 'ide');
                vbox.storageattach(name, {
                    storagectl: 'IDE Controller',
                    port: 0,
                    device: 0,
                    type: 'hdd',
                    medium: `${dDrivePath}${name}.vdi`,
                });
                vbox.storageattach(name, {
                    storagectl: 'IDE Controller',
                    port: 1,
                    device: 0,
                    type: 'dvddrive',
                    medium: iso,
                });

                console.log('VM created successfully!');
                res.status(200).send('VM created successfully');
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

        // Start cloned VM in headless mode (you may need to adjust this part)
        vbox.start(name, function (error) {
            if (error) {
                console.error('Error executing start VM command:', error.message);
                res.status(500).send('Error executing start VM command');
                return;
            }

            console.log('VM started successfully!');
            res.status(200).send('VM started successfully');
        });
    } catch (error) {
        console.error('Error processing start VM request:', error.message);
        res.status(500).send('Error processing start VM request');
    }
});

app.post('/api/stop-vm', async (req, res) => {
    try {
        const { name } = req.body;

        // Stop cloned VM (you may need to adjust this part)
        vbox.stop(name, function (error) {
            if (error) {
                console.error('Error executing stop VM command:', error.message);
                res.status(500).send('Error executing stop VM command');
                return;
            }

            console.log('VM stopped successfully!');
            res.status(200).send('VM stopped successfully');
        });
    } catch (error) {
        console.error('Error processing stop VM request:', error.message);
        res.status(500).send('Error processing stop VM request');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
