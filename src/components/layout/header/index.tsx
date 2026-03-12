'use client'
import * as React from "react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import AppNav from "@/components/app-nav";
import NavUser from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SearchIcon } from "lucide-react";

export default function Header() {
    return (<>
        <header>
            <Card className="rounded-none">
                <CardContent className="flex items-center">
                    <div>Trip</div>
                    <AppNav />
                    <CommandSearch />
                    <NavUser userName="刘俊涛" avatar="" nickName="asfhqajf" />
                </CardContent>
            </Card>
        </header>
    </>)
}

function CommandSearch() {
    const [open, setOpen] = React.useState(false);
    return (<>
        <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
            <SearchIcon />
            Search...
            <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
            </KbdGroup>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem>Calendar</CommandItem>
                        <CommandItem>Search Emoji</CommandItem>
                        <CommandItem>Calculator</CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    </>)
}

export function KbdInputGroup() {
    return (
        <div className="flex w-full max-w-xs flex-col gap-6">
            <InputGroup>
                <InputGroupInput placeholder="Search..." />
                <InputGroupAddon>
                    <SearchIcon />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                </InputGroupAddon>
            </InputGroup>
        </div>
    )
}
