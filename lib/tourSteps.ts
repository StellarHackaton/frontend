import type { TourStep } from "@/components/ui/Tour";

export const MOBILE_TOUR_KEY = "lunas_tour_mobile_v1";
export const WEB_TOUR_KEY = "lunas_tour_web_v1";

export const MOBILE_TOUR_STEPS: TourStep[] = [
  { target: "mobile-nav-account", titleKey: "tour.mobileAccount.title", bodyKey: "tour.mobileAccount.body" },
  { target: "mobile-nav-notif", titleKey: "tour.mobileNotif.title", bodyKey: "tour.mobileNotif.body" },
  { target: "mobile-balance", titleKey: "tour.mobileBalance.title", bodyKey: "tour.mobileBalance.body" },
  { target: "mobile-quick-actions", titleKey: "tour.mobileActions.title", bodyKey: "tour.mobileActions.body" },
  { target: "mobile-tabbar", titleKey: "tour.mobileNav.title", bodyKey: "tour.mobileNav.body" },
];

export const WEB_TOUR_STEPS: TourStep[] = [
  { target: "web-sidebar-nav", titleKey: "tour.webNav.title", bodyKey: "tour.webNav.body" },
  { target: "web-new-product", titleKey: "tour.webNewProduct.title", bodyKey: "tour.webNewProduct.body" },
  { target: "web-balance", titleKey: "tour.webBalance.title", bodyKey: "tour.webBalance.body" },
  { target: "web-orders-table", titleKey: "tour.webOrders.title", bodyKey: "tour.webOrders.body" },
  { target: "web-account-menu", titleKey: "tour.webAccount.title", bodyKey: "tour.webAccount.body" },
];
