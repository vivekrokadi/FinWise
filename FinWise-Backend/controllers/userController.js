export const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netWorth: 0,
      budgetUsage: 0,
      recentTransactions: [],
      upcomingBills: []
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: '/uploads/avatar.jpg'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};