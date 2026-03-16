"use client";
import { useState, useEffect, useRef, useCallback } from "react";

type Props = {
  project?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
};

type FolderImages = Record<string, string[]>;

export default function PortfolioForm({ project, onSave, saving }: Props) {
  const [title, setTitle] = useState((project?.title as string) || "");
  const [slug, setSlug] = useState((project?.slug as string) || "");
  const [location, setLocation] = useState((project?.location as string) || "");
  const [tag, setTag] = useState((project?.tag as string) || "custom");
  const [type, setType] = useState((project?.type as string) || "");
  const [description, setDescription] = useState((project?.description as string) || "");
  const [cover, setCover] = useState((project?.cover as string) || "");
  const [images, setImages] = useState<string[]>((project?.images as string[]) || []);
  const [published, setPublished] = useState(project?.published !== undefined ? !!project.published : true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"cover" | "gallery">("gallery");
  const [folders, setFolders] = useState<FolderImages>({});
  const [pickerFolder, setPickerFolder] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-slug from title
  useEffect(() => {
    if (!project) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [title, project]);

  function fetchFolders(cb?: () => void) {
    setLoadingImages(true);
    fetch("/api/admin/images")
      .then((r) => r.json())
      .then((d) => {
        setFolders(d.folders || {});
        const keys = Object.keys(d.folders || {});
        if (keys.length > 0 && !pickerFolder) setPickerFolder(keys[0]);
        setLoadingImages(false);
        cb?.();
      })
      .catch(() => setLoadingImages(false));
  }

  function loadImages() {
    if (Object.keys(folders).length > 0) { setShowPicker(true); return; }
    fetchFolders(() => setShowPicker(true));
  }

  function refreshFolder() {
    fetch("/api/admin/images")
      .then((r) => r.json())
      .then((d) => {
        setFolders(d.folders || {});
      })
      .catch(() => {});
  }

  function openPicker(mode: "cover" | "gallery") {
    setPickerMode(mode);
    loadImages();
  }

  function selectImage(path: string) {
    if (pickerMode === "cover") {
      setCover(path);
      setShowPicker(false);
    } else {
      if (!images.includes(path)) {
        setImages([...images, path]);
      }
    }
  }

  function removeImage(path: string) {
    setImages(images.filter((i) => i !== path));
  }

  function moveImage(idx: number, direction: "up" | "down") {
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;
    const updated = [...images];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setImages(updated);
  }

  function handleSubmit() {
    onSave({ slug, title, location, tag, type, description, cover, images, published });
  }

  function handleNewFolder() {
    const name = prompt("New folder name (lowercase, no spaces):");
    if (!name) return;
    const safeName = name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
    if (!safeName) return;
    setFolders((prev) => ({ ...prev, [safeName]: [] }));
    setPickerFolder(safeName);
  }

  async function uploadFiles(files: FileList | File[]) {
    if (!pickerFolder) {
      alert("Select a folder first.");
      return;
    }
    const fileArray = Array.from(files).filter((f) =>
      /\.(jpg|jpeg|png|webp|jfif|gif)$/i.test(f.name)
    );
    if (fileArray.length === 0) return;

    setUploading(true);
    let done = 0;
    const newFileNames: string[] = [];

    for (const file of fileArray) {
      setUploadProgress(`Uploading ${done + 1} of ${fileArray.length}...`);
      const form = new FormData();
      form.append("file", file);
      form.append("folder", pickerFolder);
      try {
        const r = await fetch("/api/admin/upload", { method: "POST", body: form });
        const d = await r.json();
        if (d.success && d.path) {
          const fileName = d.path.split("/").pop()!;
          newFileNames.push(fileName);
        }
      } catch {
        // skip failed uploads
      }
      done++;
    }

    // Add newly uploaded filenames to the current folder's list
    if (newFileNames.length > 0) {
      setFolders((prev) => ({
        ...prev,
        [pickerFolder]: [...(prev[pickerFolder] || []), ...newFileNames],
      }));
    }

    setUploading(false);
    setUploadProgress("");
    // Also do a full refresh to catch any server-side naming changes
    refreshFolder();
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerFolder]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  }

  const card: React.CSSProperties = { background: "#fff", borderRadius: 8, border: "1px solid #d8cdc0", padding: 24, marginBottom: 20 };
  const label: React.CSSProperties = { display: "block", fontSize: 12, color: "#a89a8c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontWeight: 600 };
  const input: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 4, border: "1px solid #d8cdc0", fontSize: 14, fontFamily: "Inter, sans-serif", color: "#1e1812", boxSizing: "border-box" };
  const btnSmall: React.CSSProperties = { padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0", background: "none", cursor: "pointer", fontSize: 13, color: "#3d3228" };
  const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 4, border: "none", background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 };

  return (
    <div>
      {/* Basic info */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={label}>Title</label>
            <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Breezeway" />
          </div>
          <div>
            <label style={label}>Slug</label>
            <input style={input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. breezeway" disabled={!!project} />
          </div>
          <div>
            <label style={label}>Location</label>
            <input style={input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Asheville, NC" />
          </div>
          <div>
            <label style={label}>Type</label>
            <input style={input} value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Custom Home, Whole Home Remodel" />
          </div>
          <div>
            <label style={label}>Tag (for filtering)</label>
            <select style={input} value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="custom">Custom Home</option>
              <option value="remodel">Remodel</option>
              <option value="addition">Addition</option>
            </select>
          </div>
          <div>
            <label style={label}>Status</label>
            <select style={input} value={published ? "1" : "0"} onChange={(e) => setPublished(e.target.value === "1")}>
              <option value="1">Published</option>
              <option value="0">Draft</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={label}>Description</label>
          <textarea style={{ ...input, minHeight: 80, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the project..." />
        </div>
      </div>

      {/* Cover image */}
      <div style={card}>
        <label style={label}>Cover Image</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <input style={{ ...input, flex: 1 }} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/optimized/folder/image.jpg" />
          <button style={btnSmall} onClick={() => openPicker("cover")}>Browse</button>
        </div>
        {cover && <img src={cover} alt="Cover preview" style={{ maxHeight: 200, borderRadius: 4, border: "1px solid #d8cdc0" }} />}
      </div>

      {/* Gallery images */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <label style={{ ...label, marginBottom: 0 }}>Gallery Images ({images.length})</label>
          <button style={btnSmall} onClick={() => openPicker("gallery")}>{loadingImages ? "Loading..." : "+ Add Images"}</button>
        </div>
        {images.length === 0 ? (
          <p style={{ color: "#a89a8c", fontSize: 13 }}>No gallery images yet. Click &quot;Add Images&quot; to browse.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
            {images.map((src, i) => (
              <div key={src} style={{ position: "relative", borderRadius: 4, overflow: "hidden", border: "1px solid #d8cdc0" }}>
                <img src={src} alt={`Gallery ${i + 1}`} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: 2, padding: 2 }}>
                  {i > 0 && (
                    <button onClick={() => moveImage(i, "up")} style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, padding: "2px 5px" }}>{"\u25C0"}</button>
                  )}
                  {i < images.length - 1 && (
                    <button onClick={() => moveImage(i, "down")} style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, padding: "2px 5px" }}>{"\u25B6"}</button>
                  )}
                  <button onClick={() => removeImage(src)} style={{ background: "rgba(192,57,43,0.8)", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, padding: "2px 5px" }}>{"\u00D7"}</button>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, padding: "1px 5px" }}>{i + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <button style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>
        {saving ? "Saving..." : project ? "Update Project" : "Create Project"}
      </button>

      {/* Image Picker Modal */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setShowPicker(false)}>
          <div style={{ background: "#fff", borderRadius: 8, width: "90vw", maxWidth: 800, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #d8cdc0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#1e1812" }}>{pickerMode === "cover" ? "Select Cover Image" : "Add Gallery Images"}</h3>
              <button onClick={() => setShowPicker(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#a89a8c" }}>{"\u00D7"}</button>
            </div>

            {/* Folder tabs + New Folder */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e8e0d6", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {Object.keys(folders).sort().map((f) => (
                <button key={f} onClick={() => setPickerFolder(f)} style={{
                  padding: "4px 12px", borderRadius: 4, border: "1px solid #d8cdc0",
                  background: pickerFolder === f ? "#6b4226" : "none",
                  color: pickerFolder === f ? "#fff" : "#3d3228",
                  cursor: "pointer", fontSize: 12,
                }}>{f}</button>
              ))}
              <button onClick={handleNewFolder} style={{
                padding: "4px 12px", borderRadius: 4, border: "1px dashed #a89a8c",
                background: "none", color: "#a89a8c", cursor: "pointer", fontSize: 12,
              }}>+ New Folder</button>
            </div>

            {/* Image grid with upload zone */}
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              {/* Upload drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                  marginBottom: 12,
                  padding: uploading ? "12px 16px" : "20px 16px",
                  border: `2px dashed ${dragOver ? "#6b4226" : "#d8cdc0"}`,
                  borderRadius: 6,
                  background: dragOver ? "rgba(107,66,38,0.06)" : "rgba(248,243,237,0.5)",
                  textAlign: "center",
                  cursor: uploading ? "default" : "pointer",
                  transition: "border-color 150ms, background 150ms",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
                {uploading ? (
                  <span style={{ fontSize: 13, color: "#6b4226", fontWeight: 500 }}>{uploadProgress}</span>
                ) : (
                  <>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{"\u2B06"}</div>
                    <div style={{ fontSize: 13, color: "#3d3228" }}>
                      Drop images here or <span style={{ color: "#6b4226", fontWeight: 600, textDecoration: "underline" }}>click to browse</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#a89a8c", marginTop: 4 }}>
                      JPG, PNG, WebP &middot; Multiple files supported &middot; Uploading to <strong>{pickerFolder || "..."}</strong>
                    </div>
                  </>
                )}
              </div>

              {/* Existing images */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {(folders[pickerFolder] || []).map((img) => {
                  const fullPath = `/optimized/${pickerFolder}/${img}`;
                  const isSelected = pickerMode === "gallery" && images.includes(fullPath);
                  return (
                    <div key={img} onClick={() => selectImage(fullPath)} style={{
                      cursor: "pointer", borderRadius: 4, overflow: "hidden",
                      border: isSelected ? "3px solid #6b4226" : "1px solid #d8cdc0",
                      opacity: isSelected ? 0.7 : 1,
                    }}>
                      <img src={fullPath} alt={img} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} loading="lazy" />
                    </div>
                  );
                })}
              </div>

              {(folders[pickerFolder] || []).length === 0 && !uploading && (
                <p style={{ textAlign: "center", color: "#a89a8c", fontSize: 13, marginTop: 8 }}>
                  No images in this folder yet. Upload some above.
                </p>
              )}
            </div>

            {/* Footer */}
            {pickerMode === "gallery" && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid #d8cdc0", textAlign: "right" }}>
                <button style={{ padding: "8px 20px", borderRadius: 4, border: "none", background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 13 }} onClick={() => setShowPicker(false)}>
                  Done ({images.length} selected)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
