#!/usr/bin/env python3
"""Validate the data files and generate data/index.json + redirects.json.

Run after adding or editing any file in data/:   python3 tools/build_index.py
Exit code 1 if a referenced file is missing or a track id is unknown.
"""
import datetime, glob, json, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(REPO, "data")
# Public address of the site, used in sitemap.xml and robots.txt.
# Change this one line if fftabs.com becomes a GitHub Pages custom domain ("https://fftabs.com/").
SITE_URL = "https://fftabs.com/"
PARTS = ["guitar", "bass", "drums", "lyrics"]
KIND_ORDER = {"studio": 0, "live": 0, "compilation": 0, "collection": 1, "side-project": 2}
# old fftabs.com "more" section ids -> new album ids
OLD_IDS = {"skinandbones": "2006", "studiocovers": "covers-studio", "livecovers": "covers-live",
           "jacksonunited": "jackson-united", "coattailriders": "coattail-riders", "espg": "2007"}

def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)

def paths(v):
    return v if isinstance(v, list) else [v]

errors, warnings = [], []
albums, referenced = [], set()
for p in sorted(glob.glob(os.path.join(D, "albums", "album_*.json"))):
    a = load(p)
    aid = a["id"]
    if os.path.basename(p) != f"album_{aid}.json":
        errors.append(f"{p}: id '{aid}' does not match file name")
    ids = [t["id"] for t in a.get("tracks", [])]
    if len(ids) != len(set(ids)):
        errors.append(f"album_{aid}: duplicate track ids")
    for f in [a.get("cover"), a.get("lyricsSheet")]:
        if f:
            referenced.add(f)
            if not os.path.exists(os.path.join(REPO, f)):
                errors.append(f"album_{aid}: missing file {f}")
    counts = {"tracks": len(ids)}
    have = {t: [] for t in ids}
    for part in PARTS:
        fp = os.path.join(D, part, f"{part}_{aid}.json")
        if not os.path.exists(fp):
            counts[part] = 0
            continue
        m = load(fp)
        mapping = m.get("tabs") or m.get("lyrics") or {}
        counts[part] = len(mapping)
        for tid, v in mapping.items():
            if tid not in have:
                errors.append(f"{part}_{aid}.json: unknown track id '{tid}'")
                continue
            have[tid].append(part)
            for f in paths(v):
                referenced.add(f)
                if not os.path.exists(os.path.join(REPO, f)):
                    errors.append(f"{part}_{aid}.json: missing file {f}")
    a["_have"] = have
    a["_counts"] = counts
    albums.append(a)

# orphans: content files nobody references
for pattern in ["tabs_guitar/**/*", "tabs_bass/**/*", "tabs_drums/**/*", "lyrics/**/*.txt"]:
    for f in glob.glob(os.path.join(REPO, pattern), recursive=True):
        if os.path.isfile(f):
            rel = os.path.relpath(f, REPO).replace(os.sep, "/")
            if rel not in referenced:
                warnings.append(f"orphan (not listed in any data file): {rel}")

albums.sort(key=lambda a: (KIND_ORDER.get(a.get("kind"), 3), a.get("year") or 9999, a["title"].lower()))
index = {"generated": datetime.date.today().isoformat(), "albums": [], "search": []}
for a in albums:
    entry = {k: a[k] for k in ["id", "title", "kind", "year", "cover"] if a.get(k) is not None}
    entry["counts"] = a["_counts"]
    if a.get("lyricsSheet"): entry["lyricsSheet"] = a["lyricsSheet"]
    index["albums"].append(entry)
    for t in a.get("tracks", []):
        if a["_have"][t["id"]]:
            index["search"].append([t["title"], a["id"], t["id"], a["_have"][t["id"]]])

# old fftabs.com URL -> new hash route
red = {"index.php": "#/", "legal.php": "#/legal", "sideprojects.php": "#/", "search.php": "#/",
       "lyrics.php": "#/instrument/lyrics", "tabs_drums_more.php": "#/instrument/drums"}
for i in ["guitar", "bass", "drums"]:
    red[f"tabs_{i}.php"] = f"#/instrument/{i}"
    red[f"tabs_{i}_more.php"] = f"#/instrument/{i}"
    for a in albums:
        if a.get("year") and a["id"].isdigit():
            red[f"tabs_{i}_{a['id']}.php"] = f"#/album/{a['id']}/{i}"
    for old, new in list(OLD_IDS.items()) + [(a["id"], a["id"]) for a in albums if not a["id"].isdigit()]:
        red[f"tabs_{i}_more.php?show={old}"] = f"#/album/{new}/{i}"
for a in albums:
    if not a["id"].isdigit():
        continue
    red[f"lyrics_{a['id']}.php"] = f"#/album/{a['id']}/lyrics"
    tracks = a.get("tracks", [])
    if not any(t.get("disc") for t in tracks):
        for t in tracks:
            if t.get("n") and "lyrics" in a["_have"][t["id"]]:
                red[f"lyrics_{a['id']}.php?track={t['n']}"] = f"#/song/{a['id']}/{t['id']}/lyrics"

def dump(path, obj):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
dump(os.path.join(D, "index.json"), index)
dump(os.path.join(REPO, "redirects.json"), dict(sorted(red.items())))

# sitemap.xml: basic for now, just the home page. Album and song pages use #/ addresses,
# which search engines treat as the home page; they'll be listed here once the site
# has real page addresses (/album/1997/, /song/…/).
from xml.sax.saxutils import escape
urls = [SITE_URL]
with open(os.path.join(REPO, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for u in urls:
        f.write(f"  <url><loc>{escape(u)}</loc></url>\n")
    f.write("</urlset>\n")
with open(os.path.join(REPO, "robots.txt"), "w", encoding="utf-8", newline="\n") as f:
    f.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n")

for w in warnings: print("WARN ", w)
for e in errors: print("ERROR", e)
print(f"{len(albums)} albums, {len(index['search'])} searchable tracks, {len(red)} redirects, {len(urls)} sitemap URLs, "
      f"{len(warnings)} warnings, {len(errors)} errors")
sys.exit(1 if errors else 0)
