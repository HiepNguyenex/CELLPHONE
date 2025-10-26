// src/utils/rss.js

// Các nguồn tin tiếng Việt (có RSS chính thức)
export const VIET_TECH_FEEDS = [
  {
    name: "VnExpress - Khoa học công nghệ",
    url: "https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss",
  },
  {
    name: "GenK - Trang chủ",
    url: "https://genk.vn/rss/home.rss",
  },
  {
    name: "Tinhte.vn",
    url: "https://tinhte.vn/rss",
  },
];

// Lấy RSS qua CORS proxy công khai (AllOrigins)
async function fetchRssRaw(rssUrl) {
  const rawUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
  const res = await fetch(rawUrl);
  if (res.ok) return res.text();

  // Fallback sang endpoint /get nếu /raw bị chặn tạm thời
  const getUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
  const res2 = await fetch(getUrl);
  if (res2.ok) {
    const data = await res2.json();
    return data.contents;
  }
  throw new Error(`Không fetch được RSS: ${rssUrl}`);
}

function textContent(node, tag) {
  const el = node.getElementsByTagName(tag)[0];
  return el ? (el.textContent || "").trim() : "";
}

function firstAttr(nodeList, attr) {
  if (!nodeList || !nodeList.length) return "";
  for (let i = 0; i < nodeList.length; i++) {
    const n = nodeList[i];
    const val = n.getAttribute && n.getAttribute(attr);
    if (val) return val;
  }
  return "";
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").trim();
}

function extractFirstImgFromHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  const img = div.querySelector("img");
  return img ? img.src : "";
}

function parseRss(xmlText, sourceName) {
  const dom = new DOMParser().parseFromString(xmlText, "text/xml");
  const items = Array.from(dom.getElementsByTagName("item"));
  return items.map((item) => {
    const title = textContent(item, "title");
    const link = textContent(item, "link");
    const pubDate = textContent(item, "pubDate") || textContent(item, "dc:date");
    const description = textContent(item, "description");

    // Ảnh: ưu tiên enclosure/media, fallback: ảnh trong description
    let image =
      firstAttr(item.getElementsByTagName("enclosure"), "url") ||
      firstAttr(item.getElementsByTagName("media:content"), "url") ||
      extractFirstImgFromHtml(description);

    const excerpt = stripHtml(description).replace(/\s+/g, " ").slice(0, 180);

    return {
      id: link || title,        // đủ duy nhất cho client
      title,
      link,
      pubDate: pubDate ? new Date(pubDate) : new Date(),
      excerpt,
      image,
      source: sourceName,
    };
  });
}

export async function fetchVietnamTechNews(limit = 12) {
  const all = [];
  for (const feed of VIET_TECH_FEEDS) {
    try {
      const xmlText = await fetchRssRaw(feed.url);
      const items = parseRss(xmlText, feed.name);
      all.push(...items);
    } catch (e) {
      console.warn("RSS lỗi:", feed.url, e);
    }
  }

  // Loại trùng theo link
  const dedup = new Map();
  for (const it of all) {
    if (!dedup.has(it.link)) dedup.set(it.link, it);
  }

  // Sắp xếp mới → cũ và giới hạn
  return Array.from(dedup.values())
    .sort((a, b) => b.pubDate - a.pubDate)
    .slice(0, limit);
}
