// This is the main handler class for the AWS Lambda function that processes API Gateway requests for the Nuzlocke application.
// package declaration for the NuzlockeHandler class, which is part of the com.twoxko.nuzlocke package.
package com.twoxko.nuzlocke;

// Import statements for AWS Lambda runtime classes, API Gateway event classes, Gson library for JSON handling, and AWS SDK for DynamoDB.
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

// Import statements for Java utility classes used for data structures like lists and maps.
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// The NuzlockeHandler class implements the RequestHandler interface, allowing it to handle API Gateway requests and responses.
public class NuzlockeHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    // Instance variables for the DynamoDB client, Gson instance, and the name of the DynamoDB table used for storing Nuzlocke data.
    private final DynamoDbClient dynamoDb;
    private final Gson gson;
    private final String TABLE_NAME = "2XKO_Nuzlocke";

    // Constructor for the NuzlockeHandler class, initializing the DynamoDB client and Gson instance.
    public NuzlockeHandler() {
        this.dynamoDb = DynamoDbClient.builder()
                .region(Region.US_EAST_2) 
                .build();
        this.gson = new Gson();
    }

    // Override is used to indicate that this method is overriding a method from the RequestHandler interface.
    // The handleRequest method processes incoming API Gateway requests, updates the DynamoDB table based on the request payload, and returns an appropriate response.
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent event, Context context) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();

        // Handle CORS preflight requests from the browser
        // a preflight request is an HTTP OPTIONS request sent by the browser to determine if the actual request is safe to send.
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "POST, OPTIONS");
        headers.put("Access-Control-Allow-Headers", "Content-Type, x-streamerbot-secret");
        response.setHeaders(headers);

        // If the incoming request is an OPTIONS request (CORS preflight), respond with a 200 OK status and return early.
        if ("OPTIONS".equalsIgnoreCase(event.getHttpMethod())) {
            response.setStatusCode(200);
            return response;
        }

        // Log the incoming request body for debugging purposes.
        try {
            String body = event.getBody();                              // Get the request body from the API Gateway event
            JsonObject payload = gson.fromJson(body, JsonObject.class); // Parse the request body into a JsonObject using Gson
            String action = payload.get("action").getAsString();        // Extract the "action" field from the JSON payload
        
            if ("get_state".equals(action)) {
                // Read everything currently sitting in the database
                // This is ran when the overlay is first loaded to get the current state of the database and display it in the overlay.
                // builder() is a method used to create a new instance of the ScanRequest class with the specified table name.
                ScanRequest scanRequest = ScanRequest.builder()
                        .tableName(TABLE_NAME)
                        .build();
                ScanResponse scanResponse = dynamoDb.scan(scanRequest); // Execute the ScanRequest to retrieve all items from the DynamoDB table

                // Convert the returned items from DynamoDB into a simplified list of maps for easier JSON serialization
                List<Map<String, String>> itemsList = new ArrayList<>();

                // Iterate through each item returned from the DynamoDB scan and simplify the attribute values for JSON serialization
                for (Map<String, AttributeValue> returnedItem : scanResponse.items()) {
                    Map<String, String> simplifiedItem = new HashMap<>();

                    // Iterate through each attribute in the returned item and extract its string or numeric value for easier JSON serialization
                    for (Map.Entry<String, AttributeValue> entry : returnedItem.entrySet()) {
                        String val = entry.getValue().s() != null ? entry.getValue().s() : entry.getValue().n();
                        simplifiedItem.put(entry.getKey(), val);
                    }
                    itemsList.add(simplifiedItem);  // Add the simplified item to the list of items to be returned in the response
                }

                // Set the response status code to 200 (OK) and include the serialized JSON of the items list in the response body
                response.setStatusCode(200);
                response.setBody(gson.toJson(itemsList));
                return response;
            }

            // Database Write Logic
            Map<String, AttributeValue> item = new HashMap<>();

            // Check the action type and populate the item attributes accordingly
            if ("toggle_champion".equals(action)) {
                // Populate the item attributes for a "toggle_champion" action, including the champion ID, type, and status
                item.put("id", AttributeValue.builder().s(payload.get("champion").getAsString()).build());
                item.put("type", AttributeValue.builder().s("champion").build());
                item.put("status", AttributeValue.builder().s(payload.get("status").getAsString()).build());
            } 
            else if ("update_fuse".equals(action)) {
                // Populate the item attributes for an "update_fuse" action, including the fuse ID, type, and count
                item.put("id", AttributeValue.builder().s(payload.get("fuse").getAsString()).build());
                item.put("type", AttributeValue.builder().s("fuse").build());
                item.put("count", AttributeValue.builder().n(payload.get("change").getAsString()).build());
            }

            // Create a PutItemRequest to insert or update the item in the DynamoDB table
            // builder() is used to create a new instance of the PutItemRequest class with the
            PutItemRequest putRequest = PutItemRequest.builder()
                    .tableName(TABLE_NAME)
                    .item(item)
                    .build();
            dynamoDb.putItem(putRequest);   // Execute the PutItemRequest to update the DynamoDB table

            // Set the response status code to 200 (OK) and include a success message in the response body
            response.setStatusCode(200);
            response.setBody(gson.toJson("Database updated successfully via Java!"));

        } catch (Exception e) {
            // Log any exceptions that occur during request processing and set the response status code to 500 (Internal Server Error)
            context.getLogger().log("Error processing request: " + e.getMessage());
            response.setStatusCode(500);
            response.setBody(gson.toJson("Internal Server Error"));
        }

        return response;
    }
}