import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3();

export const handler = async (event) => {
    console.log("event is", event)
    // Parse the incoming JSON event from API Gateway
    const orderData = JSON.parse(event.body);

    // Helper function to filter out null or undefined values
    const cleanValue = (value) => value === null || value === undefined ? '' : value;

    if(!cleanValue(orderData?.data?.consumer?.name)){
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Order rejected because of no name',
            })
        };
    }

    // Transform order data into a text summary, omitting undefined or null values
    const summary = `
        Order Summary:
        ${orderData.data.id ? `- Order ID: ${cleanValue(orderData.data.id)}` : ''}
        ${orderData.data.consumer?.name ? `- Consumer: ${cleanValue(orderData.data.consumer.name)} (${cleanValue(orderData.data.consumer.email)}, ${cleanValue(orderData.data.consumer.phone)})` : ''}
        ${orderData.data.createdAt ? `- Order Date: ${cleanValue(orderData.data.createdAt)}` : ''}
        ${orderData.data.requiredAt ? `- Required By: ${cleanValue(orderData.data.requiredAt)}` : ''}
        ${orderData.data.store_name ? `- Store: ${cleanValue(orderData.data.store_name)}` : ''}
        ${orderData.store_name ? `- Store: ${cleanValue(orderData.store_name)}` : ''}
        ${orderData.data.type ? `- Order Type: ${cleanValue(orderData.data.type)}` : ''}
        ${orderData.data.notes ? `- Order Note : ${cleanValue(orderData.data.notes)}` : ''}

        Dine in Summary:
        ${orderData.data.table?.name ? `- Table name: ${cleanValue(orderData.data?.table?.name)}` : ''}
        ${orderData.data.table?.section?.name ? `- Section Name: ${cleanValue(orderData?.data.table?.section?.name)}` : ''}
        ${orderData.data.table?.guestCount ? `- Guest Count: ${cleanValue(orderData.data?.table?.guestCount)}` : ''}
        Ordered Items:
        ${orderData.data.items?.map(item => `
            ${item.name ? `- ${cleanValue(item.name)} (Qty: ${item.quantity}, Price: ${item.unitPrice}, Total: ${item.totalAfterSurcounts}, Item note: ${cleanValue(item.itemNotes)})` : ''}
        `).join('')}
        Source:
        ${orderData.data.source !== 'all' ? `- Ordered from : ${cleanValue(orderData.data.source)}` : ''}        
        ${orderData.data.partner ? `- Ordered by partner : ${cleanValue(orderData.data.partner)}` : ''}

        Additional Charges:
        ${orderData.data.tip !== undefined ? `- Tip: ${cleanValue(orderData.data.tip)}` : ''}
        ${orderData.data.totalAfterSurcounts ? `Total Paid: ${cleanValue(orderData.data.totalAfterSurcounts)}` : ''}
        
        Payment:
        ${orderData.data.transactions?.[0]?.method ? `- Payment Method: ${cleanValue(orderData.data.transactions[0].method)}` : ''}
        ${orderData.data.transactions?.[0]?.amount ? `- Amount Paid: ${cleanValue(orderData.data.transactions[0].amount)}` : ''}
        ${orderData.data.transactions?.[0]?.tip !== undefined ? `- Tip: ${cleanValue(orderData.data.transactions[0].tip)}` : ''}
    `;

    // Define S3 bucket and file name
    const bucketName = 'thethinkproject2';
    const fileName = `order/order-summary-${uuidv4()}.txt`;

    // Prepare S3 params to save the summary
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: summary,
        ContentType: 'text/plain'
    };

    try {
        // Upload the summary to S3
        await s3.putObject(params).promise();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Order summary successfully saved to S3',
                fileName: fileName
            })
        };
    } catch (error) { 
        console.error('Error saving to S3:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to save order summary to S3', error: error.message })
        };
    }
};
