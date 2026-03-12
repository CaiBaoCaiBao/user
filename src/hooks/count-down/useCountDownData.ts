import * as React from 'react';

export const useCountDownData = (initialCount: number = 0) => {
    const [countDown, setCountDown] = React.useState(initialCount)
    const [isCounting, setIsCounting] = React.useState(false)
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)

    // 清理定时器
    const clearTimer = React.useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    // 开始倒计时
    const startCountDown = React.useCallback((count: number) => {
        // 先清除之前的定时器
        clearTimer()
        
        if (count <= 0) {
            setCountDown(0)
            setIsCounting(false)
            return
        }

        setCountDown(count)
        setIsCounting(true)
    }, [clearTimer])

    // 停止/暂停倒计时
    const stopCountDown = React.useCallback(() => {
        clearTimer()
        setIsCounting(false)
    }, [clearTimer])

    // 重置倒计时
    const resetCountDown = React.useCallback(() => {
        clearTimer()
        setCountDown(0)
        setIsCounting(false)
    }, [clearTimer])

    // 组件卸载时清理
    React.useEffect(() => {
        return () => {
            clearTimer()
        }
    }, [clearTimer])

    // 倒计时逻辑
    React.useEffect(() => {
        if (isCounting && countDown > 0) {
            timerRef.current = setTimeout(() => {
                setCountDown(prev => prev - 1)
            }, 1000)
        } else if (isCounting && countDown === 0) {
            // 倒计时结束
            setIsCounting(false)
        }
    }, [isCounting, countDown])

    return {
        countDown,
        isCounting,
        startCountDown,
        stopCountDown,
        resetCountDown,
    }
}
