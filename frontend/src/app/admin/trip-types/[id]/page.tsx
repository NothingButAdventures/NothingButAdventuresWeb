"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { uploadTripTypeImage } from "@/lib/firebase";
import { api } from "@/lib/api";
import ImagePickerModal from "@/components/ImagePickerModal";

// --- Types ---
interface TripType {
    _id: string;
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    icon?: string;
    image?: string;
    color?: string;
    isActive: boolean;
}

// --- Icons ---
const Icons = {
    Back: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    Save: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    Image: ({ className }: { className?: string }) => (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
};

export default function EditTripTypePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [tripType, setTripType] = useState<TripType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [color, setColor] = useState("#3B82F6");
    const [image, setImage] = useState("");
    const [icon, setIcon] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingEditorImage, setUploadingEditorImage] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    // TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension.configure({
                HTMLAttributes: {
                    class: "rounded-md max-w-full h-auto mx-auto shadow-md my-4",
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-zinc-900 font-semibold hover:underline decoration-zinc-900",
                },
            }),
            Placeholder.configure({
                placeholder: "Describe this trip type... (What makes it unique, Target audience, Best for...)",
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content: "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-lg max-w-none focus:outline-none min-h-[300px] px-6 py-4",
            },
        },
    });

    useEffect(() => {
        if (id) fetchTripType();
    }, [id]);

    const fetchTripType = async () => {
        try {
            const res = await fetch(`${api.baseURL}/trip-types/${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                const type = data.data.tripType;
                setTripType(type);
                setName(type.name);
                setShortDescription(type.shortDescription || "");
                setColor(type.color || "#3B82F6");
                setImage(type.image || "");
                setIcon(type.icon || "");
                setIsActive(type.isActive);
                editor?.commands.setContent(type.description || "");
            }
        } catch (err) {
            console.error("Error fetching trip type:", err);
        } finally {
            setLoading(false);
        }
    };

    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        try {
            return await uploadTripTypeImage(file);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
            return null;
        }
    };

    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const url = await uploadImageToSupabase(file);
        if (url) setImage(url);
        setUploadingImage(false);
    };

    const handleEditorImageUpload = useCallback(async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !editor) return;

            setUploadingEditorImage(true);
            const url = await uploadImageToSupabase(file);
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
            setUploadingEditorImage(false);
        };
        input.click();
    }, [editor, id]);

    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!name) return alert("Name is required");

        setSaving(true);
        try {
            const payload = {
                name,
                shortDescription,
                color,
                image,
                icon,
                isActive,
                description: editor?.getHTML() || "",
            };

            const res = await fetch(`${api.baseURL}/trip-types/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                alert("Trip type saved successfully!");
                router.refresh();
            } else {
                alert("Error saving: " + data.message);
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center text-zinc-500 animate-pulse">Loading trip type...</div>;
    if (!tripType) return <div className="p-10 text-center">Trip type not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/admin/trip-types" className="p-2 border border-gray-200 hover:bg-zinc-100 rounded-md transition text-zinc-600 bg-white shadow-sm flex items-center justify-center">
                                <Icons.Back className="w-4 h-4" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-zinc-800">Edit Trip Type</h1>
                                <p className="text-xs text-gray-500">Update details for {tripType.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 transition shadow-sm font-medium text-sm border border-zinc-900"
                        >
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Icons.Save className="w-4 h-4" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Basic Info Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-6 border-b border-gray-100 pb-3">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Trip Type Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Short Description</label>
                                <input
                                    type="text"
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    maxLength={200}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="Brief summary for cards..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Brand Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer shadow-sm"
                                    />
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm uppercase placeholder:text-gray-400"
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-500 focus:ring-2"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-zinc-700">Active (visible in tour creation)</label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Icon URL (optional)</label>
                                <input
                                    type="text"
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition shadow-sm placeholder:text-gray-400"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cover Image Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-zinc-800 mb-6 border-b border-gray-100 pb-3">Cover Image</h2>
                    <div 
                        onClick={() => setShowImagePicker(true)}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer min-h-[200px]"
                    >
                        {image ? (
                            <div className="relative w-full max-w-lg aspect-video rounded-md overflow-hidden shadow-md group">
                                <img src={image} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity">
                                    Change Image
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Icons.Image className="w-8 h-8" />
                                </div>
                                <p className="text-zinc-600 mb-2 font-medium">Select Cover Image</p>
                                <p className="text-gray-400 text-sm">Click to select from Media Library or Upload a cover image</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Card */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-zinc-800">Detailed Description</h2>
                        {/* Simple Toolbar */}
                        <div className="flex bg-white border border-gray-200 rounded-md p-1 shadow-sm">
                            <ToolbarButton
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                isActive={editor?.isActive("bold")}
                                label="B"
                                bold
                            />
                            <ToolbarButton
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                isActive={editor?.isActive("italic")}
                                label="I"
                                italic
                            />
                            <div className="w-px bg-gray-200 mx-1 my-1" />
                            <ToolbarButton
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                isActive={editor?.isActive("heading", { level: 2 })}
                                label="H2"
                            />
                            <ToolbarButton
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                                isActive={editor?.isActive("heading", { level: 3 })}
                                label="H3"
                            />
                            <div className="w-px bg-gray-200 mx-1 my-1" />
                            <ToolbarButton
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                isActive={editor?.isActive("bulletList")}
                                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" /></svg>}
                            />
                            <button
                                onClick={handleEditorImageUpload}
                                disabled={uploadingEditorImage}
                                className="p-2 text-zinc-600 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
                                title="Add Image"
                            >
                                {uploadingEditorImage ? (
                                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Icons.Image className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <EditorContent editor={editor} />
                </div>
            </div>
            <ImagePickerModal
                isOpen={showImagePicker}
                onClose={() => setShowImagePicker(false)}
                onSelect={(urls) => {
                    if (urls.length > 0) setImage(urls[0]);
                }}
                multiple={false}
            />
        </div>
    );
}

function ToolbarButton({ onClick, isActive, label, icon, bold, italic }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-2 min-w-[32px] rounded-md transition text-sm font-medium flex items-center justify-center
                ${isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}
                ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''}
            `}
        >
            {icon || label}
        </button>
    );
}
