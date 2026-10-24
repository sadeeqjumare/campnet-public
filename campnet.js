const STORAGE_KEY = "campnet.v1";
const seedPosts = [
  {
    id: "p1",
    name: "Hauwa Bello",
    initials: "HB",
    programme: "Computer Science · 300L",
    time: "12 min ago",
    text: "The view from the old campus library at 6pm never gets old. Finally found a quiet corner for this semester’s project 📚",
    tag: "#ABUReads",
    likes: 28,
    liked: false,
    comments: 6,
    color: "coral",
    photo:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "p2",
    name: "Musa Ibrahim",
    initials: "MI",
    programme: "Architecture · 400L",
    time: "38 min ago",
    text: "We’re sketching ideas for a student-led redesign of the SUB garden. A little more shade, somewhere to sit, maybe a weekend book swap. What would you add?",
    tag: "#CampusLife",
    likes: 41,
    liked: false,
    comments: 12,
    color: "blue",
  },
  {
    id: "p3",
    name: "Zainab Ahmed",
    initials: "ZA",
    programme: "Mass Communication · 200L",
    time: "1 hr ago",
    text: "Anyone going to the Arewa Culture Night on Thursday? I’m looking for people to go with 🎶",
    tag: "#FreshersWeek",
    likes: 17,
    liked: false,
    comments: 4,
    color: "gold",
  },
  {
    id: "p4",
    name: "Daniel Okafor",
    initials: "DO",
    programme: "Medicine · 500L",
    time: "2 hrs ago",
    text: "Sharing my anatomy revision deck with anyone preparing for the block exams. Drop a comment and I’ll send the link. We’ve got this.",
    tag: "#StudyCircle",
    likes: 63,
    liked: false,
    comments: 19,
    color: "green",
  },
];
const events = [
  {
    id: "e1",
    month: "NOV",
    day: "03",
    title: "Arewa Culture Night",
    detail: "SUB Amphitheatre · 6:30 PM",
    kind: "Culture",
  },
  {
    id: "e2",
    month: "NOV",
    day: "05",
    title: "Build for Zaria Hackathon",
    detail: "ICT Centre · 9:00 AM",
    kind: "Tech",
  },
  {
    id: "e3",
    month: "NOV",
    day: "08",
    title: "Campus Run Club",
    detail: "Main gate · 6:00 AM",
    kind: "Wellness",
  },
];
const seedMessages = [
  {
    id: "m1",
    name: "Zainab Ahmed",
    initials: "ZA",
    programme: "Mass Communication · 200L",
    status: "Around campus",
    color: "gold",
    preview: "Are we still on for Culture Night?",
    time: "2m",
    unread: 0,
    messages: [
      { sender: "them", text: "Hey! Are we still on for Culture Night on Thursday?" },
      { sender: "me", text: "Definitely. I’m thinking we meet by the SUB around 6?" },
      { sender: "them", text: "Perfect, I’ll bring a couple of people from my class too ✨" },
    ],
  },
  {
    id: "m2",
    name: "Musa Ibrahim",
    initials: "MI",
    programme: "Architecture · 400L",
    status: "In studio",
    color: "blue",
    preview: "Sent you a campus garden sketch",
    time: "1h",
    unread: 1,
    messages: [
      { sender: "them", text: "I drew a quick layout for the SUB garden idea." },
      { sender: "me", text: "This looks good. Want me to add a reading corner?" },
    ],
  },
  {
    id: "m3",
    name: "Study Circle · 300L",
    initials: "SC",
    programme: "Shared notes",
    status: "Online",
    color: "green",
    preview: "Daniel: notes are in the drive",
    time: "3h",
    unread: 0,
    messages: [
      { sender: "them", text: "Daniel: notes are in the drive. I’ve added the revision deck." },
      { sender: "me", text: "Thanks! I’ll check it before tonight." },
    ],
  },
];
const defaults = {
  users: {},
  profile: null,
  posts: seedPosts,
  rsvps: [],
  messages: seedMessages,
  activeMessageId: "m1",
  settings: {
    notifications: true,
    privateMode: false,
    campusOnly: true,
  },
  notifications: [
    {
      id: "n1",
      title: "Hauwa Bello",
      detail: "liked your comment in ABU Reads",
      time: "15 min ago",
      initials: "HB",
      seen: false,
    },
    {
      id: "n2",
      title: "Study Circle · 300L",
      detail: "Musa shared a new set of notes",
      time: "1 hr ago",
      initials: "SC",
      seen: false,
    },
    {
      id: "n3",
      title: "Arewa Culture Night",
      detail: "starts in 2 days. Save your spot!",
      time: "3 hrs ago",
      initials: "AC",
      seen: false,
    },
  ],
};
let data = loadData();
let activeView = "home";
let authMode = "login";
let activeFeedFilter = "campus";
let postSortOrder = "recent";
let openCommentPostId = null;
let toastTimer;
const $ = (id) => document.getElementById(id);
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

