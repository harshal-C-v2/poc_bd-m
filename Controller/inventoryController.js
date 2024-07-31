const { getQueryStringFromObject } = require("../Utils/helper");
const db = require("../server");
const moment = require("moment");

exports.createInventory = async (req, res, next) => {
  try {
    const { inventoryName, quantity, type, vendorRef, billInfo, inventoryItems } = req.body;
    // 1 Create Inventory
    const currentDate = moment().format("YYYY-MM-DD hh:mm:ss");
    const queryInventory = `INSERT INTO inventory (inventoryName, quantity, type, vendorRef, createdDate) VALUES (?, ?, ?, ?, '${currentDate}')`;
    const inventoryValues = [inventoryName, quantity, type, vendorRef];
    const [insertedItem] = await db.query(queryInventory, inventoryValues);
    // 2 Add Image
    if (billInfo) {
      const queryImage = `INSERT INTO inventory_bill_image (image, name, inventoryRef) VALUES (?, ?, ?)`;
      const imageValues = [billInfo.image, billInfo.name, insertedItem.insertId];
      await db.query(queryImage, imageValues);
    }
    // 3 Insert Item
    const insertAllItem = inventoryItems.map(async (item) => {
      const query = `INSERT INTO inventory_item (name, description, inventoryRef) VALUES (?, ?, ${insertedItem.insertId})`;
      const values = [item.name, item.description];
      await db.query(query, values);
    });
    await Promise.all(insertAllItem);
    //4 Get InsertedItem
    const selectQuery = `select * from inventory JOIN vendors ON inventory.vendorRef = vendors.id where inventory.id = ?`;
    const [insertedData] = await db.query(selectQuery, [insertedItem.insertId]);

    res.status(200).json({
      status: "success",
      message: "Client created successfully",
      data: insertedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getAllInventory = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const offset = (page - 1) * limit;
    const query = `
      SELECT inventory.id, inventory.inventoryName, quantity, type, inventory.createdDate, vendors.name as vendorName 
      FROM inventory 
      JOIN vendors ON inventory.vendorRef = vendors.id
      order by inventory.createdDate DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const [rows] = await db.query(query);
    const [totalCount] = await db.query("SELECT COUNT(*) as total FROM inventory");
    const [total] = await db.query(`SELECT count(*) as cnt FROM inventory;`);
    res.status(200).json({ status: "success", total: total[0]["cnt"], data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getSpecificInventory = async (req, res, next) => {
  try {
    // 1 Get Inventory
    const [rows] = await db.query(
      `SELECT inventory.id,inventory.inventoryName,quantity,type, vendors.id as vendorName FROM inventory JOIN vendors ON inventory.vendorRef = vendors.id where inventory.id = ${req.params.id}`
    );
    // 2 Get Image
    const [imageRows] = await db.query(`SELECT * FROM inventory_bill_image where inventoryRef = ${req.params.id}`);
    // 3 Get InventoryItems
    const [selectQueryItem] = await db.query(
      `SELECT *, id as _id FROM inventory_item WHERE inventoryRef = ${req.params.id}`
    );

    res
      .status(200)
      .json({ status: "success", data: { ...rows[0], billInfo: imageRows, inventoryItems: selectQueryItem } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// UPDATE IMAGE ==================================================

// exports.updateImage = async (req, res, next) => {
//   try {
//     const bodyObject = req.body;
//     const query = `UPDATE inventory_bill_image set ${getQueryStringFromObject(bodyObject)} WHERE inventoryRef = ?`;
//     const [data] = await db.query(query, [req.params.id]);
//     const selectQuery = `SELECT * FROM inventory_bill_image WHERE id = ?`;
//     const [updatedData] = await db.query(selectQuery, [req.params.id]);

//     res.status(200).json({
//       status: "success",
//       message: "image updated successfully",
//       data: updatedData[0],
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

exports.updateInventory = async (req, res, next) => {
  try {
    const { inventoryName, quantity, type, inventoryItems } = req.body;
    // 1 Update Inventory
    const createdDate = moment().format("YYYY-MM-DD hh:mm:ss");
    const values = { inventoryName, quantity, type, createdDate };
    const query = `UPDATE inventory set ${getQueryStringFromObject(values)} WHERE id = ?`;
    const [data] = await db.query(query, [req.params.id]);

    // 2 Update InventoryItems
    const itemPayload = inventoryItems;
    const updateAll = itemPayload.map(async (item) => {
      if (item.id) {
        const query = `UPDATE inventory_item set ${getQueryStringFromObject(item)} WHERE id = ?`;
        const [data] = await db.query(query, [item.id]);
      } else {
        const query = `INSERT INTO inventory_item (name, description, inventoryRef) VALUES (?, ?, ${req.params.id} )`;
        const values = [item.name, item.description];
        await db.query(query, values);
      }
    });
    await Promise.all(updateAll);
    //
    const selectQuery = `SELECT inventory.id, inventory.inventoryName, inventory.quantity, inventory.type, vendors.name as vendorName 
    FROM inventory 
    JOIN vendors ON inventory.vendorRef = vendors.id 
    WHERE inventory.id = ?;
    `;
    const [updatedData] = await db.query(selectQuery, [req.params.id]);

    res.status(200).json({
      status: "success",
      message: "inventory updated successfully",
      data: updatedData[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.addImage = async (req, res, next) => {
  try {
    const { image, name, inventoryRef } = req.body;
    const [query] = await db.query(`INSERT INTO inventory_bill_image (image, inventoryRef, name) VALUES (?, ?, ?)`, [
      image,
      inventoryRef,
      name,
    ]);
    const showImageQuery = `select * from inventory_bill_image where id = ${query.insertId}`;
    const [response] = await db.query(showImageQuery);
    res.status(200).json({
      status: "success",
      message: "Image added successfully",
      data: response[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteInventory = async (req, res, next) => {
  try {
    const query = `DELETE FROM inventory WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({
      status: "success",
      message: "Inventory item deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const query = `DELETE FROM inventory_bill_image WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({
      status: "success",
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deleteItemFromInventory = async (req, res, next) => {
  try {
    const query = `DELETE FROM inventory_item WHERE id = ?`;
    const [deletedData] = await db.query(query, [req.params.id]);
    res.status(200).json({
      status: "success",
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
