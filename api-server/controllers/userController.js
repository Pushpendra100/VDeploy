const bcrypt = require("bcryptjs");
const sendToken = require("../utlis/jwtToken");
const prisma = new (require("@prisma/client").PrismaClient)();
const { z } = require("zod");
const axios = require("axios");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utlis/errorHandler");

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  if (req.body.googleAccessToken) {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${req.body.googleAccessToken}`,
        },
      }
    );
    const firstName = response.data.given_name;
    const lastName = response.data.family_name;
    const email = response.data.email;
    const name = `${firstName} ${lastName}`;

    const alreadyExistUser = await prisma.user.findFirst({ where: { email } });
    if (alreadyExistUser) {
      return res.status(400).json({ message: "User already exist" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    sendToken(user, 201, res);
  } else {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().min(1),
      password: z.string().min(8),
    });

    const safeParseResult = schema.safeParse(req.body);
    if (safeParseResult.error)
      return next(new ErrorHandler(safeParseResult.error, 400));

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    sendToken(user, 201, res);
  }
});

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  if (req.body.googleAccessToken) {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${req.body.googleAccessToken}`,
        },
      }
    );
    const email = response.data.email;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.send(400).json({ message: "User doesn't exist" });

    sendToken(user, 200, res);
  } else {
    const schema = z.object({
      email: z.string().min(1),
      password: z.string().min(1),
    });

    const safeParseResult = schema.safeParse(req.body);
    if (safeParseResult.error)
      return next(new ErrorHandler(safeParseResult.error, 400));

    const { email, password } = req.body;

    const user = await prisma.user.findFirst({ where: { email: email } });
    console.log(user);
    if (!user) return next(new ErrorHandler("Invalid email or password", 401));

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched)
      return next(new ErrorHandler("Invalid email or password", 401));

    sendToken(user, 200, res);
  }
});

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await prisma.user.findFirst({
    where: { email: req.user.email },
  });
  res.status(200).json({ success: true, user });
});

exports.getUserProjects = catchAsyncErrors(async (req, res, next) => {
  const user = await prisma.user.findFirst({
    where: { email: req.user.email },
  });
  const userProjects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { updatedAt: "desc" },
  });
  res.status(200).json({ success: true, userProjects });
});
