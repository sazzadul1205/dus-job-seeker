// src/pages/Auth/CompleteProfileSteps/CVUpload.jsx

// React
import { useState, useEffect } from 'react';

// Axios
import axios from 'axios';

// Icons
import {
  FaFileAlt,
  FaTrashAlt,
  FaCloudUploadAlt,
  FaStar,
  FaRegStar,
  FaFilePdf,
  FaFileWord,
  FaSpinner
} from 'react-icons/fa';
import { MdDescription } from 'react-icons/md';
import { BiCloudUpload } from 'react-icons/bi';

// SweetAlert2 
import Swal from 'sweetalert2';

const MAX_CVS = 3;

const CVUpload = ({ data, setData }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      data.cvs.forEach((cv) => {
        if (cv.preview_url) {
          URL.revokeObjectURL(cv.preview_url);
        }
      });
    };
  }, [data.cvs]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await uploadCV(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadCV(files[0]);
    }
    // Reset input value so same file can be uploaded again
    e.target.value = '';
  };

  const uploadCV = async (file) => {
    // Check if already reached maximum CVs
    if (data.cvs.length >= MAX_CVS) {
      Swal.fire({
        icon: 'warning',
        title: 'Maximum CVs Reached',
        text: `You can only upload up to ${MAX_CVS} CVs. Please remove an existing CV before uploading a new one.`,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Please upload a file smaller than 5MB',
      });
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload PDF, DOC, or DOCX files only',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await axios.post('/api/profile/cv/upload', formData, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      const previewUrl = URL.createObjectURL(file);

      const newCv = {
        id: result.id || Date.now(),
        name: result.original_name || file.name,
        size: result.size || file.size,
        type: result.type || file.type,
        preview_url: previewUrl,
        original_name: result.original_name || file.name,
        order_position: result.order_position || data.cvs.length,
        is_primary: result.is_primary || data.cvs.length === 0,
        upload_date: result.upload_date || new Date().toISOString(),
        status: result.status || 'pending',
        cv_path: result.cv_path || null,
        url: result.url || null,
      };

      setData('cvs', [...data.cvs, newCv]);

      Swal.fire({
        icon: 'success',
        title: 'Upload Successful!',
        text: 'Your CV has been uploaded successfully.',
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Something went wrong while uploading the file.',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeCV = (index) => {
    Swal.fire({
      title: 'Remove CV?',
      text: "Are you sure you want to remove this CV?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const cvToRemove = data.cvs[index];

        // If the CV has an ID and was uploaded to server, delete it
        if (cvToRemove?.id && cvToRemove?.cv_path) {
          try {
            await axios.delete(`/api/profile/cv/${cvToRemove.id}`, {
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
              },
            });
          } catch (error) {
            console.error('Error deleting CV from server:', error);
            // Continue with removal even if server delete fails
          }
        }

        // Revoke object URL to prevent memory leaks
        if (cvToRemove?.preview_url) {
          URL.revokeObjectURL(cvToRemove.preview_url);
        }

        const newCVs = data.cvs.filter((_, i) => i !== index);
        // Reorder positions
        newCVs.forEach((cv, idx) => {
          cv.order_position = idx;
        });
        setData('cvs', newCVs);

        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: 'CV has been removed.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const setPrimaryCV = async (index) => {
    const newCVs = data.cvs.map((cv, idx) => ({
      ...cv,
      is_primary: idx === index
    }));
    setData('cvs', newCVs);

    const cv = data.cvs[index];
    if (cv?.id && cv?.cv_path) {
      try {
        await axios.patch(`/api/profile/cv/${cv.id}/primary`, {}, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error setting primary CV:', error);
        // Revert the change if server update fails
        const revertCVs = data.cvs.map((c, idx) => ({
          ...c,
          is_primary: idx === 0 // Revert to first CV being primary
        }));
        setData('cvs', revertCVs);

        Swal.fire({
          icon: 'error',
          title: 'Failed to Update',
          text: 'Could not set primary CV. Please try again.',
        });
      }
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="h-8 w-8 text-red-500" />;
    if (extension === 'doc' || extension === 'docx') return <FaFileWord className="h-8 w-8 text-blue-500" />;
    return <FaFileAlt className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const remainingSlots = MAX_CVS - data.cvs.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MdDescription className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Your CV/Resume</h2>
            <p className="text-sm text-gray-500 mt-1">Add your resume so employers can review your qualifications</p>
          </div>
        </div>
      </div>

      {/* Upload Progress Indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {data.cvs.length} of {MAX_CVS} CVs uploaded
        </span>
        <span className="text-gray-500">
          {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 rounded-full h-2 transition-all duration-300"
          style={{ width: `${(data.cvs.length / MAX_CVS) * 100}%` }}
        />
      </div>

      {/* Drag & Drop Area - Disabled when max CVs reached */}
      {data.cvs.length < MAX_CVS ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-full shadow-md mb-3">
              <BiCloudUpload className="mx-auto h-10 w-10 text-blue-500" />
            </div>
            <p className="text-base font-medium text-gray-700">
              Drag & drop your CV here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-2">Supports PDF, DOC, DOCX (Max 5MB)</p>
            {uploading && (
              <div className="mt-4 flex flex-col items-center">
                <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                <p className="text-sm text-gray-600 mt-2">Uploading...</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-yellow-100 rounded-full mb-3">
              <FaCloudUploadAlt className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-base font-medium text-yellow-800">
              Maximum CV Limit Reached
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              You have reached the maximum limit of {MAX_CVS} CVs. Please remove an existing CV to upload a new one.
            </p>
          </div>
        </div>
      )}

      {/* CV List */}
      {data.cvs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Your CVs ({data.cvs.length}/{MAX_CVS})</h3>
            <span className="text-xs text-gray-500">
              <FaStar className="inline h-3 w-3 text-yellow-500 mr-1" />
              Star indicates primary CV
            </span>
          </div>

          {data.cvs.map((cv, index) => (
            <div
              key={cv.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(cv.original_name || cv.name)}
                <div>
                  <p className="font-medium text-gray-900">{cv.original_name || cv.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(cv.size)} • {cv.upload_date ? new Date(cv.upload_date).toLocaleDateString() : 'Recently uploaded'}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    {cv.is_primary ? (
                      <>
                        <FaStar className="h-3 w-3 text-yellow-500" />
                        <span className="text-yellow-600">Primary CV</span>
                      </>
                    ) : (
                      <>
                        <FaRegStar className="h-3 w-3 text-gray-400" />
                        <span>{cv.status === 'pending' ? 'Pending' : `CV ${index + 1}`}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!cv.is_primary && data.cvs.length > 1 && (
                  <button
                    onClick={() => setPrimaryCV(index)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
                  >
                    <FaStar className="h-3 w-3" />
                    Set as Primary
                  </button>
                )}
                <button
                  onClick={() => removeCV(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Remove CV"
                >
                  <FaTrashAlt className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center justify-center gap-2">
          <FaCloudUploadAlt className="h-5 w-5 text-blue-500" />
          <p className="text-sm text-gray-600">
            You can upload up to {MAX_CVS} CVs and set one as primary. Your primary CV will be used for auto-applications.
            Files upload immediately and stay pending until your profile is complete.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CVUpload;