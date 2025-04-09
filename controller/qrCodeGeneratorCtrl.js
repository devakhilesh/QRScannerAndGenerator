const { sendErrorResponse } = require("../helper/errorHandler");
const {
  uploadSingleImage,
  deleteSingleImage,
} = require("../helper/fileUpload");
const qr = require("qr-image");
const QRGenratorfile = require("../model/qrCodeGeneratorFileModel");
const QRGenratorText = require("../model/qrCodeTextGeneratorModel");

// const { v4: uuidv4 } = require("uuid");

/**
 *    Create a new QR record by generating a QR code from provided text
 *   POST /api/qr/text
 *    { text: "Some text to encode", contentType: "link" or "text" }
 */
exports.createQrGeneratorText = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = req.body;

    const { text, contentType } = req.body;

    // Validate required fields
    if (!text) {
      return res
        .status(400)
        .json({ status: false, message: "Text is required" });
    }

    if (!contentType) {
      return res
        .status(400)
        .json({ status: false, message: "Please provide content type" });
    }

    const validContentTypes = ["link", "text"];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        status: false,
        message: "Content type should be either 'link' or 'text'",
      });
    }

    // Generate QR code image from text
    const qrImageBuffer = qr.imageSync(text, { type: "png" });
    const imageObj = { data: qrImageBuffer };

    // Upload generated QR image
    const uploadResult = await uploadSingleImage(imageObj, "QR_Generator_Text");
    if (!uploadResult.status) {
      return res
        .status(400)
        .json({ status: false, message: uploadResult.message });
    }
    const fileData = uploadResult.data;

    data.userId = userId;
    data.contentType = contentType;
    data.text = text;
    data.file = fileData;

    if (req.files && req.files.icon) {
      const iconImg = req.files.icon;

      const iconResult = await uploadSingleImage(iconImg, "icon upload");
      if (!iconResult.status) {
        return res
          .status(400)
          .json({
            status: false,
            message: "There is somrthing wrong in status upload",
          });
      }

      data.icon = iconResult.data;
    }

    if (data.purpose) {
      data.purpose = data.purpose;
    }

    // Save QR record in database
    const newQR = await QRGenratorText.create(data);

    return res.status(201).json({
      status: true,
      message: "QR generated and saved successfully",
      data: newQR,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

/**
 *    Get all QR records (excluding soft-deleted) for the authenticated user
 *   GET /api/qr/text
 */
exports.getAllQrGeneratorTexts = async (req, res) => {
  try {
    const userId = req.user._id;
    const filter = req.query; // Additional filters can be passed as query params

    const records = await QRGenratorText.find({
      userId,
      isDeleted: false,
      ...filter,
    }).lean();

    return res.status(200).json({
      status: true,
      message: "QR records fetched successfully",
      data: records,
    });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
};

/**
 *    Soft-delete a QR record by its ID
 *   DELETE /api/qr/text/:id
 */
exports.deleteQrGeneratorText = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await QRGenratorText.findById(id);

    // Check if the record exists and is not already deleted
    if (!record || record.isDeleted) {
      return res
        .status(404)
        .json({ status: false, message: "QR record not found" });
    }

    // Optionally delete the image from the file storage/cloud service here:
    // await deleteSingleImage(record.file);

    // Mark record as deleted
    record.isDeleted = true;
    await record.save();

    return res.status(200).json({
      status: true,
      message: "QR record deleted successfully",
    });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
};

// ------------------------------------------------------------------
// QR Generation Endpoints (Immediate Download with DB storage)
// ------------------------------------------------------------------

/**
 *    Create a new QR code record by generating a QR code based on an uploaded file's URL.
 *   POST /api/qr/file
 *    - contentType: "image" or "pdf"
 *          - uploadedFile (form-data file)
 */


exports.generateFileToQrCode = async (req, res) => {
  try {
    const userId = req.user._id;
    let data = req.body;
    const { contentType } = req.body;

    if (!contentType) {
      return res
        .status(400)
        .json({ status: false, message: "Please Provide Content Type" });
    }

    const validContentTypes = ["image", "pdf"];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        status: false,
        message: "Content type should be either 'image' or 'pdf'",
      });
    }

    if (!req.files || !req.files.uploadedFile) {
      return res
        .status(400)
        .json({ status: false, message: "No file provided" });
    }

    // Upload the provided file (e.g., to Cloudinary or another storage provider)
    const fileInput = req.files.uploadedFile;
    const uploadResult = await uploadSingleImage(
      fileInput,
      "QR_Generator_File"
    );
    if (!uploadResult.status) {
      return res
        .status(400)
        .json({ status: false, message: uploadResult.message });
    }
    const uploadedFile = uploadResult.data;

    // Generate a QR code based on the URL of the uploaded file
    const qrFileUrlBuffer = qr.imageSync(uploadedFile.url, { type: "png" });
    const qrImageObj = { data: qrFileUrlBuffer };

    // Upload the generated QR code image
    const uploadResultOutput = await uploadSingleImage(
      qrImageObj,
      "QR_Generator_Text"
    );
    if (!uploadResultOutput.status) {
      return res
        .status(400)
        .json({ status: false, message: uploadResultOutput.message });
    }
    const qrFile = uploadResultOutput.data;

    data.userId = userId;
    data.contentType = contentType;
    data.uploadedFile = uploadedFile;
    data.file = qrFile;

    if (req.files && req.files.icon) {
      const iconImg = req.files.icon;

      const iconResult = await uploadSingleImage(iconImg, "icon upload");
      if (!iconResult.status) {
        return res
          .status(400)
          .json({
            status: false,
            message: "There is somrthing wrong in status upload",
          });
      }

      data.icon = iconResult.data;
    }

    if (data.purpose) {
      data.purpose = data.purpose;
    }

    // Save the record using the file-based QR model
    const newQR = await QRGenratorfile.create(data);

    return res.status(201).json({
      status: true,
      message: "QR generated and saved successfully",
      data: newQR,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

/**
 *    Get all file-based QR records for the authenticated user (excluding soft-deleted records)
 *   GET /api/qr/file
 *    Optional filters can be applied as query parameters.
 */
exports.getAllFileQrCodes = async (req, res) => {
  try {
    const userId = req.user._id;
    const filter = req.query; // additional filters if needed

    const records = await QRGenratorfile.find({
      userId,
      isDeleted: false,
      ...filter,
    }).lean();

    return res.status(200).json({
      status: true,
      message: "QR records fetched successfully",
      data: records,
    });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
};

/**
 *    Soft-delete a file-based QR record by setting isDeleted to true.
 *   DELETE /api/qr/file/:id
 */
exports.deleteFileQrCode = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await QRGenratorfile.findById(id);

    if (!record || record.isDeleted) {
      return res.status(404).json({
        status: false,
        message: "QR record not found",
      });
    }

    record.isDeleted = true;
    await record.save();

    return res.status(200).json({
      status: true,
      message: "QR record deleted successfully",
    });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Get a single QR Generator Text record by ID
 */

/**
 * Update a QR Generator Text record by ID.
 * If the text is updated, regenerate the QR code and update the file field.
//  */
// exports.updateQrGeneratorText = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text } = req.body;
//     const record = await QrGeneratorText.findById(id);
//     if (!record || record.isDeleted) {
//       return res
//         .status(404)
//         .json({ status: false, message: "QR record not found" });
//     }
//     if (text) {
//       record.text = text;
//       // Regenerate the QR image from the new text
//       const qrImageBuffer = qr.imageSync(text, { type: "png" });
//       const imageObj = { data: qrImageBuffer };
//       const uploadResult = await uploadSingleImage(
//         imageObj,
//         "QR_Generator_Text"
//       );
//       if (!uploadResult.status) {
//         return res
//           .status(400)
//           .json({ status: false, message: uploadResult.message });
//       }
//       // Update the "file" field with the new upload result
//       record.file = uploadResult.data;
//     }
//     await record.save();
//     return res.status(200).json({
//       status: true,
//       message: "QR record updated successfully",
//       data: record,
//     });
//   } catch (err) {
//     return sendErrorResponse(res, 500, err.message);
//   }
// };
