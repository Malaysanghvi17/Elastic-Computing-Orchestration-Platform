// router.post('/create-vm', fetchuser, async (req, res) => {
//     try {
//         const { name, type, iso, ram, hardDriveSpace, cpus, networkAdapter } = req.body;
//         // Specify the path for VM-related files in the D drive
//         const dDrivePath = 'D:/VirtualBox VMs/';
//         let sourceVMName = '';

//         if (iso === 'puppylinux') {
//             sourceVMName = '21BCP312_Puppy_Linux Full Clone';
//         } else if (iso === 'ubuntu') {
//             sourceVMName = 'ubuntu_server';
//         } else if (iso === 'raspbian os') {
//             sourceVMName = 'Raspberry_pi_virtual_machine';
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

//                 // Attach storage to cloned VM
//                 const createHDCommand = `VBoxManage createhd --filename "${dDrivePath}${name}.vdi" --size ${hardDriveSpace}`;
//                 const storageCtlCommand = `VBoxManage storagectl "${name}" --name "IDE Controller" --add ide`;
//                 const storageAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium "${dDrivePath}${name}.vdi"`;
//                 const isoAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 1 --device 0 --type dvddrive --medium ${iso}`;

//                 exec(createHDCommand, () => {
//                     exec(storageCtlCommand, () => {
//                         exec(storageAttachCommand, () => {
//                             exec(isoAttachCommand, () => {
//                                 // Check if the VM is already registered
//                                 const listVMsCommand = 'VBoxManage list vms';
//                                 exec(listVMsCommand, async (listError, listStdout, listStderr) => {
//                                     if (listError) {
//                                         console.error('Error executing list VMs command:', listError.message);
//                                         res.status(500).send('Error executing list VMs command');
//                                         return;
//                                     }

//                                     // Parse the list of VMs to check if the desired VM is already registered
//                                     const isVMRegistered = listStdout.includes(`"${name}"`);

//                                     if (isVMRegistered) {
//                                         console.error('VM with the same name is already registered:', name);
//                                         // Save VM details to the database
//                                         console.log(req.user.id);
//                                         const usertemp = await User.findById(req.user.id);
//                                         console.log(usertemp);
//                                         // Save VM details to the database
//                                         const vmscha = new vmschema({
//                                             user: usertemp, // Use the correct user ID here
//                                             vmName: name,
//                                         });

//                                         const savedVM = await vmscha.save();

//                                         res.status(400).send('VM with the same name is already registered');
//                                         return;
//                                     }

//                                     // If not registered, continue with the innermost registration statement
//                                     const registerVMCommand = `VBoxManage registervm "${dDrivePath}${name}/${name}.vbox"`;
//                                     exec(registerVMCommand, async (registerError, registerStdout, registerStderr) => {
//                                         if (registerError) {
//                                             console.error('Error executing register VM command:', registerError.message);
//                                             res.status(500).send('Error executing register VM command');
//                                             return;
//                                         }

//                                         console.log(req.user.id);
//                                         const usertemp = await User.findById(req.user.id);
//                                         console.log(usertemp);
//                                         // Save VM details to the database
//                                         const vmscha = new vmschema({
//                                             user: usertemp, // Use the correct user ID here
//                                             vmName: name,
//                                         });

//                                         const savedVM = await vmscha.save();


//                                         console.log('VM created and registered successfully:', savedVM);
//                                         res.status(200).send('VM created and registered successfully');
//                                     });
//                                 });
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

// router.post('/create-vm', fetchuser, async (req, res) => {
//     try {
//         const { name, type, iso, ram, hardDriveSpace, cpus, networkAdapter } = req.body;
//         // Specify the path for VM-related files in the D drive
//         const dDrivePath = 'D:/VirtualBox VMs/';
//         let sourceVMName = '';

//         if (iso === 'puppylinux') {
//             sourceVMName = '21BCP312_Puppy_Linux Full Clone';
//         } else if (iso === 'ubuntu') {
//             sourceVMName = 'ubuntu_server';
//         } else if (iso === 'raspbian os') {
//             sourceVMName = 'Raspberry_pi_virtual_machine';
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

