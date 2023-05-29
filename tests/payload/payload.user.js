export const receiveAddressVerificationWebhookResponse = (candidateId) => ({
  event: 'address.completed',
  apiVersion: 'v2',
  data: {
    candidate: {
      'candidateId': candidateId,
      'firstName': 'Famous',
      'middleName': 'Prior',
      'lastName': 'Ehichioya',
      'photo': 'https://youverify-api-bucket.nyc3.digitaloceanspaces.com/reports/live_photos/2022-02-13/photo_620845a0edc7b3471.jpg',
      'email': 'famous@youverify.co',
      'mobile': '08030000000'
    },
    agent: {
      'firstName': 'Famous',
      'middleName': null,
      'lastName': 'Ehichioya',
      'signature': 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQE',
      'photo': 'https://api.staging.youverify.co/uploads/agents/images/c0806491bf8e74bf1fc06d9e2949408e6f957249.jpg'
    },
    address: {
      'latlong': {
        'lat': '6.5009833',
        'lon': '3.376612'
      },
      'flatNumber': '1st floor',
      'buildingName': 'Sum house',
      'buildingNumber': '350',
      'subStreet': 'Hughes avenue',
      'street': 'Borno way',
      'landmark': 'Police Station',
      'state': 'Lagos',
      'city': 'Yaba',
      'country': 'Nigeria',
      'lga': 'Lagos Mainland'
    },
    referenceId: '645aabb43fc9c834ec8d945e',
    parentId: null,
    status: 'completed',
    taskStatus: 'VERIFIED',
    tatStatus: 'IN_TAT',
    subjectConsent: 'true',
    startDate: null,
    endDate: null,
    submittedAt: '2023-05-10T12:14:27.748Z',
    executionDate: '2023-05-10T12:14:27.748Z',
    completedAt: null,
    acceptedAt: null,
    revalidationDate: null,
    notes: [ Array ],
    isFlagged: false,
    agentSubmittedLongitude: '3.376396',
    agentSubmittedLatitude: '6.6115416',
    reportGeolocationUrl: 'https://www.google.com/maps/search/?api=1&query=6.6115416,3.376396',
    mapAddressUrl: 'https://www.google.com/maps/search/?api=1&query=17%20Odunlami%20Somolu%20Lagos%20Nigeria',
    submissionDistanceInMeters: null,
    reasons: null,
    signature: 'https://youverify-cdn.fra1.digitaloceanspaces.com/1683720809467-DKyN1Va0hsnSTFs-irPE6.png',
    images: [ Array ],
    buildingType: 'Bungalow',
    buildingColor: 'White',
    gatePresent: true,
    gateColor: 'White',
    availabilityConfirmedBy: 'Family Members',
    closestLandmark: 'landmark',
    additionalInfo: 'additional information',
    reportAgentAccess: null,
    incidentReport: null,
    description: 'Verify the candidate',
    reportId: '645aabb43fc9c834ec8d945e',
    downloadUrl: null,
    apiVersion: 'v2',
    businessType: 'business',
    businessId: '642e9966bfa9c5d130d62571',
    userId: '642e9966bfa9c50707d6256d',
    type: 'individual',
    metadata: [ Object ],
    createdAt: '2023-05-09T20:23:16.217Z',
    lastModifiedAt: '2023-05-10T12:15:52.967Z',
    _createdAt: '2023-05-09T20:23:1616+00:00',
    _lastModifiedAt: '2023-05-10T12:15:5252+00:00',
    verificationId: '645aabb43fc9c834ec8d945e',
    id: '645aabb3956fd6000d39ec3f'
  }
});

