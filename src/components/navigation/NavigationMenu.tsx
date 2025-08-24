import NavigationItem from "./NavigationItem";
import { NavigationItem as NavItemType } from "@/types/homepage";

interface NavigationMenuProps {
  items: NavItemType[];
}

export default function NavigationMenu({ items }: NavigationMenuProps) {
  return (
    <nav className="pl-3">
      {items.map((item, index) => (
        <NavigationItem key={index} {...item} />
      ))}
    </nav>
  );
}
