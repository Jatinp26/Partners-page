# Editing partner content

Everything in the **Find a partner** logo grid and the **Partner spotlight** section comes from one file: `content/partners.json`. Edit it on GitHub, commit, and the site updates. No code changes needed.

## Add a partner

1. Put the logo in `assets/logos/`. SVG is best; a PNG on a transparent background, at least 400px wide, also works.
2. Copy an existing entry in `partners.json` and change the fields below.
3. The order of entries is the order on the page (logo grid and spotlight).

## Fields

| Field | What it is |
| --- | --- |
| `slug` | Short id, lowercase with hyphens, e.g. `lg-cns`. Also the shareable link: `#story-lg-cns` opens that partner's pop-up. Must be unique. |
| `name` | Organization name, as it should appear. |
| `logo` | Path to the logo, e.g. `assets/logos/lg-cns.svg`. Shown on the white tiles in Find a partner. |
| `logoOnDark` | Optional. A white or light version of the logo for the dark spotlight cards and pop-up. Leave `""` to use `logo`. |
| `category` | One of: `Technology & Implementation`, `Security`, `Infrastructure`, `Advisory & Consulting`, `Market & GTM`, `Capital`. |
| `note` | Optional small text under the logo tile, e.g. `Launch partner`. Leave `""` for none. |
| `spotlight` | The card and pop-up. Set to `null` to show the partner in the logo grid only. |

Inside `spotlight`:

| Field | What it is |
| --- | --- |
| `cardQuote` | Short quote on the card. One or two sentences. |
| `quote` | Full quote at the top of the pop-up. |
| `person` | Name of the person quoted. |
| `role` | Their title and company, e.g. `Vice President, LG CNS`. |
| `about` | "About the collaboration". A list of paragraphs: `["First paragraph.", "Second paragraph."]` |

## Rules

- Keep the straight double quotes `"` that wrap each value. Inside the text, use curly quotes and apostrophes (’ “ ”), or write `\"` for a straight one.
- Every entry except the last ends with a comma after its closing `}`.
- Text in square brackets, like `[Name]`, is placeholder content. Replace it before launch.
- If a logo file is missing, the page shows the organization's name in its place.
