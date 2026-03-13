'use client'
import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
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
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SearchIcon, MapPin, Map, FileText } from "lucide-react";
import { useCurrentUser } from "@/store/userStore";
import SearchApi from "@/api/search";

export default function Header() {
    const currentUser = useCurrentUser();
    const router = useRouter();

    return (
        <header>
            <Card className="rounded-none border-b">
                <CardContent className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-8">
                        <div className="text-2xl font-bold text-primary cursor-pointer" onClick={() => router.push('/')}>
                            Trip
                        </div>
                        <AppNav />
                    </div>
                    <div className="flex items-center gap-4">
                        <CommandSearch />
                        {currentUser ? (
                            <NavUser
                                nickName={currentUser.nickName || currentUser.userName}
                                userName={currentUser.userName}
                                avatar={currentUser.avatar || ''}
                            />
                        ) : (
                            <Button onClick={() => router.push('/login')}>登录</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </header>
    )
}

function CommandSearch() {
    const [open, setOpen] = React.useState(false);
    const [keyword, setKeyword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState<{
        destinations: any[];
        travelNotes: any[];
    }>({ destinations: [], travelNotes: [] });
    const router = useRouter();

    // 键盘快捷键监听
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 搜索功能
    const handleSearch = async (value: string) => {
        setKeyword(value);
        if (!value.trim()) {
            setResults({ destinations: [], travelNotes: [] });
            return;
        }

        setLoading(true);
        try {
            const response = await SearchApi.searchAll(value, 1, 5);
            console.log('搜索结果:', response.data);
            if (response.data) {
                console.log('搜索结果:', response.data);
                setResults({
                    destinations: response.data.data.destinations || [],
                    travelNotes: response.data.data.travelNotes || []
                });
            }
        } catch (error) {
            console.error('搜索失败:', error);
            setResults({ destinations: [], travelNotes: [] });
        } finally {
            setLoading(false);
        }
    };

    // 跳转到详情页
    const handleNavigate = (type: string, id: string) => {
        setOpen(false);
        switch (type) {
            case 'destination':
                router.push(`/destinations/${id}`);
                break;
            case 'travel_note':
                router.push(`/travels/${id}`);
                break;
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="w-64 justify-start text-muted-foreground"
            >
                <SearchIcon className="mr-2 h-4 w-4" />
                搜索目的地、景点、游记...
                <KbdGroup className="ml-auto">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                </KbdGroup>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput
                        placeholder="搜索目的地、景点、游记..."
                        value={keyword}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <CommandEmpty>搜索中...</CommandEmpty>
                        ) : keyword && results.destinations.length === 0 && results.travelNotes.length === 0 ? (
                            <CommandEmpty>未找到相关结果</CommandEmpty>
                        ) : (
                            <>
                                {results.destinations.length > 0 && (
                                    <CommandGroup heading="目的地">
                                        {results.destinations.map((item) => (
                                            <CommandItem
                                                key={item.destinationId}
                                                onSelect={() => handleNavigate('destination', item.destinationId)}
                                            >
                                                <MapPin className="mr-2 h-4 w-4" />
                                                <span>{item.name}</span>
                                                {item.city && <span className="ml-2 text-sm text-muted-foreground">{item.city}</span>}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                                {results.travelNotes.length > 0 && (
                                    <CommandGroup heading="游记">
                                        {results.travelNotes.map((item) => (
                                            <CommandItem
                                                key={item.noteId}
                                                onSelect={() => handleNavigate('travel_note', item.noteId)}
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                <span>{item.title}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                                {!keyword && (
                                    <CommandGroup heading="热门搜索">
                                        <CommandItem onSelect={() => handleSearch('北京')}>北京</CommandItem>
                                        <CommandItem onSelect={() => handleSearch('上海')}>上海</CommandItem>
                                        <CommandItem onSelect={() => handleSearch('西湖')}>西湖</CommandItem>
                                        <CommandItem onSelect={() => handleSearch('故宫')}>故宫</CommandItem>
                                    </CommandGroup>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}
