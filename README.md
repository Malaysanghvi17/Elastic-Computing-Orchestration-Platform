# Elastic Computing Orchestration Platform

A web-based platform for creating, managing, and interacting with virtual computing instances(PODS). It leverages Kubernetes for container management, load balancing, and auto-scaling. This platform allows users to create, manage, and delete pods and services like load balancer and provides shell access of the pods to the users via web interface.

## Features

- **Create and Manage Containers**: Define container specs like image, CPU, RAM, and ports.
- **Kubernetes Management**: Kubernetes handles deployments and pods automatically.
- **Load Balancers**: Create and manage load balancers for high availability.
- **SSH Access**: Users can interact with their virtual instances via an integrated terminal using **node-pty**.
- **Namespace Isolation**: Users' clusters are isolated using **Minikube** to ensure security and separation.

## Tech Stack

- **Frontend**: Angular
- **Backend**: Node.js
- **Container Management**: Kubernetes
- **Database**: MongoDB

## Installation

To run this project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/Malaysanghvi17/Elastic-Computing-Orchestration-Platform.git
    cd Elastic-Computing-Orchestration-Platform
    ```

2. Install backend dependencies:

    ```bash
    cd backend
    npm install
    ```

3. Install frontend dependencies:

    ```bash
    cd frontend
    npm install
    ```

4. Start MongoDB locally or set up a MongoDB cloud instance.

5. Configure Kubernetes using Minikube or set up a cloud Kubernetes service.

6. Run the backend and frontend servers.

    - For backend:

      ```bash
      cd backend
      npm start
      ```

    - For frontend:

      ```bash
      cd frontend
      ng serve
      ```

## Usage

1. Open the application in your browser at `http://localhost:4200/`.
2. Use the dashboard to create, manage, and interact with virtual instances.
3. Access terminals for your containers via the web interface.

# Working Photos of the Project:
1. Dashboard, for creating pods:
![image](https://github.com/user-attachments/assets/ad21f001-31b9-4f7c-8808-4063c5616b18)

2. Show existing pods:
![image](https://github.com/user-attachments/assets/4a7bfb9a-1146-4819-bba4-332a81661e39)

3. Select existing pods and apply Load Balancer to it:
![image](https://github.com/user-attachments/assets/06f5a5ed-6d88-43ca-a8d4-8cdfde19d8b2)

4. A load balancer is created and user can get IP of the load balancer to excess the service:
![image](https://github.com/user-attachments/assets/44b0db09-aa76-45e9-9c39-02af99a7800f)

5. The load balancer works, it redirects the requests to different webservers:
![image](https://github.com/user-attachments/assets/65d55378-5989-4ede-8164-6b334b05f97a)
![image](https://github.com/user-attachments/assets/a7abc870-0190-4ae4-99e9-8bbc8c7bb6ac)

6. user can connect to the shell of an existing pod:
![image](https://github.com/user-attachments/assets/b76a0e78-e63b-4efe-aed1-585a35d33b5c)
![image](https://github.com/user-attachments/assets/c837c827-61a4-40c8-84e2-67d8816a6be1)
