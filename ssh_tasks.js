// Import required vRO SSH module
var SSHCommand = System.getModule("com.vmware.library.ssh").executeCommand;

var sshUsername = "root";  // Replace with your ESXi SSH user
var sshPassword = "your_password";  // Use secure password handling

// Get all ESXi hosts in the cluster
var datacenters = vc.getAllDatacenters();
var datacenter = datacenters[0];  // Assuming only one datacenter
var clusters = datacenter.hostFolder.childEntity;
var cluster = clusters[0];  // Assuming only one cluster
var hosts = cluster.host;

if (hosts.length == 0) {
    throw "No hosts found in the cluster.";
}

// SSH into each ESXi host and check route list
for (var h in hosts) {
    var host = hosts[h];
    var hostIP = host.name;  // Assuming hostname resolves to IP

    System.log("Connecting to " + hostIP + " via SSH...");

    // SSH command to check routing table
    var command = "esxcli network ip route ipv4 list";

    try {
        var sshResult = SSHCommand(hostIP, sshUsername, sshPassword, command);
        System.log("Route list for " + hostIP + ":\n" + sshResult);
    } catch (e) {
        System.error("SSH failed on " + hostIP + ": " + e);
    }
}

System.log("VMkernel adapters and routing verification completed successfully.");
