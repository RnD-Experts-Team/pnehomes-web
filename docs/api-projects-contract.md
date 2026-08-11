# Backend Contract — `GET /api/projects` ("Our Projects")

**Audience:** CMS / backend team
**Status:** Frontend is built and live against a temporary local mock. This document defines the exact API the frontend expects. Once this endpoint returns real data, the frontend switches to it automatically — no frontend change needed.

---

## 1. What this feature is (plain language)

The website already has a **Gallery** (`/api/gallery`) organized **by room type** — e.g. one album "Bathrooms" holds bathroom photos from *every* house.

"**Our Projects**" is the opposite view — organized **by house (lot)**. Each lot (e.g. *Lot 64*) shows only *that one house's* photos: its exterior, kitchen, bathroom, living room, interior, etc.

On the website:
- `/our-projects` → a grid of **lot cards** (Lot 23, Lot 24, Lot 38, …).
- `/our-projects/lot-64` → all of Lot 64's photos in one elegant gallery, **in order**.

## 2. Good news: it's the SAME shape as `/api/gallery`

The response format is **identical to `/api/gallery`** — you can copy that endpoint's structure. The only difference is meaning:

| In `/api/gallery` | In `/api/projects` |
|---|---|
| a top-level album = a **room type** ("Bathrooms") | a top-level album = a **lot / house** ("Lot 64") |
| a sub-album = a **house** | a sub-album = a **room** ("Kitchen") |

So: **top-level `gallery[]` items are LOTS**, and each lot's **`sub_albums[]` are its ROOMS**.

---

## 3. Endpoint

```
GET {CMS_BASE_URL}/api/projects
Accept: application/json
```

- `{CMS_BASE_URL}` is `https://cms.pnehomes.com` in production (frontend env var `NEXT_PUBLIC_CMS_BASE_URL`).
- No auth, no query params required.
- Must respond within ~10s (frontend aborts after that). Should be cacheable.

---

## 4. Response envelope

```jsonc
{
  "success": true,          // boolean — MUST be true for the data to be used
  "data": { ...projects }   // object — see below
}
```

If `success` is `false` or `data` is missing, the frontend treats the call as failed.

### `data` object

| Field        | Type                                   | Required | Notes |
|--------------|----------------------------------------|----------|-------|
| `title`      | string                                 | yes      | Page heading, e.g. `"Our Projects"`. |
| `cover`      | string (image/video URL)               | yes      | Hero/background image for the `/our-projects` page. |
| `cover_type` | `"image"` \| `"video"` \| `null`       | yes      | Media type of `cover`. |
| `contact`    | object `{ title, message }`            | yes      | CTA button under each lot (see §7). |
| `gallery`    | array of **Lot** objects               | yes      | **Each item is one lot/house.** Order = display order of the cards. |

### Lot object (item in `data.gallery`)

| Field            | Type                              | Required | Notes |
|------------------|-----------------------------------|----------|-------|
| `id`             | number                            | yes      | Unique, stable. Used as React key. |
| `slug`           | string                            | yes      | URL segment, e.g. `"lot-64"`. Lowercase, hyphenated, unique. Drives `/our-projects/{slug}`. |
| `title`          | string                            | yes      | Display name, e.g. `"Lot 64"`. |
| `cover_img`      | string (image/video URL)          | yes      | Card image + the lot page hero. |
| `cover_img_type` | `"image"` \| `"video"` \| `null`  | yes      | Media type of `cover_img`. |
| `sub_albums`     | array of **Room** objects         | yes\*    | **The rooms of this house.** Order matters (see §6). |
| `gallery`        | array of **Image** objects        | yes\*    | Optional flat fallback — used only if `sub_albums` is empty. Send `[]` when unused. |

\* Send both keys always. Normally populate `sub_albums`; leave `gallery: []`. If a lot has no room grouping, you may instead put photos directly in `gallery` and send `sub_albums: []`.

### Room object (item in a lot's `sub_albums`)