// Restore saved demo data, falling back to the sample campus content.
function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const base = structuredClone(defaults);
    return {
      ...base,
      ...saved,
      posts: saved.posts || structuredClone(seedPosts),
      users: saved.users || {},
      rsvps: saved.rsvps || [],
      connections: saved.connections || [],
      circles: saved.circles || [],
      messages: saved.messages || structuredClone(seedMessages),
      activeMessageId: saved.activeMessageId || base.activeMessageId,
      settings: {
        ...base.settings,
        ...(saved.settings || {}),
      },
      notifications:
        saved.notifications || structuredClone(defaults.notifications),
    };
  } catch {
    return structuredClone(defaults);
  }
}

// CampNet's prototype stores account and feed data in this browser only.
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Keep the document theme and all theme buttons in sync.
function applyTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute(
      "aria-label",
      `Switch to ${dark ? "light" : "dark"} mode`,
    );
    button.setAttribute("title", `Switch to ${dark ? "light" : "dark"} mode`);
    button.setAttribute("aria-pressed", String(dark));
    button.innerHTML = `<span aria-hidden="true">${dark ? "☀" : "☾"}</span>`;
  });
  document.querySelector('meta[name="theme-color"]').content = dark
    ? "#111a15"
    : "#f6f7f2";
  if (persist) {
    try {
      localStorage.setItem("campnet.theme", theme);
    } catch {}
  }
}

// Hash demo passwords before saving them in localStorage.
async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return [...new Uint8Array(bits)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
function setMode(mode) {
  authMode = mode;
  const signup = mode === "signup";
  $("name-field").hidden = !signup;
  $("name-input").required = signup;
  $("password-input").autocomplete = signup
    ? "new-password"
    : "current-password";
  $("auth-title").textContent = signup
    ? "Find your people."
    : "Good to have you back.";
  $("auth-subtitle").textContent = signup
    ? "A better campus starts with you in it."
    : "Sign in to pick up where campus left off.";
  $("auth-submit").innerHTML =
    `<span>${signup ? "Create your CampNet account" : "Sign in to CampNet"}</span><span aria-hidden="true">→</span>`;
  $("login-tab").classList.toggle("active", !signup);
  $("signup-tab").classList.toggle("active", signup);
  $("login-tab").setAttribute("aria-selected", String(!signup));
  $("signup-tab").setAttribute("aria-selected", String(signup));
  $("auth-error").hidden = true;
}
function enter(profile) {
  data.profile = profile;
  saveData();
  $("auth-screen").hidden = true;
  $("app-screen").hidden = false;
  syncProfile();
  render();
}
function syncProfile() {
  const name = data.profile?.name || "Student";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  $("sidebar-name").textContent = name;
  $("sidebar-programme").textContent = data.profile?.programme || "ABU student";
  $("sidebar-avatar").textContent = initials;
  $("profile-avatar").textContent = initials;
  $("profile-name").textContent = name;
  $("profile-detail").textContent =
    data.profile?.programme || "ABU student · Zaria";
  $("my-post-count").textContent = data.posts.filter(
    (post) => post.authorEmail === data.profile.email,
  ).length;
  $("connection-count").textContent = data.connections.length;
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  $("date-label").textContent = `ABU · ZARIA  /  ${today.toUpperCase()}`;
}
function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 2600);
}
function openSettingsModal() {
  const modal = $("settings-modal");
  $("setting-notifications").checked = !!data.settings.notifications;
  $("setting-private").checked = !!data.settings.privateMode;
  $("setting-campus").checked = !!data.settings.campusOnly;
  modal.hidden = false;
}
function closeSettingsModal() {
  $("settings-modal").hidden = true;
}
function openProfileEditorModal() {
  const form = $("profile-editor-form");
  $("profile-name-input").value = data.profile?.name || "";
  $("profile-programme-input").value = data.profile?.programme || "";
  form.reset();
  $("profile-name-input").value = data.profile?.name || "";
  $("profile-programme-input").value = data.profile?.programme || "";
  $("profile-editor-modal").hidden = false;
}
function closeProfileEditorModal() {
  $("profile-editor-modal").hidden = true;
}
function showView(view) {
  activeView = view;
  document
    .querySelectorAll("[data-view]")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.view === view),
    );
  const titles = {
    home: "Your campus, in the loop.",
    discover: "There’s more to meet.",
    messages: "Your conversations.",
    notifications: "You’re in the loop.",
    profile: "Your CampNet space.",
    events: "Make a plan.",
  };
  $("view-title").textContent = titles[view] || titles.home;
  render();
}

