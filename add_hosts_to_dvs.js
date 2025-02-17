var clusterName = "MyCluster";  // Replace with user input

var vc = VcPlugin.allSdkConnections[0]; 

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

// Find the cluster
var clusters = datacenter.hostFolder.childEntity;
var cluster = null;
for (var j in clusters) {
    if (clusters[j].name == clusterName) {
        cluster = clusters[j];
        break;
    }
}
if (!cluster) {
    throw "Cluster '" + clusterName + "' not found.";
}

// Get all hosts in the cluster
var hosts = cluster.host;
if (hosts.length == 0) {
    throw "No hosts found in the cluster '" + clusterName + "'.";
}

// Add hosts to the Distributed Switch
var dvs = null;
var dvSwitches = vc.dvSwitchManager.dvSwitch;
for (var k in dvSwitches) {
    if (dvSwitches[k].name == switchName) {
        dvs = dvSwitches[k];
        break;
    }
}
if (!dvs) {
    throw "Distributed Switch '" + switchName + "' not found after creation.";
}

var hostArray = [];
for (var h in hosts) {
    var hostConfigSpec = new VcDistributedVirtualSwitchHostMemberConfigSpec();
    hostConfigSpec.operation = VcConfigSpecOperation.add;
    hostConfigSpec.host = hosts[h];

    // Configure uplinks
    var pnicBacking = new VcDistributedVirtualSwitchHostMemberPnicBacking();
    var pnicSpecs = [];
    var pnicNames = hosts[h].config.network.pnic; // Get physical NICs from host

    if (pnicNames.length < uplinkQuantity) {
        throw "Host '" + hosts[h].name + "' does not have enough physical NICs.";
    }

    for (var u = 0; u < uplinkQuantity; u++) {
        var pnicSpec = new VcDistributedVirtualSwitchHostMemberPnicSpec();
        pnicSpec.pnicDevice = pnicNames[u].device; // Assign the first two NICs
        pnicSpecs.push(pnicSpec);
    }

    pnicBacking.pnicSpec = pnicSpecs;
    hostConfigSpec.backing = pnicBacking;
    hostArray.push(hostConfigSpec);
}

// Apply the host configuration to the DVS
var dvsConfig = new VcDVSConfigSpec();
dvsConfig.host = hostArray;
var updateTask = dvs.reconfigureDvs_Task(dvsConfig);
var updateResult = updateTask.waitForTask();

if (updateResult == VcTaskInfoState.success) {
    System.log("Hosts from cluster '" + clusterName + "' added successfully to '" + switchName + "'.");
} else {
    throw "Failed to add hosts to the Distributed Switch: " + updateResult.error;
}
