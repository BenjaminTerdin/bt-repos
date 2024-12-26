<?php
require 'vendor/autoload.php'; // Include Guzzle library

use GuzzleHttp\Client;

function fetchAmazonProducts($keyword) {
    // Amazon API credentials
    $accessKey = '';
    $secretKey = '';
    $associateTag = '';
    $endpoint = 'webservices.amazon.com';
    $uri = '/onca/xml';

    // Parameters for the API request
    $params = [
        'Service' => 'AWSECommerceService',
        'Operation' => 'ItemSearch',
        'AWSAccessKeyId' => $accessKey,
        'AssociateTag' => $associateTag,
        'SearchIndex' => 'All',
        'Keywords' => $keyword,
        'ResponseGroup' => 'Images,ItemAttributes,Offers',
    ];

    // Generate the timestamp
    $params['Timestamp'] = gmdate('Y-m-d\TH:i:s\Z');

    // Sort the parameters by key
    ksort($params);

    // Create the canonicalized query string
    $canonicalQueryString = http_build_query($params, '', '&', PHP_QUERY_RFC3986);

    // Create the string to sign
    $stringToSign = "GET\n{$endpoint}\n{$uri}\n{$canonicalQueryString}";

    // Calculate the signature
    $signature = base64_encode(hash_hmac('sha256', $stringToSign, $secretKey, true));

    // Add the signature to the request
    $params['Signature'] = $signature;

    // Build the request URL
    $requestUrl = "https://{$endpoint}{$uri}?" . http_build_query($params);

    // Make the request using Guzzle
    $client = new Client();
    try {
        $response = $client->request('GET', $requestUrl);
        $body = $response->getBody();
        return simplexml_load_string($body);
    } catch (Exception $e) {
        return null; // Handle error (API call failed)
    }
}

// Handle the request and return results as JSON
if (isset($_GET['keyword'])) {
    $keyword = htmlspecialchars($_GET['keyword']);
    $products = fetchAmazonProducts($keyword);

    if ($products && isset($products->Items->Item)) {
        $productData = [];
        foreach ($products->Items->Item as $item) {
            $productData[] = [
                'title' => (string) $item->ItemAttributes->Title,
                'price' => (string) $item->OfferSummary->LowestNewPrice->FormattedPrice,
                'image' => (string) $item->MediumImage->URL,
                'url' => (string) $item->DetailPageURL
            ];
        }
        echo json_encode($productData); // Return data as JSON
    } else {
        echo json_encode([]); // No products found
    }
}
?>
