const seperator = "/";

module.exports = {
  

  database: {
    'devices': [],
    'properties': [],
    'requests': []
  },

  Print() {
    var ret = "\n\nDatabase: \n";
    // Loop thought the list of devices printing each one
    for (var device in this.database.devices) {
      ret += '  Device: ' + device + '\n';
      ret += '    Connection String: ' + this.database.devices[device].connectionString + '\n';
      ret += '    Vendor ID: ' + this.database.devices[device].vendorId + '\n';
      ret += '    Destination Network: ' + this.database.devices[device].destinationNetwork + '\n';
      ret += '    Destination Address: ' + this.database.devices[device].destinationAddress + '\n';
    };
    ret + "\n";

    // Loop thought the list of properties printing each one
    ret += "Properties: \n";
    for (var property in this.database.properties) {
      ret += "  " + property + ': ' + this.database.properties[property] + '\n';
    };

    // Loop thought the list of requests printing each one
    ret += "Requests: \n";
    for (var request in this.database.requests) {
      ret += "  " + request + ': ' + JSON.stringify(this.database.requests[request]) + '\n';
    };

    return ret + "\n";
  },

  

  AddDevice(deviceInstance, vendorId, destinationNetwork, destinationAddress, connectionString) {
    // Add or update the device in the database by deviceInstance

    // If the device is not in the database, add it
    if (this.database.devices[deviceInstance] == null) {
      this.database.devices[deviceInstance] = {
        connectionString: connectionString,
        vendorId: vendorId,
        destinationNetwork: destinationNetwork,
        destinationAddress: destinationAddress
      };
    }
    // If the device is in the database, update it
    else {
      this.database.devices[deviceInstance].connectionString = connectionString;
      this.database.devices[deviceInstance].vendorId = vendorId;
      this.database.devices[deviceInstance].destinationNetwork = destinationNetwork;
      this.database.devices[deviceInstance].destinationAddress = destinationAddress;
    }
  },

  AddObjectProperty(deviceInstance, objectType, objectInstance, propertyIdentifier, propertyValueText, destinationNetwork, destinationAddress, connectionString) {
    
    var networkKey = destinationNetwork + seperator + deviceInstance + seperator + objectType + seperator + objectInstance + seperator + propertyIdentifier;
    this.database.properties[networkKey] = propertyValueText;
  },

  FindOriginalRequest(connectionString, originalInvokeId, deleteRequest) {
    // Use the connection string and original invoke id as a key to the request
    var key = connectionString + seperator + originalInvokeId;
    var request = this.database.requests[key];

    // If the request was found, delete it from the database
    if (request != null && deleteRequest) {
      delete this.database.requests[key];
    }

    return request;
  },

  AddNewRequest(connectionString, originalInvokeId, destinationNetwork, destinationAddress, deviceInstance, objectType, objectInstance) {
    // Use the connection string and original invoke id as a key to the request
    var key = connectionString + seperator + originalInvokeId;
    this.database.requests[key] = {
      connectionString,
      originalInvokeId,
      destinationNetwork,
      destinationAddress,
      deviceInstance,
      objectType,
      objectInstance
    };
  }

};