const fetch = require('node-fetch');
const FormData = require('form-data');

function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('upload_preset', 'profileImage');
    formData.append('file', file);

    return fetch(process.env.CLOUDINARY_UPLOAD_URI, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(), // Set appropriate headers for form-data
    })
        .then((res) => res.json())
        .then((response) => {
            return { success: true, url: response.secure_url };
        })
        .catch((err) => {
            return { success: false, url: null, err };
        });
}

// Usage example:
const file = yourFileObjectHere; // Replace with your file data
uploadToCloudinary(file)
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.error(error);
    });
