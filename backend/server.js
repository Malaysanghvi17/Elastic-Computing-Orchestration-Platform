// server.js - Main application file
const stream = require('stream');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { exec, spawn } = require('child_process');
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

const k8sCoreApi = kc.makeApiClient(k8s.CoreV1Api);

// WebSocket server for pod shell access
const wss = new WebSocket.Server({ server });

// Helper function to validate user access to namespace
async function validateNamespaceAccess(namespace, userId) {
  try {
    // In a real app, you would check if the user has access to this namespace
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
    console.log(namespace, podSpec);
    const response = await k8sCoreApi.createNamespacedPod(namespace, podSpec);
    console.log("pod creation: ", response);
    
    res.status(201).json({
      message: 'Pod created successfully',
      pod: {
        name: response.body.metadata.name,
        namespace: response.body.metadata.namespace,
        status: response.body.status
      }
    });
  } catch (err) {
    console.error(`Error creating pod: ${JSON.stringify(err.response?.body) || err.message}`);
    console.error(`Error creating pod err: ${err.message}`);
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

    // Log the request for debugging
    console.log(`Load balancer creation request:`, {
      namespace,
      name,
      podCount: podSelectors?.length || 0,
      port,
      protocol
    });
    
    // Validate required fields
    if (!namespace || !name) {
      return res.status(400).json({ error: 'Missing namespace or name' });
    }
    
    if (!Array.isArray(podSelectors) || podSelectors.length === 0) {
      return res.status(400).json({ error: 'podSelectors must be a non-empty array of pod names' });
    }
    
    // Validate k8s API connection
    try {
      await k8sCoreApi.getAPIResources();
      console.log('Kubernetes API connection validated');
    } catch (apiErr) {
      console.error(`Kubernetes API connection error: ${apiErr.message}`);
      return res.status(500).json({ 
        error: 'Failed to connect to Kubernetes API',
        details: apiErr.message
      });
    }

    // Check access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // Assign a common label to all selected pods
    const commonLabelKey = 'load-balancer-group';
    const commonLabelValue = name;
    
    // Track any pod patching failures
    const patchResults = [];

    // Apply labels to all pods first
    for (const podName of podSelectors) {
      try {
        // Check if pod exists first and get current pod data
        const existingPod = await k8sCoreApi.readNamespacedPod(podName, namespace);
        console.log(`Found pod ${podName}, proceeding to patch`);
        
        // Get existing labels or initialize empty object
        const existingLabels = existingPod.body.metadata.labels || {};
        
        // Patch each pod with the common label - using strategic merge patch
        const patchBody = {
          metadata: {
            labels: {
              ...existingLabels,  // Keep existing labels
              [commonLabelKey]: commonLabelValue
            }
          }
        };

        // Try different patch strategies if one fails
        try {
          console.log(`Attempting to patch pod ${podName} with merge-patch strategy`);
          const patchResult = await k8sCoreApi.patchNamespacedPod(
            podName,
            namespace,
            patchBody,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              headers: { 'Content-Type': 'application/merge-patch+json' }
            }
          );
          console.log(`Successfully patched pod ${podName}`);
        } catch (patchErr) {
          console.log(`Merge-patch failed for pod ${podName}, trying strategic-merge-patch strategy`);
          // Try strategic merge patch as fallback
          const strategicPatchResult = await k8sCoreApi.patchNamespacedPod(
            podName,
            namespace,
            patchBody,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              headers: { 'Content-Type': 'application/strategic-merge-patch+json' }
            }
          );
          console.log(`Successfully patched pod ${podName} with strategic-merge-patch`);
        }
        
        patchResults.push({ podName, success: true });
      } catch (podErr) {
        // More detailed error logging
        console.error(`Error patching pod ${podName}: ${podErr.message}`);
        if (podErr.response && podErr.response.body) {
          console.error(`Response details: ${JSON.stringify(podErr.response.body)}`);
        }
        
        // Try an alternative approach - full replacement
        try {
          console.log(`Attempting alternative patching approach for pod ${podName}`);
          
          // Get the full pod definition
          const pod = await k8sCoreApi.readNamespacedPod(podName, namespace);
          
          // Update the labels directly
          pod.body.metadata.labels = {
            ...(pod.body.metadata.labels || {}),
            [commonLabelKey]: commonLabelValue
          };
          
          // Replace the pod
          await k8sCoreApi.replaceNamespacedPod(podName, namespace, pod.body);
          console.log(`Successfully updated pod ${podName} using replace method`);
          patchResults.push({ podName, success: true, method: 'replace' });
        } catch (replaceErr) {
          console.error(`All methods failed for pod ${podName}: ${replaceErr.message}`);
          patchResults.push({ 
            podName, 
            success: false, 
            error: `Multiple methods failed: ${podErr.message}; Replace error: ${replaceErr.message}`
          });
        }
      }
    }

    // Check if any pods were successfully patched
    const successfulPatches = patchResults.filter(result => result.success);
    if (successfulPatches.length === 0) {
      return res.status(400).json({ 
        error: 'Failed to patch any pods', 
        details: patchResults 
      });
    }

    // Now create the LoadBalancer service using that label
    const serviceSpec = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: name,
        namespace: namespace,
        annotations: {
          'created-by': 'load-balancer-api',
          'managed-pods': podSelectors.join(',')
        }
      },
      spec: {
        selector: {
          [commonLabelKey]: commonLabelValue
        },
        ports: [{
          port: parseInt(port) || 80,
          targetPort: parseInt(port) || 80,
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
      },
      podResults: patchResults
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

/**
 * @api {get} /api/services/:namespace/:name/url Get service URL
 * @apiDescription Get the external URL for a service using minikube service command
 * @apiParam {String} namespace Service namespace
 * @apiParam {String} name Service name
 * @apiQuery {String} userId User ID for authorization
 */
app.get('/api/services/:namespace/:name/url', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const { userId } = req.query;
    
    // Validate user has access to namespace
    const hasAccess = await validateNamespaceAccess(namespace, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to namespace' });
    }

    // Start the command but don't wait for it to complete
    const childProcess = spawn('minikube', ['service', name, '--namespace', namespace, '--url']);
    
    let url = null;
    let timeout = setTimeout(() => {
      // Kill the process if it takes too long
      childProcess.kill();
      if (!url) {
        res.status(500).json({ error: 'Timeout waiting for service URL' });
      }
    }, 10000); // 10 second timeout
    
    // Process output
    childProcess.stdout.on('data', (data) => {
      if (!url) {
        // Extract URL from the first line
        url = data.toString().trim().split('\n')[0];
        
        // Respond with the URL
        res.status(200).json({ url });
        
        // Don't kill the process, let it run in the background
        clearTimeout(timeout);
      }
    });
    
    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    childProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error(`Error getting service URL: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    });
    
  } catch (err) {
    console.error(`Error getting service URL: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// WebSocket handler for pod shell access
// WebSocket handler for pod shell access
wss.on('connection', (ws, req) => {
  console.log('WebSocket connection established');
  
  let stdinStream = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'init') {
        const { namespace, podName, userId, container } = data;

        const hasAccess = await validateNamespaceAccess(namespace, userId);
        if (!hasAccess) {
          ws.send(JSON.stringify({ type: 'error', message: 'Access denied to namespace' }));
          ws.close();
          return;
        }

        const stdoutStream = new stream.PassThrough();
        const stderrStream = new stream.PassThrough();
        stdinStream = new stream.PassThrough();

        stdoutStream.on('data', (chunk) => {
          ws.send(JSON.stringify({ type: 'stdout', data: chunk.toString() }));
        });

        stderrStream.on('data', (chunk) => {
          ws.send(JSON.stringify({ type: 'stderr', data: chunk.toString() }));
        });

        const exec = new k8s.Exec(kc);

        await exec.exec(
          namespace,
          podName,
          container || undefined,
          ['/bin/sh'],
          stdoutStream,
          stderrStream,
          stdinStream,
          true  // tty
        );

        ws.send(JSON.stringify({ type: 'connected', message: `Connected to pod ${podName}` }));
      }

      else if (data.type === 'command') {
        if (!stdinStream) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not connected to a pod' }));
          return;
        }

        stdinStream.write(data.command + '\n');
      }

    } catch (err) {
      console.error(`WebSocket error: ${err.message}`);
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (stdinStream) {
      try {
        stdinStream.end();
      } catch (err) {
        console.error(`Error closing stdin stream: ${err.message}`);
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