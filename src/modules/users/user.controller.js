const userService = require("./user.service");
const catchAsync = require("../../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  res.status(200).json({
    status: "success",
    ...result,
  });
});

exports.updateUserAccess = catchAsync(async (req, res) => {
  // req.user.id is the Admin making the request
  // req.params.id is the User being modified
  const updatedUser = await userService.updateUserAccess(
    req.user.id,
    req.params.id,
    req.body,
  );

  res.status(200).json({
    status: "success",
    message: "User access updated successfully",
    data: { user: updatedUser },
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.user.id, req.params.id);

  res.status(204).send();
});
