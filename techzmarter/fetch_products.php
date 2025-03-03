<?php
require_once __DIR__ . '/vendor/autoload.php';

use Amazon\ProductAdvertisingAPI\v1\Configuration;
use Amazon\ProductAdvertisingAPI\v1\com\amazon\paapi5\v1\api\DefaultApi;
use Amazon\ProductAdvertisingAPI\v1\com\amazon\paapi5\v1\GetBrowseNodesRequest;
use Amazon\ProductAdvertisingAPI\v1\com\amazon\paapi5\v1\GetBrowseNodesResource;
use Amazon\ProductAdvertisingAPI\v1\ApiException;
use Dotenv\Dotenv;
use GuzzleHttp\Client;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$logFile = __DIR__ . '/debug.log'; // Define log file path
$processId = getmypid(); // Unique process ID for debugging

/**
 * Function to log debug messages
 */
function logDebug($message) {
    global $logFile, $processId;
    file_put_contents($logFile, date("[Y-m-d H:i:s]") . " [PID: $processId] " . $message . "\n", FILE_APPEND);
}

// Start debug log
logDebug("Debug Log Started");

/**
 * Generate a cache file name based on the browse node ID.
 */
function getCacheFilename($nodeId) {
    $cacheDir = __DIR__ . '/cache';
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true);
    }
    return $cacheDir . '/' . md5($nodeId) . '.json';
}

/**
 * Fetch browse node details from the Amazon API with caching.
 */
function fetchBrowseNodeInfo($browseNodeId) {
    $cacheFile = getCacheFilename($browseNodeId);
    $cacheTTL = 3600; // 1 hour cache

    // Load API credentials from environment variables
    $accessKey = getenv('AMAZON_ACCESS_KEY') ?: $_ENV['AMAZON_ACCESS_KEY'];
    $secretKey = getenv('AMAZON_SECRET_KEY') ?: $_ENV['AMAZON_SECRET_KEY'];
    $associateTag = getenv('AMAZON_ASSOCIATE_TAG') ?: $_ENV['AMAZON_ASSOCIATE_TAG'];

    if (!$accessKey || !$secretKey || !$associateTag) {
        logDebug("Amazon API Error: Missing API credentials");
        return ['error' => 'Missing API credentials', 'message' => 'Please check your .env file'];
    }

    // Configure API
    $config = new Configuration();
    $config->setAccessKey($accessKey);
    $config->setSecretKey($secretKey);
    $config->setHost('webservices.amazon.se'); // For Sweden
    $config->setRegion('eu-west-1');           // For Sweden

    $apiInstance = new DefaultApi(new Client(), $config);

    // Create the GetBrowseNodes request
    $request = new GetBrowseNodesRequest();
    $request->setPartnerTag($associateTag);
    $request->setPartnerType("Associates");
    $request->setMarketplace("www.amazon.se"); // Swedish marketplace

    // Pass one or more browse node IDs
    $request->setBrowseNodeIds([$browseNodeId]);

    // Choose which details you want about the node
    $request->setResources([
        GetBrowseNodesResource::ANCESTOR,
        GetBrowseNodesResource::CHILDREN
    ]);

    // Log the request attempt (for debugging)
    logDebug("Attempting GetBrowseNodes for node: $browseNodeId");

    try {
        // Make the API request and capture the response
        $response = $apiInstance->getBrowseNodes($request);

        // Log the raw API response (this is the unprocessed response from the API)
        logDebug("Raw API Response (GetBrowseNodes): " . json_encode($response, JSON_PRETTY_PRINT));

        // Decode the response to an array for easier manipulation
        $data = json_decode(json_encode($response), true);

        // Log the decoded API response (this is the response data after decoding)
        logDebug("Decoded API Response: " . json_encode($data, JSON_PRETTY_PRINT));

        // Cache the response for future use
        file_put_contents($cacheFile, json_encode($data));

        // Return the data for further use
        return $data;

    } catch (ApiException $e) {
        // Log the exception error message if the API request fails
        $errorMessage = "Amazon API Error (GetBrowseNodes): " . $e->getMessage();
        logDebug($errorMessage);
        return ['error' => 'API request failed', 'message' => $e->getMessage()];
    }
}


// ------------------------------------------
// Example usage: Get details for a browse node
// ------------------------------------------

// Replace with a valid browse node ID for Sweden
$browseNodeId = "20512681031";
$browseNodeInfo = fetchBrowseNodeInfo($browseNodeId);

// Debug output: Show raw API response
echo "<pre>";
print_r($browseNodeInfo);
echo "</pre>";

// If there's no error, let's see if we have node details
// Example usage: Get details for a browse node
$browseNodeId = "20512681031"; // Assuming this is the ID for Electronics, confirm if correct
$browseNodeInfo = fetchBrowseNodeInfo($browseNodeId);

// Debug output: Show raw API response
echo "<pre>";
print_r($browseNodeInfo);
echo "</pre>";

// If there's no error, let's see if we have node details
if (!isset($browseNodeInfo['error'])) {
    if (isset($browseNodeInfo['browseNodesResult']['browseNodes']) && is_array($browseNodeInfo['browseNodesResult']['browseNodes'])) {
        // Extract the node(s)
        foreach ($browseNodeInfo['browseNodesResult']['browseNodes'] as $node) {
            $nodeId = $node['id'] ?? "Unknown ID";
            $displayName = $node['displayName'] ?? "No Name";
            echo "<p>Browse Node ID: {$nodeId}<br>Display Name: {$displayName}</p>";

            // Check for child nodes
            if (!empty($node['children'])) {
                echo "<p>Child Nodes:</p><ul>";

                // Loop through each child node to check for Best Sellers
                foreach ($node['children'] as $child) {
                    $childId = $child['id'] ?? "Unknown Child ID";
                    $childName = $child['displayName'] ?? "No Child Name";
                    echo "<li>{$childId} - {$childName}</li>";

                    // Look for "Best Sellers" in the child nodes
                    if (stripos($childName, 'Best Sellers') !== false) {
                        // Found Best Sellers child node, log or display its ID
                        echo "<p><strong>Found Best Sellers! Node ID: {$childId} - {$childName}</strong></p>";
                    }
                }
                echo "</ul>";
            }
        }
    } else {
        echo '<p class="error-message">No browse node data found.</p>';
    }
} else {
    echo '<p class="error-message">Error fetching browse node: ' . htmlspecialchars($browseNodeInfo['message']) . '</p>';
}

?>
