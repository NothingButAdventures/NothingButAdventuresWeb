import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    FirebaseStorage,
    listAll,
    getMetadata,
    updateMetadata,
    deleteObject,
} from "firebase/storage";

// Firebase project configuration for Nothing But Adventures
// These are public/safe to expose in frontend code (not secrets)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyABp1gBfTBNygIp_QDg4j-89Lrtnz4TthU",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nothing-but-adventures.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nothing-but-adventures",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nothing-but-adventures.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "384612959972",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:384612959972:web:c8f330254e1b4560facef1",
};

// Singleton pattern – avoid re-initializing on hot reloads
let app: FirebaseApp;
let storage: FirebaseStorage;
let auth: Auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

storage = getStorage(app);
auth = getAuth(app);

export { storage, auth, GoogleAuthProvider };

// ─────────────────────────────────────────────
// Core upload helper
// ─────────────────────────────────────────────

/**
 * Upload a File to Firebase Storage and return its permanent public download URL.
 *
 * @param file   The File object to upload
 * @param folder Storage folder path, e.g. "tour-images" or "user-avatars"
 * @param onProgress Optional callback receiving progress 0–100
 */
export const uploadToFirebase = async (
    file: File,
    folder: string = "uploads",
    onProgress?: (pct: number) => void,
    customTitle?: string
): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const path = `${folder}/${uniqueName}`;

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                if (onProgress) {
                    const pct = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    onProgress(pct);
                }
            },
            (error) => {
                console.error("Firebase upload error:", error);
                reject(new Error("Failed to upload image. Please try again."));
            },
            async () => {
                try {
                    // Store custom title as metadata if provided
                    if (customTitle) {
                        await updateMetadata(uploadTask.snapshot.ref, {
                            customMetadata: { title: customTitle },
                        });
                    }
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (err) {
                    reject(err);
                }
            }
        );
    });
};

/**
 * List all images in a specific folder in Firebase Storage.
 * 
 * @param folder Storage folder path, e.g. "tour-images"
 */
export const listAllImages = async (folder: string = "tour-images"): Promise<string[]> => {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)));
    return urls;
};

export interface ImageWithTitle {
    url: string;
    title: string;
}

/**
 * List all images in a folder with their titles (from custom metadata or filename).
 */
export const listAllImagesWithTitles = async (folder: string = "tour-images"): Promise<ImageWithTitle[]> => {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);

    const images = await Promise.all(
        result.items.map(async (item) => {
            const [url, metadata] = await Promise.all([
                getDownloadURL(item),
                getMetadata(item).catch(() => null),
            ]);
            // Use custom title if set, otherwise derive from filename
            const customTitle = metadata?.customMetadata?.title;
            const fallbackTitle = item.name
                .replace(/\.[^.]+$/, "") // remove extension
                .replace(/^\d+-[a-z0-9]+$/, "") // remove auto-generated names
                .replace(/[-_]/g, " ") // dashes/underscores to spaces
                .trim();
            return {
                url,
                title: customTitle || fallbackTitle || item.name,
                createdAt: metadata?.timeCreated || "",
            };
        })
    );
    // Sort newest first
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return images;
};

// ─────────────────────────────────────────────
// Convenience wrappers for specific folders
// ─────────────────────────────────────────────

export const uploadTourImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "tour-images", onProgress);

export const uploadBlogImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "blog-images", onProgress);

export const uploadUserAvatar = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "user-avatars", onProgress);

export const uploadCountryImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "country-images", onProgress);

export const uploadContinentImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "continent-images", onProgress);

export const uploadDiscountImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "discount-images", onProgress);

export const uploadPhysicalRatingImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "physical-rating-images", onProgress);

export const uploadTripTypeImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "trip-type-images", onProgress);

export const uploadTravelStyleImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "travel-style-images", onProgress);

export const uploadActivityImage = (file: File, onProgress?: (pct: number) => void) =>
    uploadToFirebase(file, "activities", onProgress);

/**
 * Delete an image from Firebase Storage by its URL.
 */
export const deleteImageFromFirebase = async (url: string): Promise<void> => {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
};
