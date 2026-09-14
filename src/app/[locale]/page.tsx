import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import SearchBox from "@/components/SearchBox";
import WelcomeGate from "@/components/WelcomeGate";
import SnowEffect from "@/components/SnowEffect";
import PanelGlow from "@/components/PanelGlow";
import SiteFooter from "@/components/SiteFooter";
import BannerSlider from "@/components/BannerSlider";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import {
  getBannerSlides,
  getCategories,
  getProducts,
  getReviews,
  getSiteSettings,
  getTickerItems,
  recordVisit,
} from "@/lib/menu-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, products, settings, tickerItems, bannerSlides, reviews] =
    await Promise.all([
      getCategories(),
      getProducts(),
      getSiteSettings(),
      getTickerItems(),
      getBannerSlides(),
      getReviews(),
      recordVisit(),
    ]);

  if (settings.maintenance) {
    return <MaintenanceScreen logoUrl={settings.logoUrl} />;
  }

  const announcement =
    settings.announcementEnabled &&
    (settings.announcementTitle || settings.announcementMessage)
      ? {
          title: settings.announcementTitle,
          message: settings.announcementMessage,
          image: settings.announcementImage,
        }
      : null;

  return (
    <WelcomeGate announcement={announcement}>
    <div className="doodle-bg flex min-h-screen flex-col">
      {settings.menuMode === "snow" && <SnowEffect />}
      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        <Header
          logoUrl={settings.logoUrl}
          instagramUrl={settings.socialInstagramUrl}
          tiktokUrl={settings.socialTiktokUrl}
          mapsUrl={settings.socialMapsUrl}
        />
      </div>

      <div className="mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-4xl">
        <Ticker items={tickerItems.map((t) => t.text)} />

        <main className="flex-1 px-5 pt-4">
          <BannerSlider slides={bannerSlides} />

          <ReviewsMarquee reviews={reviews} />

          <div className="relative overflow-hidden rounded-[28px] bg-white p-4 shadow-panel sm:p-16">
            <PanelGlow />
            <div className="relative z-[1]">
              <SearchBox categories={categories} products={products} />
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
    </WelcomeGate>
  );
}
