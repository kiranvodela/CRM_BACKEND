// controllers/contactController.js
const Contact = require("../models/Contact");
const { validationResult } = require("express-validator");

const createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const contactData = {
      ...req.body,
      userId: req.user._id,
    };

    const existingContact = await Contact.findOne({
      userId: req.user._id,
      email: req.body.email,
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this email already exists for this user',
      });
    }

    const contact = await Contact.create(contactData);

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: { contact },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Contact with this email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while creating contact",
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: { contact },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating contact",
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting contact",
    });
  }
};

const exportContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id })
      .select("-userId -__v")
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvHeader = "Name,Email,Phone,Company,Status,Notes,Created At\n";
    const csvData = contacts
      .map(
        (contact) =>
          `"${contact.name}","${contact.email}","${contact.phone}","${contact.company}","${contact.status}","${contact.notes || ""}","${contact.createdAt}"`,
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
    res.send(csvHeader + csvData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while exporting contacts",
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
  exportContacts,
};
