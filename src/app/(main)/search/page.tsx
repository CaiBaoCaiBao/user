'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import Destinations from '@/components/destinations'
import Spots from '@/components/spots'
import Travels from '@/components/travels'

export default function SearchPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState('destinations')
    const [searchKeyword, setSearchKeyword] = useState('')

    // 从URL参数获取初始搜索词和标签页
    useEffect(() => {
        const keyword = searchParams.get('q')
        const tab = searchParams.get('tab')
        if (keyword) setSearchKeyword(keyword)
        if (tab) setActiveTab(tab)
    }, [searchParams])

    const handleSearch = () => {
        if (!searchKeyword.trim()) return
        // 更新URL参数，触发各个组件重新搜索
        const params = new URLSearchParams()
        params.set('q', searchKeyword)
        params.set('tab', activeTab)
        router.push(`/search?${params.toString()}`)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 全局搜索栏 */}
            <div className="mb-8">
                <div className="flex gap-2 max-w-2xl mx-auto">
                    <Input
                        placeholder="搜索目的地、景点、游记..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                        <Search className="w-4 h-4 mr-2" />
                        搜索
                    </Button>
                </div>
            </div>

            {/* 搜索结果标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                    <TabsTrigger value="destinations">目的地</TabsTrigger>
                    <TabsTrigger value="spots">景点</TabsTrigger>
                    <TabsTrigger value="travels">游记</TabsTrigger>
                </TabsList>

                <TabsContent value="destinations" className="mt-6">
                    <Destinations initialKeyword={searchKeyword} />
                </TabsContent>

                <TabsContent value="spots" className="mt-6">
                    <Spots initialKeyword={searchKeyword} />
                </TabsContent>

                <TabsContent value="travels" className="mt-6">
                    <Travels initialKeyword={searchKeyword} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
