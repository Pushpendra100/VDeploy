const jwt = require("jsonwebtoken");
const prisma = new (require("@prisma/client").PrismaClient)();

const ErrorHandler = require("../utlis/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token)
    return next(new ErrorHandler("Please login to access this resource", 401));
  const decodeData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await prisma.user.findFirst({ where: { email: decodeData.email } });
  if (!req.user) return next(new ErrorHandler("Invalid token", 401));
  next();
});
