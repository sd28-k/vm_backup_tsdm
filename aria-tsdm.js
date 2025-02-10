//Login to Vcenter
var serviceInstance = new VcServiceInstance(vCenterServer, vCenterUsername, vCenterPassword);
System.log("Successfully logged into vCenter: " + vCenterServer);
return serviceInstance;

//Create VDS

var dvsManager = serviceInstance.content.dvSwitchManager;

// Define the DVS create spec
var dvsCreateSpec = new VcDVSCreateSpec();
dvsCreateSpec.configSpec = new VcDVSConfigSpec();
dvsCreateSpec.configSpec.name = DistributedSwitchName;
dvsCreateSpec.configSpec.numStandalonePorts = 8;  // Adjust as needed

// Create the Distributed Virtual Switch
var task = dvsManager.CreateDistributedVirtualSwitch_Task(dvsCreateSpec);
task.waitForTask();

System.log("Distributed Switch " + DistributedSwitchName + " created successfully.");
return true;

// Creare Port Group
var dvs = serviceInstance.getDistributedVirtualSwitchByName(DistributedSwitchName);
if (dvs) {
    var portGroupSpec = new VcDVPortgroupConfigSpec();
    portGroupSpec.name = PortGroupName;
    portGroupSpec.type = VcDVPortgroupType.earlyBinding;
    portGroupSpec.defaultPortConfig = new VcVMwareDVSPortSetting();
    
    var vlanSpec = new VcVmwareDistributedVirtualSwitchVlanIdSpec();
    vlanSpec.vlanId = VlanID;
    vlanSpec.inherited = false;
    portGroupSpec.defaultPortConfig.vlan = vlanSpec;
    
    var task = dvs.CreateDVPortgroup_Task(portGroupSpec);
    task.waitForTask();
    System.log("Distributed Port Group " + PortGroupName + " created successfully.");
    return true;
}
System.error("Failed to create Port Group. Distributed Switch not found.");
return false;

//Configure VMkernel adapter
var hostSystem = serviceInstance.getHostSystemByName(EsxiHostName);
if (!hostSystem) {
    System.error("ESXi Host not found: " + EsxiHostName);
    return false;
}

var networkSystem = hostSystem.configManager.networkSystem;

var vmkConfig = new VcHostVirtualNicSpec();
vmkConfig.ip = new VcHostIpConfig();
vmkConfig.ip.dhcp = false;
vmkConfig.ip.ipAddress = VMKernelIP;
vmkConfig.ip.subnetMask = SubnetMask;

var result = networkSystem.AddVirtualNic(PortGroupName, vmkConfig);
System.log("VMKernel adapter created on " + EsxiHostName + " with IP: " + VMKernelIP);
return result;
