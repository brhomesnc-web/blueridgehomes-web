"use client"

import { useEffect, useState } from "react"

type ImageSet = {
  full: string
  large: string
  medium: string
  small: string
}

export default function Gallery({ project }: { project: string }) {
  const [images, setImages] = useState<ImageSet[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/gallery?project=${project}`)
      .then((res) => res.json())
      .then(setImages)
  }, [project])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.medium}
            srcSet={`
              ${img.small} 480w,
              ${img.medium} 768w,
              ${img.large} 1200w
            `}
            sizes="(max-width:768px) 100vw, 33vw"
            loading="lazy"
            className="cursor-pointer rounded-lg"
            onClick={() => setActive(img.full)}
          />
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setActive(null)}
        >
          <img src={active} className="max-h-[90vh] max-w-[90vw]" />
        </div>
      )}
    </>
  )
}
