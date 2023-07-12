// CAS BACnet Stack NodeJS Client Example
// More information can be found here: https://github.com/chipkin/BACnetClientExampleNodeJS
// Start with the "function main()"
//
// Written by: Steven Smethurst
// Last updated: 2023-July-11
//

var CASBACnetStack = require('./CASBACnetStackAdapter'); // CAS BACnet stack

var ffi = require('ffi-napi'); // DLL interface. https://github.com/node-ffi/node-ffi
var ref = require('ref-napi'); // DLL Data types. https://github.com/TooTallNate/ref
var dequeue = require('dequeue'); // Creates a FIFO buffer. https://github.com/lleo/node-dequeue/
const dgram = require('dgram'); // UDP server
const os = require('os'); // Retrieve network info

// Logger
const loggerObj = require('./logging');
const logger = loggerObj.child({ label: 'BACnetClientExample' });

// Settings
const SETTING_BACNET_PORT = 47808; // Default BACnet IP UDP Port.
const SETTING_DEVICE_INSTANCE = 389005; // This BACnet client device instance.
const SETTING_IP_ADDRESS = []; // Set IP Address to use for BACnet, set to [] to discover... [192,168,2,101]
const SETTING_SUBNET_MASK = []; // Set Subnet Mask to use for BACnet, set to [] to discover... [255,255,255,0]  

// Constants
const APPLICATION_VERSION = '0.0.2';
const CONNECTION_STRING_SIZE = 6; // The size of the connection string in bytes.

// Globals
var fifoRecvBuffer = new dequeue();
var server = dgram.createSocket('udp4');
var database = require('./database.js');
var subnetMask = [];
var localAddress = [];


// Callback Functions
// ------------------------------------------------------------------------
// FFI types
var uint8Ptr = ref.refType('uint8 *');

// Message Callback Functions
var FuncPtrCallbackSendMessage = ffi.Callback('uint16', [uint8Ptr, 'uint16', uint8Ptr, 'uint8', 'uint8', 'bool'], CallbackSendMessage);
var FuncPtrCallbackReceiveMessage = ffi.Callback('uint16', [uint8Ptr, 'uint16', uint8Ptr, 'uint8', uint8Ptr, uint8Ptr], CallbackRecvMessage);

// System Callback Functions
var FuncPtrCallbackGetSystemTime = ffi.Callback('uint64', [], CallbackGetSystemTime);

// Get Property Callback Functions
var FuncPtrCallbackGetPropertyCharacterString = ffi.Callback('bool', ['uint32', 'uint16', 'uint32', 'uint32', 'char*', 'uint32*', 'uint32', 'uint8', 'bool', 'uint32'], GetPropertyCharacterString);

// Debug 
var FuncPtrCallbackLogDebugMessage = ffi.Callback('void', ['uint8*', 'uint16', 'uint8'], LogDebugMessage);


// Helper Functions
// ------------------------------------------------------------------------

// CreateStringFromCharPointer converts a char pointer (from the CAS BACnet Stack) into a string useable by NodeJS.
function CreateStringFromCharPointer(charPointer, length) {
  let messageToRead = ref.reinterpret(charPointer, length, 0);
  let workingString = '';
  for (let offset = 0; offset < length; offset++) {
    workingString += String.fromCharCode(messageToRead.readUInt8(offset));
  }
  return workingString;
}


// Helper function to get a key name from an array by the value.
function HelperGetKeyByValue(object, value) {
  // https://www.geeksforgeeks.org/how-to-get-a-key-in-a-javascript-object-by-its-value/
  return Object.keys(object).find((key) => object[key] === value);
}

