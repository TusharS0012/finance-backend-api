const analyticsService = require("./analytics.service");
const catchAsync = require("../../utils/catchAsync");

exports.getDashboard = catchAsync(async (req, res) => {
  // req.user is guaranteed to exist because this route will be protected
  const dashboardData = await analyticsService.getDashboardSummary(req.user.id);

  res.status(200).json({
    status: "success",
    data: dashboardData,
  });
});
