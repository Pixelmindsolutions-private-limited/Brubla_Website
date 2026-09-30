import { SearchIcon, ArrowLeft, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SearchResultsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [searchData, setSearchData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(query);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        colors: [],
        sizes: [],
        sortBy: 'newest'
    });
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load recent searches:', e);
            }
        }
    }, []);

    // Save recent search
    const saveRecentSearch = (searchTerm) => {
        if (!searchTerm.trim()) return;
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    useEffect(() => {
        if (query) {
            fetchSearchResults(query);
            setSearchInput(query);
            saveRecentSearch(query);
        }
    }, [query]);

    const fetchSearchResults = async (searchQuery) => {
        setLoading(true);
        try {
            const response = await fetch(`http://31.97.228.17:4077/api/users/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.success) {
                setSearchData(data);
                // Fix image URLs for products
                const fixedProducts = (data.products || []).map(product => ({
                    ...product,
                    mainImage: product.mainImage?.replace('localhost:4077', '31.97.228.17:4077') || '/placeholder-image.jpg'
                }));
                setProducts(fixedProducts);
            } else {
                setProducts([]);
            }

            if (searchQuery.length > 0) {
                fetchSuggestions(searchQuery);
            }
        } catch (error) {
            console.error('Search error:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async (searchQuery) => {
        try {
            const response = await fetch(`http://31.97.228.17:4077/api/users/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setSuggestions(data.data || []);
        } catch (error) {
            console.error('Suggestions error:', error);
            setSuggestions([]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput.trim() });
            setShowSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        if (value.length > 0) {
            fetchSuggestions(value);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchInput(suggestion);
        setSearchParams({ q: suggestion });
        setShowSuggestions(false);
        saveRecentSearch(suggestion);
    };

    const handleRecentClick = (term) => {
        setSearchInput(term);
        setSearchParams({ q: term });
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setSearchInput('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const toggleFilter = (type, value) => {
        setSelectedFilters(prev => {
            if (type === 'sortBy') {
                return { ...prev, sortBy: value };
            }

            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];

            return { ...prev, [type]: updated };
        });
    };

    const clearAllFilters = () => {
        setSelectedFilters({
            colors: [],
            sizes: [],
            sortBy: 'newest'
        });
    };

    // Filter products based on selected filters
    const filteredProducts = products.filter(product => {
        // Color filter
        if (selectedFilters.colors.length > 0) {
            const hasColor = product.colors?.some(color =>
                selectedFilters.colors.includes(color)
            );
            if (!hasColor) return false;
        }

        // Size filter
        if (selectedFilters.sizes.length > 0) {
            const hasSize = product.sizes?.some(size =>
                selectedFilters.sizes.includes(size)
            );
            if (!hasSize) return false;
        }

        return true;
    }).sort((a, b) => {
        if (selectedFilters.sortBy === 'priceLow') {
            return a.price - b.price;
        } else if (selectedFilters.sortBy === 'priceHigh') {
            return b.price - a.price;
        } else if (selectedFilters.sortBy === 'discount') {
            return (b.discount || 0) - (a.discount || 0);
        }
        // newest first
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const availableFilters = searchData?.filters?.available || {};
    const searchInfo = searchData?.search || {};

    // Popular searches
    const popularSearches = [
        "Jeans", "Jackets", "T-Shirts", "Winter Collection",
        "Summer", "Premium", "Casual", "Formal"
    ];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-[#f9f5f0]">
                {/* Search Bar Header */}
                <div className="top-0 z-50 bg-[#f9f5f0] border-b border-[rgba(111,78,55,0.1)] pt-20 pb-4 px-4 md:px-8 lg:px-12">
                    <div className="max-w-7xl mx-auto">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex-shrink-0 p-2 rounded-full transition-colors hover:bg-[#ece5de]"
                                    aria-label="Go back"
                                >
                                    <ArrowLeft className="w-5 h-5 text-[#1f1f1f]" />
                                </button>
                                <div className="flex-1 relative">
                                    <div className="flex items-center gap-2.5 rounded-full px-4 py-2.5 bg-white border border-[rgba(111,78,55,0.2)] focus-within:border-black focus-within:shadow-lg transition-all">
                                        <SearchIcon className="w-4 h-4 flex-shrink-0 text-[#7a6a5a]" />
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchInput}
                                            onChange={handleInputChange}
                                            onFocus={() => searchInput.length > 0 && setShowSuggestions(true)}
                                            placeholder="Search products, brands, categories..."
                                            className="bg-transparent text-sm outline-none flex-1 min-w-0 placeholder:text-[#7a6a5a]"
                                            style={{ color: "#000", caretColor: "#000" }}
                                        />
                                        {searchInput && (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="flex-shrink-0 p-1 rounded-full hover:bg-[#f9f5f0] transition-colors"
                                            >
                                                <X className="w-4 h-4 text-[#7a6a5a]" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[rgba(111,78,55,0.1)] overflow-hidden z-50">
                                            <div className="py-2">
                                                {suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f9f5f0] transition-colors text-left"
                                                    >
                                                        <SearchIcon className="w-4 h-4 text-[#7a6a5a]" />
                                                        <span className="text-sm text-[#1f1f1f]">{suggestion}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-[#333] transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="px-4 md:px-8 lg:px-12 py-8">
                    <div className="max-w-7xl mx-auto">
                        {/* No Query - Show Popular and Recent Searches */}
                        {!query && (
                            <>
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-sm font-semibold text-[#1f1f1f]">Recent Searches</h2>
                                            <button
                                                onClick={clearRecentSearches}
                                                className="text-xs text-[#7a6a5a] hover:text-[#1f1f1f] transition"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentSearches.map((term) => (
                                                <button
                                                    key={term}
                                                    onClick={() => handleRecentClick(term)}
                                                    className="px-4 py-2 rounded-full text-sm bg-white border border-[rgba(111,78,55,0.15)] text-[#1f1f1f] hover:bg-[#ece5de] transition-all hover:scale-105"
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Popular Searches */}
                                <div className="mb-8">
                                    <h2 className="text-sm font-semibold text-[#1f1f1f] mb-3">Popular Searches</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {popularSearches.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => {
                                                    setSearchInput(term);
                                                    setSearchParams({ q: term });
                                                }}
                                                className="px-4 py-2 rounded-full text-sm bg-white border border-[rgba(111,78,55,0.15)] text-[#1f1f1f] hover:bg-[#ece5de] transition-all hover:scale-105"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Search Results Header */}
                        {query && (
                            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f1f]">
                                        Search Results
                                    </h1>
                                    <p className="text-[#7a6a5a] mt-2">
                                        {loading ? 'Searching...' :
                                            `${searchInfo.totalResults || filteredProducts.length} result${(searchInfo.totalResults || filteredProducts.length) !== 1 ? 's' : ''} for "${query}"`}
                                    </p>
                                </div>

                                {/* Filter Toggle Button */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[rgba(111,78,55,0.2)] text-sm font-semibold hover:bg-[#ece5de] transition"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        )}

                        {/* Filters Panel */}
                        {query && showFilters && (
                            <div className="mb-8 p-4 bg-white rounded-xl border border-[rgba(111,78,55,0.1)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[#1f1f1f]">Filter Products</h3>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-xs text-[#7a6a5a] hover:text-[#1f1f1f] transition"
                                    >
                                        Clear all
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Color Filter */}
                                    {availableFilters.colors && availableFilters.colors.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-[#7a6a5a] uppercase tracking-wider mb-2">Colors</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {availableFilters.colors.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => toggleFilter('colors', color)}
                                                        className={`px-3 py-1.5 rounded-full text-xs transition ${selectedFilters.colors.includes(color)
                                                                ? 'bg-black text-white'
                                                                : 'bg-[#f9f5f0] text-[#1f1f1f] hover:bg-[#ece5de]'
                                                            }`}
                                                    >
                                                        {color}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Size Filter */}
                                    {availableFilters.sizes && availableFilters.sizes.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-[#7a6a5a] uppercase tracking-wider mb-2">Sizes</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {availableFilters.sizes.map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => toggleFilter('sizes', size)}
                                                        className={`px-3 py-1.5 rounded-full text-xs transition ${selectedFilters.sizes.includes(size)
                                                                ? 'bg-black text-white'
                                                                : 'bg-[#f9f5f0] text-[#1f1f1f] hover:bg-[#ece5de]'
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sort By */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-[#7a6a5a] uppercase tracking-wider mb-2">Sort By</h4>
                                        <select
                                            value={selectedFilters.sortBy}
                                            onChange={(e) => toggleFilter('sortBy', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-[#f9f5f0] border border-[rgba(111,78,55,0.15)] text-sm outline-none focus:border-black"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="priceLow">Price: Low to High</option>
                                            <option value="priceHigh">Price: High to Low</option>
                                            <option value="discount">Discount: High to Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Results Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-gray-200 rounded-lg h-64 mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className="cursor-pointer group"
                                        >
                                            <div className="overflow-hidden rounded-lg mb-3 bg-white relative">
                                                {product.discount > 0 && (
                                                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                        {product.discount}% OFF
                                                    </div>
                                                )}
                                                <img
                                                    src={product.mainImage}
                                                    alt={product.name}
                                                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.target.src = 'https://placehold.co/600x800/e5e7eb/64748b?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            <h3 className="font-semibold text-[#1f1f1f] mb-1 line-clamp-2">{product.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[#1f1f1f] font-semibold">
                                                    ₹{product.price}
                                                </p>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <>
                                                        <p className="text-[#7a6a5a] text-sm line-through">
                                                            ₹{product.originalPrice}
                                                        </p>
                                                        <span className="text-green-600 text-xs font-semibold">
                                                            {product.discount}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {product.category && (
                                                <p className="text-xs text-[#7a6a5a] mt-1">
                                                    {product.category.name}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {searchInfo.totalResults > 20 && filteredProducts.length >= 20 && (
                                    <div className="text-center mt-12">
                                        <button className="px-8 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-[#333] transition-colors">
                                            Load More
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <SearchIcon className="w-16 h-16 mx-auto text-[#7a6a5a] opacity-20 mb-4" />
                                <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">
                                    No results found
                                </h2>
                                <p className="text-[#7a6a5a] max-w-md mx-auto">
                                    We couldn't find any products matching "{query}".
                                    Try checking your spelling or using different keywords.
                                </p>
                                <div className="mt-8">
                                    <h3 className="text-sm font-semibold text-[#1f1f1f] mb-3">Try these popular searches:</h3>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {popularSearches.slice(0, 4).map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => {
                                                    setSearchInput(term);
                                                    setSearchParams({ q: term });
                                                }}
                                                className="px-4 py-2 rounded-full text-sm bg-white border border-[rgba(111,78,55,0.15)] text-[#1f1f1f] hover:bg-[#ece5de] transition-all"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="mt-8 px-6 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-[#333] transition"
                                >
                                    Browse All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SearchResultsPage;