// Helper function to convert a connection string ("192.168.1.101:47808" or "192.168.1.101") into a buffer.
// That can be used by the CAS BACnet Stack.
function HelperGetConnectionStringAsBuffer(connectionString) {
  // Convert the connection string as a text into a buffer that the CAS BACnet Stack expects.
  // The connection string is in the format of "192.168.1.101:47808" or "192.168.1.101"
  var newConnectionString = Buffer.allocUnsafe(CONNECTION_STRING_SIZE);
  var ipAddress = connectionString.substring(0, connectionString.indexOf(':')).split('.').map(Number);
  var port = parseInt(connectionString.substring(connectionString.indexOf(':') + 1));

  // If the port doesn't exist then set it to the default port.
  if (isNaN(port)) {
    port = SETTING_BACNET_PORT;
  }

  newConnectionString.writeUInt8(ipAddress[0], 0);
  newConnectionString.writeUInt8(ipAddress[1], 1);
  newConnectionString.writeUInt8(ipAddress[2], 2);
  newConnectionString.writeUInt8(ipAddress[3], 3);
  newConnectionString.writeUInt8(port / 256, 4);
  newConnectionString.writeUInt8(port % 256, 5);

  // Return the connection string as a buffer.
  return newConnectionString;
}

// Callback functions
// ------------------------------------------------------------------------

// This callback function is used when the CAS BACnet stack wants to send a message out onto the network.
function CallbackSendMessage(message, messageLength, connectionString, connectionStringLength, networkType, broadcast) {
  // Convert the connection string to a buffer.
  var newConnectionString = ref.reinterpret(connectionString, connectionStringLength, 0);

  var ipAddress = "";
  // If the message needs to be sent as a broadcast message then find the broadcast address
  if (broadcast) {
    // Use the subnetMask to calculate the broadcast address
    var broadcastAddress = [];
    for (var i = 0; i < 4; i++) {
      broadcastAddress.push((localAddress[i] & subnetMask[i]) | (~subnetMask[i] & 0xFF));
    }
    ipAddress = broadcastAddress[0] + '.' + broadcastAddress[1] + '.' + broadcastAddress[2] + '.' + broadcastAddress[3];
  } else {
    ipAddress = newConnectionString.readUInt8(0) + '.' + newConnectionString.readUInt8(1) + '.' + newConnectionString.readUInt8(2) + '.' + newConnectionString.readUInt8(3);
  }

  var port = newConnectionString.readUInt8(4) * 256 + newConnectionString.readUInt8(5);
  // Check to see if the port is valid.
  if (port <= 0 || port >= 65536) {
    logger.error('Failed to CallbackSendMessage. Bad port: ' + port);
    return 0;
  }

  logger.debug('>> CallbackSendMessage. messageLength: ' + messageLength + ", broadcast: " + broadcast + ", networkType: " + networkType + ", ipAddress: " + ipAddress + ", port: " + port);

  // Check to make sure that we are currently connected to the udp port before sending a message.
  if (server.address() === null) {
    logger.error('Error: UDP port is not open. Cannot send message.');
    return 0;
  }

  // copy the message to the sendBuffer.
  var newMessage = ref.reinterpret(message, messageLength, 0);
  sendBuffer = Buffer.alloc(messageLength);
  for (var offset = 0; offset < messageLength; ++offset) {
    sendBuffer.writeUInt8(newMessage[offset], offset);
  }

  // Send the message.
  try {
    // TODO: server.send is async, for now we trigger unelegant error-out if an error occurs when server is trying to send
    server.send(sendBuffer, port, ipAddress, function (error) {
      if (error) {
        logger.error('Error: Could not send message');
        server.close();
      } else {
        return newMessage.length;
      }
    });
  } catch (e) {
    logger.error('Exception: ' + e.stack);
  }

  return newMessage.length;
}

