import chat0 from "./locales/en/chat.json";
import onboarding0 from "./locales/en/onboarding.json";
import workspace0 from "./locales/en/workspace.json";
import settings0 from "./locales/en/settings.json";
import common0 from "./locales/en/common.json";
import computer0 from "./locales/en/computer.json";
import automation0 from "./locales/en/automation.json";
import git0 from "./locales/en/git.json";

import chatAr from "./locales/ar/chat.json";
import onboardingAr from "./locales/ar/onboarding.json";
import workspaceAr from "./locales/ar/workspace.json";
import settingsAr from "./locales/ar/settings.json";
import commonAr from "./locales/ar/common.json";
import computerAr from "./locales/ar/computer.json";
import automationAr from "./locales/ar/automation.json";
import gitAr from "./locales/ar/git.json";

export const uiLocalizationResources = {
  en: {
    chat: chat0,
    onboarding: onboarding0,
    workspace: workspace0,
    settings: settings0,
    common: common0,
    computer: computer0,
    automation: automation0,
    git: git0,
  },
  ar: {
    chat: chatAr,
    onboarding: onboardingAr,
    workspace: workspaceAr,
    settings: settingsAr,
    common: commonAr,
    computer: computerAr,
    automation: automationAr,
    git: gitAr,
  },
} as const;
