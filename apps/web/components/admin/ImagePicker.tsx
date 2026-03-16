"use client";
import { useState, useEffect } from "react";

type ImageInfo = { folder: string; path: string; name: string };

export default function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && images.length === 0) {
      setLoading(true);
      fetch("/api/admin/images")
        .then((r) => r.json())
        .then((d) => {
          setImages(d.images || []);
          setFolders(d.folders || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, images.length]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "blog");
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (data.path) {
      onChange(data.path);
      // Refresh full image list to pick up new folders
      const refreshRes = await fetch("/api/admin/images");
      const refreshData = await refreshRes.json();
      setImages(refreshData.images || []);
      setFolders(refreshData.folders || []);
    }
  }

  const filtered = activeFolder === "all" ? images : images.filter((i) => i.folder === activeFolder);

  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  const modalStyle: React.CSSProperties = {
    background: "#fff", borderRadius: 8, width: "90vw", maxWidth: 900,
    maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden",
  };
  const headerStyle: React.CSSProperties = {
    padding: "16px 20px", borderBottom: "1px solid #d8cdc0",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  };
  const gridStyle: React.CSSProperties = {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: 8, padding: 16, overflowY: "auto", flex: 1,
  };
  const thumbStyle: React.CSSProperties = {
    width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4,
    cursor: "pointer", border: "2px solid transparent",
  };
  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 10px", borderRadius: 4, border: "1px solid #d8cdc0", fontSize: 12,
    cursor: "pointer", background: active ? "#6b4226" : "none", color: active ? "#fff" : "#3d3228",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          style={{
            flex: 1, padding: "10px 12px", border: "1px solid #d8cdc0",
            borderRadius: 4, fontSize: 14, boxSizing: "border-box",
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/optimized/project/image.jpg"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: "10px 16px", borderRadius: 4, border: "1px solid #d8cdc0",
            background: "#fff", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
          }}
        >
          Browse
        </button>
      </div>
      {value && (
        <img
          src={value}
          alt="Preview"
          style={{ marginTop: 8, maxHeight: 120, borderRadius: 4, objectFit: "cover" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}

      {open && (
        <div style={overlayStyle} onClick={() => setOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={headerStyle}>
              <strong style={{ color: "#1e1812" }}>Select Image</strong>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{
                  padding: "6px 14px", borderRadius: 4, border: "1px solid #6b4226",
                  color: "#6b4226", fontSize: 13, cursor: "pointer",
                }}>
                  {uploading ? "Uploading..." : "Upload New"}
                  <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
                </label>
                <button onClick={() => setOpen(false)} style={{
                  background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999",
                }}>×</button>
              </div>
            </div>
            <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid #eee" }}>
              <button style={tabStyle(activeFolder === "all")} onClick={() => setActiveFolder("all")}>All</button>
              {folders.map((f) => (
                <button key={f} style={tabStyle(activeFolder === f)} onClick={() => setActiveFolder(f)}>{f}</button>
              ))}
            </div>
            {loading ? (
              <p style={{ padding: 20, color: "#a89a8c" }}>Loading images...</p>
            ) : (
              <div style={gridStyle}>
                {filtered.map((img) => (
                  <div key={img.path} onClick={() => { onChange(img.path); setOpen(false); }}
                    title={img.name} style={{ position: "relative" }}>
                    <img src={img.path} alt={img.name} style={thumbStyle}
                      onMouseOver={(e) => { (e.target as HTMLImageElement).style.borderColor = "#6b4226"; }}
                      onMouseOut={(e) => { (e.target as HTMLImageElement).style.borderColor = "transparent"; }}
                    />
                    <div style={{ fontSize: 10, color: "#a89a8c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