// This callback fundtion is used when the CAS BACnet stack wants to check to see if there are any incomming messages
function CallbackRecvMessage(message, maxMessageLength, receivedConnectionString, maxConnectionStringLength, receivedConnectionStringLength, networkType) {
  // Check to see if there are any messages waiting on the buffer.
  if (fifoRecvBuffer.length > 0) {
    // There is at lest one message on the buffer.
    var msg = fifoRecvBuffer.shift();

    const receivedMessage = msg[0];

    logger.debug('<< CallbackRecvMessage Got message. Length: ' + receivedMessage.length + ', From:' + msg[1] + ', Message: ' + receivedMessage.toString('hex'));
    if (receivedMessage.length > maxMessageLength) {
      logger.error('Error: Message too large to fit into buffer on Recv. Dumping message. msg[0].length=' + receivedMessage.length + ', maxMessageLength=' + maxMessageLength);
      return 0;
    }

    // Received Connection String
    // --------------------------------------------------------------------

    // Extract address and port
    var receivedAddress = msg[1].substring(0, msg[1].indexOf(':')).split('.').map(Number);
    var receivedPort = parseInt(msg[1].substring(msg[1].indexOf(':') + 1));

    // Reinterpret the receivedConnectionString parameter with a the max buffer size.
    var newReceivedConnectionString = ref.reinterpret(receivedConnectionString, maxConnectionStringLength, 0);
    newReceivedConnectionString.writeUInt8(receivedAddress[0], 0);
    newReceivedConnectionString.writeUInt8(receivedAddress[1], 1);
    newReceivedConnectionString.writeUInt8(receivedAddress[2], 2);
    newReceivedConnectionString.writeUInt8(receivedAddress[3], 3);
    newReceivedConnectionString.writeUInt8(receivedPort / 256, 4);
    newReceivedConnectionString.writeUInt8(receivedPort % 256, 5);

    // Connection string length
    receivedConnectionStringLength.writeUInt8(CONNECTION_STRING_SIZE, 0); // Ensure its null terminated.

    // Received message
    // --------------------------------------------------------------------
    // Reinterpret the message parameter with a the max buffer size.
    var newMessage = ref.reinterpret(message, maxMessageLength, 0);
    for (var offset = 0; offset < receivedMessage.length; offset++) {
      newMessage.writeUInt8(receivedMessage[offset], offset);
    }

    // Pass the recived message to the process function.
    ProcessBACnetMessage(msg[1], newMessage);

    // Return the length of the message.
    return receivedMessage.length;
  }
  return 0;
}

// This callback is used to determin the current system time.
function CallbackGetSystemTime() {
  // https://stackoverflow.com/a/9456144/58456
  var d = new Date();
  return d.getTime() / 1000;
}




function GetPropertyCharacterString(deviceInstance, objectType, objectInstance, propertyIdentifier, value, valueElementCount, maxElementCount, encodingType, useArrayIndex, propertyArrayIndex) {
  logger.debug('GetPropertyCharacterString - deviceInstance: ' + deviceInstance + ', objectType: ' + objectType + ', objectInstance: ' + objectInstance + ', propertyIdentifier: ' + propertyIdentifier + ', useArrayIndex: ' + useArrayIndex + ', propertyArrayIndex: ' + propertyArrayIndex + ', maxElementCount: ' + maxElementCount + ', encodingType: ' + encodingType);

  var newValue = ref.reinterpret(value, maxElementCount, 0);

  // Convert the enumerated values to human readable strings.
  var resultPropertyIdentifier = HelperGetKeyByValue(CASBACnetStack.PROPERTY_IDENTIFIER, propertyIdentifier).toLowerCase();
  var resultObjectType = HelperGetKeyByValue(CASBACnetStack.OBJECT_TYPE, objectType).toLowerCase();

  // Example of getting object Name property
  if (propertyIdentifier === CASBACnetStack.PROPERTY_IDENTIFIER.OBJECT_NAME && objectType === CASBACnetStack.OBJECT_TYPE.DEVICE) {
    // The property has been defined.
    // Convert the property to the requested data type and return success.
    charValue = "Example name"
    newValue.write(charValue, 0, 'utf8');
    valueElementCount.writeInt32LE(charValue.length, 0); // Null terminated string.
    return true;

  }

  // Could not find the value in the database.
  logger.error('GetPropertyCharacterString error. Could not find this value in the application database');
  return false;
}

