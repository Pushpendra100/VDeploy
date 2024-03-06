const prisma = new (require("@prisma/client").PrismaClient)();
const { z } = require("zod");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const {
  S3Client,
  DeleteObjectCommand,
  ListObjectsCommand,
} = require("@aws-sdk/client-s3");

const client = require("../config/clickHouse");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utlis/errorHandler");

const ecsClient = new ECSClient({
  region: process.env.ECS_REGION,
  credentials: {
    accessKeyId: process.env.ECS_ACCESS_KEY_ID,
    secretAccessKey: process.env.ECS_SECRET_ACCESS_KEY,
  },
});

const s3Client = new S3Client({
  region: process.env.S3_CLIENT_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

exports.createProject = catchAsyncErrors(async (req, res, next) => {
  const schema = z.object({
    name: z.string().min(1),
    gitURL: z.string().min(1),
  });

  const safeParseResult = schema.safeParse(req.body);
  if (safeParseResult.error)
    return next(new ErrorHandler(safeParseResult.error, 400));

  const { name, gitURL } = req.body;
  const user = await prisma.user.findFirst({
    where: { email: req.user.email },
  });

  const project = await prisma.project.create({
    data: {
      name,
      gitURL,
      subDomain: generateSlug(),
      userId: user.id,
    },
  });

  return res.status(201).json({
    success: true,
    project,
  });
});

exports.getProjectDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await prisma.user.findFirst({
    where: { email: req.user.email },
  });
  const projectId = req.params.id;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const deployments = await prisma.deployment.findMany({
    where: { projectId },
  });

  return res.status(200).json({
    success: true,
    project,
    deployments,
  });
});

exports.projectDeploy = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.id;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return next(new ErrorHandler("Project not found", 404));

  const deployment = await prisma.deployment.create({
    data: {
      project: { connect: { id: projectId } },
      status: "QUEUED",
    },
  });

  // Spin the ECS container
  const command = new RunTaskCommand({
    cluster: process.env.ECS_CLUSTER,
    taskDefinition: process.env.ECS_TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          process.env.ECS_SUBNET_1,
          process.env.ECS_SUBNET_2,
          process.env.ECS_SUBNET_3,
        ],
        securityGroups: [process.env.ECS_SECURITY_GROUP_1],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            {
              name: "GIT_REPOSITORY__URL",
              value: project.gitURL,
            },
            {
              name: "PROJECT_ID",
              value: project.id,
            },
            {
              name: "DEPLOYMENT_ID",
              value: deployment.id,
            },
            {
              name: "KAFKA_BROKER",
              value: process.env.KAFKA_BROKER,
            },
            {
              name: "KAFKA_USERNAME",
              value: process.env.KAFKA_USERNAME,
            },
            {
              name: "KAFKA_PASSWORD",
              value: process.env.KAFKA_PASSWORD,
            },
            {
              name: "S3_CLIENT_REGION",
              value: process.env.S3_CLIENT_REGION,
            },
            {
              name: "S3_ACCESS_KEY_ID",
              value: process.env.S3_ACCESS_KEY_ID,
            },
            {
              name: "S3_SECRET_ACCESS_KEY",
              value: process.env.S3_SECRET_ACCESS_KEY,
            },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);

  return res.json({
    status: "queued",
    data: { deploymentId: deployment.id },
  });
});

exports.projectDeployments = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.id;
  const deployments = await prisma.deployment.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return res.status(200).json({ success: true, deployments });
});

exports.getDeploymentDetails = catchAsyncErrors(async (req, res, next) => {
  const deploymentId = req.params.id;
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  return res.status(200).json({ deployment });
});

exports.getDeploymentLogs = catchAsyncErrors(async (req, res, next) => {
  const deploymentId = req.params.id;
  const logs = await client.query({
    query: `SELECT event_id, deployment_id, log, timestamp from log_events where deployment_id = {deployment_id:String} order by timestamp`,
    query_params: {
      deployment_id: deploymentId,
    },
    format: "JSONEachRow",
  });
  const rawLogs = await logs.json();
  return res.status(200).json({ logs: rawLogs });
});

exports.setDeploymentStatus = catchAsyncErrors(async (req, res, next) => {
  const deploymentId = req.params.id;
  const status = req.body.status;
  console.log(deploymentId);
  const deployment = await prisma.deployment.update({
    where: { id: deploymentId },
    data: { status },
  });
  return res.status(200).json({
    success: true,
    deployment,
  });
});

exports.setProjectStatus = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.id;
  const status = req.body.status;
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
  return res.status(200).json({
    success: true,
    project,
  });
});

exports.setProjectDeploymentOff = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.projectId;
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: "NOT_LIVE" },
  });
  const deployment = await prisma.deployment.findFirst({
    where: { projectId, status: "READY" },
  });
  await prisma.deployment.update({
    where: { id: deployment.id },
    data: { status: "STOPPED" },
  });
  return res.status(200).json({
    success: true,
    project,
  });
});

exports.deleteProject = catchAsyncErrors(async (req, res, next) => {
  const projectId = req.params.id;
  await prisma.deployment.deleteMany({ where: { projectId } });
  await prisma.project.delete({
    where: { id: projectId },
  });

  const { Contents } = await s3Client.send(
    new ListObjectsCommand({
      Bucket: "vercel-clone-pushpa",
      Prefix: `__outputs/${projectId}`,
    })
  );

  if (!Contents) return;
  Contents.forEach(async (Key) => {
    console.log(Key);
    const command = new DeleteObjectCommand({ Bucket: "vercel-clone-pushpa", Key:Key.Key })
    await s3Client.send(command);
  });

  return res.status(200).json({
    success: true,
  });
});
