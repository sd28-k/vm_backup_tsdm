// Input parameters
var switchName = "MyDistributedSwitch";  // Replace with user input
var switchVersion = "7.0.0";  // Replace with user input
var datacenterName = "Datacenter";  // Replace with user input
// Fixed uplink quantity
var uplinkQuantity = 2;  // Always set to 2

// Get vSphere SDK connection
var vc = VcPlugin.allSdkConnections[0];  // Assuming a single vCenter connection

// Find the specified Datacenter
var datacenters = vc.getAllDatacenters();
var datacenter = null;
for (var i in datacenters) {
    if (datacenters[i].name == datacenterName) {
        datacenter = datacenters[i];
        break;
    }
}
if (!datacenter) {
    throw "Datacenter '" + datacenterName + "' not found.";
}

// Create the DVS config spec
var dvsCreateSpec = new VcDVSCreateSpec();
dvsCreateSpec.configSpec = new VcDVSConfigSpec();
dvsCreateSpec.configSpec.name = switchName;
dvsCreateSpec.configSpec.maxPorts = 1024; // Default max ports
dvsCreateSpec.configSpec.numStandalonePorts = 10; // Default standalone ports
dvsCreateSpec.configSpec.uplinkPortPolicy = new VcDVSNameArrayUplinkPortPolicy();

// Set the DVS version
dvsCreateSpec.productInfo = new VcDistributedVirtualSwitchProductSpec();
dvsCreateSpec.productInfo.version = switchVersion;

// Configure exactly 2 uplinks
dvsCreateSpec.configSpec.uplinkPortPolicy.uplinkPortName = ["Uplink1", "Uplink2"];

// Create the Distributed Switch
var dvsManager = vc.dvSwitchManager;
var task = dvsManager.createDistributedVirtualSwitch_Task(datacenter, dvsCreateSpec);

// Wait for completion
var result = task.waitForTask();
if (result == VcTaskInfoState.success) {
    System.log("Distributed Switch '" + switchName + "' created successfully with 2 uplinks.");
} else {
    throw "Failed to create Distributed Switch: " + result.error;
}
