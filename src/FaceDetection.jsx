import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";
import "./index.css";

const FaceDetection = () => {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [age, setAge] = useState(null);
  const [gender, setGender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("Starting to load models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/face-and-gender-detection/models/");
        console.log("TinyFaceDetector loaded successfully");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/face-and-gender-detection/models/");
        console.log("FaceLandmark68Net loaded successfully");
        await faceapi.nets.ageGenderNet.loadFromUri("/face-and-gender-detection/models/");
        console.log("AgeGenderNet loaded successfully");
        setModelsLoaded(true); // Only set to true if all models load
      } catch (error) {
        console.error("Failed to load models:", error.message);
        console.error("Error details:", error);
        // Optionally alert user about the failure
        alert("Failed to load models. Check console for details.");
      }
    };
    loadModels();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!modelsLoaded) {
        alert("Models are still loading or failed to load. Please wait or check console.");
        return;
      }
      setLoading(true);
      setImageName(file.name);
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;

      img.onload = async () => {
        try {
          const detections = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withAgeAndGender();

          if (detections) {
            setImage(imageUrl);
            setAge(Math.round(detections.age));
            setGender(detections.gender);
          } else {
            alert("No face detected, please try again.");
            setImage(null);
          }
        } catch (error) {
          console.error("Detection error:", error);
          alert("Error during detection. Check console.");
        } finally {
          setLoading(false);
        }
      };
    }
  };

  return (
    <div className="app-wrapper">
      <div className="bubbles">
        <span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>

      <div className="app-container">
        <h1 className="title">Face Detection App</h1>
        <p className="subtitle">Detect Age & Gender from an Image</p>

        <div className="upload-section">
          <button
            className="upload-btn"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Upload Image
          </button>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />
          {imageName && <p className="file-name">📂 {imageName}</p>}
        </div>

        {loading && <div className="loading-spinner"></div>}

        {image && (
          <div className="image-preview">
            <img src={image} alt="Uploaded" className="img-responsive" />
          </div>
        )}

        {age !== null && (
          <p className="result-text">
            Age: <strong>{age}</strong>
          </p>
        )}
        {gender !== null && (
          <p className="result-text">
            Gender: <strong>{gender}</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default FaceDetection;