| Field            | Type                              | Required | Notes |
|------------------|-----------------------------------|----------|-------|
| `slug`           | string                            | yes      | e.g. `"kitchen"`, `"exterior"`. Unique within the lot. |
| `title`          | string                            | yes      | e.g. `"Kitchen"`. (Not shown as a divider currently, but keep it accurate.) |
| `cover_img`      | string (image/video URL)          | yes      | Reserved for future use; send the room's best image. |
| `cover_img_type` | `"image"` \| `"video"` \| `null`  | yes      | Media type of `cover_img`. |
| `gallery`        | array of **Image** objects        | yes      | The room's photos, in display order. |

### Image object (item in a room's / lot's `gallery`)

| Field              | Type                              | Required | Notes |
|--------------------|-----------------------------------|----------|-------|
| `virtual_img`      | string (image URL)                | yes      | The default photo shown (the render/virtual image). |
| `virtual_img_type` | `"image"` \| `"video"` \| `null`  | yes      | Usually `"image"`. |
| `real_img`         | string (image URL)                | no       | Optional real/built photo. If present & non-empty, a **"View Real Image"** toggle appears on that photo. Send `""` if none. |
| `real_img_type`    | `"image"` \| `"video"` \| `null`  | no       | Media type of `real_img`. Send `null` if no real image. |

---

## 5. Image URL formats accepted

Send whatever the CMS already uses for the gallery. The frontend normalizes Google Drive links automatically. Any of these work:

- Google Drive file link: `https://drive.google.com/file/d/<FILE_ID>/view`
- Google user-content link: `https://lh3.googleusercontent.com/d/<FILE_ID>`
- A plain absolute image URL (`https://…/photo.jpg`)

> The frontend converts Drive links to `https://lh3.googleusercontent.com/d/<FILE_ID>=w1024` for display, exactly like `/api/gallery` does today. **Same behavior — no special handling required from you.**

---

## 6. Ordering rules (important)

The lot page shows **all of a lot's photos in one continuous gallery**, with the room dividers removed. The frontend builds that single stream by concatenating, **in array order**:

```
lot.sub_albums[0].gallery, then sub_albums[1].gallery, … then lot.gallery
```

So to control what the visitor sees first:

1. **Put the room you want first (usually "Exterior") first in `sub_albums`.** The very first image of the first room becomes the large hero at the top.
2. Order rooms sensibly, e.g. **Exterior → Kitchen → Living Room → Bathroom → Interior**.
3. Within each room, order `gallery` best-photo-first.
4. Order `data.gallery` (the lots) in the order the cards should appear on `/our-projects`.

---

## 7. Contact CTA

Each lot page shows a button built from `data.contact`:

- Button label = `contact.title` (e.g. `"Interested in a home like this?"`).
- Clicking sends the visitor to `/contact?message=…` where the message is `contact.message` with the token **`{title}` replaced by the lot's title**.

Example: `contact.message = "I'm interested in {title}. Please send details."` on Lot 64 becomes `"I'm interested in Lot 64. Please send details."`

---

## 8. Full example response

