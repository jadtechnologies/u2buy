"use client";
import { PackageIcon, PlusIcon, Search, ShoppingCart, Menu, X, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, SignInButton } from "@clerk/nextjs";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Navbar = () => {
  const { user } = useUser();
  const { openSignIn, signOut } = useClerk();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { total: cartCount, isPlus } = useSelector((state) => state.cart);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-1 h-[60px]  transition-all">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image src={assets.logo} alt="logo" className="h-10 w-auto object-contain" />
            {isPlus && <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
              plus
            </p>}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/">About</Link>
            <Link href="/category">Category</Link>
            <Link href="/">Contact</Link>

            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600"
            >
              <ShoppingCart size={18} />
              Cart
              <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                {cartCount}
              </button>
            </Link>

            {!user ? (
              <SignInButton>
                <button
                  className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full cursor-pointer"
                >
                  Login
                </button>
              </SignInButton>
            ) : (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    labelIcon={<PackageIcon size={16} />}
                    label="My Orders"
                    onClick={() => router.push("/orders")}
                  />
                  {user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() ===
                    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim() && (
                      <UserButton.Action
                        labelIcon={<PackageIcon size={16} />}
                        label="Admin Dashboard"
                        onClick={() => router.push("/admin")}
                      />
                    )}
                  <UserButton.Action
                    labelIcon={<PlusIcon size={16} />}
                    label="Switch Account"
                    onClick={() => signOut()}
                  />
                </UserButton.MenuItems>
              </UserButton>
            )}
          </div>

          {/* Mobile User Button  */}
          <div className="sm:hidden flex items-center gap-3">
            {/* Mobile Cart Icon */}
            <Link
              href="/cart"
              className="relative flex items-center text-slate-600 p-1"
            >
              <ShoppingCart size={20} />
              <button className="absolute -top-1 -right-1 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">
                {cartCount}
              </button>
            </Link>

            {user ? (
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    labelIcon={<ShoppingCart size={16} />}
                    label="Cart"
                    onClick={() => router.push("/cart")}
                  />
                  <UserButton.Action
                    labelIcon={<PackageIcon size={16} />}
                    label="My Orders"
                    onClick={() => router.push("/orders")}
                  />
                  {user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() ===
                    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase().trim() && (
                      <UserButton.Action
                        labelIcon={<PackageIcon size={16} />}
                        label="Admin Dashboard"
                        onClick={() => router.push("/admin")}
                      />
                    )}
                  <UserButton.Action
                    labelIcon={<PlusIcon size={16} />}
                    label="Switch Account"
                    onClick={() => signOut()}
                  />
                </UserButton.MenuItems>
              </UserButton>
            ) : (
              <SignInButton>
                <button
                  className="text-slate-600 p-1 transition-colors hover:text-indigo-500 cursor-pointer"
                >
                  <UserIcon size={20} />
                </button>
              </SignInButton>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 p-1 transition-colors hover:text-indigo-500"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-[calc(100%+1px)] left-0 w-full bg-white flex flex-col gap-4 px-6 py-4 text-slate-600 z-50 shadow-md">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          <Link href="/category" onClick={() => setIsMobileMenuOpen(false)}>Category</Link>
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
        </div>
      )}
      
      <hr className="border-gray-300" />
    </nav>
  );
};

export default Navbar;