function LogDebugMessage(message, messageLength, messageType) {
  // This callback is called when the CAS BACnet Stack logs an error or info message
  // In this callback, you will be able to access this debug message.
  if (messageType) {
    logger.info(CreateStringFromCharPointer(message, messageLength));
  } else {
    logger.error(CreateStringFromCharPointer(message, messageLength));
  }
}

// This function decodes and processes the BACnet message.
// This is where most of your bussiness logic will be.
function ProcessBACnetMessage(connectionString, BACnetMessageAsBuffer) {
  const MAX_JSON_MESSAGE_LENGTH = 1024 * 20;
  var messageAsJSONBuffer = Buffer.allocUnsafe(MAX_JSON_MESSAGE_LENGTH);
  var messageAsJSONBufferLength = CASBACnetStack.stack.BACnetStack_DecodeAsJSON(BACnetMessageAsBuffer, BACnetMessageAsBuffer.length, messageAsJSONBuffer, MAX_JSON_MESSAGE_LENGTH, CASBACnetStack.CONSTANTS.NETWORK_TYPE_BACNET_IP);
  messageAsJSONBuffer = messageAsJSONBuffer.subarray(0, messageAsJSONBufferLength); // Remove the end of the buffer.

  var messageAsJSON = '';
  try {
    messageAsJSON = JSON.parse(messageAsJSONBuffer.toString('utf8'));
  } catch (e) {
    logger.error('Could not parse JSON. Exception: ' + e.message + ", messageAsJSONBuffer: " + messageAsJSONBuffer.toString('utf8'));
    return;
  }
  logger.info(JSON.stringify(messageAsJSON));

  // In this example we are only processing two types of messages: 
  // I-am, and read-property-multiple.

  // All messages will have a NPDU, section that has network information.
  var destinationNetwork = messageAsJSON?.BACnetPacket?.NPDU?.DestinationNetwork;
  var destinationAddress = messageAsJSON?.BACnetPacket?.NPDU?.DestinationAddress?._length;

  // # I-Am
  // An I-Am message is sent by a BACnet device on response from a Who-Is message.
  // The I-Am are used for discovery of a BACnet device.
  // Use JSON Path to extract the data from the message. BACnetPacket/UnconfirmedRequestPDU/_serviceChoice = "iAm"
  //
  // Example message:
  // {"BACnetPacket":{"_networkType":"IP","BVLL":{"_function":"originalBroadcastNPDU"},
  // "NPDU":{"_control":"0x20","_version":"1","DestinationNetwork":"65535","DestinationAddress":{"_length":"0"},"HopCount":"255"},
  // "UnconfirmedRequestPDU":{"_serviceChoice":"iAm","IAmRequest":{"IAmDeviceIdentifier":{"_text":"device, 389001","_datatype":"12","_objectInstance":"389001","_objectType":"8"},
  // "MaxAPDULengthAccepted":{"_text":"1458","_datatype":"2","_value":"1458"},"SegmentationSupported":{"_text":"noSegmentation","_datatype":"9","_value":"3"},
  // "VendorId":{"_text":"37","_datatype":"2","_value":"37"}}}}}
  // 
  var serviceChoice = messageAsJSON?.BACnetPacket?.UnconfirmedRequestPDU?._serviceChoice;
  if (serviceChoice === "iAm") {
    // Extract the data from the message.
    var deviceInstance = messageAsJSON?.BACnetPacket?.UnconfirmedRequestPDU?.IAmRequest?.IAmDeviceIdentifier?._objectInstance;
    var vendorId = messageAsJSON?.BACnetPacket?.UnconfirmedRequestPDU?.IAmRequest?.VendorId?._value;

    // Print the information to the console for debugging.
    logger.info('I-Am message. Device Instance: ' + deviceInstance + ', VendorId: ' + vendorId + ', DestinationNetwork: ' + destinationNetwork + ', DestinationAddress: ' + destinationAddress);
    database.AddDevice(deviceInstance, vendorId, destinationNetwork, destinationAddress, connectionString);
    return; // We are done processing this message.
  }

  // # Read-Property-Multiple
  // A Read-Property-Multiple message is sent by a BACnet device on response from a Read-Property-Multiple message.
  var serviceChoice = messageAsJSON?.BACnetPacket?.ComplexACKPDU?._serviceChoice;
  logger.info('serviceChoice: ' + serviceChoice);
  if (serviceChoice === "readPropertyMultiple") {

    // Get the _originalInvokeId from the message to match up to the request.
    var originalInvokeId = messageAsJSON?.BACnetPacket?.ComplexACKPDU?._originalInvokeId;
    var originalRequest = database.FindOriginalRequest(connectionString, originalInvokeId, true);
    if (originalRequest == undefined) {
      logger.error("Could not find original request using originalInvokeId: " + originalInvokeId + ", connectionString: " + connectionString);
      return;
    }

    logger.info("originalInvokeId: " + originalInvokeId + ", originalRequest: " + JSON.stringify(originalRequest));

    // Loop thought the results adding them to the database one at a time.
    var ReadAccessResults = messageAsJSON?.BACnetPacket?.ComplexACKPDU?.ReadPropertyMultipleACK?.ListOfReadAccessResults?.ReadAccessResult?.ListOfResults?.ReadResult;
    logger.info("Found ReadAccessResults: " + ReadAccessResults.length);
    for (var i = 0; i < ReadAccessResults.length; i++) {

      var PropertyIdentifier = ReadAccessResults[i]?.PropertyIdentifier?._text;
      var PropertyValue = ReadAccessResults[i]?.PropertyValue;

      // PropertyValue.UnsignedInteger._text || PropertyValue.CharacterString._text etc...
      // The middle is the data type and should be a whild card.

      // Extract the _text from the PropertyValue
      var PropertyValueText = '';
      for (var key in PropertyValue) {
        if (key !== '_text') {
          PropertyValueText = PropertyValue[key]._text;
        }
      }

      logger.info('ReadPropertyMultiple message. originalInvokeId: ' + originalInvokeId + ', Device Instance: ' + originalRequest.deviceInstance + ', PropertyIdentifier: ' + PropertyIdentifier + ', PropertyValue: ' + PropertyValueText);
      database.AddObjectProperty(originalRequest.deviceInstance, originalRequest.objectType, originalRequest.objectInstance, PropertyIdentifier, PropertyValueText, originalRequest.destinationNetwork, originalRequest.destinationAddress, connectionString);
    }
  }
}

