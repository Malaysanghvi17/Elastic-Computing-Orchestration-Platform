// server.js - Main application file
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');
const k8s = require('@kubernetes/client-node');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Configure middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Kubernetes client
const kc = new k8s.KubeConfig();
kc.loadFromDefault(); // Will use ~/.kube/config or in-cluster config

const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);

// WebSocket server for pod shell access
const wss = new WebSocket.Server({ server });

// Helper function to validate user access to namespace
async function validateNamespaceAccess(namespace, userId) {
  try {
    // In a real app, you would check if the user has access to this namespace
    // For demo purposes, we'll just check if the namespace exists
    await k8sCoreApi.readNamespace(namespace);
    return true;
  } catch (err) {
    console.error(`Error validating namespace access: ${err.message}`);
    return false;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * @api {post} /api/pods Create a new pod
 * @apiDescription Create a new pod in the specified namespace
 * @apiBody {String} namespace User's namespace
 * @apiBody {String} podName Name for the new pod
 * @apiBody {String} imageName Docker image name
 * @apiBody {String} cpuLimit CPU limit (e.g. "500m")
 * @apiBody {String} memoryLimit Memory limit (e.g. "512Mi")
 * @apiBody {Number} port Port to expose
 * @apiBody {String} protocol Protocol (TCP/UDP)
 * @apiBody {String} userId User ID for authorization
 */
app.post('/api/pods', async (req, res) => {
  try {
    const { 
      namespace, 
      podName, 
      imageName, 
      cpuLimit, 
      memoryLimit, 
      port, 
      protocol, 
      userId 
    } = req.body;

    // Validate required fields
    if (!namespace || !podName || !imageName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate user has access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // Create pod specification
    const podSpec = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: podName,
        namespace: namespace,
        labels: {
          app: podName,
          createdBy: userId
        }
      },
      spec: {
        containers: [{
          name: podName,
          image: imageName,
          resources: {
            limits: {
              cpu: cpuLimit || '500m',
              memory: memoryLimit || '512Mi'
            }
          },
          ports: [{
            containerPort: port || 80,
            protocol: protocol || 'TCP'
          }]
        }]
      }
    };

    // Create the pod
    const response = await k8sCoreApi.createNamespacedPod(namespace, podSpec);
    res.status(201).json({
      message: 'Pod created successfully',
      pod: {
        name: response.body.metadata.name,
        namespace: response.body.metadata.namespace,
        status: response.body.status
      }
    });
  } catch (err) {
    console.error(`Error creating pod: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @api {get} /api/pods/:namespace List all pods in a namespace
 * @apiDescription Get all pods in the specified namespace
 * @apiParam {String} namespace User's namespace
 * @apiQuery {String} userId User ID for authorization
 */
app.get('/api/pods/:namespace', async (req, res) => {
  try {
    const { namespace } = req.params;
    const { userId } = req.query;
    
    // Validate user has access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // List all pods in the namespace
    const response = await k8sCoreApi.listNamespacedPod(namespace);
    
    // Format the response
    const pods = response.body.items.map(pod => ({
      name: pod.metadata.name,
      status: pod.status.phase,
      image: pod.spec.containers[0].image,
      createdAt: pod.metadata.creationTimestamp
    }));

    res.status(200).json({ pods });
  } catch (err) {
    console.error(`Error listing pods: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @api {delete} /api/pods/:namespace/:podName Delete a pod
 * @apiDescription Delete a pod in the specified namespace
 * @apiParam {String} namespace User's namespace
 * @apiParam {String} podName Name of the pod to delete
 * @apiQuery {String} userId User ID for authorization
 */
app.delete('/api/pods/:namespace/:podName', async (req, res) => {
  try {
    const { namespace, podName } = req.params;
    const { userId } = req.query;
    
    // Validate user has access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // Delete the pod
    await k8sCoreApi.deleteNamespacedPod(podName, namespace);
    res.status(200).json({ message: `Pod ${podName} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting pod: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @api {post} /api/loadbalancers Create a load balancer
 * @apiDescription Create a load balancer that targets multiple pods
 * @apiBody {String} namespace User's namespace
 * @apiBody {String} name Name for the load balancer
 * @apiBody {Array} podSelectors Array of pod names or labels to target
 * @apiBody {Number} port Port to expose
 * @apiBody {String} protocol Protocol (TCP/UDP)
 * @apiBody {String} userId User ID for authorization
 */
app.post('/api/loadbalancers', async (req, res) => {
  try {
    const { namespace, name, podSelectors, port, protocol, userId } = req.body;
    
    // Validate required fields
    if (!namespace || !name || !podSelectors || !podSelectors.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate user has access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // Create selector for target pods
    const selectorLabels = {};
    if (typeof podSelectors === 'string') {
      // Single selector (app name)
      selectorLabels.app = podSelectors;
    } else if (Array.isArray(podSelectors)) {
      // Handle array of pod names by creating a selector that matches any of them
      // For simplicity, we'll use the 'app' label we set when creating pods
      if (podSelectors.length === 1) {
        selectorLabels.app = podSelectors[0];
      } else {
        // For multiple pods, create a service that selects them all
        // This is a simplified approach - in real world you'd use proper label selectors
        selectorLabels.app = podSelectors[0];
      }
    }

    // Create service (load balancer) spec
    const serviceSpec = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: name,
        namespace: namespace
      },
      spec: {
        selector: selectorLabels,
        ports: [{
          port: port || 80,
          targetPort: port || 80,
          protocol: protocol || 'TCP'
        }],
        type: 'LoadBalancer'
      }
    };

    // Create the service
    const response = await k8sCoreApi.createNamespacedService(namespace, serviceSpec);
    
    res.status(201).json({
      message: 'Load balancer created successfully',
      service: {
        name: response.body.metadata.name,
        namespace: response.body.metadata.namespace,
        selector: response.body.spec.selector,
        type: response.body.spec.type,
        ports: response.body.spec.ports
      }
    });
  } catch (err) {
    console.error(`Error creating load balancer: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @api {get} /api/loadbalancers/:namespace List all load balancers in a namespace
 * @apiDescription Get all load balancers in the specified namespace
 * @apiParam {String} namespace User's namespace
 * @apiQuery {String} userId User ID for authorization
 */
app.get('/api/loadbalancers/:namespace', async (req, res) => {
  try {
    const { namespace } = req.params;
    const { userId } = req.query;
    
    // Validate user has access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // List all services in the namespace
    const response = await k8sCoreApi.listNamespacedService(namespace);
    
    // Filter for LoadBalancer type services
    const loadBalancers = response.body.items
      .filter(service => service.spec.type === 'LoadBalancer')
      .map(service => ({
        name: service.metadata.name,
        externalIP: service.status.loadBalancer.ingress 
          ? service.status.loadBalancer.ingress[0].ip 
          : 'Pending',
        ports: service.spec.ports,
        selector: service.spec.selector,
        createdAt: service.metadata.creationTimestamp
      }));

    res.status(200).json({ loadBalancers });
  } catch (err) {
    console.error(`Error listing load balancers: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @api {delete} /api/loadbalancers/:namespace/:name Delete a load balancer
 * @apiDescription Delete a load balancer in the specified namespace
 * @apiParam {String} namespace User's namespace
 * @apiParam {String} name Name of the load balancer to delete
 * @apiQuery {String} userId User ID for authorization
 */
app.delete('/api/loadbalancers/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const { userId } = req.query;
    
    // Validate user has access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // Delete the service
    await k8sCoreApi.deleteNamespacedService(name, namespace);
    res.status(200).json({ message: `Load balancer ${name} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting load balancer: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// WebSocket handler for pod shell access
wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  let podExec = null;
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle initial connection setup
      if (data.type === 'init') {
        const { namespace, podName, userId, container } = data;
        
        // Validate user has access to namespace
        const hasAccess = await validateNamespaceAccess(namespace, userId);
        if (!hasAccess) {
          ws.send(JSON.stringify({ type: 'error', message: 'Access denied to namespace' }));
          ws.close();
          return;
        }
        
        // Create an exec instance into the specified pod
        const exec = new k8s.Exec(kc);
        
        // Set up options for the exec command
        const options = {
          command: ['/bin/sh'],
          container: container || undefined,
          stdout: true,
          stderr: true,
          stdin: true,
          tty: true
        };
        
        // Execute command in the pod
        podExec = await exec.exec(namespace, podName, options.container, options.command, 
          process.stdout, process.stderr, process.stdin, options.tty);
        
        // Handle stdout data from the pod
        podExec.stdout.on('data', (data) => {
          ws.send(JSON.stringify({ type: 'stdout', data: data.toString() }));
        });
        
        // Handle stderr data from the pod
        podExec.stderr.on('data', (data) => {
          ws.send(JSON.stringify({ type: 'stderr', data: data.toString() }));
        });
        
        // Handle exec close
        podExec.on('close', (code) => {
          ws.send(JSON.stringify({ type: 'close', code }));
        });
        
        // Handle exec error
        podExec.on('error', (err) => {
          ws.send(JSON.stringify({ type: 'error', message: err.message }));
        });
        
        // Send confirmation to client
        ws.send(JSON.stringify({ type: 'connected', message: `Connected to pod ${podName}` }));
      }
      // Handle command execution
      else if (data.type === 'command') {
        if (!podExec) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not connected to a pod' }));
          return;
        }
        
        // Send command to pod's stdin
        podExec.stdin.write(data.command + '\n');
      }
    } catch (err) {
      console.error(`WebSocket error: ${err.message}`);
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }
  });
  
  // Handle WebSocket close
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (podExec) {
      try {
        podExec.kill();
      } catch (err) {
        console.error(`Error killing pod exec: ${err.message}`);
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing