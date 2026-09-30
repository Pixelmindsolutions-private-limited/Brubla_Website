import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import { Route, Routes, Navigate } from 'react-router-dom';
import ExclusivePage from './components/Exclusive';
import ExclusiveProductsPage from './components/ExclusiveProducts';
import SingleExclusiveProduct from './components/SingleExclusiveProduct';
import ProfilePage from './components/ProfilePage';
import ScrollToTop from './views/ScrollToTop';
import CategoriesGrid from './components/Categories';
import CategoryProductsPage from './pages/SubCategoryProductsPage';
import JoinUs from './pages/JoinUs';
import ProductDetails from './pages/ProductDetails';
import AllProducts from './pages/AllProducts';
import CartPage from './pages/CartPage';
import PersonalDetails from './pages/PersonalDetails';
import MyOrders from './pages/MyOrders';
import UserAddresses from './pages/UserAddresses';
import UserNotifications from './pages/UserNotifications';
import Collections from './pages/Collections';
import SingleCollectionProducts from './pages/SingleCollectionProducts';
import { WeddingPlannerPage } from './pages/WeddingPlanner';
import BrublaLogin from './components/Login';
import SubCategoriesGrid from './components/SubCategoryGrid';
import SubCategoryProductsPage from './pages/SubCategoryProductsPage';
import NotFoundPage from './views/NotFoundPage';
import WishlistPage from './pages/UserWishlist';
import SearchResultsPage from './pages/SearchPage';
import UserWallet from './pages/UserWallet';
import AllExclusiveProductsPage from './components/AllExclusiveProducts';

/* =========================
   PRIVATE ROUTE COMPONENT
========================= */

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("authToken");

  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<BrublaLogin />} />

        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/exclusive" element={<PrivateRoute><ExclusivePage /></PrivateRoute>} />
        <Route path="/exclusiveproducts" element={<PrivateRoute><ExclusiveProductsPage /></PrivateRoute>} />
        <Route path="/all-exclusiveproducts" element={<PrivateRoute><AllExclusiveProductsPage /></PrivateRoute>} />
        <Route path="/exclusiveproducts/:id" element={<PrivateRoute><SingleExclusiveProduct /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/category" element={<PrivateRoute><CategoriesGrid /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><AllProducts /></PrivateRoute>} />
        <Route path="/category/:categoryId" element={<PrivateRoute><SubCategoriesGrid /></PrivateRoute>} />
        <Route path="/category/subcategory/:subcategoryId" element={<PrivateRoute><SubCategoryProductsPage /></PrivateRoute>} />
        <Route path="/product/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
        <Route path="/joinUs" element={<PrivateRoute><JoinUs /></PrivateRoute>} />
        <Route path="/mycart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/profile/wallet" element={<PrivateRoute><UserWallet /></PrivateRoute>} />
        <Route path="/profile/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
        <Route path="/profile/saved-addresses" element={<PrivateRoute><UserAddresses /></PrivateRoute>} />
        <Route path="/profile/wishlists" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
        <Route path="/profile/notifications" element={<PrivateRoute><UserNotifications /></PrivateRoute>} />
        <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
        <Route path="/collections/:id" element={<PrivateRoute><SingleCollectionProducts /></PrivateRoute>} />
        <Route path="/wedding" element={<PrivateRoute><WeddingPlannerPage /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchResultsPage /></PrivateRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;