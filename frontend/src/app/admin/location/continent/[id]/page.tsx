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
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";
import { api } from "@/lib/api";

// --- Configuration ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const BUCKET_NAME = "location-image";

// --- Types ---
interface Continent {
    _id: string;
    id: string;
    name: string;
    slug: string;
    image?: string;
    description?: string;
}

// --- Icons ---
const Icons = {
    Back: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
    ),
    Save: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    Upload: ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Image: ({ className }: { className?: string }) => (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
};

export default function EditContinentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [continent, setContinent] = useState<Continent | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingEditorImage, setUploadingEditorImage] = useState(false);

    // TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto mx-auto shadow-md my-4",
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 hover:text-blue-800 underline",
                },
            }),
            Placeholder.configure({
                placeholder: "Describe this continent... (History, Geography, Culture, etc.)",
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
        if (id) fetchContinent();
    }, [id]);

    const fetchContinent = async () => {
        try {
            const res = await fetch(`${api.baseURL}/continents/${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                const cont = data.data.continent;
                setContinent(cont);
                setName(cont.name);
                setImage(cont.image || "");
                editor?.commands.setContent(cont.description || "");
            }
        } catch (err) {
            console.error("Error fetching continent:", err);
        } finally {
            setLoading(false);
        }
    };

    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `continent-${id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            return data.publicUrl;
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
            const res = await fetch(`${api.baseURL}/continents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    image,
                    description: editor?.getHTML() || "",
                }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.status === "success") {
                alert("Continent saved successfully!");
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

    if (loading) return <div className="p-10 flex justify-center text-gray-500 animate-pulse">Loading continent...</div>;
    if (!continent) return <div className="p-10 text-center">Continent not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/location" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                                <Icons.Back className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Edit Continent</h1>
                                <p className="text-sm text-gray-500">Update details for {continent.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-lg"
                        >
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Icons.Save className="w-5 h-5" />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Basic Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h2 className="text-lg font-semibold mb-6">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Continent Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {image && (
                                        <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setImage("")}
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium">
                                        {uploadingImage ? "Uploading..." : "Upload Image"}
                                        <input type="file" hidden accept="image/*" onChange={handleMainImageUpload} disabled={uploadingImage} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                        <h2 className="text-lg font-semibold text-gray-900">Content & Description</h2>
                        {/* Simple Toolbar */}
                        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
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
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
                                title="Add Image"
                            >
                                {uploadingEditorImage ? (
                                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Icons.Image className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ onClick, isActive, label, icon, bold, italic }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-2 min-w-[32px] rounded-md transition text-sm font-medium flex items-center justify-center
                ${isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}
                ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''}
            `}
        >
            {icon || label}
        </button>
    );
}
