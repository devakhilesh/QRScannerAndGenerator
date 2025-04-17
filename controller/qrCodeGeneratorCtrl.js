const { sendErrorResponse } = require("../helper/errorHandler");
const {
  uploadSingleImage,
  deleteSingleImage,
} = require("../helper/fileUpload");
const qr = require("qr-image");
const QRGenratorfile = require("../model/qrCodeGeneratorFileModel");
const QRGenratorText = require("../model/qrCodeTextGeneratorModel");
const QRCode = require('qrcode');
const officegen = require("officegen")
const cloudinary = require("cloudinary").v2;
const { PassThrough } = require('stream');
const { Readable } = require('stream');



const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {}; // No-op
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Upload function
const uploadDocxToCloudinary = (buffer, filename = "document.docx") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "text_docs",
        public_id: filename.replace(".docx", ""),
        format: "docx", // ensure Cloudinary treats it as .docx
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          status: true,
          data: {
            public_id: result.public_id,
            url: result.secure_url,
            format: result.format,
          },
        });
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
};

const generateDocxBuffer = (text) => {
  return new Promise((resolve, reject) => {
    const docx = officegen('docx');

    const pObj = docx.createP();
    pObj.addText(text);

    const chunks = [];
    const stream = new PassThrough();

    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);

    docx.generate(stream); // Pass writable stream here
  });
};


exports.createQrGeneratorText = async (req, res) => {
  let uploadedResources = [];
  try {
    const { text, contentType, purpose } = req.body;
    const userId = req.user._id;

    // Validation
    if (!text?.trim()) return sendErrorResponse(res, 400, "Text is required");
    if (!["link", "text"].includes(contentType)) {
      return sendErrorResponse(res, 400, "Invalid content type");
    }

  let data = {
      userId,
      contentType,
      text: text.trim(),
    };

    let payload;
    if (contentType === "text") {
      // Generate DOCX file
      const docxBuffer = await generateDocxBuffer(text.trim());
      
      // Upload DOCX to Cloudinary
      const docxUpload = await uploadDocxToCloudinary(docxBuffer, `${Date.now()}document.docx`);

      
      if (!docxUpload.status) throw new Error(docxUpload.message);
      
      // data.txtFile = docxUpload.data;
      data.text = docxUpload.data.url
      payload = docxUpload.data.url;
      uploadedResources.push({
        public_id: docxUpload.data.public_id,
        resource_type: "raw"
      });
    } else {
      // URL validation
      // try { new URL(text.trim()); }
      // catch (err) {
      //   return sendErrorResponse(res, 400, "Invalid URL format");
      // }
      payload = text.trim();
    }

    // Generate QR Code
    const qrImageBuffer = qr.imageSync(payload, { type: "png" });
    const qrUpload = await uploadSingleImage(
      { data: qrImageBuffer, filename: "qrcode.png" },
      "qr_codes"
    );
    if (!qrUpload.status) throw new Error(qrUpload.message);
    
    data.file = qrUpload.data;
    uploadedResources.push({
      public_id: qrUpload.data.public_id,
      resource_type: "image"
    });

    // Handle icon upload
    if (req.files?.icon) {
      const iconUpload = await uploadSingleImage(
        req.files.icon,
        "qr_icons"
      );
      if (!iconUpload.status) throw new Error(iconUpload.message);
      
      data.icon = iconUpload.data;
      uploadedResources.push({
        public_id: iconUpload.data.public_id,
        resource_type: "image"
      });
    }

    if (purpose) data.purpose = purpose;

    // Save to database
    const qrRecord = await QRGenratorText.create(data);
    
    res.status(201).json({
      status: true,
      message: "QR generated successfully",
      data: qrRecord,
    });

  } catch (err) {
    // Cleanup uploaded resources on error
    await Promise.all(uploadedResources.map(async ({ public_id, resource_type }) => {
      await cloudinary.uploader.destroy(public_id, { 
        resource_type: resource_type 
      });
    }));
    return sendErrorResponse(res, 500, err.message);
  }
};


/* 
exports.createQrGeneratorText = async (req, res) => {
  let uploadedResources = [];
  try {
    const { text, contentType, purpose } = req.body;
    const userId = req.user._id;

    // Validation
    if (!text?.trim()) return sendErrorResponse(res, 400, "Text is required");
    if (!["link", "text"].includes(contentType)) {
      return sendErrorResponse(res, 400, "Invalid content type");
    }

    const data = {
      userId,
      contentType,
      text: text.trim(),
    };

    // Handle content type specific logic
    let payload;
    if (contentType === "text") {
      // Upload text file
      const txtBuffer = Buffer.from(text.trim(), "utf8");
      const txtUpload = await uploadSingleImage(
        { data: txtBuffer, filename: "textfile.txt" },
        "text_files",
        "raw"
      );
      if (!txtUpload.status) throw new Error(txtUpload.message);
      
      data.txtFile = txtUpload.data;
      payload = txtUpload.data.url;
      uploadedResources.push({ 
        public_id: txtUpload.data.public_id, 
        resource_type: "raw" 
      });
    } else {
      // Validate URL format
      try { new URL(text.trim()); } 
      catch (err) {
        return sendErrorResponse(res, 400, "Invalid URL format");
      }
      payload = text.trim();
    }

    // Generate QR Code
    const qrImageBuffer = qr.imageSync(payload, { type: "png" });
    const qrUpload = await uploadSingleImage(
      { data: qrImageBuffer, filename: "qrcode.png" },
      "qr_codes"
    );
    if (!qrUpload.status) throw new Error(qrUpload.message);
    
    data.file = qrUpload.data;
    uploadedResources.push({
      public_id: qrUpload.data.public_id,
      resource_type: "image"
    });

    // Handle optional icon
    if (req.files?.icon) {
      const iconUpload = await uploadSingleImage(
        req.files.icon,
        "qr_icons"
      );
      if (!iconUpload.status) throw new Error(iconUpload.message);
      
      data.icon = iconUpload.data;
      uploadedResources.push({
        public_id: iconUpload.data.public_id,
        resource_type: "image"
      });
    }

    // Add purpose if provided
    if (purpose) data.purpose = purpose;

    // Save to database
    const qrRecord = await QRGenratorText.create(data);
    
    res.status(201).json({
      status: true,
      message: "QR generated successfully",
      data: qrRecord,
    });

  } catch (err) {
    // Cleanup uploaded resources on error
    await Promise.all(uploadedResources.map(async ({ public_id, resource_type }) => {
      await cloudinary.uploader.destroy(public_id, { 
        resource_type: resource_type 
      });
    }));
    return sendErrorResponse(res, 500, err.message);
  }
};


 */


