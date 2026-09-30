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

const Home = () => {
    return (
        <>
            <Navbar />
            <main className="pt-[40px] lg:pb-0">
                <HeroBanneer />
                <CategorySection />
                <FlashBanner />
                <RecommendedProducts />
                <CollectionGrid />
                <UpcomingSection />
                <BannerSection />
                {/* <AdBanner /> */}
                {/* <DesignsOnRadar /> */}
                <AllCollections />
            </main>
            <Footer />

        </>
    );
}

export default Home;