function main() {
  // Print version information
  // ------------------------------------------------------------------------
  logger.info('BACnet Client Example NodeJS https://github.com/chipkin/BACnetClientExampleNodeJS');
  logger.info('GetLibaryPath: ' + CASBACnetStack.GetLibaryPath());
  logger.info('Application Version: ' + APPLICATION_VERSION + ', BACnetStack_Version: ' + CASBACnetStack.stack.BACnetStack_GetAPIMajorVersion() + '.' + CASBACnetStack.stack.BACnetStack_GetAPIMinorVersion() + '.' + CASBACnetStack.stack.BACnetStack_GetAPIPatchVersion() + '.' + CASBACnetStack.stack.BACnetStack_GetAPIBuildVersion() + ', BACnetStackAdapter_Version: ' + CASBACnetStack.GetAdapterVersion());

  // Setup the callback functions
  // ------------------------------------------------------------------------
  logger.info('Setting up callback functions...');

  // Message Callback Functions
  CASBACnetStack.stack.BACnetStack_RegisterCallbackSendMessage(FuncPtrCallbackSendMessage);
  CASBACnetStack.stack.BACnetStack_RegisterCallbackReceiveMessage(FuncPtrCallbackReceiveMessage);

  // System Time Callback Functions
  CASBACnetStack.stack.BACnetStack_RegisterCallbackGetSystemTime(FuncPtrCallbackGetSystemTime);

  // Get Property Callback Functions
  CASBACnetStack.stack.BACnetStack_RegisterCallbackGetPropertyCharacterString(FuncPtrCallbackGetPropertyCharacterString);

  // Debug Callback Function
  CASBACnetStack.stack.BACnetStack_RegisterCallbackLogDebugMessage(FuncPtrCallbackLogDebugMessage);

  // Setup the BACnet device.
  // ------------------------------------------------------------------------
  logger.info('Setting up BACnet device...');
  logger.info('BACnet device instance: ' + SETTING_DEVICE_INSTANCE);
  CASBACnetStack.stack.BACnetStack_AddDevice(SETTING_DEVICE_INSTANCE);

  // Set up the BACnet services
  // ------------------------------------------------------------------------
  // By default only the required servics are enabled.
  logger.info('Enabling IAm... ');
  CASBACnetStack.stack.BACnetStack_SetServiceEnabled(SETTING_DEVICE_INSTANCE, CASBACnetStack.SERVICES_SUPPORTED.I_AM, true);
  CASBACnetStack.stack.BACnetStack_SetServiceEnabled(SETTING_DEVICE_INSTANCE, CASBACnetStack.SERVICES_SUPPORTED.WHO_IS, true);

  logger.info('Enabling ReadPropertyMultiple... ');
  if (!CASBACnetStack.stack.BACnetStack_SetServiceEnabled(SETTING_DEVICE_INSTANCE, CASBACnetStack.SERVICES_SUPPORTED.READ_PROPERTY_MULTIPLE, true)) {
    logger.error('Failed to enable the ReadPropertyMultiple service');
    return false;
  }

  // Setup the UDP socket
  // ------------------------------------------------------------------------
  logger.info('Setting up BACnet UDP port. Port: ' + SETTING_BACNET_PORT);

  server.on('error', (err) => {
    logger.error(`UDP.Server error:\n${err.stack}`);
    server.close();
  });

  server.on('message', (msg, rinfo) => {
    // logger.info(`UDP.Server message. From: ${rinfo.address}:${rinfo.port}, Message:`, msg);

    // When we recive a message we are storing it into a FIFO buffer.
    // When the CAS BACnet Stack tick function is called. it will call the CallbackRecvMessage function.
    // In this function we will read the message from the FIFO buffer and pass it to the CAS BACnet Stack.
    fifoRecvBuffer.push([msg, rinfo.address + ':' + rinfo.port]);

    // Note: If the fifoRecvBuffer ever gets too big you may wish to trim it or call BACnetStack_Tick more frequently.

    // No need to wait for the tick function to be called. We can call it now.
    CASBACnetStack.stack.BACnetStack_Tick();
  });

  server.on('listening', () => {
    const address = server.address();
    logger.info(`UDP.Server listening ${address.address}:${address.port}`);
  });

  server.on('exit', () => {
    logger.info(`UDP.Server Exit`);
  });

  // Get the system network information
  // ------------------------------------------------------------------------

  // Get netmask and ip address if not set
  var localAddressString = '';
  if (SETTING_IP_ADDRESS.length !== 4 || SETTING_SUBNET_MASK.length !== 4) {
    const networkInterfaces = os.networkInterfaces();
    logger.info('Found the following networks: \n' + JSON.stringify(networkInterfaces, null, 2));

    // Find the FIRST network that satisfies the conditions.
    var foundNetwork = false;
    for (localNetwork in networkInterfaces) {
      networkInterfaces[localNetwork].forEach(function (adapter) {
        // NOTE: Specify your network here with your own filters
        // Internal must be false and family must be IPv4
        if (adapter.internal || adapter.family !== 'IPv4' || foundNetwork) {
          return;
        }
        localAddress = adapter.address.split('.').map(Number);
        subnetMask = adapter.netmask.split('.').map(Number);
        foundNetwork = true;
        return;
      });
    }
  } else {
    localAddress = SETTING_IP_ADDRESS;
    subnetMask = SETTING_SUBNET_MASK;
  }

  logger.info('IP Address: ' + localAddress + ', SubnetMask: ' + subnetMask);
  localAddressString = localAddress[0] + '.' + localAddress[1] + '.' + localAddress[2] + '.' + localAddress[3];

  // Bind to the specific adapter and BACnet UDP port
  server.bind({
    address: localAddressString,
    port: SETTING_BACNET_PORT
  });

  // Main program loop
  // ------------------------------------------------------------------------
  var intervalCount = 1;
  logger.info('Starting main program loop... ');

  // Process the BACnet stack
  // The tick function must run every 100ms or so. 
  // It will process the BACnet stack and send out any messages.
  // Run any timers, do any retransmits, etc.
  setInterval(() => {
    while (CASBACnetStack.stack.BACnetStack_Tick()) {
      intervalCount += 1;
    }
  }, 100);


  // Send a WhoIs message
  // ------------------------------------------------------------------------
  setInterval(() => {
    logger.info('Sending WhoIs... ');

    var newConnectionString = Buffer.allocUnsafe(CONNECTION_STRING_SIZE);
    // The IP address of the connection string doesn't matter as it will be replaced by the broadcast address.
    // Update the 4 and 5th bytes with the port number.
    newConnectionString[4] = SETTING_BACNET_PORT / 256;
    newConnectionString[5] = SETTING_BACNET_PORT % 256;

    try {
      CASBACnetStack.stack.BACnetStack_SendWhoIs(newConnectionString, CONNECTION_STRING_SIZE, CASBACnetStack.CONSTANTS.NETWORK_TYPE_BACNET_IP, true, 0, null, 0);
    } catch (e) {
      logger.error('Send Who-is Exception: ' + e.stack);
    }
  }, 1000 * 3);

  // Send the ReadPropertyMultiple message
  // ------------------------------------------------------------------------
  setInterval(() => {
    // For each device in the database. The device key is (deviceInstance)
    Object.keys(database.database.devices).forEach(function (deviceIdentifier) {
      var deviceObject = database.database.devices[deviceIdentifier];

      // Create the connection string
      var newConnectionString = HelperGetConnectionStringAsBuffer(deviceObject.connectionString);

      // Build the request
      // Note: We are hard coding the object type and property identifier for this example.
      //       In your application you may want to read the object type and property identifier from a database.
      var objectType = CASBACnetStack.OBJECT_TYPE.DEVICE;
      var propertyIdentifier = CASBACnetStack.PROPERTY_IDENTIFIER.ALL;
      CASBACnetStack.stack.BACnetStack_BuildReadProperty(objectType, deviceIdentifier, propertyIdentifier, false, 0);

      // Send the request
      var destinationNetwork = 0; // deviceObject.destinationNetwork;
      var destinationAddressLength = 0;
      var destinationAddress = Buffer.allocUnsafe(1); //  deviceObject.destinationAddress;
      var sentInvokeIdAsBuffer = Buffer.allocUnsafe(1); // The invoke id is returned by the CAS BACnet Stack after the message is sent.
      CASBACnetStack.stack.BACnetStack_SendReadProperty(sentInvokeIdAsBuffer, newConnectionString, CONNECTION_STRING_SIZE, CASBACnetStack.CONSTANTS.NETWORK_TYPE_BACNET_IP, destinationNetwork, destinationAddress, destinationAddressLength);

      logger.info('Sent ReadPropertyMultiple to device: ' + deviceIdentifier + ", connectionString: " + deviceObject.connectionString + ", sentInvokeId: " + sentInvokeIdAsBuffer.readUint8());
      database.AddNewRequest(deviceObject.connectionString, sentInvokeIdAsBuffer.readUint8(), destinationNetwork, destinationAddress, deviceIdentifier, objectType, deviceIdentifier);
    });
  }, 1000 * 1);



  // Print database
  // ------------------------------------------------------------------------
  setInterval(() => {
    logger.info(database.Print());
  }, 1000 * 3);


}

// Start the application.
// ------------------------------------------------------------------------
main();
