  // Helper function to validate and convert isBulk to boolean
  exports.validateBooleanValue = (value) => {
    if (value === "true" || value === "false") {
      return Boolean(value === "true");
    }
    return Boolean(value); 
  };