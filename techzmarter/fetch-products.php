<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Load environment variables from info.env in the project root
$dotenv = Dotenv::createImmutable(__DIR__, 'info.env');
$dotenv->load();

use Amazon\ProductAdvertisingAPI\v1\Configuration;
use Amazon\ProductAdvertisingAPI\v1\com\amazon\paapi5\v1\api\DefaultApi;
use Amazon\ProductAdvertisingAPI\v1\com\amazon\paapi5\v1\SearchItemsRequest;
use Amazon\ProductAdvertisingAPI\v1\com\amazon\paapi5\v1\ProductAdvertisingAPIClientException;
use GuzzleHttp\Client;

/**
 * Generate a cache file name based on the keyword.
 */
function getCacheFilename($keyword) {
    // Ensure the cache folder exists
    $cacheDir = __DIR__ . '/cache';
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true);
    }
    return $cacheDir . '/' . md5($keyword) . '.json';
}

/**
 * Fetch products from Amazon API with caching.
 */
function fetchAmazonProducts($keyword) {
    $cacheFile = getCacheFilename($keyword);
    $cacheTTL = 3600; // Cache time-to-live in seconds (e.g., 1 hour)

    // If cache exists and is not expired, return cached data.
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTTL) {
        error_log("Using cached data for keyword: " . $keyword);
        $cachedData = file_get_contents($cacheFile);
        // Here, we decode the JSON back to an object. Depending on your API, you may need to adjust.
        return json_decode($cachedData);
    }

    // Log environment variables for debugging using $_ENV
    error_log('AMAZON_ACCESS_KEY length: ' . strlen($_ENV['AMAZON_ACCESS_KEY'] ?? ''));
    error_log('AMAZON_SECRET_KEY length: ' . strlen($_ENV['AMAZON_SECRET_KEY'] ?? ''));
    error_log('AMAZON_ASSOCIATE_TAG: ' . ($_ENV['AMAZON_ASSOCIATE_TAG'] ?? ''));

    // Set up configuration with your credentials using $_ENV
    $config = new Configuration();
    $config->setAccessKey($_ENV['AMAZON_ACCESS_KEY'] ?? '');
    $config->setSecretKey($_ENV['AMAZON_SECRET_KEY'] ?? '');
    $config->setHost('webservices.amazon.com');
    $config->setRegion('us-east-1');

    // Initialize the API instance.
    $apiInstance = new DefaultApi(new Client(), $config);

    // Create the search request.
    $request = new SearchItemsRequest();
    $request->setPartnerTag($_ENV['AMAZON_ASSOCIATE_TAG'] ?? '');
    $request->setPartnerType("Associates");
    $request->setKeywords($keyword);
    $request->setSearchIndex("Electronics");
    $request->setMarketplace("www.amazon.com");  // Marketplace is required
    $request->setResources([
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'Offers.Listings.Price'
    ]);

    // Log the request parameters.
    error_log('Request Keyword: ' . $keyword);
    error_log('Search Index: Electronics');
    error_log('Marketplace: www.amazon.com');
    error_log('Resources: ' . implode(', ', ['Images.Primary.Medium', 'ItemInfo.Title', 'Offers.Listings.Price']));

    // Retry logic to mitigate 429 errors
    $maxRetries = 3;
    $attempt = 0;
    $retryDelay = 2; // in seconds

    while ($attempt < $maxRetries) {
        try {
            $response = $apiInstance->searchItems($request);
            // Cache the API response as JSON
            file_put_contents($cacheFile, json_encode($response));
            return $response;
        } catch (ProductAdvertisingAPIClientException $e) {
            $errorMessage = $e->getMessage();
            // Check if the error indicates a 429 Too Many Requests error.
            if (strpos($errorMessage, '429') !== false || strpos($errorMessage, 'TooManyRequests') !== false) {
                error_log("Received 429 Too Many Requests, retrying in {$retryDelay} seconds (attempt " . ($attempt + 1) . ")...");
                sleep($retryDelay);
                $attempt++;
                $retryDelay *= 2; // Exponential backoff
            } else {
                error_log('API request failed: ' . $errorMessage);
                return ['error' => 'API request failed', 'message' => $errorMessage];
            }
        }
    }
    return ['error' => 'API request failed', 'message' => 'Exceeded maximum retries due to 429 errors'];
}

if (isset($_GET['keyword'])) {
    $keyword = htmlspecialchars($_GET['keyword']);
    $products = fetchAmazonProducts($keyword);

    if (isset($products['error'])) {
        header('Content-Type: application/json');
        echo json_encode($products);
    } else {
        $productData = [];
        foreach ($products->getSearchResult()->getItems() as $item) {
            $productData[] = [
                'title' => $item->getItemInfo()->getTitle()->getDisplayValue() ?? "No title",
                'price' => $item->getOffers()->getListings()[0]->getPrice()->getDisplayAmount() ?? "Price unavailable",
                'image' => $item->getImages()->getPrimary()->getMedium()->getURL() ?? "No image available",
                'url'   => $item->getDetailPageURL() ?? "#"
            ];
        }
        header('Content-Type: application/json');
        echo json_encode($productData, JSON_PRETTY_PRINT);
    }
}
?>