// Rendering functions below build the visible content for each app view.
function render() {
  renderFeed();
  renderEvents();
  renderRailVisibility();
  updateNotificationIndicators();
}
function updateNotificationIndicators() {
  const unreadCount = data.notifications.filter((item) => !item.seen).length;
  const notificationBadge = $("notification-count");
  notificationBadge.textContent = unreadCount;
  notificationBadge.hidden = unreadCount === 0;
  $("notification-dot").hidden = unreadCount === 0;

  const hasUnreadMessages = data.messages.some((item) => item.unread > 0);
  $("message-unread-dot").hidden = !hasUnreadMessages;
}
function renderRailVisibility() {
  document.querySelector(".profile-card").hidden =
    activeView === "messages" || activeView === "notifications";
  document.querySelector(".events-section").hidden =
    activeView === "messages" || activeView === "notifications";
  document.querySelector(".trends-section").hidden =
    activeView === "messages" || activeView === "notifications";
  document.querySelector(".quick-actions-section").hidden =
    activeView === "messages" || activeView === "notifications";
}
function postCard(post) {
  const isMine = post.authorEmail && post.authorEmail === data.profile?.email;
  const commentCount = Number(post.comments) || 0;
  const moreButton = isMine
    ? '<button class="post-more" data-action="delete" aria-label="Delete your post">···</button>'
    : '<button class="post-more" data-action="more" aria-label="More post options">···</button>';

  return `
    <article class="post-card" data-post="${escapeHtml(post.id)}">
      <div class="post-head">
        <span class="avatar avatar-${escapeHtml(post.color || "coral")}">
          ${escapeHtml(post.initials || "CN")}
        </span>
        <div class="post-author">
          <b>${escapeHtml(post.name)}</b>
          <span>
            ${escapeHtml(post.programme || "ABU student")}
            <i>·</i> ${escapeHtml(post.time || "just now")}
          </span>
        </div>
        ${moreButton}
      </div>
      <p class="post-text">${escapeHtml(post.text)}</p>
      ${post.photo ? `<img class="post-photo" src="${escapeHtml(post.photo)}" alt="A campus-related image shared by ${escapeHtml(post.name)}" loading="lazy">` : ""}
      <div class="post-tag-row">
        <a class="post-tag" href="#">${escapeHtml(post.tag || "#ABU")}</a>
        <span class="post-reaction-summary">${post.likes} students found this useful</span>
      </div>
      <div class="post-actions">
        <button class="post-action ${post.liked ? "is-liked" : ""}" data-action="like">
          <span>${post.liked ? "♥" : "♡"}</span> Appreciate <b>${post.likes}</b>
        </button>
        <button class="post-action" data-action="comment" aria-expanded="${openCommentPostId === post.id}">
          <span>◌</span> Comment <b>${commentCount}</b>
        </button>
        <button class="post-action post-share" data-action="share">
          <span>↗</span> Share
        </button>
      </div>
      ${renderPostComments(post)}
    </article>
  `;
}
function renderPostComments(post) {
  if (openCommentPostId !== post.id) return "";

  const comments = post.commentItems || [];
  const commentMarkup = comments.length
    ? comments
        .map(
          (comment) => `
            <article class="post-comment">
              <b>${escapeHtml(comment.name)}</b>
              <p>${escapeHtml(comment.text)}</p>
              <time>${escapeHtml(comment.time || "just now")}</time>
            </article>
          `,
        )
        .join("")
    : '<p class="comments-empty">Be the first to add something useful.</p>';

  return `
    <section class="post-comments" aria-label="Comments">
      <div class="comment-list">${commentMarkup}</div>
      <form class="comment-form" data-comment-form="${escapeHtml(post.id)}">
        <label class="sr-only" for="comment-${escapeHtml(post.id)}">Write a comment</label>
        <input id="comment-${escapeHtml(post.id)}" name="comment" maxlength="280" placeholder="Add a helpful comment…" required>
        <button type="submit">Reply</button>
      </form>
    </section>
  `;
}
function renderComposer() {
  const name = data.profile?.name || "Student";
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return `<section class="composer"><div class="composer-top"><span class="avatar avatar-me">${escapeHtml(initials)}</span><button id="composer-open" class="composer-prompt" type="button">What’s happening on campus, ${escapeHtml(name.split(" ")[0])}?</button></div><div class="composer-tools"><span class="composer-hint">A good place to share what’s useful.</span><button id="compose-button" class="compose-button" type="button"><span>＋</span> Start a post</button></div><form id="composer-form" class="composer-form" hidden><label class="sr-only" for="post-input">Write a campus post</label><textarea id="post-input" maxlength="500" placeholder="Share a thought, a tip, or a little campus news…" required></textarea><div class="composer-form-bottom"><span>Keep it kind. Keep it CampNet.</span><button class="compose-button" type="submit">Post to campus <span>→</span></button></div></form></section>`;
}
function renderCampusPulse() {
  const campusPostCount = data.posts.length;
  const eventCount = events.length;
  const joinedCircleCount = data.circles.length;

  return `
    <section class="campus-pulse">
      <div class="pulse-header">
        <div>
          <p class="eyebrow">ABU at a glance</p>
          <h2>Campus pulse</h2>
        </div>
        <button class="quiet-link" data-view="discover">See more</button>
      </div>
      <div class="pulse-grid">
        <div class="pulse-card">
          <span>Campus posts</span>
          <b>${campusPostCount}</b>
          <small>Shared around ABU</small>
        </div>
        <div class="pulse-card">
          <span>Upcoming events</span>
          <b>${eventCount}</b>
          <small>On the campus calendar</small>
        </div>
        <div class="pulse-card">
          <span>Your circles</span>
          <b>${joinedCircleCount}</b>
          <small>Communities you joined</small>
        </div>
      </div>
    </section>
  `;
}
function renderFeed() {
  const root = $("view-content");
  if (activeView === "messages") {
    root.innerHTML = renderMessages();
    return;
  }
  if (activeView === "notifications") {
    root.innerHTML = renderNotifications();
    return;
  }
  if (activeView === "profile") {
    root.innerHTML = renderProfile();
    return;
  }
  if (activeView === "events") {
    root.innerHTML = renderAllEvents();
    return;
  }
  if (activeView === "discover") {
    root.innerHTML = renderDiscover();
    return;
  }
  const query = $("search-input").value.trim().toLowerCase();
  const filteredPosts = data.posts.filter((post) => {
    const matchesSearch =
      !query ||
      `${post.name} ${post.programme} ${post.text} ${post.tag}`
        .toLowerCase()
        .includes(query);
    const matchesFeed =
      activeFeedFilter === "campus" ||
      (activeFeedFilter === "friends" && data.connections.includes(post.name)) ||
      (activeFeedFilter === "study" &&
        /study|notes|revision|course|exam/i.test(`${post.tag} ${post.text}`));

    return matchesSearch && matchesFeed;
  });
  const posts = [...filteredPosts].sort((first, second) =>
    postSortOrder === "popular"
      ? second.likes - first.likes
      : data.posts.indexOf(first) - data.posts.indexOf(second),
  );
  const postList = posts.length
    ? posts.map(postCard).join("")
    : `
      <div class="empty-feed">
        <span>⌕</span>
        <b>No posts found</b>
        <p>Try another name, course, or campus topic.</p>
      </div>
    `;
  const feedTitles = {
    campus: "HAPPENING AROUND ABU",
    friends: "PEOPLE YOU KNOW",
    study: "STUDY & NOTES",
  };
  const sectionTitle = query
    ? `RESULTS FOR “${escapeHtml(query)}”`
    : feedTitles[activeFeedFilter];

  root.innerHTML = `
    <div class="feed-tabs">
      <button class="feed-tab ${activeFeedFilter === "campus" ? "active" : ""}" data-feed="campus" aria-pressed="${activeFeedFilter === "campus"}">
        For your campus <span class="tab-live"></span>
      </button>
      <button class="feed-tab ${activeFeedFilter === "friends" ? "active" : ""}" data-feed="friends" aria-pressed="${activeFeedFilter === "friends"}">People you know</button>
      <button class="feed-tab ${activeFeedFilter === "study" ? "active" : ""}" data-feed="study" aria-pressed="${activeFeedFilter === "study"}">Study &amp; notes</button>
    </div>
    ${renderComposer()}
    ${renderCampusPulse()}
    <div class="section-label">
      <span>${sectionTitle}</span>
      <button id="feed-sort">${postSortOrder === "recent" ? "Most recent" : "Most appreciated"} <span>⌄</span></button>
    </div>
    <div class="post-list">${postList}</div>
  `;
}
function renderDiscover() {
  const circles = [
    { name: "ABU Reads", art: "Aa", style: "book", description: "Books, quiet corners & good recs" },
    { name: "Build at ABU", art: "⌘", style: "build", description: "Hackathons, projects & side quests" },
    { name: "Zaria Creatives", art: "✳", style: "creative", description: "Make things. Find your people." },
    { name: "Campus Run Club", art: "↗", style: "run", description: "Early starts, easy pace, all welcome" },
  ];
  const students = [
    { name: "Zainab Ahmed", initials: "ZA", color: "gold", programme: "Mass Communication · 200L" },
    { name: "Musa Ibrahim", initials: "MI", color: "blue", programme: "Architecture · 400L" },
    { name: "Daniel Okafor", initials: "DO", color: "green", programme: "Medicine · 500L" },
  ];
  const circleCards = circles.map((circle) => {
    const joined = data.circles.includes(circle.name);
    return `
      <button class="circle-card" data-circle="${escapeHtml(circle.name)}" aria-pressed="${joined}">
        <span class="circle-art circle-art-${circle.style}">${circle.art}</span>
        <b>${escapeHtml(circle.name)}</b>
        <small>${escapeHtml(circle.description)}</small>
        <span class="circle-join">${joined ? "Joined" : "Join circle"} <i>${joined ? "✓" : "↗"}</i></span>
      </button>
    `;
  });
  const studentCards = students.map((student) => {
    const connected = data.connections.includes(student.name);
    return `
      <div class="person-card">
        <span class="avatar avatar-${student.color}">${student.initials}</span>
        <b>${escapeHtml(student.name)}</b>
        <small>${escapeHtml(student.programme)}</small>
        <button data-friend="${escapeHtml(student.name)}" aria-pressed="${connected}">
          ${connected ? "✓ Connected" : "＋ Connect"}
        </button>
      </div>
    `;
  });

  return `
    <section class="discovery-hero">
      <p class="eyebrow">A campus of 40,000 stories</p>
      <h2>Somebody here<br>gets <em>your thing.</em></h2>
      <p>Find the people and corners of ABU that make it feel like yours.</p>
    </section>
    <div class="section-label">
      <span>STUDENT CIRCLES</span>
      <button class="quiet-link" id="discover-all">Browse all <span>→</span></button>
    </div>
    <div class="circle-grid">${circleCards.join("")}</div>
    <div class="section-label discover-people"><span>STUDENTS TO KNOW</span></div>
    <div class="people-row">${studentCards.join("")}</div>
  `;
}
function renderMessages() {
  const thread =
    data.messages.find((item) => item.id === data.activeMessageId) ||
    data.messages[0];

  if (!thread) {
    return '<div class="message-layout"><div class="message-list"><div class="message-list-top"><b>Recent</b><button class="icon-button" aria-label="New message" id="new-message">＋</button></div></div><div class="message-conversation"><div class="empty-feed"><span>▤</span><b>No messages yet</b><p>Choose a student from Discover to start a conversation.</p></div></div></div>';
  }

  return `<div class="message-layout"><div class="message-list"><div class="message-list-top"><b>Recent</b><button class="icon-button" aria-label="New message" id="new-message">＋</button></div>${data.messages
    .map(
      (item) => `<button class="message-person ${item.id === thread.id ? "selected" : ""}" data-message-thread="${item.id}"><span class="avatar avatar-${escapeHtml(item.color || "gold")}">${escapeHtml(item.initials)}</span><span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.preview)}</small></span><time>${escapeHtml(item.time)}</time></button>`,
    )
    .join("")}</div><div class="message-conversation"><div class="conversation-head"><span class="avatar avatar-${escapeHtml(thread.color || "gold")}">${escapeHtml(thread.initials)}</span><span><b>${escapeHtml(thread.name)}</b><small>${escapeHtml(thread.programme)}</small></span><span class="online-status"><i></i> ${escapeHtml(thread.status)}</span></div><div class="conversation-body"><p class="conversation-date">TODAY · 10:42 AM</p>${thread.messages
    .map(
      (message) => `<div class="bubble ${message.sender === "me" ? "sent" : "received"}">${escapeHtml(message.text)}</div>`,
    )
    .join("")}</div><form class="message-compose" id="message-form"><input id="message-input" placeholder="Write a message…" aria-label="Write a message" required><button type="submit" aria-label="Send message">↑</button></form></div></div>`;
}
function renderNotifications() {
  return `<div class="notifications-head"><div><span class="eyebrow">YOUR ACTIVITY</span><p>A few things found their way to you.</p></div><button id="mark-read" class="quiet-link">Mark all as read</button></div><div class="notification-list">${data.notifications.map((item) => `<article class="notification-item ${item.seen ? "seen" : ""}"><span class="avatar avatar-${item.initials === "HB" ? "coral" : item.initials === "SC" ? "blue" : "gold"}">${escapeHtml(item.initials)}</span><div><p><b>${escapeHtml(item.title)}</b> ${escapeHtml(item.detail)}</p><time>${escapeHtml(item.time)}</time></div>${item.seen ? "" : '<i class="notification-unread"></i>'}</article>`).join("")}</div>`;
}
function renderProfile() {
  const mine = data.posts.filter(
    (post) => post.authorEmail === data.profile?.email,
  );
  const initials = (data.profile?.name || "S")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const name = data.profile?.name || "Student";
  const programme = data.profile?.programme || "ABU student · Zaria";
  const postsContent = mine.length
    ? `<div class="post-list">${mine.map(postCard).join("")}</div>`
    : `
      <div class="profile-empty">
        <span>✳</span>
        <b>Your story starts here.</b>
        <p>Share a campus moment or a useful little discovery.</p>
        <button id="profile-first-post">Write your first post <span>→</span></button>
      </div>
    `;

  return `
    <section class="profile-page">
      <div class="profile-page-cover"></div>
      <div class="profile-page-info">
        <span class="avatar avatar-large avatar-me">${escapeHtml(initials)}</span>
        <div>
          <h2>${escapeHtml(name)}</h2>
          <p>
            ${escapeHtml(programme)}
            <span>·</span> Ahmadu Bello University
          </p>
        </div>
        <div class="profile-actions">
          <button class="profile-edit" id="edit-profile">Edit profile</button>
          <button class="profile-logout" id="logout-button" type="button">Log out</button>
        </div>
      </div>
      <div class="profile-bio">
        Here to find good people, share useful things, and make the most of campus.
      </div>
      <div class="profile-subnav">
        <button class="active">Posts <span>${mine.length}</span></button>
        <button data-view="discover">Circles <span>${data.circles.length}</span></button>
        <button data-view="events">Events <span>${data.rsvps.length}</span></button>
      </div>
      ${postsContent}
    </section>
  `;
}
function renderAllEvents() {
  return `<div class="all-events-intro"><p class="eyebrow">MAKE THE MOST OF THIS PLACE</p><h2>Good things happen<br>when you <em>show up.</em></h2><p>Talks, little adventures, and things worth leaving your room for.</p></div><div class="all-events-list">${events.map(eventCard).join("")}</div>`;
}
function eventCard(event) {
  const joined = data.rsvps.includes(event.id);
  return `<article class="event-row"><div class="event-date"><span>${event.month}</span><b>${event.day}</b></div><div class="event-info"><span class="event-kind">${event.kind}</span><h3>${event.title}</h3><p>${event.detail}</p></div><button class="rsvp-button ${joined ? "joined" : ""}" data-rsvp="${event.id}">${joined ? "Going ✓" : "I’m interested"}</button></article>`;
}
function renderEvents() {
  $("events-list").innerHTML = events
    .slice(0, 2)
    .map(
      (event) =>
        `<article class="event-mini"><div class="mini-date"><span>${event.month}</span><b>${event.day}</b></div><div class="mini-event-info"><b>${event.title}</b><small>${event.detail}</small></div><button class="event-add ${data.rsvps.includes(event.id) ? "joined" : ""}" data-rsvp="${event.id}" aria-label="${data.rsvps.includes(event.id) ? "Remove RSVP" : "RSVP to"} ${event.title}">${data.rsvps.includes(event.id) ? "✓" : "+"}</button></article>`,
    )
    .join("");
}

