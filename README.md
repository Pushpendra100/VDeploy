
# VDeploy
This web application allow users to deploy their react project from their GitHub url. The application follows microservice architecture.

## Features
- User can login and register in both ways - password or google
- Create and delete project
- Make and switch off the deployment
- Get logs of the deployment in the real time
- Logs are stored
  
## Architecture
The project contains the following folders and services
- ```frontend```: Frontend developed using Next.js
- ```api-server```: Node.js HTTP API server for REST API's
- ```build-server```: Docker image which clones github repo, builds and pushes the build to S3
- ```s3-reverse-proxy```: Reverse proxy the subdomains and domains to s3 bucket static assets

**Tech used to make scalable architecture -**
- **Next.js** - Next.js provide modern framework to develop frontend with easy integration of tailwind css (utility-first CSS framework) and shadcn ui (collection of customizable react components)
- **Node.js** - Node.js is scalable and can handle a large number of concurrent connections due to its asynchronous, non-blocking I/O model.
- **ECS** - AWS ECS used to create multiple instances of docker of different user at the same time.
- **S3 Bucket** - Amazon S3, public cloud storage container for storing the static files of the build.
- **Kafka** - Kafka provides real-time streaming data pipelines for the logs generated during the build (Publisher - build-server) and api-server act as the consumer for the logs.
- **ClickHouse** - ClickHouse uses a column oriented structure and is highle performant. ClickHouse works best with immutable data and is great for analytics. ClickHouse is used to store logs of the deployments.
- **PostgreSQL** - PostgreSQL provides reliability, robust feature set, and strong support for complex queries and transactions, ensuring data integrity and scalability. It is used to store users, projecst and deployments data.
  
![diagram-export-06-03-2024-22_06_14](https://github.com/Pushpendra100/VDeploy/assets/94526347/0dbe939c-e6f4-41b3-9f3e-f5b2db1d9b2a)


## Setup Guide
1. Run ```npm install``` in all 4 services i.e. frontend, api-server, build-server and s3-reverse-proxy.
2. Make .env file and include all the environment variables.
3. Include *kafka.pem* file in api-server and build-server folder.
4. Docker build the build-server and push the image to AWS ECR.
5. Run ```npm run dev``` in  frontend, api-server, and s3-reverse-proxy (make sure to have nodmeon in both api-server and s3-reverse-proxy - ```npm install --save-dev nodemon```)

At this point following service would be up and running: 
|Service|PORT|
|------|------|
|frontend|:3000|
|api-server|:9000|
|s3-reverse-proxy|:8000|

## Demo Video
[Watch the demo video of VDeploy](https://drive.google.com/drive/folders/1UEbWOz7XrRRxLkF2KlI6kyI_LWXkblFK?usp=sharing) 