//                 // Attach storage to cloned VM
//                 const createHDCommand = `VBoxManage createhd --filename "${dDrivePath}${name}.vdi" --size ${hardDriveSpace}`;
//                 const storageCtlCommand = `VBoxManage storagectl "${name}" --name "IDE Controller" --add ide`;
//                 const storageAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium "${dDrivePath}${name}.vdi"`;
//                 const isoAttachCommand = `VBoxManage storageattach "${name}" --storagectl "IDE Controller" --port 1 --device 0 --type dvddrive --medium ${iso}`;

//                 exec(createHDCommand, () => {
//                     exec(storageCtlCommand, () => {
//                         exec(storageAttachCommand, () => {
//                             exec(isoAttachCommand, () => {
//                                 // Register VM
//                                 const registerVMCommand = `VBoxManage registervm "${dDrivePath}${name}/${name}.vbox"`;
//                                 exec(registerVMCommand, async (error, stdout, stderr) => {
//                                     if (error) {
//                                         console.error('Error executing register VM command:', error.message);
//                                         res.status(500).send('Error executing register VM command');
//                                         return;
//                                     }

//                                     // Save VM details to the database
//                                     const vmscha = new vmschema({
//                                         user: req.user.id,
//                                         name,
//                                         // Add other fields as needed
//                                     });                            

//                                     const savedVM = await vmscha.save();

//                                     console.log('VM created and registered successfully:', savedVM);
//                                     res.status(200).send('VM created and registered successfully');
//                                 });
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

// router.post('/create-vm', fetchuser, async (req, res) => {
//     try {
//         const { name, image = "ubuntu", ram, storage, cpus, password } = req.body;
//         // Check the last registered container to determine the starting value for port numbers
//         const lastContainer = await Container.findOne({}).sort({ port: -1 });
//         let startingSSHPort = 2222;
//         let startingHTTPPort = 8080;

//         if (lastContainer) {
//             startingSSHPort = lastContainer.sshPort + 1;
//             startingHTTPPort = lastContainer.httpPort + 1;
//         }

//         // Create container with port forwarding
//         const createContainerCommand = `docker run -it -d --name ${name} --memory=${ram}m --cpus=${cpus} -p ${startingSSHPort}:22 -p ${startingHTTPPort}:80 ${image}`;
//         exec(createContainerCommand, (error, stdout, stderr) => {
//             if (error) {
//                 console.error('Error executing create container command:', error.message);
//                 res.status(500).send('Error executing create container command');
//                 return;
//             }

//             // Install SSH and generate key pairs inside the container
//             const installAndGenerateSSHCommand = `
//                 docker exec ${name} apt update && \
//                 docker exec ${name} apt install openssh-server -y && \
//                 docker exec ${name} ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa -N "" -y && \
//                 docker exec ${name} echo 'PermitRootLogin yes' | tee -a /etc/ssh/sshd_config &&\
//                 docker exec ${name} echo username:${password} | chpasswd
//             `;
//             exec(installAndGenerateSSHCommand, async (error, stdout, stderr) => {
//                 if (error) {
//                     console.error('Error installing SSH and generating SSH keys:', error.message);
//                     return res.status(500).send('Error installing SSH and generating SSH keys');
//                 }
//                 console.log('Container created successfully with SSH installed and SSH keys generated:', stdout);
                
//                 // Save container details to the database
//                 const container = new Container({
//                     user: req.user.id,
//                     containerName: name,
//                     image: image,
//                     ram: ram,
//                     cpus: cpus,
//                     storage: "variable",
//                     sshPort: startingSSHPort,
//                     httpPort: startingHTTPPort,
//                     passwd: password
//                 });
//                 container.save();

//                 console.log('Container created successfully:', stdout);
//                 res.status(200).send('Container created successfully');

//                 // Stop the container
//                 const stopContainerCommand = `docker stop ${name}`;
//                 exec(stopContainerCommand, (error, stdout, stderr) => {
//                     if (error) {
//                         console.error('Error stopping container:', error.message);
//                         // Handle error while stopping container
//                     } else {
//                         console.log('Container stopped successfully:', stdout);
//                     }
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Error processing create container request:', error.message);
//         res.status(500).send('Error processing create container request');
//     }
// });