$("login-tab").addEventListener("click", () => setMode("login"));
$("signup-tab").addEventListener("click", () => setMode("signup"));
$("auth-switch-top").addEventListener("click", () =>
  setMode(authMode === "login" ? "signup" : "login"),
);
$("auth-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("email-input").value.trim().toLowerCase();
  const password = $("password-input").value;
  const error = $("auth-error");
  const submit = $("auth-submit");
  if (!email.includes("@")) {
    error.textContent = "Enter a valid email address.";
    error.hidden = false;
    return;
  }
  submit.disabled = true;
  error.hidden = true;
  if (authMode === "signup") {
    const name = $("name-input").value.trim();
    if (!name) {
      error.textContent = "Add your name to get started.";
      error.hidden = false;
      submit.disabled = false;
      return;
    }
    if (data.users[email]) {
      error.textContent =
        "An account for this email already exists. Try signing in.";
      error.hidden = false;
      submit.disabled = false;
      return;
    }
    const profile = { name, email, programme: "ABU student · Zaria" };
    try {
      const salt = crypto.randomUUID();
      data.users[email] = {
        ...profile,
        passwordSalt: salt,
        passwordHash: await hashPassword(password, salt),
      };
      enter(profile);
    } catch {
      error.textContent =
        "Password verification is unavailable in this browser. Use the sample profile instead.";
      error.hidden = false;
      submit.disabled = false;
    }
  } else {
    const account = data.users[email];
    if (!account) {
      error.textContent =
        "We couldn’t find that local profile. Join CampNet or try the sample profile.";
      error.hidden = false;
      submit.disabled = false;
      return;
    }
    try {
      const candidate = await hashPassword(password, account.passwordSalt);
      if (candidate !== account.passwordHash) {
        error.textContent = "That password doesn’t match this local profile.";
        error.hidden = false;
        submit.disabled = false;
        return;
      }
      enter({
        name: account.name,
        email: account.email,
        programme: account.programme,
      });
    } catch {
      error.textContent =
        "Password verification is unavailable in this browser. Use the sample profile instead.";
      error.hidden = false;
      submit.disabled = false;
    }
  }
});
$("demo-button").addEventListener("click", () =>
  enter({
    name: "Sadeeq Jumare",
    email: "sadeeq@campnet.local",
    programme: "Computer Science · 300L",
  }),
);
$("search-input").addEventListener("input", () => {
  if (activeView === "home") renderFeed();
});

