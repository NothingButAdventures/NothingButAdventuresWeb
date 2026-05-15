import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { listAllImagesWithTitles, uploadToFirebase, ImageWithTitle } from "@/lib/firebase";
import { X, CloudArrowUp, Image as ImageIcon, Check, MagnifyingGlass } from "@phosphor-icons/react";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  folder?: string;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  folder = "tour-images",
}: ImagePickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [libraryImages, setLibraryImages] = useState<ImageWithTitle[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Upload form state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "library") {
      fetchImages();
    }
  }, [isOpen, activeTab, folder]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setPendingFiles([]);
      setUploadTitle("");
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const images = await listAllImagesWithTitles(folder);
      setLibraryImages(images);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter images by search query
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return libraryImages;
    const q = searchQuery.toLowerCase();
    return libraryImages.filter((img) =>
      img.title.toLowerCase().includes(q)
    );
  }, [libraryImages, searchQuery]);

  const handleSelect = (url: string) => {
    if (multiple) {
      setSelectedUrls((prev) =>
        prev.includes(url)
          ? prev.filter((u) => u !== url)
          : [...prev, url]
      );
    } else {
      setSelectedUrls([url]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedUrls);
    onClose();
    setSelectedUrls([]);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles(files);
    // Default title to first file's name without extension
    if (!uploadTitle) {
      setUploadTitle(files[0].name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleUploadSubmit = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        const title = pendingFiles.length === 1
          ? uploadTitle || file.name.replace(/\.[^.]+$/, "")
          : `${uploadTitle || "Image"} ${i + 1}`;
        const url = await uploadToFirebase(file, folder, (pct) => {
          setUploadProgress(pct);
        }, title);
        uploadedUrls.push(url);
      }

      if (multiple) {
        setSelectedUrls((prev) => [...prev, ...uploadedUrls]);
      } else {
        setSelectedUrls([uploadedUrls[0]]);
      }

      // Reset upload form and switch to library
      setPendingFiles([]);
      setUploadTitle("");
      setActiveTab("library");
      fetchImages();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(107, 114, 128, 0.75)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          margin: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 0 24px',
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0,
            backgroundColor: 'white',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Select Image</h3>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
            >
              <X size={24} weight="bold" />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <button
              onClick={() => setActiveTab("library")}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                paddingBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: activeTab === "library" ? '#111827' : '#6b7280',
                borderBottom: activeTab === "library" ? '2px solid #111827' : '2px solid transparent',
              }}
            >
              Media Library
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                paddingBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: activeTab === "upload" ? '#111827' : '#6b7280',
                borderBottom: activeTab === "upload" ? '2px solid #111827' : '2px solid transparent',
              }}
            >
              Upload New
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            minHeight: 0,
          }}
        >
          {activeTab === "library" && (
            <>
              {/* Search Bar */}
              <div
                style={{
                  position: 'relative',
                  marginBottom: '16px',
                }}
              >
                <MagnifyingGlass
                  size={18}
                  weight="regular"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search images by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 38px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  <ImageIcon size={48} weight="light" style={{ margin: '0 auto 8px' }} />
                  <p>{searchQuery ? 'No images match your search.' : 'No images found in library.'}</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {filteredImages.map((img, index) => {
                    const isSelected = selectedUrls.includes(img.url);
                    return (
                      <div
                        key={index}
                        onClick={() => handleSelect(img.url)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: isSelected ? '2px solid #111827' : '2px solid #e5e7eb',
                          transition: 'border-color 0.15s',
                          background: 'white',
                        }}
                      >
                        {/* Image */}
                        <div style={{ position: 'relative', height: '96px' }}>
                          <img
                            src={img.url}
                            alt={img.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          {isSelected && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: '#111827',
                                  color: 'white',
                                  borderRadius: '50%',
                                  padding: '4px',
                                }}
                              >
                                <Check size={16} weight="bold" />
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Title below image */}
                        <div
                          style={{
                            padding: '6px 8px',
                            fontSize: '12px',
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            borderTop: '1px solid #f3f4f6',
                          }}
                          title={img.title}
                        >
                          {img.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "upload" && (
            <div>
              {/* File picker area */}
              {pendingFiles.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '180px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                  }}
                >
                  <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                    <CloudArrowUp size={48} weight="light" style={{ margin: '0 auto 8px', color: '#9ca3af' }} />
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Click to select or drag and drop</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      multiple={multiple}
                      accept="image/*"
                      onChange={handleFilePick}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  {/* Preview of selected files */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {pendingFiles.map((file, i) => (
                      <div key={i} style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Title input */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                      Image Title
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Himalaya Sunset View"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleUploadSubmit}
                      disabled={uploading}
                      style={{
                        padding: '8px 20px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'white',
                        backgroundColor: uploading ? '#d1d5db' : '#111827',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPendingFiles([]); setUploadTitle(""); }}
                      disabled={uploading}
                      style={{
                        padding: '8px 20px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#374151',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      Change Files
                    </button>
                  </div>
                </div>
              )}

              {uploading && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                    <div
                      style={{
                        backgroundColor: '#111827',
                        height: '8px',
                        borderRadius: '9999px',
                        transition: 'width 0.3s',
                        width: `${uploadProgress}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: '12px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedUrls.length === 0 || uploading}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: selectedUrls.length === 0 || uploading ? '#d1d5db' : '#111827',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedUrls.length === 0 || uploading ? 'not-allowed' : 'pointer',
            }}
          >
            Add Selected Images {selectedUrls.length > 0 && `(${selectedUrls.length})`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
