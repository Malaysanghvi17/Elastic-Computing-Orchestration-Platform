const express = require('express');
const { exec } = require('child_process');
const fetchuser = require('../middleware/fetchuser');
const Container = require('../models/containerschema');
const router = express.Router();

router.post('/create-vm', fetchuser, async (req, res) => {
    try {
        const { name, image = "ubuntu", ram, storage, cpus, password } = req.body;
        // Check the last registered container to determine the starting value for port numbers
        const lastContainer = await Container.findOne({}).sort({ port: -1 });
        let startingSSHPort = 2222;
        let startingHTTPPort = 8080;

        if (lastContainer) {
            startingSSHPort = lastContainer.sshPort + 1;
            startingHTTPPort = lastContainer.httpPort + 1;
        }

        
        // Send initial response to the client
        res.status(200).set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        
        // Create container with port forwarding
        const createContainerCommand = `docker run -it -d --name ${name} --memory=${ram}m --cpus=${cpus} -p ${startingSSHPort}:22 -p ${startingHTTPPort}:80 ${image}`;
        exec(createContainerCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing create container command:', error.message);
                res.write(`data: Error executing create container command: ${error.message}\n\n`);
                // res.end();
                // return;
            }
            console.log("docker container created successfully!");
            res.write(`${stdout} Docker container created!\n\n`);

            // Install SSH and generate key pairs inside the container
            exec(`docker exec ${name} apt update`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error updating package lists:', error.message);
                    res.write(`data: Error updating package lists: ${error.message}\n\n`);
                    // res.end();
                    // return;
                }
                console.log('Packages updated successfully!', stdout);
                res.write(`${stdout} Packages updated!\n\n`);

                exec(`docker exec ${name} apt install openssh-server -y`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error installing openssh-server:', error.message);
                        res.write(`data: Error installing openssh-server: ${error.message}\n\n`);
                        // res.end();
                        // return;
                    }
                    console.log('Some extra packages installed successfully:', stdout);
                    res.write(`${stdout} extra packages installed successfully!\n\n`);

                    exec(`docker exec ${name} sh -c "echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config"`, (error, stdout, stderr) => {
                        if (error) {
                            console.error('Error updating sshd_config:', error.message);
                            res.write(`data: Error updating sshd_config: ${error.message}\n\n`);
                            // res.end();
                            // return;
                        }
                        console.log('sshd_config updated successfully:', stdout);
                        res.write(`data: sshd_config updated!\n\n`);

                        exec(`docker exec ${name} sh -c "echo 'root:${password}' | chpasswd"`, (error, stdout, stderr) => {
                            if (error) {
                                console.error('Error updating root password:', error.message);
                                res.write(`data: Error updating root password: ${error.message}\n\n`);
                                // res.end();
                                // return;
                            }
                            console.log('Root password updated successfully:', stdout);
                            res.write(`data: Root password updated successfully!\n\n`);

                            // Stop the container
                            const stopContainerCommand = `docker stop ${name}`;
                            exec(stopContainerCommand, (error, stdout, stderr) => {
                                if (error) {
                                    console.error('Error stopping container:', error.message);
                                    res.write('container didnot stop due to some issue, try again!')
                                    // Handle error while stopping container
                                } else {
                                    console.log('Container stopped successfully:', stdout);
                                    res.write(`data: VM stopped, now you can start it and use it via ssh!\n\n`);
                                }
                                // res.end();
                            });
                        });
                    });
                });
            });

            // Save container details to the database
            const container = new Container({
                user: req.user.id,
                containerName: name,
                image: image,
                ram: ram,
                cpus: cpus,
                storage: "variable",
                sshPort: startingSSHPort,
                httpPort: startingHTTPPort,
                passwd: password
            });
            container.save();
            res.write('data of vm stored to the database!');
            res.end();
        });

    } catch (error) {
        console.error('Error processing create container request:', error.message);
        res.status(500).send('Error processing create container request');
    }
});

router.post('/start-vm', fetchuser, async (req, res) => {
    try {
        const { name } = req.body;
        const container = await Container.findOne({ containerName: name, user: req.user.id });
        let resport = container.sshPort;
        // Start container
        const startContainerCommand = `docker start ${name}`;
        exec(startContainerCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing start container command:', error.message);
                return res.status(500).send('Error executing start container command');
            }
            
            // Start SSH server inside the container
            const startSSHServerCommand = `docker exec ${name} service ssh start`;
            exec(startSSHServerCommand, async (error, stdout, stderr) => {
                if (error) {
                    console.error('Error starting SSH server:', error.message);
                    return res.status(500).send('Error starting SSH server');
                }
                
                console.log('Container started successfully with SSH server running');
                res.status(200).json({
                    message: 'Container started successfully with SSH server running',
                    containerName: name,
                    port: resport
                });
            });
        });
    } catch (error) {
        console.error('Error processing start container request:', error.message);
        res.status(500).send('Error processing start container request');
    }
});

router.get('/list-vms', fetchuser, async (req, res) => {
    try {
        // Fetch containers from the database based on the logged-in user
        const containers = await Container.find({ user: req.user.id });

        // Map container details to response format for each container
        const response = containers.map(container => ({
            name: container.containerName,
            GuestOs: container.image,
            cpus: container.cpus,
            memory: container.ram,
            storage: container.storage,
            sshport: container.sshPort,
            macaddress1: "-", // Placeholder value
        }));

        // Send the response with the array of container details
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching container list:', error.message);
        res.status(500).send('Error fetching container list');
    }
});


router.post('/stop-vm', fetchuser, async (req, res) => {
    try {
        const { name } = req.body;

        // Stop container
        const stopContainerCommand = `docker stop ${name}`;
        exec(stopContainerCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing stop container command:', error.message);
                res.status(500).send('Error executing stop container command');
                return;
            }

            console.log('Container stopped successfully:', stdout);
            res.status(200).send('Container stopped successfully');
        });
    } catch (error) {
        console.error('Error processing stop container request:', error.message);
        res.status(500).send('Error processing stop container request');
    }
});

router.post('/delete-vm', fetchuser, async (req, res) => {
    try {
        const { name } = req.body;

        // Remove container
        const deleteContainerCommand = `docker rm ${name}`;
        exec(deleteContainerCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing delete container command:', error.message);
                res.status(500).send('Error executing delete container command');
                return;
            }

            // Remove container from the database
            await Container.findOneAndDelete({ user: req.user.id, containerName: name });

            console.log('Container deleted successfully:', stdout);
            res.status(200).send('Container deleted successfully');
        });
    } catch (error) {
        console.error('Error processing delete container request:', error.message);
        res.status(500).send('Error processing delete container request');
    }
});

module.exports = router;