// Delegation keeps controls working when a view is re-rendered.
document.addEventListener("click", (event) => {
  if (event.target.closest("#sidebar-profile")) {
    const menu = $("profile-menu");
    menu.hidden = !menu.hidden;
    return;
  }
  if (!event.target.closest("#profile-menu") && !event.target.closest("#sidebar-profile")) {
    $("profile-menu").hidden = true;
  }
  const feedTab = event.target.closest("[data-feed]");
  if (feedTab) {
    activeFeedFilter = feedTab.dataset.feed;
    renderFeed();
    return;
  }
  const themeToggle = event.target.closest("[data-theme-toggle]");
  if (themeToggle) {
    applyTheme(
      document.documentElement.dataset.theme === "dark" ? "light" : "dark",
      true,
    );
    return;
  }
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    showView(viewButton.dataset.view);
    return;
  }
  const rsvp = event.target.closest("[data-rsvp]");
  if (rsvp) {
    const id = rsvp.dataset.rsvp;
    data.rsvps = data.rsvps.includes(id)
      ? data.rsvps.filter((item) => item !== id)
      : [...data.rsvps, id];
    saveData();
    render();
    toast(
      data.rsvps.includes(id)
        ? "You’re on the list. See you there."
        : "RSVP removed.",
    );
    return;
  }
  const action = event.target.closest("[data-action]");
  if (action) {
    const article = action.closest("[data-post]");
    const post = data.posts.find((item) => item.id === article?.dataset.post);
    if (!post) return;
    if (action.dataset.action === "like") {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      saveData();
      renderFeed();
    } else if (action.dataset.action === "comment") {
      openCommentPostId =
        openCommentPostId === post.id ? null : post.id;
      renderFeed();
    } else if (action.dataset.action === "share") {
      navigator.clipboard
        ?.writeText(`${post.text} — ${post.name} on CampNet`)
        .then(() => toast("Post copied to clipboard."))
        .catch(() => toast("Share this post with a friend on campus."));
    } else if (action.dataset.action === "delete") {
      data.posts = data.posts.filter((item) => item.id !== post.id);
      saveData();
      render();
      toast("Post removed.");
    } else if (action.dataset.action === "more")
      toast("Thanks for keeping CampNet welcoming.");
    return;
  }
  const threadButton = event.target.closest("[data-message-thread]");
  if (threadButton) {
    data.activeMessageId = threadButton.dataset.messageThread;
    const thread = data.messages.find(
      (item) => item.id === data.activeMessageId,
    );
    if (thread) thread.unread = 0;
    saveData();
    render();
    return;
  }
  const profileAction = event.target.closest("[data-profile-action]");
  if (profileAction) {
    const action = profileAction.dataset.profileAction;
    $("profile-menu").hidden = true;
    if (action === "edit") openProfileEditorModal();
    if (action === "settings") openSettingsModal();
    if (action === "logout") {
      data.profile = null;
      data.activeMessageId = "m1";
      saveData();
      activeView = "home";
      $("auth-screen").hidden = false;
      $("app-screen").hidden = true;
      setMode("login");
      $("auth-form").reset();
      $("auth-error").hidden = true;
      toast("Logged out successfully.");
    }
    return;
  }
  const circle = event.target.closest("[data-circle]");
  if (circle) {
    const name = circle.dataset.circle;
    const alreadyJoined = data.circles.includes(name);
    data.circles = alreadyJoined
      ? data.circles.filter((item) => item !== name)
      : [...data.circles, name];
    saveData();
    renderFeed();
    toast(alreadyJoined ? `You left ${name}.` : `You joined ${name}.`);
    return;
  }
  const quickAction = event.target.closest("[data-quick-action]");
  if (quickAction) {
    const key = quickAction.dataset.quickAction;
    if (key === "events") {
      showView("events");
      toast("Here are the next campus events.");
    } else if (key === "study") {
      showView("discover");
      toast("Quiet study spaces and circles are waiting.");
    } else if (key === "ask") {
      toast("Campus desk: check the student affairs board for help.");
    }
    return;
  }
  const friend = event.target.closest("[data-friend]");
  if (friend) {
    const name = friend.dataset.friend;
    const alreadyConnected = data.connections.includes(name);
    data.connections = alreadyConnected
      ? data.connections.filter((item) => item !== name)
      : [...data.connections, name];
    saveData();
    syncProfile();
    renderFeed();
    toast(alreadyConnected ? `Removed ${name} from your connections.` : `You’re now connected with ${name}.`);
    return;
  }
  if (event.target.closest("#composer-open")) {
    $("composer-form").hidden = false;
    $("post-input").focus();
  }
  if (event.target.closest("#compose-button")) {
    $("composer-form").hidden = false;
    $("post-input").focus();
  }
  if (event.target.closest("#profile-first-post")) {
    showView("home");
    setTimeout(() => {
      $("composer-form").hidden = false;
      $("post-input").focus();
    }, 0);
  }
  if (event.target.closest("#top-notifications")) showView("notifications");
  if (event.target.closest("#mark-read")) {
    data.notifications.forEach((item) => {
      item.seen = true;
    });
    saveData();
    render();
    toast("All caught up.");
  }
  if (event.target.closest("#edit-profile")) {
    openProfileEditorModal();
    return;
  }
  if (event.target.closest("#logout-button")) {
    data.profile = null;
    data.activeMessageId = "m1";
    saveData();
    activeView = "home";
    $("auth-screen").hidden = false;
    $("app-screen").hidden = true;
    setMode("login");
    $("auth-form").reset();
    $("auth-error").hidden = true;
    $("profile-menu").hidden = true;
    toast("Logged out successfully.");
    return;
  }
  if (event.target.closest("#feed-sort")) {
    postSortOrder = postSortOrder === "recent" ? "popular" : "recent";
    renderFeed();
  }
  if (event.target.closest("#discover-all"))
    toast("You’re seeing all the featured student circles.");
  if (event.target.closest("#new-message"))
    toast("Choose a student from Discover to start a conversation.");
  if (event.target.closest("#close-settings")) closeSettingsModal();
  if (event.target.closest("#cancel-settings")) closeSettingsModal();
  if (event.target.closest("#close-profile-editor")) closeProfileEditorModal();
  if (event.target.closest("#cancel-profile-editor")) closeProfileEditorModal();
});
document.addEventListener("submit", (event) => {
  const commentForm = event.target.closest("[data-comment-form]");
  if (commentForm) {
    event.preventDefault();
    const post = data.posts.find(
      (item) => item.id === commentForm.dataset.commentForm,
    );
    const input = commentForm.elements.comment;
    const text = input.value.trim();
    if (!post || !text || !data.profile) return;

    post.commentItems = post.commentItems || [];
    post.commentItems.push({
      name: data.profile.name,
      text,
      time: "just now",
    });
    post.comments = (Number(post.comments) || 0) + 1;
    openCommentPostId = post.id;
    saveData();
    renderFeed();
    toast("Comment added.");
    return;
  }

  if (event.target.id === "composer-form") {
    event.preventDefault();
    const text = $("post-input").value.trim();
    if (!text) return;
    const name = data.profile?.name || "Student";
    data.posts.unshift({
      id: `p${Date.now()}`,
      name,
      initials: name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
      programme: data.profile?.programme || "ABU student",
      time: "just now",
      text,
      tag: "#CampusLife",
      likes: 0,
      liked: false,
      comments: 0,
      commentItems: [],
      color: "me",
      authorEmail: data.profile?.email,
    });
    saveData();
    render();
    toast("Your post is up.");
  }
  if (event.target.id === "message-form") {
    event.preventDefault();
    const input = $("message-input");
    const message = input.value.trim();
    if (!message) return;

    const thread =
      data.messages.find((item) => item.id === data.activeMessageId) ||
      data.messages[0];
    if (!thread) return;

    thread.messages.push({ sender: "me", text: message });
    thread.preview = message;
    thread.time = "now";
    saveData();
    render();
    toast("Message sent.");
  }
  if (event.target.id === "settings-form") {
    event.preventDefault();
    data.settings = {
      notifications: $("setting-notifications").checked,
      privateMode: $("setting-private").checked,
      campusOnly: $("setting-campus").checked,
    };
    saveData();
    closeSettingsModal();
    toast("Preferences saved.");
  }
  if (event.target.id === "profile-editor-form") {
    event.preventDefault();
    if (!data.profile) return;
    data.profile.name = $("profile-name-input").value.trim();
    data.profile.programme = $("profile-programme-input").value.trim();
    if (!data.profile.name || !data.profile.programme) {
      toast("Please complete both fields.");
      return;
    }
    saveData();
    syncProfile();
    render();
    closeProfileEditorModal();
    toast("Profile updated.");
  }
});

if (data.profile) enter(data.profile);
else {
  $("auth-screen").hidden = false;
  $("app-screen").hidden = true;
}
applyTheme(document.documentElement.dataset.theme || "light");
try {
  matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    (event) => {
      try {
        if (!localStorage.getItem("campnet.theme"))
          applyTheme(event.matches ? "dark" : "light");
      } catch {}
    },
  );
} catch {}
renderEvents();
