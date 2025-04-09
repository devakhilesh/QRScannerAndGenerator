// Create a document
async function createDocument(model, data) {
  try {
    const document = await model.create(data);
    if (!document) {
      return { status: false, message: "Document creation failed" };
    }
    return {
      status: true,
      message: "Document created successfully",
      data: document,
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

// Find a single document
async function findListOfAllDocument(model, query) {
  try {
    const document = await model.find(query);
    return {
      status: true,
      message: "Document fetched successfully",
      data: document,
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

// Find document by ID
async function findByIdDocument(model, id) {
  try {
    const document = await model.findById(id);
    if (!document) {
      return { status: false, message: "Document not found" };
    }
    return {
      status: true,
      message: "Document fetched successfully",
      data: document,
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

//find One document 
async function findOneDocument(model, query) {
  try {
    const document = await model.findOne(query);
    if (!document) {
      return { status: false, message: "Document not found" };
    }
    return {
      status: true,
      message: "Document fetched successfully",
      data: document,
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

// Update document by id
async function updateDocumentById(model, id, updateData) {
  try {
    const document = await model.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!document) {
      return { status: false, message: "Document not found" };
    }
    return {
      status: true,
      message: "Document updated successfully",
      data: document,
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

//findOne and Update document 
async function findOneAndUpdateDocument(model,query, updateData) {
  try {
    const document = await model.findOneAndUpdate(query, updateData, {
      new: true,
    });
    if (!document) {
      return { status: false, message: "Document not found" };
    }
    return {
      status: true,
      message: "Document updated successfully",
      data: document,
    };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

// findOne and Delete document
async function deleteDocument(model, query) {
  try {
    const document = await model.findOneAndDelete(query);
    if (!document) {
      return { status: false, message: "Document not found" };
    }
    return {
      status: true,
      message: "Document deleted successfully",
      data: document,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error deleting document: " + error.message,
    };
  }
}

// findById And Delete
async function deleteByIdDocument(model, id) {
  try {
    const document = await model.findByIdAndDelete(id);
    if (!document) {
      return { status: false, message: "Document not found" };
    }
    return {
      status: true,
      message: "Document deleted successfully",
      data: document,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error deleting document: " + error.message,
    };
  }
}

module.exports = {
  createDocument,
  findListOfAllDocument,
  findByIdDocument,
  findOneDocument,
  updateDocumentById,
  findOneAndUpdateDocument,
  deleteDocument,
  deleteByIdDocument,
};
