// // const axios = require('axios');
// // const { IP_INFO_URL } = require('../../config/appConfig');

// // async function getCoordinates() {
// //   try {
// //     const response = await axios.get(IP_INFO_URL);
// //     const { loc } = response.data;
// //     const [latitude, longitude] = loc.split(',');
// //     return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
// //   } catch (error) {
// //     console.error('Error fetching IP information:', error);
// //     return null;
// //   }
// // }

// // module.exports = { getCoordinates };










// // const axios = require('axios');
// // const { IP_INFO_URL, IPINFO_API_TOKEN } = require('../../config/appConfig');

// // async function getCoordinates() {
// //     try {
// //         const response = await axios.get(`${IP_INFO_URL}?token=${IPINFO_API_TOKEN}`);
// //         const { loc } = response.data;
// //         const [latitude, longitude] = loc.split(',');
// //         return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
// //     } catch (error) {
// //         console.error('Error fetching IP information:', error);
// //         return null;
// //     }
// // }

// // module.exports = { getCoordinates };



// const axios = require('axios');
// const { IP_INFO_URL, IPINFO_API_TOKEN } = require('../../config/appConfig');

// async function getCoordinates() {
//     try {
//         const response = await axios.get(`${IP_INFO_URL}?token=${IPINFO_API_TOKEN}`, {
//             timeout: 5000 // Set a timeout of 5000 milliseconds (5 seconds)
//         });
//         const { loc } = response.data;
//         const [latitude, longitude] = loc.split(',');
//         return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
//     } catch (error) {
//         console.error('Error fetching IP information:', error);
//         return null;
//     }
// }

// module.exports = { getCoordinates };








const axios = require('axios');
const { IP_INFO_URL, IPINFO_API_TOKEN } = require('../../config/appConfig');

async function getCoordinates() {
    try {
        const response = await axios.get(`${IP_INFO_URL}?token=${IPINFO_API_TOKEN}`, {
            timeout: 5000 // Consider adding a timeout
        });
        const { loc } = response.data;
        const [latitude, longitude] = loc.split(',');
        return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    } catch (error) {
        console.error('Error fetching IP information:', error);
        return null;
    }
}

module.exports = { getCoordinates };