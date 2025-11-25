import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

function RequiredLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block font-medium">
      {children} <span className="text-red-500">*</span>
    </label>
  );
}
function ReportFound() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location: "",
    pointOfContact: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.itemName ||
        !formData.description ||
        !formData.location ||
        !formData.pointOfContact ||
        !imageFile
      ) {
        alert("Please fill in all required fields and upload an image");
        setLoading(false);
        return;
      }

      // Convert image to base64
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await fileToBase64(imageFile);
      }

      const payload = {
        itemName: formData.itemName,
        description: formData.description,
        location: formData.location,
        pointOfContact: formData.pointOfContact,
        imageUrl: imageUrl,
        reportType: "found",
      };

      const response = await api.post("/items/report", payload);

      if (response.status === 201) {
        alert("Item reported successfully!");
        // Reset form
        setFormData({
          itemName: "",
          description: "",
          location: "",
          pointOfContact: "",
        });
        setImage(null);
        setImageFile(null);
        // Redirect to dashboard or items page
        navigate("/");
      }
    } catch (error) {
      console.error("Error reporting item:", error);
      alert(
        error.response?.data?.message ||
          "Failed to report item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="my-20 flex items-center justify-center">
      {/* Common Card */}
      <div className="flex flex-col w-[900px] bg-themeCream rounded-3xl overflow-hidden shadow-md p-10">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-themeGreen mb-8">
          Report Found Item
        </h1>

        {/* Form + Upload Section */}
        <div className="flex gap-10">
          {/* Left: Found Items Info */}
          <form className="flex-1 space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <RequiredLabel
                htmlFor="itemName"
                className="text-sm font-medium mb-1"
              >
                Item Name
              </RequiredLabel>
              <input
                type="text"
                id="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="What is the name of the item?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="flex flex-col">
              <RequiredLabel
                htmlFor="description"
                className="text-sm font-medium mb-1"
              >
                Description
              </RequiredLabel>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a brief description of the item"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="flex flex-col">
              <RequiredLabel
                htmlFor="location"
                className="text-sm font-medium mb-1"
              >
                Location
              </RequiredLabel>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Where did you find this?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="flex flex-col">
              <RequiredLabel
                htmlFor="pointOfContact"
                className="text-sm font-medium mb-1"
              >
                Point of Contact
              </RequiredLabel>
              <input
                type="text"
                id="pointOfContact"
                value={formData.pointOfContact}
                onChange={handleInputChange}
                placeholder="To whom should owner contact?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-10">
              <button
                type="submit"
                disabled={loading}
                className="px-8 bg-themeGreen text-themeCream font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Reporting..." : "Report"}
              </button>
            </div>
          </form>

          {/* Right: Upload Image */}
          <div className="flex-1">
            <RequiredLabel
              htmlFor="upload"
              className="text-sm font-medium mb-1"
            >
              Upload the image
            </RequiredLabel>
            <input
              type="file"
              id="upload"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            {image && (
              <div>
                <h3 className="mb-2">Preview:</h3>
                <img
                  src={image}
                  alt="preview"
                  className="w-64 h-64 object-cover rounded-lg shadow"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportFound;
