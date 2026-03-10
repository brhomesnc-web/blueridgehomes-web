\# Blue Ridge Homes — AI Development Context



This file provides context for AI coding tools working on the Blue Ridge Homes website.



All AI systems interacting with this repository should read this file before making code changes.



---



\# Project Overview



Blue Ridge Homes is a custom home builder based in Western North Carolina.



This website serves as:



• a portfolio showcase

• a lead generation tool

• a brand credibility platform



The design goal is a \*\*modern luxury aesthetic\*\* with strong visual storytelling.



The site prioritizes:



• large photography

• minimal layout clutter

• strong typography

• subtle textures

• fast loading image galleries



---



\# Technology Stack



Framework:



Next.js 16 (App Router)



Language:



TypeScript



Styling:



TailwindCSS



Image Processing:



ImageMagick → WebP conversion pipeline



Hosting:



Self-hosted Linux server



---



\# Project Structure



Repository root:



```

/apps/web

```



Next.js application:



```

/apps/web/app

```



Components:



```

/apps/web/components

```



Images:



```

/apps/web/public/optimized

/apps/web/public/imported

```



---



\# Important Directories



\### Pages



```

/app/page.tsx

/app/services/page.tsx

/app/contact/page.tsx

/app/portfolio/page.tsx

/app/portfolio/\[slug]/page.tsx

```



\### API



```

/app/api/gallery/route.ts

```



\### Components



```

/components/Gallery.tsx

/components/site/Header.tsx

/components/site/Footer.tsx

/components/site/PageShell.tsx

/components/site/PageWrapper.tsx

```



---



\# Image System



Images are pre-optimized.



Directory:



```

/public/optimized/

```



Each image includes responsive sizes:



```

image.webp

image-1200.webp

image-768.webp

image-480.webp

```



The gallery API returns all sizes.



---



\# Gallery API



Endpoint:



```

/api/gallery

```



Example:



```

/api/gallery?project=breezeway

```



Response format:



```

\[

&nbsp; {

&nbsp;   full,

&nbsp;   large,

&nbsp;   medium,

&nbsp;   small

&nbsp; }

]

```



Used by the Gallery component.



---



\# Design Rules



The site should follow these design principles:



Luxury minimalism.



No WordPress-style UI.



Avoid overly rounded buttons or heavy shadows.



Typography hierarchy is critical.



Background textures should be subtle.



Spacing should feel premium and breathable.



Hero sections should never exceed:



```

60vh

```



Portfolio cards should prioritize imagery over text.



---



\# AI Editing Guidelines



When modifying files:



1\. Avoid breaking existing routes.

2\. Avoid removing existing components unless unused.

3\. Maintain Tailwind utility patterns already used.

4\. Keep the layout responsive.

5\. Prefer visual consistency over adding new UI patterns.



---



\# What AI Should Focus On



Primary development priorities:



Landing page design polish.



Portfolio gallery layout.



Responsive image loading.



Typography hierarchy.



Button design system.



---



\# What AI Should NOT Change



Infrastructure.



Server configuration.



Nginx.



Deployment scripts.



Image pipeline.



---



\# File Editing Preference



When editing large files:



Return the \*\*entire file\*\* rather than partial edits.



This prevents diff corruption in terminal tools.



---



\# Current Development Goal



The landing page should visually match the provided template design.



Key elements:



• textured background

• floating stats bar

• refined hero typography

• elegant buttons

• strong section contrast



---



\# When in Doubt



Favor \*\*simpler, cleaner design choices\*\*.



This is a luxury construction brand, not a tech product.



---



