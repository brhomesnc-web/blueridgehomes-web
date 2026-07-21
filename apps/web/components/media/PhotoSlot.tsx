"use client";
import ImagePicker from "@/components/admin/ImagePicker";
import { type PhotoSpec } from "@/lib/mediaBlocks";

/**
 * The photo block's editing UI — shows the writer's `intent` so the reviewer
 * picks the right shot rather than guessing behind a bare placeholder.
 *
 * PURE spec-in / spec-out, like ChartPreview: no markdown string, no fence
 * ordinal, no TipTap. Filling a slot IS the edit (it resolves the block to an
 * image), so there is no `onSpecChange` here — nothing about a photo spec is
 * editable in place.
 */

export type PhotoSlotProps = {
  spec: PhotoSpec | null;
  onReplaceWithImage: (path: string, alt: string) => void;
  onRemove: () => void;
};

export default function PhotoSlot({ spec, onReplaceWithImage, onRemove }: PhotoSlotProps) {
  const intent = spec?.intent || "(no description provided)";
  const path = spec?.path || "";
  return (
    <div className="my-5 rounded-lg border border-[var(--br-line)] bg-[var(--br-cream-2)] p-3 not-prose">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="rounded-full bg-[var(--br-stone)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--br-text-mid)]">
          Photo slot
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[11.5px] font-semibold text-[var(--br-text-soft)] underline hover:text-[#8b3a32]"
        >
          Drop slot
        </button>
      </div>
      <div className="mb-2 text-[13px] text-[var(--br-text-mid)]">
        Wants: <em>{intent}</em>
      </div>
      <ImagePicker value={path} onChange={(p) => onReplaceWithImage(p, intent)} />
    </div>
  );
}
