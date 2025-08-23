import NavigationItem from "./NavigationItem";
import { NavigationItem as NavItemType } from "@/types/homepage";

interface NavigationMenuProps {
  items: NavItemType[];
}

export default function NavigationMenu({ items }: NavigationMenuProps) {
  return (
    <nav className="px-3">
      {items.map((item, index) => (
        <NavigationItem key={index} {...item} />
      ))}
    </nav>
  );
}
