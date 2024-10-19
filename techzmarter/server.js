const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const aws4 = require('aws4');

const app = express();
const PORT = process.env.PORT || 3000;

// Amazon API configuration
const HOST = 'webservices.amazon.se';
const URI_PATH = '/paapi5/getitems';
const ACCESS_KEY = 'AKIAJ2DO7NUY3QX7I7TA';  // Replace with your actual access key
const SECRET_KEY = 'VzN8dfP3RXkeWfoaqi6i2WYBJtVxeoNgsBcw1Evy';    // Replace with your actual secret key
const REGION = 'eu-west-1';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Function to sign requests to the Amazon API
function getSignedRequest(method, path, host, accessKeyId, secretAccessKey, region, payload) {
    const opts = {
        service: 'ProductAdvertisingAPI',
        region: region,
        method: method,
        path: path,
        host: host,
        body: payload,
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
        }
    };

    aws4.sign(opts, { accessKeyId, secretAccessKey });
    return opts;
}

// API route to get items
app.post('/api/get-items', async (req, res) => {
    const { itemId } = req.body;

    const requestPayload = JSON.stringify({
        Resources: [
            "BrowseNodeInfo.BrowseNodes",
            "ItemInfo.Title",
            "Offers.Listings.Price"
            // Add other resources you need
        ],
        ItemIdType: "ASIN",
        ItemIds: [itemId],
        PartnerTag: "techzmarter-21",
        PartnerType: "Associates",
        Marketplace: "www.amazon.se"
    });

    // Get the signed request options
    const signedRequest = getSignedRequest('POST', URI_PATH, HOST, ACCESS_KEY, SECRET_KEY, REGION, requestPayload);

    try {
        // Make the request to the Amazon API
        const response = await axios.post(`https://${HOST}${URI_PATH}`, requestPayload, {
            headers: signedRequest.headers,
        });

        // Send the response data back to the client
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