```json
{
  "success": true,
  "data": {
    "title": "Our Projects",
    "cover": "https://drive.google.com/file/d/ABC_COVER_ID/view",
    "cover_type": "image",
    "contact": {
      "title": "Interested in a home like this?",
      "message": "I'm interested in {title}. Could you share more details?"
    },
    "gallery": [
      {
        "id": 7,
        "slug": "lot-64",
        "title": "Lot 64",
        "cover_img": "https://drive.google.com/file/d/LOT64_COVER_ID/view",
        "cover_img_type": "image",
        "sub_albums": [
          {
            "slug": "exterior",
            "title": "Exterior",
            "cover_img": "https://drive.google.com/file/d/EXT1/view",
            "cover_img_type": "image",
            "gallery": [
              {
                "virtual_img": "https://drive.google.com/file/d/EXT1/view",
                "virtual_img_type": "image",
                "real_img": "https://drive.google.com/file/d/EXT1_REAL/view",
                "real_img_type": "image"
              },
              {
                "virtual_img": "https://drive.google.com/file/d/EXT2/view",
                "virtual_img_type": "image",
                "real_img": "",
                "real_img_type": null
              }
            ]
          },
          {
            "slug": "kitchen",
            "title": "Kitchen",
            "cover_img": "https://drive.google.com/file/d/KIT1/view",
            "cover_img_type": "image",
            "gallery": [
              {
                "virtual_img": "https://drive.google.com/file/d/KIT1/view",
                "virtual_img_type": "image",
                "real_img": "https://drive.google.com/file/d/KIT1_REAL/view",
                "real_img_type": "image"
              }
            ]
          }
        ],
        "gallery": []
      },
      {
        "id": 3,
        "slug": "lot-38",
        "title": "Lot 38",
        "cover_img": "https://drive.google.com/file/d/LOT38_COVER/view",
        "cover_img_type": "image",
        "sub_albums": [
          {
            "slug": "exterior",
            "title": "Exterior",
            "cover_img": "https://drive.google.com/file/d/L38_EXT1/view",
            "cover_img_type": "image",
            "gallery": [
              {
                "virtual_img": "https://drive.google.com/file/d/L38_EXT1/view",
                "virtual_img_type": "image",
                "real_img": "",
                "real_img_type": null
              }
            ]
          }
        ],
        "gallery": []
      }
    ]
  }
}
```

---

## 9. Current lots to seed

The frontend currently expects these 9 lots (from the client). Use these slugs/titles:

| title     | slug        |
|-----------|-------------|
| Lot 23    | `lot-23`    |
| Lot 24    | `lot-24`    |
| Lot 38    | `lot-38`    |
| Lot 49    | `lot-49`    |
| Lot 51    | `lot-51`    |
| Lot 62    | `lot-62`    |
| Lot 64    | `lot-64`    |
| Lot 7375  | `lot-7375`  |
| Lot 7577  | `lot-7577`  |

Suggested room slugs/titles (reuse consistently): `exterior`/Exterior, `kitchen`/Kitchen, `living-room`/Living Room, `bathroom`/Bathroom, `interior`/Interior. Add more as needed (bedroom, basement, office, …).

---

## 10. Rules / edge cases

- Always return **all keys** shown above, even when empty (`sub_albums: []`, `gallery: []`, `real_img: ""`, `real_img_type: null`). Missing keys are tolerated (frontend defaults them) but explicit is safer.
- `slug` must be **unique** among lots, and each room `slug` unique **within its lot**. Duplicate lot slugs → only the first is reachable.
- A lot with no photos at all is allowed (its page shows an empty state) but avoid shipping empty lots.
- `cover` / `cover_img` should not be empty — they drive the hero and cards.
- Keep the endpoint **fast and cacheable** (frontend caches for 60s via ISR and aborts after ~10s).

---

## 11. Acceptance checklist

- [ ] `GET /api/projects` returns `{ success: true, data: {...} }`.
- [ ] `data.gallery` is an array of lots, each with `id, slug, title, cover_img, cover_img_type, sub_albums[], gallery[]`.
- [ ] Each `sub_albums[]` room has `slug, title, cover_img, cover_img_type, gallery[]`.
- [ ] Each image has `virtual_img (+_type)` and `real_img (+_type)` (real may be `""`/`null`).
- [ ] Rooms ordered with Exterior first; lots ordered as they should appear.
- [ ] `contact.message` contains the literal `{title}` token.
- [ ] Drive links are in `drive.google.com/file/d/<id>/view` or `lh3.googleusercontent.com/d/<id>` form.
- [ ] Response is JSON, returns in < 10s.

Once this is live at `https://cms.pnehomes.com/api/projects`, the website's "Our Projects" pages will use it with no code change. (The frontend has a temporary local mock that is superseded the moment real lots are returned; that mock fallback can then be removed.)
