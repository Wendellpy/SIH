const body = {
    thumbnailBase64: '',
    simulatedType: 'Building',
    simulatedData: { ulpin3D: 'MH1BB40A17D1NU.G00-00', name: 'Test', height: 10, numFloors: 2, address: 'Test' }
};
fetch('http://localhost:4000/api/v1/units/MH1BB40A17D1NU.G00-00/property-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
}).then(res => {
    console.log(res.status, res.statusText);
    return res.text();
}).then(console.log).catch(console.error);