export const receiveAddressVerificationNotVerifiedWebhookResponse = (candidateId) => ({
  event: 'address.completed',
  apiVersion: 'v2',
  data: {
    candidate: {
      'candidateId': candidateId,
      'firstName': 'Famous',
      'middleName': 'Prior',
      'lastName': 'Ehichioya',
      'photo': 'https://youverify-api-bucket.nyc3.digitaloceanspaces.com/reports/live_photos/2022-02-13/photo_620845a0edc7b3471.jpg',
      'email': 'famous@youverify.co',
      'mobile': '08030000000'
    },
    agent: {
      'firstName': 'Famous',
      'middleName': null,
      'lastName': 'Ehichioya',
      'signature': 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQE',
      'photo': 'https://api.staging.youverify.co/uploads/agents/images/c0806491bf8e74bf1fc06d9e2949408e6f957249.jpg'
    },
    address: {
      'latlong': {
        'lat': '6.5009833',
        'lon': '3.376612'
      },
      'flatNumber': '1st floor',
      'buildingName': 'Sum house',
      'buildingNumber': '350',
      'subStreet': 'Hughes avenue',
      'street': 'Borno way',
      'landmark': 'Police Station',
      'state': 'Lagos',
      'city': 'Yaba',
      'country': 'Nigeria',
      'lga': 'Lagos Mainland'
    },
    referenceId: '645aabb43fc9c834ec8d945e',
    parentId: null,
    status: 'completed',
    taskStatus: 'FAILED',
    tatStatus: 'IN_TAT',
    subjectConsent: 'true',
    startDate: null,
    endDate: null,
    submittedAt: '2023-05-10T12:14:27.748Z',
    executionDate: '2023-05-10T12:14:27.748Z',
    completedAt: null,
    acceptedAt: null,
    revalidationDate: null,
    notes: [ Array ],
    isFlagged: false,
    agentSubmittedLongitude: '3.376396',
    agentSubmittedLatitude: '6.6115416',
    reportGeolocationUrl: 'https://www.google.com/maps/search/?api=1&query=6.6115416,3.376396',
    mapAddressUrl: 'https://www.google.com/maps/search/?api=1&query=17%20Odunlami%20Somolu%20Lagos%20Nigeria',
    submissionDistanceInMeters: null,
    reasons: null,
    signature: 'https://youverify-cdn.fra1.digitaloceanspaces.com/1683720809467-DKyN1Va0hsnSTFs-irPE6.png',
    images: [ Array ],
    buildingType: 'Bungalow',
    buildingColor: 'White',
    gatePresent: true,
    gateColor: 'White',
    availabilityConfirmedBy: 'Family Members',
    closestLandmark: 'landmark',
    additionalInfo: 'additional information',
    reportAgentAccess: null,
    incidentReport: null,
    description: 'Verify the candidate',
    reportId: '645aabb43fc9c834ec8d945e',
    downloadUrl: null,
    apiVersion: 'v2',
    businessType: 'business',
    businessId: '642e9966bfa9c5d130d62571',
    userId: '642e9966bfa9c50707d6256d',
    type: 'individual',
    metadata: [ Object ],
    createdAt: '2023-05-09T20:23:16.217Z',
    lastModifiedAt: '2023-05-10T12:15:52.967Z',
    _createdAt: '2023-05-09T20:23:1616+00:00',
    _lastModifiedAt: '2023-05-10T12:15:5252+00:00',
    verificationId: '645aabb43fc9c834ec8d945e',
    id: '645aabb3956fd6000d39ec3f'
  }
});

export const receiveAddressVerificationWrongEventWebhookResponse = (candidateId) => ({
  event: 'address.verified',
  apiVersion: 'v2',
  data: {
    candidate: {
      'candidateId': candidateId,
      'firstName': 'Famous',
      'middleName': 'Prior',
      'lastName': 'Ehichioya',
      'photo': 'https://youverify-api-bucket.nyc3.digitaloceanspaces.com/reports/live_photos/2022-02-13/photo_620845a0edc7b3471.jpg',
      'email': 'famous@youverify.co',
      'mobile': '08030000000'
    },
    agent: {
      'firstName': 'Famous',
      'middleName': null,
      'lastName': 'Ehichioya',
      'signature': 'data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQE',
      'photo': 'https://api.staging.youverify.co/uploads/agents/images/c0806491bf8e74bf1fc06d9e2949408e6f957249.jpg'
    },
    address: {
      'latlong': {
        'lat': '6.5009833',
        'lon': '3.376612'
      },
      'flatNumber': '1st floor',
      'buildingName': 'Sum house',
      'buildingNumber': '350',
      'subStreet': 'Hughes avenue',
      'street': 'Borno way',
      'landmark': 'Police Station',
      'state': 'Lagos',
      'city': 'Yaba',
      'country': 'Nigeria',
      'lga': 'Lagos Mainland'
    },
    referenceId: '645aabb43fc9c834ec8d945e',
    parentId: null,
    status: 'completed',
    taskStatus: 'VERIFIED',
    tatStatus: 'IN_TAT',
    subjectConsent: 'true',
    startDate: null,
    endDate: null,
    submittedAt: '2023-05-10T12:14:27.748Z',
    executionDate: '2023-05-10T12:14:27.748Z',
    completedAt: null,
    acceptedAt: null,
    revalidationDate: null,
    notes: [ Array ],
    isFlagged: false,
    agentSubmittedLongitude: '3.376396',
    agentSubmittedLatitude: '6.6115416',
    reportGeolocationUrl: 'https://www.google.com/maps/search/?api=1&query=6.6115416,3.376396',
    mapAddressUrl: 'https://www.google.com/maps/search/?api=1&query=17%20Odunlami%20Somolu%20Lagos%20Nigeria',
    submissionDistanceInMeters: null,
    reasons: null,
    signature: 'https://youverify-cdn.fra1.digitaloceanspaces.com/1683720809467-DKyN1Va0hsnSTFs-irPE6.png',
    images: [ Array ],
    buildingType: 'Bungalow',
    buildingColor: 'White',
    gatePresent: true,
    gateColor: 'White',
    availabilityConfirmedBy: 'Family Members',
    closestLandmark: 'landmark',
    additionalInfo: 'additional information',
    reportAgentAccess: null,
    incidentReport: null,
    description: 'Verify the candidate',
    reportId: '645aabb43fc9c834ec8d945e',
    downloadUrl: null,
    apiVersion: 'v2',
    businessType: 'business',
    businessId: '642e9966bfa9c5d130d62571',
    userId: '642e9966bfa9c50707d6256d',
    type: 'individual',
    metadata: [ Object ],
    createdAt: '2023-05-09T20:23:16.217Z',
    lastModifiedAt: '2023-05-10T12:15:52.967Z',
    _createdAt: '2023-05-09T20:23:1616+00:00',
    _lastModifiedAt: '2023-05-10T12:15:5252+00:00',
    verificationId: '645aabb43fc9c834ec8d945e',
    id: '645aabb3956fd6000d39ec3f'
  }
});
