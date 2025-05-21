import Link from "next/link";

const MainNavigation = () => {
  return (
    <nav className="flex justify-between items-center pb-4">
      <img className="w-16" src="./logo.png" alt="logo" />
      <ul className="flex gap-15 text-2xl text-white ">
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/usage">Usage</Link>
        </li>
        <li>
          <Link className="text-orange-500" href="/login">
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MainNavigation;
