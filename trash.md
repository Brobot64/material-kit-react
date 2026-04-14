{
            "_id": "69d8f6401c2613d41a75b4c9",
            "businessId": "69628a1cae0d0cf6477cf660",
            "sku": "EQU-001",
            "name": "Ceramic Mug",
            "categoryId": "69d8f6401c2613d41a75b4c6",
            "unit": "Piece",
            "taxRate": 0,
            "description": "Durable ceramic mug",
            "details": {
                "Color": "Blue",
                "Size": "Standard",
                "Material": "Ceramic"
            },
            "hasVariants": false,
            "images": [],
            "isActive": true,
            "variants": [],
            "createdAt": "2026-04-10T13:08:16.674Z",
            "updatedAt": "2026-04-10T13:48:51.375Z",
            "__v": 0,
            "outlets": [
                {
                    "_id": "69d8f6411c2613d41a75b4cc",
                    "productId": "69d8f6401c2613d41a75b4c9",
                    "outletId": "69628a1cae0d0cf6477cf666",
                    "quantity": 0,
                    "sellingPrice": 12,
                    "costPriceMethod": "FIFO",
                    "currentCost": 5,
                    "minStock": 0,
                    "maxStock": 0,
                    "isActive": true,
                    "createdAt": "2026-04-10T13:08:17.235Z",
                    "updatedAt": "2026-04-10T13:48:52.286Z",
                    "__v": 0
                }
            ],
            "category": {
                "_id": "69d8f6401c2613d41a75b4c6",
                "businessId": "69628a1cae0d0cf6477cf660",
                "name": "Equipment",
                "isActive": true,
                "createdAt": "2026-04-10T13:08:16.453Z",
                "updatedAt": "2026-04-10T13:08:16.453Z",
                "__v": 0
            },
            "totalQuantity": 0,
            "totalMinStock": 0,
            "categoryName": "Equipment",
            "stockStatus": "OUT_OF_STOCK"
        },





Bookmark collections endpoint need to have thumbnail images / return the details of the items/bookmarks in the collection endpoint 

There should be an all book marks endpoint 

In the create a bookmark I should be able to add a bookmark without adding to a collection
This is seperate for some cases where I would want to organize it in a collection 

The images for the items I’m bookmarking aren’t returned ; infact the details themselves 

Get book marks in collection don’t show the details of the bookmarked item

There’s no rename collection endpoint 

All the invite collaborators endpoints accross the app are missing 

Budget page the budget overview endpoint
Percentage spent is not calculated properly 

Time line and event scheduler not using consistent api 
Guest list and rsvp the same thing 
Collaborative dashboard thesame thing
Messaging the same thing 
Plans and billing the same and also seed data 
Booking and payment- need seeded data 

And please for the rest endpoints I haven’t checked everything because the api wasn’t correct 
You could either 
1. Give a proper documentation on how the response should be 
2. Seed data in the endpoints for GET APIs so I’ll work with the response structure : some of these endpoints I can’t do anything with them cause I don’t even know how the response will be 

N/B PLEASE USE THE FIGMA AS GUIDE TO CREATE YOUR ENDPOINTS