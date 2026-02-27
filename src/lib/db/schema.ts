export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: string;
  custom_css: string;
  bg_type: string;
  bg_color: string;
  bg_gradient_from: string;
  bg_gradient_to: string;
  bg_gradient_direction: string;
  bg_image_url: string;
  btn_shape: string;
  btn_color: string;
  btn_text_color: string;
  btn_hover: string;
  btn_shadow: string;
  font_family: string;
  font_size: string;
  text_color: string;
  layout: string;
  avatar_shape: string;
  avatar_border: string;
  nsfw: number;
  tip_enabled: number;
  tip_text: string;
  tip_url: string;
  // SEO & Meta
  seo_title: string;
  seo_description: string;
  og_image_url: string;
  hide_from_search: number;
  // Appearance: Animation & Social Position
  link_animation: string;
  social_position: string;
  // Tracking & Analytics
  ga_measurement_id: string;
  fb_pixel_id: string;
  tiktok_pixel_id: string;
  // Password protection
  page_password: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface LinkRow {
  id: number;
  user_id: number;
  title: string;
  url: string;
  icon: string;
  thumbnail_url: string | null;
  position: number;
  clicks: number;
  is_active: number;
  bg_color: string;
  text_color: string;
  shape: string;
  nsfw: number;
  link_type: string;
  embed_url: string;
  scheduled_start: string;
  scheduled_end: string;
  // UTM parameters
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  // Pinned
  is_pinned: number;
  // Block config (JSON string for advanced block types)
  block_config: string;
  created_at: string;
}

export interface ClickRow {
  id: number;
  link_id: number;
  referrer: string;
  country: string;
  device: string;
  created_at: string;
}

export interface SocialIconRow {
  id: number;
  user_id: number;
  platform: string;
  url: string;
  position: number;
}

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  theme TEXT NOT NULL DEFAULT 'default',
  custom_css TEXT DEFAULT '',
  bg_type TEXT NOT NULL DEFAULT 'theme',
  bg_color TEXT DEFAULT '',
  bg_gradient_from TEXT DEFAULT '',
  bg_gradient_to TEXT DEFAULT '',
  bg_gradient_direction TEXT NOT NULL DEFAULT 'top-bottom',
  bg_image_url TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT '',
  thumbnail_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS link_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  referrer TEXT DEFAULT '',
  country TEXT DEFAULT '',
  device TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_icons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_user_position ON links(user_id, position);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_created_at ON link_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_social_icons_user_id ON social_icons(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
`;
