const db = require("../server");

exports.deleteContact = async (req, res, next) => {
  try {
    const query = `DELETE FROM contacts WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({ status: "success", message: "Contact deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
