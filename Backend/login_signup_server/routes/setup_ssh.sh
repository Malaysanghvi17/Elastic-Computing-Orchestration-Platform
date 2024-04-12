#!/bin/bash

# Function to check if user has root privileges
isRoot() {
  if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root. Please use sudo."
    exit 1
  fi
}

# Check for root privileges
isRoot

# Backup the original sshd_config file (crucial)
echo "Creating backup of /etc/ssh/sshd_config..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Define the lines to be pasted
lines="
Include /etc/ssh/sshd_config.d/*.conf
PermitRootLogin Yes
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem        sftp    /usr/lib/openssh/sftp-server
"

# Overwrite the sshd_config file with the defined lines
echo "Overwriting /etc/ssh/sshd_config..."
echo -e "$lines" > /etc/ssh/sshd_config

# Inform user about the need to restart SSH service
echo "**WARNING:** The changes will NOT take effect until you restart the SSH service."
echo "**Recommended:** Use 'sudo systemctl restart sshd' (or appropriate command for your system)"

# Restart SSH service
echo "Restarting SSH service..."
service ssh restart

exit 0
