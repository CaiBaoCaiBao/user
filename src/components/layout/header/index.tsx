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
    CommandSeparator,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SearchIcon, MapPin, Map, FileText, TrendingUp, Mountain, Clock, X, Trash2 } from "lucide-react";
import { useCurrentUser } from "@/store/userStore";
import SearchApi from "@/api/search";
import { toast } from "sonner";
import { getSearchHistory, addSearchHistory, removeSearchHistory, clearSearchHistory, getSearchHistoryKeywords } from "@/utils/search-history";

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
    const [suggestions, setSuggestions] = React.useState<any[]>([]);
    const [hotKeywords, setHotKeywords] = React.useState<string[]>([]);
    const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
    const [showHistory, setShowHistory] = React.useState(true);
    const router = useRouter();
    const abortControllerRef = React.useRef<AbortController | null>(null);
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // 加载热门搜索关键词
    const loadHotKeywords = React.useCallback(async () => {
        try {
            const response = await SearchApi.getHotKeywords(10);
            if (response.data?.success && response.data?.data) {
                setHotKeywords(response.data.data);
            }
        } catch (error) {
            console.error('加载热门搜索失败:', error);
            // 使用默认热门搜索词
            setHotKeywords(['北京', '上海', '西湖', '故宫', '长城', '三亚', '成都', '西安']);
        }
    }, []);

    // 每次打开搜索对话框时加载热门搜索
    React.useEffect(() => {
        if (open) {
            loadHotKeywords();
        }
    }, [open, loadHotKeywords]);

    // 加载搜索历史
    React.useEffect(() => {
        if (open) {
            setSearchHistory(getSearchHistoryKeywords());
            setShowHistory(true);
        }
    }, [open]);

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
            setSuggestions([]);
            setShowHistory(true);
            return;
        }

        setShowHistory(false);

        // 防抖延迟 300ms
        searchTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            abortControllerRef.current = new AbortController();

            try {
                // 并行请求搜索结果和搜索建议
                const [searchResponse, suggestionsResponse] = await Promise.all([
                    SearchApi.searchAll(value, 1, 5),
                    SearchApi.getSuggestions(value, 8)
                ]);

                if (searchResponse.data?.success && searchResponse.data?.data) {
                    setResults({
                        destinations: searchResponse.data.data.destinations || [],
                        travelNotes: searchResponse.data.data.travelNotes || [],
                        attractions: searchResponse.data.data.attractions || []
                    });

                    // 保存搜索记录
                    const resultCount = (searchResponse.data.data.destinations?.length || 0) +
                                     (searchResponse.data.data.travelNotes?.length || 0) +
                                     (searchResponse.data.data.attractions?.length || 0);
                    SearchApi.saveSearchLog({
                        keyword: value.trim(),
                        searchType: 'all',
                        resultCount: resultCount
                    }).catch(err => {
                        // 搜索记录保存失败不影响主流程
                        console.warn('保存搜索记录失败:', err);
                    });
                } else {
                    setResults({ destinations: [], travelNotes: [], attractions: [] });
                }

                if (suggestionsResponse.data?.success && suggestionsResponse.data?.data) {
                    setSuggestions(suggestionsResponse.data.data);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                // 如果是主动取消的请求，不处理错误
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }

                console.error('搜索失败:', error);
                setResults({ destinations: [], travelNotes: [], attractions: [] });
                setSuggestions([]);

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

    // 搜索历史点击处理
    const handleHistorySearch = React.useCallback((historyKeyword: string) => {
        setKeyword(historyKeyword);
        handleSearch(historyKeyword);
    }, [handleSearch]);

    // 搜索建议点击处理
    const handleSuggestionSearch = React.useCallback((suggestion: any) => {
        setKeyword(suggestion.keyword);
        handleSearch(suggestion.keyword);
    }, [handleSearch]);

    // 跳转到详情页
    const handleNavigate = (type: string, id: string) => {
        // 添加到搜索历史
        if (keyword.trim()) {
            addSearchHistory(keyword.trim());
        }

        setOpen(false);
        switch (type) {
            case 'destination':
                router.push(`/destinations/${id}`);
                break;
            case 'travel_note':
                router.push(`/travels/${id}`);
                break;
            case 'attraction':
                router.push(`/spots/${id}`);
                break;
        }
    };

    // 删除单条搜索历史
    const handleRemoveHistory = React.useCallback((e: React.MouseEvent, historyKeyword: string) => {
        e.stopPropagation();
        removeSearchHistory(historyKeyword);
        setSearchHistory(getSearchHistoryKeywords());
    }, []);

    // 清空搜索历史
    const handleClearHistory = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        clearSearchHistory();
        setSearchHistory([]);
    }, []);

    // 对话框关闭时清空数据
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // 清空搜索关键词和结果
            setKeyword('');
            setResults({ destinations: [], travelNotes: [], attractions: [] });
            setSuggestions([]);
            setLoading(false);
            setShowHistory(true);
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
                        ) : keyword.trim() !== '' && results.destinations.length === 0 && results.travelNotes.length === 0 && results.attractions.length === 0 && suggestions.length === 0 ? (
                            <CommandEmpty>
                                <div className="flex flex-col items-center gap-2 py-4">
                                    <SearchIcon className="h-8 w-8 text-muted-foreground" />
                                    <span>未找到相关结果</span>
                                    <span className="text-sm text-muted-foreground">试试其他关键词</span>
                                </div>
                            </CommandEmpty>
                        ) : (
                            <>
                                {/* 搜索建议 */}
                                {suggestions.length > 0 && (
                                    <>
                                        <CommandGroup heading="搜索建议">
                                            {suggestions.map((suggestion, index) => (
                                                <CommandItem
                                                    key={`suggestion-${index}`}
                                                    onSelect={() => handleSuggestionSearch(suggestion)}
                                                    className="cursor-pointer"
                                                >
                                                    <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <div className="flex flex-col flex-1">
                                                        <span className="font-medium">{suggestion.keyword}</span>
                                                        {suggestion.extra && (
                                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                                {suggestion.extra}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {suggestion.type === 'destination' && <MapPin className="h-3 w-3 text-muted-foreground" />}
                                                    {suggestion.type === 'attraction' && <Mountain className="h-3 w-3 text-muted-foreground" />}
                                                    {suggestion.type === 'travel_note' && <FileText className="h-3 w-3 text-muted-foreground" />}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                        <CommandSeparator />
                                    </>
                                )}

                                {/* 搜索结果 */}
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

                                {/* 搜索历史和热门搜索 */}
                                {!keyword && (
                                    <>
                                        {searchHistory.length > 0 && (
                                            <>
                                                <CommandGroup heading={
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>搜索历史</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                            onClick={handleClearHistory}
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            清空
                                                        </Button>
                                                    </div>
                                                }>
                                                    {searchHistory.map((historyKeyword) => (
                                                        <CommandItem
                                                            key={historyKeyword}
                                                            onSelect={() => handleHistorySearch(historyKeyword)}
                                                            className="cursor-pointer group"
                                                        >
                                                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            <span className="flex-1">{historyKeyword}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-muted"
                                                                onClick={(e) => handleRemoveHistory(e, historyKeyword)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                <CommandSeparator />
                                            </>
                                        )}

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
                                    </>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    )
}
