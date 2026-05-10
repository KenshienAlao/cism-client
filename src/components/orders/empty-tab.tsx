import { ShoppingBag } from "lucide-react";
import { Emptystatetab } from "../emptystatetab";

export default function Emptytab({ activeTab }: { activeTab: string }) {
    return (
        <Emptystatetab
            title={`No ${activeTab.replace('_', ' ').toLowerCase()} orders`}
            description="This tab is empty for now. Check back later or explore other tabs!"
            icon={ShoppingBag}
            className="py-20 md:py-32"
        />
    );
}