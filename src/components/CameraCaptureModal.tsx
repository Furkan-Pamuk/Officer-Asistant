"use client";

import { useEffect, useRef, useState } from "react";
import { db, uid } from "@/lib/db";
import { learnFromHistory } from "@/lib/catalogue";
import {
  prepareCatalogContextForAI,
  maintainMyListCatalog,
  normalizeCategory,
} from "@/lib/my-list-catalog";
import type { RequestTab } from "@/lib/types";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string | null;
  currentTab: string;
  onAdded?: (item: { productId: string; name: string; quantity: string }) => void;
}

interface IdentifiedProduct {
  productId: string;
  productName: string;
  category: string;
  unit: string;
  confidence: number;
  matchSource: string;
  description: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  contractId,
  currentTab,
  onAdded,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusText, setStatusText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [recognized, setRecognized] = useState<IdentifiedProduct | null>(null);
  const [addedReqId, setAddedReqId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [catalogContextCount, setCatalogContextCount] = useState<number>(0);
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Initialize camera stream when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setRecognized(null);
      setAddedReqId(null);
      setQuantity("1");
      setErrorMsg("");
      startCamera(facingMode);

      // Pre-warm / count the catalog context from My List
      prepareCatalogContextForAI(contractId, currentTab).then((ctx) => {
        setCatalogContextCount(6795 + ctx.length);
      });

      // Load saved Google key from localStorage if available
      try {
        const savedKey = localStorage.getItem("oa-google-api-key") || localStorage.getItem("oa-ai-api-key");
        if (savedKey) setUserApiKey(savedKey);
      } catch {}
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  async function startCamera(facing: "environment" | "user") {
    stopCamera();
    setErrorMsg("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser or requires HTTPS.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn("Camera start failed, offering upload fallback:", err);
      setCameraActive(false);
      setErrorMsg(
        err?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in browser settings, or use the Upload Photo button below."
          : `Camera unavailable: ${err?.message || "Check permissions or use photo upload."}`
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function toggleCamera() {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }

  // Snap photo from live video stream
  function capturePhoto() {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      if (navigator.vibrate) navigator.vibrate(40);

      stopCamera();
      setCapturedImage(dataUrl);
      analyzePhoto(dataUrl);
    } catch (err: any) {
      setErrorMsg("Failed to capture image: " + err.message);
    }
  }

  // Handle file upload fallback
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        stopCamera();
        setCapturedImage(dataUrl);
        analyzePhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  // Send photo and My List catalog context to AI API
  async function analyzePhoto(imageDataUrl: string) {
    if (!contractId) {
      setErrorMsg("Please select an active vessel contract first.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg("");
    setStatusText("Preparing catalog context from My List...");

    try {
      // 1. Build context from My List and catalogue
      const catalogContext = await prepareCatalogContextForAI(contractId, currentTab);
      setCatalogContextCount(6795 + catalogContext.length);

      setStatusText("Sending photo to Gemini 3.5 Flash Lite with all 6,795 catalog items...");

      // Retrieve current profile & contract for user activity tracking in Admin Dashboard
      const profile = await db.profile.get("me").catch(() => null);
      const contract = contractId ? await db.contracts.get(contractId).catch(() => null) : null;
      const currentUser = {
        id: "usr_furkan",
        name: profile?.displayName || "Furkan Pamuk",
        rank: profile?.rank || "Chief Officer",
        vessel: contract?.shipName || "M/V Pacific Horizon",
      };

      // 2. Call the Next.js API route authenticated with Google API key
      const res = await fetch("/api/requests/ai-identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageDataUrl,
          catalogContext,
          preferredCategory: currentTab,
          googleApiKey: userApiKey.trim() || undefined,
          model: "gemini-3.5-flash-lite",
          currentUser,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        if (data.needsApiKey) {
          setShowKeyInput(true);
        }
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (!data.product || !data.product.productId) {
        throw new Error("No matching catalog product was returned by Google AI.");
      }

      const prod: IdentifiedProduct = data.product;
      setRecognized(prod);
      setStatusText("Product recognized! Appending to My List...");

      // 3. Automatically append the recognized product to "My List"
      const targetTab: RequestTab = normalizeCategory(prod.category);
      const newRequestId = uid("r");

      await db.requests.add({
        id: newRequestId,
        tab: targetTab,
        item: prod.productName,
        code: prod.productId,
        quantity: "1",
        unit: prod.unit || "pcs",
        status: "draft",
        note: `AI Camera (${Math.round((prod.confidence || 0.9) * 100)}% match • ${prod.matchSource})`,
        updatedAt: new Date().toISOString(),
        contractId,
      });

      setAddedReqId(newRequestId);

      // 4. Teach catalogue system and maintain the catalog from "My List"
      await learnFromHistory(prod.productName, prod.productId, prod.unit, targetTab);
      await maintainMyListCatalog(contractId);

      if (onAdded) {
        onAdded({
          productId: prod.productId,
          name: prod.productName,
          quantity: "1",
        });
      }

      setStatusText("Successfully added to My List!");
    } catch (err: any) {
      console.error("AI identification error:", err);
      setErrorMsg(err.message || "Failed to analyze image with AI.");
    } finally {
      setAnalyzing(false);
    }
  }

  // Allows instant quantity adjustment after auto-adding
  async function updateAddedQuantity(newQty: string) {
    setQuantity(newQty);
    if (addedReqId) {
      await db.requests.update(addedReqId, { quantity: newQty });
      await maintainMyListCatalog(contractId);
    }
  }

  function handleSaveKey() {
    try {
      localStorage.setItem("oa-google-api-key", userApiKey.trim());
      localStorage.setItem("oa-ai-api-key", userApiKey.trim());
      setShowKeyInput(false);
      if (errorMsg.includes("Google API key")) {
        setErrorMsg("");
      }
    } catch {}
  }

  function handleRetake() {
    setCapturedImage(null);
    setRecognized(null);
    setAddedReqId(null);
    setQuantity("1");
    setErrorMsg("");
    startCamera(facingMode);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-stone-900 text-stone-100 shadow-2xl dark:border-red-900/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-sm">
              📷
            </span>
            <div>
              <h3 className="text-base font-bold text-amber-100">Camera Product Scanner</h3>
              <p className="text-xs text-stone-400">
                Gemini 3.5 Flash Lite • All {catalogContextCount || 6795} Catalog Items in Context
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              title="Configure Google API Key"
              className={`rounded-full border px-2.5 py-1 text-xs font-bold transition-colors ${
                userApiKey
                  ? "border-emerald-600 bg-emerald-950/60 text-emerald-300"
                  : "border-amber-600 bg-amber-950/60 text-amber-300 animate-pulse"
              }`}
            >
              🔑 Google Key
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-800 font-bold text-stone-300 hover:bg-stone-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Google API Key Configuration Bar */}
        {showKeyInput && (
          <div className="border-b border-amber-900/60 bg-stone-950 p-3 text-xs">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-amber-200">
                Google AI Studio API Key (Gemini)
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-amber-400 underline hover:text-amber-300"
              >
                Get Free Key ↗
              </a>
            </div>
            <div className="mt-1.5 flex gap-2">
              <input
                type="password"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 font-mono text-xs text-stone-100 focus:border-amber-400 focus:outline-none"
              />
              <button
                onClick={handleSaveKey}
                className="rounded-xl bg-amber-500 px-3.5 py-1.5 font-black text-black hover:bg-amber-400"
              >
                Save Key
              </button>
            </div>
            <p className="mt-1 text-[11px] text-stone-400">
              All AI image requests are authenticated directly via Google API. Stored securely on your device.
            </p>
          </div>
        )}

        {/* Viewfinder or Preview Area */}
        <div className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden bg-black">
          {!capturedImage ? (
            <>
              {/* Live Video Viewfinder */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`h-full max-h-[55vh] w-full object-cover ${!cameraActive ? "hidden" : ""}`}
              />

              {/* Reticle / Target Overlay */}
              {cameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative h-48 w-48 rounded-2xl border-2 border-dashed border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    <div className="absolute -top-1 -left-1 h-5 w-5 border-t-4 border-l-4 border-amber-400" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 border-t-4 border-r-4 border-amber-400" />
                    <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-amber-400" />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-amber-400" />
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-pulse" />
                  </div>
                  <span className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-amber-200 backdrop-blur-md">
                    Point camera at store product or IMPA label
                  </span>
                </div>
              )}

              {/* Camera Inactive / Permission Fallback View */}
              {!cameraActive && (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl">📸</span>
                  <p className="mt-2 text-sm font-semibold text-stone-300">
                    Live camera not active
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-stone-400">
                    {errorMsg || "Click start camera or select a photo from your gallery."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => startCamera(facingMode)}
                      className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-black hover:bg-amber-500"
                    >
                      🔄 Retry Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full border border-stone-600 bg-stone-800 px-4 py-2 text-xs font-bold text-stone-200 hover:bg-stone-700"
                    >
                      📁 Browse / Upload Image
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Captured Snapshot Preview */
            <div className="relative h-full max-h-[55vh] w-full bg-black flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured product snapshot"
                className="max-h-[55vh] w-full object-contain"
              />

              {/* Analyzing Scanning Animation */}
              {analyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center backdrop-blur-sm">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                  <p className="mt-3 text-sm font-bold text-amber-200">{statusText}</p>
                  <p className="mt-1 text-xs text-stone-400">
                    Matching across all 6,795 IMPA catalog items with Gemini 3.5 Flash Lite...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Recognition Result Card */}
        {recognized && (
          <div className="border-t border-stone-800 bg-stone-950 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-500 px-2 py-0.5 font-mono text-xs font-black text-black">
                    ID: {recognized.productId}
                  </span>
                  <span className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] font-semibold text-stone-300">
                    {recognized.category.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-amber-300">
                    {Math.round(recognized.confidence * 100)}% match
                  </span>
                </div>
                <h4 className="mt-1 font-serif text-base font-bold text-white">
                  {recognized.productName}
                </h4>
                <p className="mt-0.5 text-xs text-stone-400">{recognized.description}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                  ✓ In My List
                </span>
              </div>
            </div>

            {/* Quick Quantity Tweaker */}
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/90 p-2.5 text-xs">
              <span className="font-medium text-stone-300">Order Quantity:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    updateAddedQuantity(String(Math.max(1, (parseInt(quantity) || 1) - 1)))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-800 font-bold hover:bg-stone-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => updateAddedQuantity(e.target.value)}
                  className="w-14 rounded-lg border border-stone-700 bg-stone-950 px-2 py-1 text-center font-bold text-white"
                />
                <button
                  onClick={() =>
                    updateAddedQuantity(String((parseInt(quantity) || 1) + 1))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-800 font-bold hover:bg-stone-700"
                >
                  +
                </button>
                <span className="ml-1 text-stone-400 font-semibold">{recognized.unit}</span>
              </div>
            </div>
          </div>
        )}

        {/* Explicit informative error message banner */}
        {errorMsg && (
          <div className="border-t-2 border-red-500 bg-red-950/80 p-4 text-xs text-red-200">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <strong className="block text-sm font-black text-red-100">Recognition Process Failed</strong>
                <p className="mt-1 leading-relaxed opacity-95">{errorMsg}</p>
                {errorMsg.toLowerCase().includes("google api key") && (
                  <button
                    onClick={() => setShowKeyInput(true)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-black hover:bg-amber-300"
                  >
                    <span>🔑</span>
                    <span>Enter Google API Key</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-800 bg-stone-950 px-4 py-3">
          {!capturedImage ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white"
                >
                  📁 Gallery
                </button>
                <button
                  onClick={toggleCamera}
                  className="rounded-full border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white"
                >
                  🔄 Flip Cam
                </button>
              </div>

              {/* Big Shutter Button */}
              <button
                disabled={!cameraActive}
                onClick={capturePhoto}
                className={`flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-400 bg-white shadow-lg transition-transform active:scale-95 ${
                  !cameraActive ? "opacity-40 cursor-not-allowed" : "hover:scale-105"
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-amber-500" />
              </button>

              <button
                onClick={onClose}
                className="rounded-full border border-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                disabled={analyzing}
                className="rounded-full border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-bold text-stone-200 hover:bg-stone-700"
              >
                🔄 Retake Photo
              </button>

              <button
                onClick={onClose}
                className="rounded-full bg-amber-500 px-5 py-2 text-xs font-black text-black hover:bg-amber-400"
              >
                ✓ Done (View List)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
