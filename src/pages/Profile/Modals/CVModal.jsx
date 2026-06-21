// src/pages/Profile/Modals/CVModal.jsx

// React
import { useState, useEffect } from 'react';

// Axios
import axios from 'axios';

// SweetAlert
import Swal from 'sweetalert2';

// Modals
import Modal from './Modal';

// Icons
import {
  FaFileAlt,
  FaTrashAlt,
  FaCloudUploadAlt,
  FaStar,
  FaRegStar,
  FaFilePdf,
  FaFileWord,
  FaSpinner,
  FaEye
} from 'react-icons/fa';
import { MdDescription } from 'react-icons/md';
import { BiCloudUpload } from 'react-icons/bi';

const MAX_CVS = 3;

export default function CVModal({ isOpen, onClose, profile }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewCv, setPreviewCv] = useState(null);
  const [cvs, setCvs] = useState([]);
  const token = localStorage.getItem('token');

  // Initialize CVs from profile - using setTimeout to avoid cascading renders
  useEffect(() => {
    if (profile?.cvs) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setCvs(profile.cvs.map(cv => ({
          id: cv.id,
          original_name: cv.original_name,
          size: cv.file_size || 0,
          type: cv.cv_path?.split('.').pop() || 'pdf',
          data: cv.cv_url,
          cv_path: cv.cv_path,
          is_primary: cv.is_primary || false,
          order_position: cv.order_position,
          status: cv.status,
          upload_date: cv.created_at
        })));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

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

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadCV = async (file) => {
    if (cvs.length >= MAX_CVS) {
      Swal.fire({
        icon: 'warning',
        title: 'Maximum CVs Reached',
        text: `You can only upload up to ${MAX_CVS} CVs.`,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Too Large',
        text: 'Please upload a file smaller than 5MB',
      });
      return;
    }

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

      const response = await axios.post('/api/applicant-profiles/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = response.data;
      const fileData = await readFileAsDataURL(file);

      const newCv = {
        id: result.id,
        original_name: result.original_name,
        size: result.size,
        type: result.type,
        data: fileData,
        order_position: result.order_position,
        is_primary: result.is_primary,
        upload_date: result.upload_date || new Date().toISOString(),
        status: result.status,
        cv_path: result.cv_path,
      };

      // Use setTimeout to avoid cascading renders
      setTimeout(() => {
        setCvs(prev => [...prev, newCv]);
      }, 0);

      Swal.fire({
        icon: 'success',
        title: 'CV Uploaded!',
        text: `${file.name} uploaded successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Something went wrong.',
      });
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 0);
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
      confirmButtonText: 'Yes, remove it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const cvToRemove = cvs[index];
        if (cvToRemove?.id) {
          try {
            await axios.delete(`/api/applicant-profiles/cv/${cvToRemove.id}`, {
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            });
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.response?.data?.message || 'Failed to remove CV.',
            });
            return;
          }
        }

        const newCVs = cvs.filter((_, i) => i !== index);
        // Use setTimeout to avoid cascading renders
        setTimeout(() => {
          setCvs(newCVs);
        }, 0);

        if (previewCv?.id === cvs[index]?.id) {
          setTimeout(() => {
            setPreviewCv(null);
          }, 0);
        }

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
    const newCVs = cvs.map((cv, idx) => ({
      ...cv,
      is_primary: idx === index
    }));

    // Optimistic update
    setTimeout(() => {
      setCvs(newCVs);
    }, 0);

    const cv = cvs[index];
    if (cv?.id) {
      try {
        await axios.patch(`/api/applicant-profiles/cv/${cv.id}/primary`, {}, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Primary CV Updated!',
          text: 'This CV is now set as primary.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to update primary CV.',
        });
        // Revert the local state change
        const revertedCVs = cvs.map((cv, idx) => ({
          ...cv,
          is_primary: idx === (cvs.findIndex(c => c.id === cv.id))
        }));
        setTimeout(() => {
          setCvs(revertedCVs);
        }, 0);
      }
    }
  };

  const previewCV = (cv) => {
    setPreviewCv(cv);
  };

  const closePreview = () => {
    setPreviewCv(null);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop().toLowerCase();
    if (extension === 'pdf') return <FaFilePdf className="h-8 w-8 text-red-500" />;
    if (extension === 'doc' || extension === 'docx') return <FaFileWord className="h-8 w-8 text-blue-500" />;
    return <FaFileAlt className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const remainingSlots = MAX_CVS - cvs.length;

  if (!isOpen) return null;

  return (
    <>
      <Modal
        title="Manage CVs & Resumes"
        onClose={onClose}
        onSave={() => { onClose(); }}
        saving={false}
      >
        <div className="space-y-6">
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

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {cvs.length} of {MAX_CVS} CVs uploaded
            </span>
            <span className="text-gray-500">
              {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-300"
              style={{ width: `${(cvs.length / MAX_CVS) * 100}%` }}
            />
          </div>

          {cvs.length < MAX_CVS ? (
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 bg-gray-50'
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

          {cvs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Your CVs ({cvs.length}/{MAX_CVS})</h3>
                <span className="text-xs text-gray-500">
                  <FaStar className="inline h-3 w-3 text-yellow-500 mr-1" />
                  Star indicates primary CV
                </span>
              </div>

              {cvs.map((cv, index) => (
                <div key={cv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(cv.original_name)}
                    <div>
                      <p className="font-medium text-gray-900">{cv.original_name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(cv.size)} • {new Date(cv.upload_date).toLocaleDateString()}
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
                    <button
                      onClick={() => previewCV(cv)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Preview CV"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    {!cv.is_primary && cvs.length > 1 && (
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
                    >
                      <FaTrashAlt className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
      </Modal>

      {/* PDF Preview Modal */}
      {previewCv && previewCv.type === 'application/pdf' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4" onClick={closePreview}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{previewCv.original_name}</h3>
                <p className="text-xs text-gray-500">{formatFileSize(previewCv.size)}</p>
              </div>
              <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">{getFileIcon(previewCv.original_name)}</div>
              <p className="text-gray-600 mb-4">Preview not available for this file type.</p>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewCv.data || `/storage/${previewCv.cv_path}`;
                  link.download = previewCv.original_name;
                  link.click();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-PDF Preview */}
      {previewCv && previewCv.type !== 'application/pdf' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4" onClick={closePreview}>
          <div className="bg-white rounded-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{previewCv.original_name}</h3>
                <p className="text-xs text-gray-500">{formatFileSize(previewCv.size)}</p>
              </div>
              <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 text-center">
              <div className="mb-4">{getFileIcon(previewCv.original_name)}</div>
              <p className="text-gray-600 mb-4">Preview not available for this file type.</p>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewCv.data || `/storage/${previewCv.cv_path}`;
                  link.download = previewCv.original_name;
                  link.click();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}