/* exports.createQrGeneratorText = async (req, res) => {
  try {
    const userId      = req.user._id;
    const data        = {};                  // this is what we'll save
    const { text, contentType, purpose } = req.body;

    // 1) validate inputs
    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Text is required" });
    }
    if (!contentType || !["link","text"].includes(contentType)) {
      return res
        .status(400)
        .json({ status: false, message: "contentType must be 'link' or 'text'" });
    }

    // 2) decide what our QR payload is:
    //    - if link → payload = the link itself
    //    - if text → first upload .txt, payload = that .txt URL
    let payload = text.trim();

    if (contentType === "text") {
      // --- convert raw text to a .txt buffer ---
      const txtBuffer = Buffer.from(payload, "utf8");

      // --- upload the .txt file ---
      const txtUpload = await uploadSingleImage(
        { data: txtBuffer, filename: "generated-text.txt" },
        "Text_Files"
      );
      if (!txtUpload.status) {
        return sendErrorResponse(res, 400, txtUpload.message);
      }

      // record the .txt‑file metadata and switch to its URL
      data.txtFile = txtUpload.data;     // e.g. { url, public_id, ... }
      payload     = txtUpload.data.url;  // this is what we'll QR‑encode
    }

    // 3) generate & upload the QR image for **payload**
    const qrImageBuffer = qr.imageSync(payload, { type: "png" });
    const qrUpload = await uploadSingleImage(
      { data: qrImageBuffer, filename: "qr.png" },
      "QR_Generator_Text"
    );
    if (!qrUpload.status) {
      return sendErrorResponse(res, 400, qrUpload.message);
    }
    data.file = qrUpload.data;  // QR metadata

    // 4) build the DB record
    data.userId      = userId;
    data.contentType = contentType;
    data.text        = payload;    // now holds the .txt URL or the original link
    if (purpose) data.purpose = purpose;

    // 5) optional icon
    if (req.files && req.files.icon) {
      const iconResult = await uploadSingleImage(
        req.files.icon,
        "QR_Icon"
      );
      if (!iconResult.status) {
        return sendErrorResponse(res, 400, iconResult.message);
      }
      data.icon = iconResult.data;
    }

    // 6) save & respond
    const newQR = await QRGenratorText.create(data);
    return res.status(201).json({
      status:  true,
      message: "Text‐file (if text) uploaded & QR generated successfully",
      data:    newQR,
    });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
};
 */




// const { v4: uuidv4 } = require("uuid");

/**
 *    Create a new QR record by generating a QR code from provided text
 *   POST /api/qr/text
 *    { text: "Some text to encode", contentType: "link" or "text" }
 */
/* exports.createQrGeneratorText = async (req, res) => {
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


// in text section provide uploaded doc url and store 

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
}; */

/* exports.createQrGeneratorText = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text, contentType, purpose } = req.body;

    // 1) basic validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      return sendErrorResponse(res, 400, "Text is required and must be a non‑empty string.");
    }
    if (!contentType || !['link','text'].includes(contentType)) {
      return sendErrorResponse(res, 400, "contentType must be either 'link' or 'text'.");
    }

    // 2) if it's a link, make sure it's a valid URL (add http if missing)
    let payload = text.trim();
    if (contentType === 'link') {
      if (!/^https?:\/\//i.test(payload)) {
        payload = 'https://' + payload;
      }
      try {
        new URL(payload);
      } catch(_) {
        return sendErrorResponse(res, 400, "Invalid URL provided for link.");
      }
    }

    // 3) generate a PNG buffer with high error‑correction so it scans even if small or complex
    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 500,
      margin: 2,
    };
    const qrImageBuffer = await QRCode.toBuffer(payload, qrOptions);

    // 4) upload it
    const uploadResult = await uploadSingleImage(
      { data: qrImageBuffer, filename: 'qr.png' },
      'QR_Generator_Text'
    );
    if (!uploadResult.status) {
      return sendErrorResponse(res, 400, uploadResult.message);
    }

    // 5) build DB record
    const record = {
      userId,
      contentType,
      text: payload,
      file: uploadResult.data,
    };
    // optional icon upload
    if (req.files && req.files.icon) {
      const iconResult = await uploadSingleImage(req.files.icon, 'QR_Icon');
      if (!iconResult.status) {
        return sendErrorResponse(res, 400, iconResult.message);
      }
      record.icon = iconResult.data;
    }
    if (purpose) {
      record.purpose = purpose;
    }

    // 6) persist
    const newQR = await QRGenratorText.create(record);

    return res.status(201).json({
      status: true,
      message: "QR generated and saved successfully",
      data: newQR,
    });
  } catch (err) {
    return sendErrorResponse(res, 500, err.message);
  }
}; */



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
