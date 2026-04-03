const recordService = require("./record.service");
const catchAsync = require("../../utils/catchAsync");

exports.getRecords = catchAsync(async (req, res) => {
  // req.user is populated by the auth middleware (which we will build next)
  const result = await recordService.getRecords(req.user.id, req.query);

  res.status(200).json({
    status: "success",
    ...result,
  });
});

exports.createRecord = catchAsync(async (req, res) => {
  const record = await recordService.createRecord(req.user.id, req.body);

  res.status(201).json({
    status: "success",
    data: record,
  });
});

exports.deleteRecord = catchAsync(async (req, res) => {
  await recordService.deleteRecord(req.user.id, req.params.id, req.user.role);

  res.status(204).send(); // 204 No Content is standard for successful deletions
});
