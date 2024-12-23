import AWS from 'aws-sdk';
import {
    BedrockAgentRuntimeClient,
    InvokeAgentCommand,
  } from "@aws-sdk/client-bedrock-agent-runtime";
  import { v4 as uuidv4 } from 'uuid';



const AGGREGATED_FILE_KEY = "knowledge/aggregated_insights.json"
const BUCKET_NAME = "thethinkproject2"
const BEDROCK_AGENT_ID = "OA3G21UESB"
const KNOWLEDGE_BASE_ID = "FPBKSGFEM3"
const AWS_REGION = 'ap-southeast-2'
const MODEL_ARN = 'arn:aws:bedrock:ap-southeast-2:711387125062:agent/OA3G21UESB'
const MODEL_ID = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
const ALIAS_ID= "FN4YCBTL4I"

const s3 = new AWS.S3();
// const bedrock = new AWS.Bedrock({ region: AWS_REGION }); // Ensure the correct region



export const handler = async (event) => {
    console.log("triggering now")
    try {
        // Get the S3 bucket and file information from the event
        const bucketName = event.Records[0].s3.bucket.name;
        console.log("bucketName", bucketName)
        const fileKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        console.log("fileKey", fileKey)
        // Retrieve the text file content from S3
        const s3Object = await s3.getObject({
            Bucket: bucketName,
            Key: fileKey
        }).promise();
    
        const fileContent = s3Object.Body.toString('utf-8'); // Convert the file content to string
        console.log("fileContent", fileContent)
        // const client = new BedrockAgentRuntimeClient({ region: AWS_REGION });
        
        // const command = new InvokeAgentCommand({
        //    agentId: BEDROCK_AGENT_ID,
        //    inputText: fileContent,
        //    agentAliasId: ALIAS_ID,
        //    sessionId: uuidv4()
        // });
        // const response = await client.send(command);
        
        // const response = await client.send(command, { requestTimeout : 1000 * 10 });

        // console.log("response", response)
        // let completion = "";

        // console.log("response", response)
        // if (response.completion === undefined) {
        //     throw new Error("Completion is undefined");
        // }

        // for await (const chunkEvent of response.completion) {
        //     const chunk = chunkEvent.chunk;
        //     console.log(chunk);
        //     const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
        //     completion += decodedResponse;
        // }

        // console.log("completion", completion)

        // put completion data to s3


        if(fileContent){
            // Date.now()
            const summary_path = `knowledge/knowledge-${Date.now()}.txt`
            const s3Params = {
                Bucket: BUCKET_NAME,
                Key: summary_path, // Adjust the file path and name as needed
                Body: fileContent,
                ContentType: 'text/plain',
            };
           const puts3 = await s3.putObject(s3Params).promise();
              console.log("file created success", puts3)

              // moved to another lambda
          //  const params = {
          //   knowledgeBaseId: KNOWLEDGE_BASE_ID, // Your Knowledge Base ID
          //   inputSource: {
          //     s3: {
          //       uri: `s3://thethinkproject/${summary_path}`, // S3 URI where your file is stored (e.g., 's3://bucket-name/path/to/file.json')
          //     },
          //   },
          // };
          // s3://thethinkproject/knowledge/knowledge-1734639159480.txt
          //  const command = new UpdateKnowledgeBaseCommand(params)

          //  const bedrockClient = new BedrockAgentClient({
          //   region: AWS_REGION, // e.g., 'us-east-1', 'ap-southeast-2'
          // });

          // const updata = await bedrockClient.send(command)
          // console.log("Knowledge Base updated successfully:", updata);

        }
    
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Text sent to Bedrock successfully.' }),
        };
    
    }catch(e){
        console.log("exception is", e)
        return {
            statusCode: 500,
            body: e
        };
    }

}
  
