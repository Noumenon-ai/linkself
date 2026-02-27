export type PlanId = "free" | "pro" | "business";

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number; // monthly USD, 0 for free
  maxLinks: number; // -1 for unlimited
  maxSocialIcons: number;
  themes: "basic" | "all";
  basicThemeIds: string[]; // which themes are available on free
  analytics: "7d" | "30d" | "90d";
  features: {
    customCss: boolean;
    scheduling: boolean;
    embeds: boolean;
    emailCollector: boolean;
    countdownTimer: boolean;
    contactForm: boolean;
    faqBlock: boolean;
    imageGallery: boolean;
    testimonialBlock: boolean;
    mapBlock: boolean;
    seoControls: boolean;
    videoBackground: boolean;
    patternBackground: boolean;
    gaPixel: boolean;
    fbPixel: boolean;
    tiktokPixel: boolean;
    passwordProtection: boolean;
    utmBuilder: boolean;
    customDomain: boolean;
    removeBranding: boolean;
    pinnedLinks: boolean;
    linkAnimations: boolean;
    nsfwPerLink: boolean;
  };
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    maxLinks: 5,
    maxSocialIcons: 5,
    themes: "basic",
    basicThemeIds: ["default", "midnight", "minimal", "dark", "pastel"],
    analytics: "7d",
    features: {
      customCss: false,
      scheduling: false,
      embeds: false,
      emailCollector: false,
      countdownTimer: false,
      contactForm: false,
      faqBlock: false,
      imageGallery: false,
      testimonialBlock: false,
      mapBlock: false,
      seoControls: false,
      videoBackground: false,
      patternBackground: false,
      gaPixel: false,
      fbPixel: false,
      tiktokPixel: false,
      passwordProtection: false,
      utmBuilder: false,
      customDomain: false,
      removeBranding: false,
      pinnedLinks: false,
      linkAnimations: false,
      nsfwPerLink: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 9,
    maxLinks: -1,
    maxSocialIcons: -1,
    themes: "all",
    basicThemeIds: [],
    analytics: "30d",
    features: {
      customCss: true,
      scheduling: true,
      embeds: true,
      emailCollector: true,
      countdownTimer: true,
      contactForm: true,
      faqBlock: true,
      imageGallery: true,
      testimonialBlock: true,
      mapBlock: true,
      seoControls: true,
      videoBackground: true,
      patternBackground: true,
      gaPixel: false,
      fbPixel: false,
      tiktokPixel: false,
      passwordProtection: false,
      utmBuilder: true,
      customDomain: false,
      removeBranding: true,
      pinnedLinks: true,
      linkAnimations: true,
      nsfwPerLink: true,
    },
  },
  business: {
    id: "business",
    name: "Business",
    price: 29,
    maxLinks: -1,
    maxSocialIcons: -1,
    themes: "all",
    basicThemeIds: [],
    analytics: "90d",
    features: {
      customCss: true,
      scheduling: true,
      embeds: true,
      emailCollector: true,
      countdownTimer: true,
      contactForm: true,
      faqBlock: true,
      imageGallery: true,
      testimonialBlock: true,
      mapBlock: true,
      seoControls: true,
      videoBackground: true,
      patternBackground: true,
      gaPixel: true,
      fbPixel: true,
      tiktokPixel: true,
      passwordProtection: true,
      utmBuilder: true,
      customDomain: true,
      removeBranding: true,
      pinnedLinks: true,
      linkAnimations: true,
      nsfwPerLink: true,
    },
  },
};

export function getPlan(planId: string | undefined): PlanConfig {
  return PLANS[(planId as PlanId)] || PLANS.free;
}

export function canUseFeature(planId: string | undefined, feature: keyof PlanConfig["features"]): boolean {
  return getPlan(planId).features[feature];
}

export function isWithinLinkLimit(planId: string | undefined, currentCount: number): boolean {
  const plan = getPlan(planId);
  return plan.maxLinks === -1 || currentCount < plan.maxLinks;
}

export function isWithinSocialIconLimit(planId: string | undefined, currentCount: number): boolean {
  const plan = getPlan(planId);
  return plan.maxSocialIcons === -1 || currentCount < plan.maxSocialIcons;
}

export function isThemeAvailable(planId: string | undefined, themeId: string): boolean {
  const plan = getPlan(planId);
  if (plan.themes === "all") return true;
  return plan.basicThemeIds.includes(themeId);
}

export function getAnalyticsPeriods(planId: string | undefined): string[] {
  const plan = getPlan(planId);
  switch (plan.analytics) {
    case "90d": return ["7d", "30d", "90d"];
    case "30d": return ["7d", "30d"];
    default: return ["7d"];
  }
}

export function requiredPlanForFeature(feature: keyof PlanConfig["features"]): PlanId {
  if (PLANS.pro.features[feature]) return "pro";
  if (PLANS.business.features[feature]) return "business";
  return "business";
}

// Block types that require paid plans
export const BLOCK_TYPE_FEATURE_MAP: Record<string, keyof PlanConfig["features"]> = {
  "embed": "embeds",
  "email-collector": "emailCollector",
  "countdown": "countdownTimer",
  "contact-form": "contactForm",
  "faq": "faqBlock",
  "image-gallery": "imageGallery",
  "testimonial": "testimonialBlock",
  "map": "mapBlock",
};

// Admin usernames that always get business plan
export const ADMIN_USERNAMES = ["guy1985"];

export function isAdmin(username: string): boolean {
  return ADMIN_USERNAMES.includes(username);
}
