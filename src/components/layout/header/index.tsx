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
import { SearchIcon, MapPin, Map, FileText, TrendingUp, Mountain } from "lucide-react";
import { useCurrentUser } from "@/store/userStore";
import SearchApi from "@/api/search";
import { toast } from "sonner";

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
        attractions: any[];
    }>({ destinations: [], travelNotes: [], attractions: [] });
    const router = useRouter();
    const abortControllerRef = React.useRef<AbortController | null>(null);
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // 热门搜索关键词
    const hotKeywords = ['北京', '上海', '西湖', '故宫', '长城', '三亚', '成都', '西安'];

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

    // 组件卸载时清理
    React.useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // 防抖搜索功能
    const handleSearch = React.useCallback(async (value: string) => {
        // 取消之前的请求
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // 清除之前的定时器
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setKeyword(value);

        if (!value.trim()) {
            setResults({ destinations: [], travelNotes: [], attractions: [] });
            return;
        }

        // 防抖延迟 300ms
        searchTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            abortControllerRef.current = new AbortController();

            try {
                const response = await SearchApi.searchAll(value, 1, 5);

                if (response.data?.success && response.data?.data) {
                    setResults({
                        destinations: response.data.data.destinations || [],
                        travelNotes: response.data.data.travelNotes || [],
                        attractions: response.data.data.attractions || []
                    });
                } else {
                    setResults({ destinations: [], travelNotes: [], attractions: [] });
                }
            } catch (error) {
                // 如果是主动取消的请求，不处理错误
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }

                console.error('搜索失败:', error);
                setResults({ destinations: [], travelNotes: [], attractions: [] });

                // 用户友好的错误提示
                if (error instanceof Error) {
                    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
                        toast.error('搜索超时，请重试');
                    } else if (error.message.includes('network') || error.message.includes('Network')) {
                        toast.error('网络连接失败，请检查网络');
                    } else {
                        toast.error('搜索失败，请稍后重试');
                    }
                }
            } finally {
                setLoading(false);
                abortControllerRef.current = null;
            }
        }, 300);
    }, []);

    // 热门搜索点击处理
    const handleHotSearch = React.useCallback((hotKeyword: string) => {
        setKeyword(hotKeyword);
        handleSearch(hotKeyword);
    }, [handleSearch]);

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
            case 'attraction':
                router.push(`/attractions/${id}`);
                break;
        }
    };

    // 对话框关闭时清空数据
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // 清空搜索关键词和结果
            setKeyword('');
            setResults({ destinations: [], travelNotes: [], attractions: [] });
            setLoading(false);
            // 取消正在进行的搜索请求
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = null;
            }
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
            <CommandDialog open={open} onOpenChange={handleOpenChange}>
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="搜索目的地、景点、游记..."
                        value={keyword}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        {loading ? (
                            <CommandEmpty>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    <span>搜索中...</span>
                                </div>
                            </CommandEmpty>
                        ) : keyword.trim() !== '' && results.destinations.length === 0 && results.travelNotes.length === 0 && results.attractions.length === 0 ? (
                            <CommandEmpty>
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <SearchIcon className="h-8 w-8 text-muted-foreground" />
                                    <span>未找到相关结果</span>
                                    <span className="text-sm text-muted-foreground">试试其他关键词</span>
                                </div>
                            </CommandEmpty>
                        ) : (
                            <>
                                {results.destinations.length > 0 && (
                                    <CommandGroup heading={`目的地 (${results.destinations.length})`}>
                                        {results.destinations.map((item) => (
                                            <CommandItem
                                                key={item.destinationId}
                                                onSelect={() => handleNavigate('destination', item.destinationId)}
                                                className="cursor-pointer"
                                            >
                                                <MapPin className="mr-2 h-4 w-4 text-primary" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.name}</span>
                                                    {item.city && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.province && `${item.province} · `}{item.city}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                                {results.travelNotes.length > 0 && (
                                    <CommandGroup heading={`游记 (${results.travelNotes.length})`}>
                                        {results.travelNotes.map((item) => (
                                            <CommandItem
                                                key={item.noteId}
                                                onSelect={() => handleNavigate('travel_note', item.noteId)}
                                                className="cursor-pointer"
                                            >
                                                <FileText className="mr-2 h-4 w-4 text-primary" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.title}</span>
                                                    {item.summary && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {item.summary}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                                {results.attractions.length > 0 && (
                                    <CommandGroup heading={`景点 (${results.attractions.length})`}>
                                        {results.attractions.map((item) => (
                                            <CommandItem
                                                key={item.aid}
                                                onSelect={() => handleNavigate('attraction', item.aid)}
                                                className="cursor-pointer"
                                            >
                                                <Mountain className="mr-2 h-4 w-4 text-primary" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.name}</span>
                                                    {item.address && (
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {item.address}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                                {!keyword && (
                                    <CommandGroup heading={
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>热门搜索</span>
                                        </div>
                                    }>
                                        {hotKeywords.map((hotKeyword) => (
                                            <CommandItem
                                                key={hotKeyword}
                                                onSelect={() => handleHotSearch(hotKeyword)}
                                                className="cursor-pointer"
                                            >
                                                <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <span>{hotKeyword}</span>
                                            </CommandItem>
                                        ))}
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
