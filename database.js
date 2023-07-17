/**
 * This is a simple database that stores the devices, properties, and requests
 * - The device table is filled in from I-AM responses from Who-Is requests
 * - The property table is filled in from Read-Property responses from Read-Property-All requests
 * - The request table contains a list of outstanding Read-Property-All requests that have not been responded to yet.
 */

const seperator = "/";

module.exports = {

  database: {
    'devices': [],
    'properties': [],
    'requests': []
  },

  // Prints the database to a string and returns it
  // Useful for debugging
  Print() {
    var ret = "\n\n";
    ret += "Database: \n";
    // Loop thought the list of devices printing each one
    for (var device in this.database.devices) {
      ret += '  Device: ' + device + '\n';
      ret += '    Connection String: ' + this.database.devices[device].connectionString + '\n';
      ret += '    Vendor ID: ' + this.database.devices[device].vendorId + '\n';
      ret += '    Source Network: ' + this.database.devices[device].sourceNetwork + '\n';
      ret += '    Source Address: ' + this.database.devices[device].sourceAddress + '\n';
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


  // When a new device is found, add it to the database
  // If the device is already in the database, update it with the new information
  AddDevice(deviceInstance, vendorId, sourceNetwork, sourceAddress, connectionString) {
    // If the device is not in the database, add it
    if (this.database.devices[deviceInstance] == null) {
      this.database.devices[deviceInstance] = {};
    };

    if (sourceNetwork == null || sourceNetwork == undefined || sourceNetwork == '') {
      sourceNetwork = 0; // local 
      sourceAddress = '';
    }

    // Update the database 
    this.database.devices[deviceInstance].connectionString = connectionString;
    this.database.devices[deviceInstance].vendorId = vendorId;
    this.database.devices[deviceInstance].sourceNetwork = sourceNetwork;
    this.database.devices[deviceInstance].sourceAddress = sourceAddress;
  },

  // Update the database with a new property
  // A key is created from the connectionString, device instance, object type, object instance, and property identifier
  AddObjectProperty(deviceInstance, objectType, objectInstance, propertyIdentifier, propertyValueText, sourceNetwork, sourceAddress, connectionString) {
    var networkKey = connectionString + seperator + sourceNetwork + seperator + sourceAddress + seperator + deviceInstance + seperator + objectType + seperator + objectInstance + seperator + propertyIdentifier;
    this.database.properties[networkKey] = propertyValueText;
  },



  // Find the request in the database and return it
  // If deleteRequest is true, delete the request from the database
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

  // Find the request in the database and removes it
  RemoveRequest(connectionString, originalInvokeId) {
    FindOriginalRequest(connectionString, originalInvokeId, true);
  },  

  // Add a new request to the database
  AddNewRequest(connectionString, originalInvokeId, sourceNetwork, sourceAddress, deviceInstance, objectType, objectInstance) {
    // Use the connection string and original invoke id as a key to the request
    var key = connectionString + seperator + originalInvokeId;

    if (sourceNetwork == null || sourceNetwork == undefined || sourceNetwork == '') {
      sourceNetwork = 0; // local 
      sourceAddress = 0;
    }
    if (sourceNetwork != 0) {
      sourceAddress = sourceAddress.toString('hex');
    }

    this.database.requests[key] = {
      connectionString,
      originalInvokeId,
      sourceNetwork,
      sourceAddress,
      deviceInstance,
      objectType,
      objectInstance
    };
  }

};