// router.post('/create-vm', fetchuser, async (req, res) => {
//     try {
//         const { name, image = "ubuntu", ram, storage, cpus, password } = req.body;
//         // Check the last registered container to determine the starting value for port numbers
//         const lastContainer = await Container.findOne({}).sort({ port: -1 });
//         let startingSSHPort = 2222;
//         let startingHTTPPort = 8080;

//         if (lastContainer) {
//             startingSSHPort = lastContainer.sshPort + 1;
//             startingHTTPPort = lastContainer.httpPort + 1;
//         }

//         // Create container with port forwarding
//         const createContainerCommand = `docker run -it -d --name ${name} --memory=${ram}m --cpus=${cpus} -p ${startingSSHPort}:22 -p ${startingHTTPPort}:80 ${image}`;
//         exec(createContainerCommand, (error, stdout, stderr) => {
//             if (error) {
//                 console.error('Error executing create container command:', error.message);
//                 res.status(500).send('Error executing create container command');
//                 return;
//             }
//             else{
//                 console.log("docker container created successfully!");
//                 res.status(200).send('docker container created successfully!');
//             }
//             // Install SSH and generate key pairs inside the container
//             exec(`docker exec ${name} apt update`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error('Error updating package lists:', error.message);
//                     return res.status(500).send('Error updating package lists', error.message);
//                 }
//                 else{
//                     console.log('Packages updated successfully!', stdout);
//                     res.status(200).send('Packages updated successfully!', stdout);
//                 }

//                 exec(`docker exec ${name} apt install openssh-server -y`, (error, stdout, stderr) => {
//                     if (error) {
//                         console.error('Error installing openssh-server:', error.message);
//                         return res.status(500).send('Error installing openssh-server', error.message);
//                     }
//                     else{
//                         console.log('some extra packages installed successfully:', stdout);
//                         res.status(200).send('Packages installed successfully!', stdout);
//                     }

//                     // exec(`docker exec ${name} ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa -N "" -y`, (error, stdout, stderr) => {
//                     //     if (error) {
//                     //         console.error('Error generating SSH keys:', error.message);
//                     //         return res.status(500).send('Error generating SSH keys');
//                     //     }
//                     //     console.log('SSH keys generated successfully:', stdout);

//                         exec(`docker exec ${name} sh -c "echo 'PermitRootLogin yes' >> /etc/ssh/sshd_config"`, (error, stdout, stderr) => {
//                             if (error) {
//                                 console.error('Error updating sshd_config:', error.message);
//                                 return res.status(500).send('Error updating sshd_config');
//                             }
//                             else{
//                                 console.log('sshd_config updated successfully:', stdout);
//                                 res.status(200).send('sshd_config updated successfully', stdout);
//                             }
//                             console.log('sshd_config updated successfully:', stdout);

//                             exec(`docker exec ${name} sh -c "echo 'root:${password}' | chpasswd"`, (error, stdout, stderr) => {
//                                 if (error) {
//                                     console.error('Error updating root password:', error.message);
//                                     return res.status(500).send('Error updating root password');
//                                 }
//                                 console.log('Root password updated successfully:', stdout);
//                                 res.status(200).send('Password updated and Virtual machine created successfully');

//                                 // Stop the container
//                                 const stopContainerCommand = `docker stop ${name}`;
//                                 exec(stopContainerCommand, (error, stdout, stderr) => {
//                                     if (error) {
//                                         console.error('Error stopping container:', error.message);
//                                         // Handle error while stopping container
//                                     } else {
//                                         console.log('Container stopped successfully:', stdout);
//                                         res.status(200).send('VM stopped, now you can start it and use it via ssh!');
//                                     }
//                                 });
//                             });
//                         });
//                     // });
//                 });
//             });
//             // Save container details to the database
//             const container = new Container({
//                 user: req.user.id,
//                 containerName: name,
//                 image: image,
//                 ram: ram,
//                 cpus: cpus,
//                 storage: "variable",
//                 sshPort: startingSSHPort,
//                 httpPort: startingHTTPPort,
//                 passwd: password
//             });
//             container.save();

//         });

//     } catch (error) {
//         console.error('Error processing create container request:', error.message);
//         res.status(500).send('Error processing create container request');
//     }
// });