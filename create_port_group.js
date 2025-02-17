var vlanId = 100;  // Replace with user input
var numPorts = 32;  // Replace with user input

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

// Create the Port Group config spec
var dvPortgroupConfigSpec = new VcDVPortgroupConfigSpec();
dvPortgroupConfigSpec.name = portGroupName;
dvPortgroupConfigSpec.numPorts = numPorts;
dvPortgroupConfigSpec.type = VcDVPortgroupType.earlyBinding;  // Static binding

// VLAN Configuration
var vlanSpec = new VcVmwareDistributedVirtualSwitchVlanIdSpec();
vlanSpec.vlanId = vlanId;
vlanSpec.inherited = false;

// Apply VLAN settings
dvPortgroupConfigSpec.defaultPortConfig = new VcVMwareDVSPortSetting();
dvPortgroupConfigSpec.defaultPortConfig.vlan = vlanSpec;

// Create the Port Group
var task = dvs.addDVPortgroup_Task([dvPortgroupConfigSpec]);

// Wait for completion
var result = task.waitForTask();
if (result == VcTaskInfoState.success) {
    System.log("Port Group '" + portGroupName + "' created successfully on '" + switchName + "'.");
} else {
    throw "Failed to create Port Group: " + result.error;
}
