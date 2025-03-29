import { createRaribleSdk } from "@rarible/sdk";
import fs from "fs"; // Import file system module
import { updateNodeGlobalVars } from "./common.js";

const API_KEY = "xxxxxx"; // Add your API key here
const COLLECTION_ADDRESS = "address"; // Replace with the actual collection address
const FILE_NAME = "output.csv"; // Replace with the desired file name

// to run the script on backend
updateNodeGlobalVars();

async function getEclipseCollectionHolders(collectionAddress) {
  // Initialize the Rarible SDK with Eclipse blockchain
  const sdk = createRaribleSdk(undefined, "prod", {
    blockchain: "ECLIPSE",
    apiKey: API_KEY,
  });

  try {
    // Get collection info
    const collection = await sdk.apis.collection.getCollectionById({
      collection: `ECLIPSE:${collectionAddress}`,
    });

    console.log(`Collection Name: ${collection.name}`);

    // Fetch all items in the collection with pagination
    const holders = new Map();
    let continuation = null;

    // Initialize CSV file with headers
    const csvHeader = "Address\n";
    fs.writeFileSync(FILE_NAME, csvHeader);

    const processedOwners = new Set(); // Track already processed owners

    console.log("Fetching collection items...");
    do {
      const response = await fetchCollectionHolders(
        collectionAddress,
        continuation
      );

      console.log(`Fetched ${response.items.length} items`);
      console.log(`response.continuation: ${response.continuation}`);

      // Process each item
      const csvData = [];
      for (const item of response.items) {
        if (item.ownerIfSingle) {
          const owner = item.ownerIfSingle.split(":")[1];
          if (!processedOwners.has(owner)) {
            // Check if owner is already processed
            csvData.push(`${owner}`); // Add each holder's data to CSV
            processedOwners.add(owner); // Mark owner as processed
          }
        }
      }

      // Append current page data to the CSV file
      if (csvData.length > 0) {
        fs.appendFileSync(FILE_NAME, csvData.join("\n") + "\n");
      }

      continuation = response.continuation; // Update continuation token
    } while (continuation); // Continue until no more items

    console.log(`Total items fetched: ${holders.size}`);
    console.log(`\nHolders data written to ${FILE_NAME}`);
  } catch (error) {
    console.error(error);
    console.error("Error:", error.message);
  }
}

export async function fetchCollectionHolders(collectionAddress, continuation) {
  const url = `https://api.rarible.org/v0.1/items/byCollection?collection=ECLIPSE%3A${collectionAddress}&size=100&continuation=${continuation}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-API-KEY": API_KEY,
    },
  };

  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}

getEclipseCollectionHolders(COLLECTION_ADDRESS)
  .then(() => console.log("Done")) // Log "Done" when the script completes
  .catch(console.error); // Log any errors to the console
