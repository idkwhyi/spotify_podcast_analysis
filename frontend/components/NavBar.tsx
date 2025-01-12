'use client'
import {useState} from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  // Button,
} from "@nextui-org/react";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36" className="bg-transparent">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};


const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} className="border-b border-b-borderColor bg-graphiteGray text-foreground">
      <NavbarContent className="w-fit bg-graphiteGray">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden bg-graphiteGray"
        />
        <NavbarBrand className="bg-graphiteGray">
          <AcmeLogo />
          <Link href="/" className="font-bold text-inherit bg-graphiteGray">ASPY</Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4 bg-graphiteGray" justify="center">

        <NavbarItem isActive className="bg-graphiteGray">
          <Link aria-current="page" className="bg-graphiteGray text-foreground" href="/podcast">
            Podcasts
          </Link>
        </NavbarItem>

        <NavbarItem isActive className="bg-graphiteGray">
          <Link aria-current="page" className="bg-graphiteGray text-foreground" href="/episode">
            Episodes
          </Link>
        </NavbarItem>
        
        <NavbarItem isActive className="bg-graphiteGray">
          <Link className="bg-graphiteGray text-foreground" href="/category">
            Categories
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* <NavbarContent justify="end">
        <Button className="bg-primary text-black px-5 py-2 rounded-md">Trending</Button>
      </NavbarContent> */}
      
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2 ? "primary" : index === menuItems.length - 1 ? "danger" : "foreground"
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default NavBar;
