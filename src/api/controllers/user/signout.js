const signout = async (_req, res, next) => {
  try {
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export default signout;
