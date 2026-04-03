const authService = require("./auth.service");
const catchAsync = require("../../utils/catchAsync");

exports.register = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Please provide both email and password",
    });
  }

  const user = await authService.register(req.body);

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: { user },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Please provide both email and password",
    });
  }

  const { user, token } = await authService.login(email, password);

  res.status(200).json({
    status: "success",
    token,
    data: { user },
  });
});
