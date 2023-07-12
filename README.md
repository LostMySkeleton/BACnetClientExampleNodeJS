# BACnet Client Example NodeJS

A basic BACnet IP Client example written in NodeJS using the [CAS BACnet Stack](https://store.chipkin.com/services/stacks/bacnet-stack).

In this example, the application will

- Send a global who-is message. Record the responding devices in a database
- For each device in the database, it will send a ReadPropertyMuliple-All message. Record the responses in a database
- Print the database to the console

It is recommended that you use the [CAS BACnet Stack Server example](https://github.com/chipkin/BACnetServerExampleCPP/releases) as a test BACnet Server device with this client.

## Installation

1. Place `CASBACnetStack_x64_Debug.dll` into `bin/`
2. (optional) Set network settings, if left empty the program will get your system's active network configuration

```js
// Settings
const SETTING_BACNET_PORT = 47808;  // Default BACnet IP UDP Port.
const SETTING_IP_ADDRESS = [];      // Set IP Address to use for BACnet (i.e. [192, 168, 1, 3])
const SETTING_SUBNET_MASK = [];     // Set Subnet Mask to use for BACnet (i.e. [255, 255, 255, 0])
```

3. Install NodeJS if its not already installed.

[Install NodeJS](https://nodejs.dev/en/learn/how-to-install-nodejs/)

4. Run the following

```bash

sudo apt install build-essential
npm install 
npm run start
```

## Example output

```txt
BACnet Client Example NodeJS https://github.com/chipkin/BACnetClientExampleNodeJS
GetLibaryPath: ./bin/CASBACnetStack_x64_Debug.dll
Application Version: 0.0.1, BACnetStack_Version: 4.1.16.2298, BACnetStackAdapter_Version: 1.1.0.0
Setting up callback functions...
Setting up BACnet device...
BACnet device instance: 389005
Enabling IAm... 
Enabling ReadPropertyMultiple... 
Setting up BACnet UDP port. Port: 47808
Network: [Ethernet], Adapter: 192.168.2.199, Netmask: 255.255.255.0
Starting main program loop... 
UDP.Server listening 192.168.2.199:47808
Sending WhoIs... 
>> CallbackSendMessage. messageLength: 8, broadcast: true, networkType: 0, ipAddress: 192.168.2.255, port: 47808
<< CallbackRecvMessage Got message. Length: 8, From:192.168.2.199:47808, Message: 810b000801001008
{"BACnetPacket":{"_networkType":"IP","BVLL":{"_function":"originalBroadcastNPDU"},"NPDU":{"_control":"0x00","_version":"1"},"UnconfirmedRequestPDU":{"_serviceChoice":"whoIs","WhoIsRequest":null}}}
>> CallbackSendMessage. messageLength: 21, broadcast: true, networkType: 0, ipAddress: 192.168.2.255, port: 47808
<< CallbackRecvMessage Got message. Length: 24, From:192.168.2.105:47808, Message: 810b00180120ffff00ff1000c40205ef892205b291032125
{"BACnetPacket":{"_networkType":"IP","BVLL":{"_function":"originalBroadcastNPDU"},"NPDU":{"_control":"0x20","_version":"1","DestinationNetwork":"65535","DestinationAddress":{"_length":"0"},"HopCount":"255"},"UnconfirmedRequestPDU":{"_serviceChoice":"iAm","IAmRequest":{"IAmDeviceIdentifier":{"_text":"device, 389001","_datatype":"12","_objectInstance":"389001","_objectType":"8"},"MaxAPDULengthAccepted":{"_text":"1458","_datatype":"2","_value":"1458"},"SegmentationSupported":{"_text":"noSegmentation","_datatype":"9","_value":"3"},"VendorId":{"_text":"37","_datatype":"2","_value":"37"}}}}}
I-Am message. Device Instance: 389001, VendorId: 37, DestinationNetwork: 65535, DestinationAddress: 0
<< CallbackRecvMessage Got message. Length: 21, From:192.168.2.24:47808, Message: 810b001501001000c40205f36f2205c49103220185
{"BACnetPacket":{"_networkType":"IP","BVLL":{"_function":"originalBroadcastNPDU"},"NPDU":{"_control":"0x00","_version":"1"},"UnconfirmedRequestPDU":{"_serviceChoice":"iAm","IAmRequest":{"IAmDeviceIdentifier":{"_text":"device, 389999","_datatype":"12","_objectInstance":"389999","_objectType":"8"},"MaxAPDULengthAccepted":{"_text":"1476","_datatype":"2","_value":"1476"},"SegmentationSupported":{"_text":"noSegmentation","_datatype":"9","_value":"3"},"VendorId":{"_text":"389","_datatype":"2","_value":"389"}}}}}
I-Am message. Device Instance: 389999, VendorId: 389, DestinationNetwork: undefined, DestinationAddress: undefined
<< CallbackRecvMessage Got message. Length: 21, From:192.168.2.199:47808, Message: 810b001501001000c40205ef8d2205c49103220185
{"BACnetPacket":{"_networkType":"IP","BVLL":{"_function":"originalBroadcastNPDU"},"NPDU":{"_control":"0x00","_version":"1"},"UnconfirmedRequestPDU":{"_serviceChoice":"iAm","IAmRequest":{"IAmDeviceIdentifier":{"_text":"device, 389005","_datatype":"12","_objectInstance":"389005","_objectType":"8"},"MaxAPDULengthAccepted":{"_text":"1476","_datatype":"2","_value":"1476"},"SegmentationSupported":{"_text":"noSegmentation","_datatype":"9","_value":"3"},"VendorId":{"_text":"389","_datatype":"2","_value":"389"}}}}}
I-Am message. Device Instance: 389005, VendorId: 389, DestinationNetwork: undefined, DestinationAddress: undefined
>> CallbackSendMessage. messageLength: 19, broadcast: false, networkType: 0, ipAddress: 192.168.2.105, port: 47808
Sent ReadPropertyMultiple to device: 389001, connectionString: 192.168.2.105:47808, sentInvokeId: 42
>> CallbackSendMessage. messageLength: 19, broadcast: false, networkType: 0, ipAddress: 192.168.2.199, port: 47808
Sent ReadPropertyMultiple to device: 389005, connectionString: 192.168.2.199:47808, sentInvokeId: 180
>> CallbackSendMessage. messageLength: 19, broadcast: false, networkType: 0, ipAddress: 192.168.2.24, port: 47808
Sent ReadPropertyMultiple to device: 389999, connectionString: 192.168.2.24:47808, sentInvokeId: 239
<< CallbackRecvMessage Got message. Length: 19, From:192.168.2.199:47808, Message: 810a001301040005b40e0c0205ef8d1e09081f
>> CallbackSendMessage. messageLength: 230, broadcast: false, networkType: 0, ipAddress: 192.168.2.199, port: 47808
<< CallbackRecvMessage Got message. Length: 9, From:192.168.2.105:47808, Message: 810a00090100712a04
{"BACnetPacket":{"_networkType":"IP","BVLL":{"_function":"originalUnicastNPDU"},"NPDU":{"_control":"0x00","_version":"1"},"AbortPDU":{"_abortReason":"segmentationNotSupported","_originalInvokeId":"42","_server":"1"}}}
<< CallbackRecvMessage Got message. Length: 409, From:192.168.2.24:47808, Message: 810a0199010030ef0e0c0205f36f1e290b4e2227104f290c4e730076314f29184e114f291c4e752500436869706b696e2074657374204241436e657420495020536572766572206465766963654f291e4e4f292c4e750800342e312e352e304f29384ea47b070a014f29394eb4103139004f293e4e2205c44f29464e751100434153204241436e657420537461636b4f29494e21004f294b4ec40205f36f4f294c4ec400000000c400400001c400800002c400c00003c401000004c401400005c40205f36fc40340000dc40380000ec404c00013c405000014c406c0001bc409c00027c40a000028c40a80002ac40b00003cc40b40002dc40b80002ec40bc0002fc40c000030c40c800032c40e0000384f294d4e750f00446576696365205261696e626f774f294f4e91084f29604e850904fc86181001afa0804f29614e850704043bd821fa004f29624e21014f296b4e91034f29704e91004f29774e31004f29784e2201854f29794e751b00436869706b696e204175746f6d6174696f6e2053797374656d734f298b4e21134f29984e4f299b4e21164f1f
{"BACnetPacket":{"_networkType":"IP","BVLL":{"_function":"originalUnicastNPDU"},"NPDU":{"_control":"0x00","_version":"1"},"ComplexACKPDU":{"_moreFollows":"0","_originalInvokeId":"239","_segmentedMessage":"0","_serviceChoice":"readPropertyMultiple","ReadPropertyMultipleACK":{"ListOfReadAccessResults":{"_count":"1","ReadAccessResult":{"ObjectIdentifier":{"_text":"device, 389999","_context":"0","_datatype":"12","_objectInstance":"389999","_objectType":"8"},"ListOfResults":{"_context":"1","_count":"26","ReadResult":[{"PropertyIdentifier":{"_text":"apduTimeout","_context":"2","_datatype":"9","_value":"11"},"PropertyValue":{"_context":"4","UnsignedInteger":{"_text":"10000","_datatype":"2","_value":"10000"}}},{"PropertyIdentifier":{"_text":"applicationSoftwareVersion","_context":"2","_datatype":"9","_value":"12"},"PropertyValue":{"_context":"4","CharacterString":{"_text":"v1","_datatype":"7","_encoding":"0","_length":"2"}}},{"PropertyIdentifier":{"_text":"daylightSavingsStatus","_context":"2","_datatype":"9","_value":"24"},"PropertyValue":{"_context":"4","Boolean":{"_text":"true","_datatype":"1","_value":"1"}}},{"PropertyIdentifier":{"_text":"description","_context":"2","_datatype":"9","_value":"28"},"PropertyValue":{"_context":"4","CharacterString":{"_text":"Chipkin test BACnet IP Server device","_datatype":"7","_encoding":"0","_length":"36"}}},{"PropertyIdentifier":{"_text":"deviceAddressBinding","_context":"2","_datatype":"9","_value":"30"},"PropertyValue":{"_context":"4"}},{"PropertyIdentifier":{"_text":"firmwareRevision","_context":"2","_datatype":"9","_value":"44"},"PropertyValue":{"_context":"4","CharacterString":{"_text":"4.1.5.0","_datatype":"7","_encoding":"0","_length":"7"}}},{"PropertyIdentifier":{"_text":"localDate","_context":"2","_datatype":"9","_value":"56"},"PropertyValue":{"_context":"4","Date":{"_text":"July, 10, 2023, Monday","_datatype":"10","_day":"10","_month":"7","_weekday":"1","_year":"123"}}},{"PropertyIdentifier":{"_text":"localTime","_context":"2","_datatype":"9","_value":"57"},"PropertyValue":{"_context":"4","Time":{"_text":"16:49:57.0","_datatype":"11","_hour":"16","_hundrethSeconds":"0","_minute":"49","_second":"57"}}},{"PropertyIdentifier":{"_text":"maxApduLengthAccepted","_context":"2","_datatype":"9","_value":"62"},"PropertyValue":{"_context":"4","UnsignedInteger":{"_text":"1476","_datatype":"2","_value":"1476"}}},{"PropertyIdentifier":{"_text":"modelName","_context":"2","_datatype":"9","_value":"70"},"PropertyValue":{"_context":"4","CharacterString":{"_text":"CAS BACnet Stack","_datatype":"7","_encoding":"0","_length":"16"}}},{"PropertyIdentifier":{"_text":"numberOfApduRetries","_context":"2","_datatype":"9","_value":"73"},"PropertyValue":{"_context":"4","UnsignedInteger":{"_text":"0","_datatype":"2","_value":"0"}}},{"PropertyIdentifier":{"_text":"objectIdentifier","_context":"2","_datatype":"9","_value":"75"},"PropertyValue":{"_context":"4","ObjectIdentifier":{"_text":"device, 389999","_datatype":"12","_objectInstance":"389999","_objectType":"8"}}},{"PropertyIdentifier":{"_text":"objectList","_context":"2","_datatype":"9","_value":"76"},"PropertyValue":{"_context":"4","ObjectIdentifier":[{"_text":"analogInput, 0","_datatype":"12","_objectInstance":"0","_objectType":"0"},{"_text":"analogOutput, 1","_datatype":"12","_objectInstance":"1","_objectType":"1"},{"_text":"analogValue, 2","_datatype":"12","_objectInstance":"2","_objectType":"2"},{"_text":"binaryInput, 3","_datatype":"12","_objectInstance":"3","_objectType":"3"},{"_text":"binaryOutput, 4","_datatype":"12","_objectInstance":"4","_objectType":"4"},{"_text":"binaryValue, 5","_datatype":"12","_objectInstance":"5","_objectType":"5"},{"_text":"device, 389999","_datatype":"12","_objectInstance":"389999","_objectType":"8"},{"_text":"multiStateInput, 13","_datatype":"12","_objectInstance":"13","_objectType":"13"},{"_text":"multiStateOutput, 14","_datatype":"12","_objectInstance":"14","_objectType":"14"},{"_text":"multiStateValue, 19","_datatype":"12","_objectInstance":"19","_objectType":"19"},{"_text":"trendLog, 20","_datatype":"12","_objectInstance":"20","_objectType":"20"},{"_text":"trendLogMultiple, 27","_datatype":"12","_objectInstance":"27","_objectType":"27"},{"_text":"bitstringValue, 39","_datatype":"12","_objectInstance":"39","_objectType":"39"},{"_text":"characterstringValue, 40","_datatype":"12","_objectInstance":"40","_objectType":"40"},{"_text":"dateValue, 42","_datatype":"12","_objectInstance":"42","_objectType":"42"},{"_text":"datetimeValue, 60","_datatype":"12","_objectInstance":"60","_objectType":"44"},{"_text":"integerValue, 45","_datatype":"12","_objectInstance":"45","_objectType":"45"},{"_text":"largeAnalogValue, 46","_datatype":"12","_objectInstance":"46","_objectType":"46"},{"_text":"octetstringValue, 47","_datatype":"12","_objectInstance":"47","_objectType":"47"},{"_text":"positiveIntegerValue, 48","_datatype":"12","_objectInstance":"48","_objectType":"48"},{"_text":"timeValue, 50","_datatype":"12","_objectInstance":"50","_objectType":"50"},{"_text":"networkPort, 56","_datatype":"12","_objectInstance":"56","_objectType":"56"}]}},{"PropertyIdentifier":{"_text":"objectName","_context":"2","_datatype":"9","_value":"77"},"PropertyValue":{"_context":"4","CharacterString":{"_text":"Device Rainbow","_datatype":"7","_encoding":"0","_length":"14"}}},{"PropertyIdentifier":{"_text":"objectType","_context":"2","_datatype":"9","_value":"79"},"PropertyValue":{"_context":"4","ObjectType":{"_text":"device","_datatype":"9","_value":"8"}}},{"PropertyIdentifier":{"_text":"protocolObjectTypesSupported","_context":"2","_datatype":"9","_value":"96"},"PropertyValue":{"_context":"4","BitString":{"_text":"b111111001000011000011000000100000000000110101111101000001000","_datatype":"8","_length":"60","_unusedBits":"4"}}},{"PropertyIdentifier":{"_text":"protocolServicesSupported","_context":"2","_datatype":"9","_value":"97"},"PropertyValue":{"_context":"4","BitString":{"_text":"b00000100001110111101100000100001111110100000","_datatype":"8","_length":"44","_unusedBits":"4"}}},{"PropertyIdentifier":{"_text":"protocolVersion","_context":"2","_datatype":"9","_value":"98"},"PropertyValue":{"_context":"4","UnsignedInteger":{"_text":"1","_datatype":"2","_value":"1"}}},{"PropertyIdentifier":{"_text":"segmentationSupported","_context":"2","_datatype":"9","_value":"107"},"PropertyValue":{"_context":"4","Segmentation":{"_text":"noSegmentation","_datatype":"9","_value":"3"}}},{"PropertyIdentifier":{"_text":"systemStatus","_context":"2","_datatype":"9","_value":"112"},"PropertyValue":{"_context":"4","DeviceStatus":{"_text":"operational","_datatype":"9","_value":"0"}}},{"PropertyIdentifier":{"_text":"utcOffset","_context":"2","_datatype":"9","_value":"119"},"PropertyValue":{"_context":"4","Integer":{"_text":"0","_datatype":"3","_value":"0"}}},{"PropertyIdentifier":{"_text":"vendorIdentifier","_context":"2","_datatype":"9","_value":"120"},"PropertyValue":{"_context":"4","UnsignedInteger":{"_text":"389","_datatype":"2","_value":"389"}}},{"PropertyIdentifier":{"_text":"vendorName","_context":"2","_datatype":"9","_value":"121"},"PropertyValue":{"_context":"4","CharacterString":{"_text":"Chipkin Automation Systems","_datatype":"7","_encoding":"0","_length":"26"}}},{"PropertyIdentifier":{"_text":"protocolRevision","_context":"2","_datatype":"9","_value":"139"},"PropertyValue":{"_context":"4","UnsignedInteger":{"_text":"19","_datatype":"2","_value":"19"}}},{"PropertyIdentifier":{"_text":"activeCovSubscriptions","_context":"2","_datatype":"9","_value":"152"},"PropertyValue":{"_context":"4"}},{"PropertyIdentifier":{"_text":"databaseRevision","_context":"2","_datatype":"9","_value":"155"},"PropertyValue":{"_context":"4","UnsignedInteger":{"_text":"22","_datatype":"2","_value":"22"}}}]}}}}}}}
originalInvokeId: 239, originalRequest: {"connectionString":"192.168.2.24:47808","originalInvokeId":239,"destinationNetwork":0,"destinationAddress":{"type":"Buffer","data":[0]},"deviceInstance":"389999","objectType":8,"objectInstance":"389999"}
Found ReadAccessResults: 26
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: apduTimeout, PropertyValue: 10000
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: applicationSoftwareVersion, PropertyValue: v1
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: deviceAddressBinding, PropertyValue: undefined
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: firmwareRevision, PropertyValue: 4.1.16.2298
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: maxApduLengthAccepted, PropertyValue: 1476
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: modelName, PropertyValue: CAS BACnet Stack
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: numberOfApduRetries, PropertyValue: 0
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: objectIdentifier, PropertyValue: device, 389005
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: objectList, PropertyValue: device, 389005
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: objectName, PropertyValue: Example name
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: objectType, PropertyValue: device
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: protocolObjectTypesSupported, PropertyValue: b000000001000000000000000000000000000000000000000000000000000
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: protocolServicesSupported, PropertyValue: b00000000000010100000000000100000011000000000
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: protocolVersion, PropertyValue: 1
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: segmentationSupported, PropertyValue: noSegmentation
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: systemStatus, PropertyValue: operational
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: vendorIdentifier, PropertyValue: 389
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: vendorName, PropertyValue: Chipkin Automation Systems
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: protocolRevision, PropertyValue: 19
ReadPropertyMultiple message. originalInvokeId: 239, Device Instance: 389005, PropertyIdentifier: databaseRevision, PropertyValue: 1

Database: 
  Device: 389001
    Connection String: 192.168.2.105:47808
    Vendor ID: 37
    Destination Network: 65535
    Destination Address: 0
  Device: 389005
    Connection String: 192.168.2.199:47808
    Vendor ID: 389
    Destination Network: 65535
    Destination Address: 0
  Device: 389999
    Connection String: 192.168.2.24:47808
    Vendor ID: 389
    Destination Network: 65535
    Destination Address: 0
Properties: 
  0/389999/8/389999/apduTimeout: 10000
  0/389999/8/389999/applicationSoftwareVersion: v1
  0/389999/8/389999/daylightSavingsStatus: true
  0/389999/8/389999/description: Chipkin test BACnet IP Server device
  0/389999/8/389999/deviceAddressBinding: undefined
  0/389999/8/389999/firmwareRevision: 4.1.5.0
  0/389999/8/389999/localDate: July, 10, 2023, Monday
  0/389999/8/389999/localTime: 16:51:1.0
  0/389999/8/389999/maxApduLengthAccepted: 1476
  0/389999/8/389999/modelName: CAS BACnet Stack
  0/389999/8/389999/numberOfApduRetries: 0
  0/389999/8/389999/objectIdentifier: device, 389999
  0/389999/8/389999/objectList: undefined
  0/389999/8/389999/objectName: Device Rainbow
  0/389999/8/389999/objectType: device
  0/389999/8/389999/protocolObjectTypesSupported: b111111001000011000011000000100000000000110101111101000001000
  0/389999/8/389999/protocolServicesSupported: b00000100001110111101100000100001111110100000
  0/389999/8/389999/protocolVersion: 1
  0/389999/8/389999/segmentationSupported: noSegmentation
  0/389999/8/389999/systemStatus: operational
  0/389999/8/389999/utcOffset: 0
  0/389999/8/389999/vendorIdentifier: 389
  0/389999/8/389999/vendorName: Chipkin Automation Systems
  0/389999/8/389999/protocolRevision: 19
  0/389999/8/389999/activeCovSubscriptions: undefined
  0/389999/8/389999/databaseRevision: 22
  0/389005/8/389005/apduTimeout: 10000
  0/389005/8/389005/applicationSoftwareVersion: v1
  0/389005/8/389005/deviceAddressBinding: undefined
  0/389005/8/389005/firmwareRevision: 4.1.16.2298
  0/389005/8/389005/maxApduLengthAccepted: 1476
  0/389005/8/389005/modelName: CAS BACnet Stack
  0/389005/8/389005/numberOfApduRetries: 0
  0/389005/8/389005/objectIdentifier: device, 389005
  0/389005/8/389005/objectList: device, 389005
  0/389005/8/389005/objectName: Example name
  0/389005/8/389005/objectType: device
  0/389005/8/389005/protocolObjectTypesSupported: b000000001000000000000000000000000000000000000000000000000000
  0/389005/8/389005/protocolServicesSupported: b00000000000010100000000000100000011000000000
  0/389005/8/389005/protocolVersion: 1
  0/389005/8/389005/segmentationSupported: noSegmentation
  0/389005/8/389005/systemStatus: operational
  0/389005/8/389005/vendorIdentifier: 389
  0/389005/8/389005/vendorName: Chipkin Automation Systems
  0/389005/8/389005/protocolRevision: 19
  0/389005/8/389005/databaseRevision: 1
Requests: 

```
