var subnetMask = "255.255.255.0";  // Replace with user input
var gateway = "192.168.1.1";  // Replace with user input
var ipAddress = "";

// Get vSphere SDK connection
var vc = VcPlugin.allSdkConnections[0];  

// Find the Distributed Switch
var dvs = null;
var dvSwitches = vc.dvSwitchManager.dvSwitch;
for (var i in dvSwitches) {
    if (dvSwitches[i].name == switchName) {
        dvs = dvSwitches[i];
        break;
    }
}
if (!dvs) {
    throw "Distributed Switch '" + switchName + "' not found.";
}

// Find the Port Group
var portGroup = null;
var dvPortGroups = dvs.portgroup;
for (var j in dvPortGroups) {
    if (dvPortGroups[j].name == portGroupName) {
        portGroup = dvPortGroups[j];
        break;
    }
}
if (!portGroup) {
    throw "Port Group '" + portGroupName + "' not found on '" + switchName + "'.";
}

// Get all ESXi hosts in the cluster
var datacenters = vc.getAllDatacenters();
var datacenter = datacenters[0];  // Assuming only one datacenter
var clusters = datacenter.hostFolder.childEntity;
var cluster = clusters[0];  // Assuming only one cluster
var hosts = cluster.host;

if (hosts.length == 0) {
    throw "No hosts found in the cluster.";
}

// Iterate over each host to create a VMkernel
for (var h in hosts) {
    var host = hosts[h];

    // Generate unique IP per host (modify as needed)
    var ipAddress = "192.168.1." + (10 + parseInt(h));  // Example logic for different IPs

    System.log("Configuring VMkernel on host: " + host.name + " with IP: " + ipAddress);

    // Create VMkernel network config
    var vmkNicSpec = new VcHostVirtualNicSpec();
    vmkNicSpec.mac = "";
    vmkNicSpec.portgroup = portGroupName;

    // Set Static IP Configuration
    var ipConfig = new VcHostIpConfig();
    ipConfig.dhcp = false;
    ipConfig.ipAddress = ipAddress;
    ipConfig.subnetMask = subnetMask;
    vmkNicSpec.ip = ipConfig;

    // Get Network System for the host
    var networkSystem = host.configManager.networkSystem;

    // Create the VMkernel adapter
    networkSystem.addVirtualNic(portGroupName, vmkNicSpec);

    System.log("VMkernel adapter created on " + host.name + " with IP: " + ipAddress);
}

// Configure default gateway
for (var h in hosts) {
    var host = hosts[h];
    var networkSystem = host.configManager.networkSystem;
    
    var routeSpec = new VcHostIpRouteConfig();
    routeSpec.defaultGateway = gateway;
    
    networkSystem.updateIpRouteConfig(routeSpec);
    System.log("Gateway " + gateway + " set for host " + host.name);
}

System.log("VMkernel adapters configured successfully on all hosts.");
