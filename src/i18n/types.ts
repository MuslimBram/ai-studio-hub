export type TranslationKeys = {
  // Nav
  nav_home: string;
  nav_photo: string;
  nav_video: string;
  nav_audio: string;
  nav_text: string;
  nav_games: string;
  nav_business: string;
  nav_content_engine: string;
  nav_donate: string;
  nav_profile: string;
  nav_admin: string;
  nav_logout: string;
  nav_login: string;
  nav_signup: string;

  // Hero
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;

  // Search
  search_placeholder: string;
  search_results_for: string;
  search_no_results: string;

  // Categories
  categories_title: string;
  featured_tools: string;
  popular_tools: string;
  new_tools: string;
  official_tools: string;

  // Auth
  login_title: string;
  login_email: string;
  login_password: string;
  login_button: string;
  login_forgot: string;
  login_no_account: string;
  login_success: string;
  signup_title: string;
  signup_name: string;
  signup_name_placeholder: string;
  signup_button: string;
  signup_has_account: string;
  signup_verify_title: string;
  signup_verify_text: string;
  signup_verify_back: string;
  signup_password_min: string;
  email_placeholder: string;
  password_placeholder: string;

  // Errors
  error_title: string;
  error_fill_all: string;
  error_fill_email_password: string;

  // Profile
  profile_title: string;
  profile_email: string;
  profile_name: string;
  profile_bio: string;
  profile_bio_placeholder: string;
  profile_save: string;
  profile_saved: string;
  profile_saved_desc: string;
  profile_donations: string;
  profile_donate: string;
  profile_no_donations: string;
  profile_become_supporter: string;
  profile_security: string;
  donation_accepted: string;
  donation_pending: string;

  // Donate
  donate_title: string;
  donate_subtitle: string;
  donate_donors: string;
  donate_total: string;
  donate_bonus_title: string;
  donate_bonus_subtitle: string;
  donate_badge_title: string;
  donate_badge_desc: string;
  donate_early_title: string;
  donate_early_desc: string;
  donate_priority_title: string;
  donate_priority_desc: string;
  donate_thanks: string;
  donate_thanks_desc: string;
  donate_view_profile: string;
  donate_cancelled: string;
  donate_cancelled_desc: string;
  donate_now: string;

  // Tool page
  tool_not_found: string;
  tool_back_home: string;
  tool_features: string;
  tool_use_cases: string;
  tool_input_output: string;
  tool_input: string;
  tool_output: string;
  tool_tags: string;
  tool_price: string;
  tool_use_now: string;
  tool_visit_original: string;
  tool_provider: string;
  tool_model: string;
  tool_category: string;
  tool_subcategory: string;
  tool_added_on: string;

  // Tool Workspace
  workspace_prompt_placeholder: string;
  workspace_generate: string;
  workspace_generating: string;
  workspace_results: string;
  workspace_copy: string;
  workspace_copied: string;
  workspace_empty_prompt: string;
  workspace_ai_limit: string;
  workspace_ai_error: string;
  workspace_generate_error: string;

  // Content Engine
  ce_title: string;
  ce_subtitle: string;
  ce_dashboard: string;
  ce_scheduler: string;
  ce_ai_content: string;
  ce_competitors: string;
  ce_analytics: string;
  ce_channels: string;

  // Content Generator
  cg_title: string;
  cg_captions: string;
  cg_hashtags: string;
  cg_weekly_plan: string;
  cg_seo: string;
  cg_competitor_analysis: string;
  cg_professional: string;
  cg_casual: string;
  cg_sales: string;
  cg_keywords_placeholder: string;
  cg_business_placeholder: string;
  cg_generate: string;
  cg_generating: string;
  cg_results: string;
  cg_copy: string;
  cg_save: string;
  cg_saved: string;
  cg_day: string;
  cg_readability: string;
  cg_engagement: string;
  cg_keywords_count: string;
  cg_improvements: string;
  cg_main_themes: string;
  cg_keyword_gaps: string;
  cg_suggested_topics: string;

  // Footer
  footer_description: string;
  footer_categories: string;
  footer_quick_links: string;
  footer_home: string;
  footer_support_platform: string;
  footer_create_account: string;
  footer_login: string;
  footer_support_us: string;
  footer_support_desc: string;
  footer_donate_now: string;
  footer_copyright: string;
  footer_built_with: string;
  footer_supporters: string;

  // Badge labels
  badge_new: string;
  badge_popular: string;
  badge_featured: string;
  badge_official: string;

  // Forgot password
  forgot_title: string;
  forgot_desc: string;
  forgot_send: string;
  forgot_sent: string;
  forgot_sent_desc: string;
  forgot_back: string;

  // Not found
  notfound_title: string;
  notfound_desc: string;
  notfound_back: string;

  // Common
  common_loading: string;
  common_error: string;
  common_success: string;
  common_cancel: string;
  common_save: string;
  common_delete: string;
  common_edit: string;
  common_close: string;
  common_confirm: string;
  common_back: string;
  common_next: string;

  // Language
  language_name: string;
  language_switch: string;

  // Social accounts
  sa_title: string;
  sa_connect: string;
  sa_edit: string;
  sa_delete: string;
  sa_reconnect: string;
  sa_set_primary: string;
  sa_primary: string;
  sa_connected: string;
  sa_disconnected: string;
  sa_no_accounts: string;
  sa_confirm_delete: string;
};

export type Language = 'sq' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'tr' | 'ar' | 'zh' | 'ja' | 'ko' | 'ru' | 'pl' | 'nl' | 'sv' | 'no' | 'da' | 'fi' | 'el' | 'cs' | 'ro' | 'hu' | 'bg' | 'hr' | 'sr' | 'sk' | 'sl' | 'uk' | 'he' | 'hi' | 'bn' | 'th' | 'vi' | 'id' | 'ms' | 'fil' | 'sw' | 'am' | 'ka' | 'az' | 'kk' | 'uz' | 'mk' | 'bs' | 'mt' | 'is' | 'et' | 'lv' | 'lt';

export const LANGUAGE_LABELS: Record<Language, string> = {
  sq: 'Shqip',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  tr: 'Türkçe',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  pl: 'Polski',
  nl: 'Nederlands',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  el: 'Ελληνικά',
  cs: 'Čeština',
  ro: 'Română',
  hu: 'Magyar',
  bg: 'Български',
  hr: 'Hrvatski',
  sr: 'Српски',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  uk: 'Українська',
  he: 'עברית',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
  fil: 'Filipino',
  sw: 'Kiswahili',
  am: 'አማርኛ',
  ka: 'ქართული',
  az: 'Azərbaycan',
  kk: 'Қазақ',
  uz: "O'zbek",
  mk: 'Македонски',
  bs: 'Bosanski',
  mt: 'Malti',
  is: 'Íslenska',
  et: 'Eesti',
  lv: 'Latviešu',
  lt: 'Lietuvių',
};
