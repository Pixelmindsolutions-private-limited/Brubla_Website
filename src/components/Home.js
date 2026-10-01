import Navbar from "./Navbar";
import HeroBanneer from "./Hero";
import CategorySection from "./Category";
import FlashBanner from "./FlashBanner";
import RecommendedProducts from "./RecommendedProducts";
import CollectionGrid from "./CollectionGrid";
import UpcomingAndRadar, { DesignsOnRadar, UpcomingSection } from "./UpcommingAndRadar";
import AdBanner from "./AdBanner";
import AllCollections from "./AllCollections";
import Footer from "./Footer";
import { BannerSection } from "../pages/WeddingBanner"
import Advertising from "../pages/Advertizing";
import { SAMPLE_PRODUCTS } from "../pages/Advertizing";
import QuoteSection from "../views/QuoteSection";
import OccasionBooking from "../pages/OccasionBooking";
import HomeExclussive from "../pages/HomeExclussive";

const Home = () => {
    return (
        <>
            <Navbar />
            <main className="pt-[40px] lg:pb-0">
                <HeroBanneer />
                <CategorySection />
                {/* <FlashBanner /> */}
                <AllCollections />
                <RecommendedProducts />
                <CollectionGrid />
                {/* <UpcomingSection /> */}
                <OccasionBooking />
                <HomeExclussive image="/images/exclusive.jpg" to="/exclusive" />
                {/* <AdBanner /> */}
                {/* <BannerSection /> */}
                {/* <DesignsOnRadar /> */}

                {/* <Advertising type="categories" title="Our categories" count={3} />
                <Advertising type="collections" title="Our collections" count={5} />
                <Advertising type="products" title="Best sellers" items={SAMPLE_PRODUCTS} count={7} /> */}
                <QuoteSection />
            </main>
            <Footer />

        </>
    );
}

export default Home;