import json
import boto3
from urllib.parse import unquote_plus
from botocore.exceptions import ClientError


# Initialize the AWS clients
s3_client = boto3.client('s3')
# bedrock_client = boto3.client('bedrock', region_name='ap-southeast-2')  # Replace with your AWS region

bedrock_client = boto3.client('bedrock-agent')

# client = boto3.client('bedrock-agent')

def lambda_handler(event, context):
    try:
        # Get the S3 bucket and file name from the event
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        file_key = unquote_plus(event['Records'][0]['s3']['object']['key'])

        # Print the details of the event
        print(f"File uploaded to S3: Bucket={bucket_name}, Key={file_key}")

        # S3 Path
        s3_file_path = f's3://thethinkproject2/{file_key}'

        # Specify the Knowledge Base ID (replace with your actual ID)
        knowledge_base_id = 'FPBKSGFEM3'

        # Update the knowledge base using the S3 file
        update_knowledge_base(knowledge_base_id, s3_file_path)

        return {
            'statusCode': 200,
            'body': json.dumps('Knowledge base update initiated successfully.')
        }

    except ClientError as e:
        print(f"Error occurred: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error: {str(e)}")
        }

def update_knowledge_base(knowledge_base_id, s3_path):
    try:

        # working code
        response = bedrock_client.start_ingestion_job(
            clientToken="80f0c78fa57341ac9e82cd2f554337e11",  # Unique token to ensure idempotency
            dataSourceId="4TBSCCSVUE",  # Specify your data source ARN
            knowledgeBaseId=knowledge_base_id,  # ID of the knowledge base to which data is ingested
            description="Ingesting data for knowledge base use"
        )


        # print("Knowledge base update initiated successfully.")
        # print(response)

    except ClientError as e:
        print(f"Error updating knowledge base: {e}")
        raise e
