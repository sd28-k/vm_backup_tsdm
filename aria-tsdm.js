//Login to Vcenter
var serviceInstance = new VcServiceInstance(vCenterServer, vCenterUsername, vCenterPassword);
System.log("Successfully logged into vCenter: " + vCenterServer);

//Create VDS

var dvsManager = serviceInstance.content.dvSwitchManager;

// Define the DVS create spec
var dvsCreateSpec = new VcDVSCreateSpec();
dvsCreateSpec.configSpec = new VcDVSConfigSpec();
dvsCreateSpec.configSpec.name = DistributedSwitchName;
dvsCreateSpec.configSpec.numStandalonePorts = 8;  // Adjust as needed

// Create the Distributed Virtual Switch
// Get vCenter service instance
var dvsManager = serviceInstance.content.dvSwitchManager;

// Find the specified cluster
var cluster = serviceInstance.getClusterComputeResourceByName(ClusterName);
if (!cluster) {
    System.error("Cluster not found: " + ClusterName);
    throw "Cluster not found";
}

// Get all hosts in the cluster
var hosts = cluster.host;
if (hosts.length === 0) {
    System.error("No hosts found in the cluster: " + ClusterName);
    throw "No hosts found";
}

// Define the DVS create spec
var dvsCreateSpec = new VcDVSCreateSpec();
dvsCreateSpec.configSpec = new VcDVSConfigSpec();
dvsCreateSpec.configSpec.name = DistributedSwitchName;
dvsCreateSpec.configSpec.numStandalonePorts = 8;  // Adjust as needed

// Optionally set DVS version (e.g., "8.0.0", "7.0.3")
dvsCreateSpec.productInfo = new VcDistributedVirtualSwitchProductSpec();
dvsCreateSpec.productInfo.version = SwitchVersion;  // Pass version as input

// Assign ESXi hosts in the cluster to the Distributed Switch
var dvsHostMembers = [];
for (var i = 0; i < hosts.length; i++) {
    var hostConfigSpec = new VcDistributedVirtualSwitchHostMemberConfigSpec();
    hostConfigSpec.operation = VcConfigSpecOperation.add;
    hostConfigSpec.host = hosts[i];

    dvsHostMembers.push(hostConfigSpec);
}

// Attach hosts to the switch
dvsCreateSpec.configSpec.host = dvsHostMembers;

// Create the Distributed Virtual Switch
var task = dvsManager.CreateDistributedVirtualSwitch_Task(dvsCreateSpec);
task.waitForTask();

System.log("Distributed Switch " + DistributedSwitchName + " created successfully in Cluster: " + ClusterName);


//Configure VMkernel adapter
var hostSystem = serviceInstance.getHostSystemByName(EsxiHostName);
if (!hostSystem) {
    System.error("ESXi Host not found: " + EsxiHostName);
}

var networkSystem = hostSystem.configManager.networkSystem;

var vmkConfig = new VcHostVirtualNicSpec();
vmkConfig.ip = new VcHostIpConfig();
vmkConfig.ip.dhcp = false;
vmkConfig.ip.ipAddress = VMKernelIP;
vmkConfig.ip.subnetMask = SubnetMask;

var result = networkSystem.AddVirtualNic(PortGroupName, vmkConfig);
System.log("VMKernel adapter created on " + EsxiHostName + " with IP: " + VMKernelIP);
