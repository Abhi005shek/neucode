import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { SignInButton } from "@clerk/nextjs";
import { ShieldAlertIcon } from "lucide-react";

export default function UnauthenticatedView() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-lg bg-muted">
        <Item variant={"outline"}>
          <ItemMedia variant={"icon"}>
            <ShieldAlertIcon color="white" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-white">Unauthorized Access</ItemTitle>
            <ItemDescription>
              You are not authorized to view this content. Please sign in to
              access the application.
            </ItemDescription>
          </ItemContent>
          <ItemActions className="text-white">
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>

          </ItemActions>
        </Item>
      </div>
    </div>
  );
}
