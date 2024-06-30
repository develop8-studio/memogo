import { Button, Text } from '@chakra-ui/react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useKey } from 'react-use';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const View = () => {
    const [position, setPosition] = useState({ x: 400, y: 300 });
    const [tubukichiPosition, setTubukichiPosition] = useState({ x: 200, y: 200 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const move = useCallback((dx: number, dy: number) => {
        setPosition((prev) => {
            let newX = prev.x + dx;
            let newY = prev.y + dy;
            newX = Math.max(0, Math.min(newX, 750)); // 限界を設定
            newY = Math.max(0, Math.min(newY, 550)); // 限界を設定
            return { x: newX, y: newY };
        });
    }, []);

    useKey('ArrowUp', () => move(0, -5));
    useKey('ArrowDown', () => move(0, 5));
    useKey('ArrowLeft', () => move(-5, 0));
    useKey('ArrowRight', () => move(5, 0));

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const dx = (Math.random() - 0.5) * 10;
            const dy = (Math.random() - 0.5) * 10;
            setTubukichiPosition((prev) => ({
                x: Math.max(0, Math.min(prev.x + dx, 750)), // 限界を設定
                y: Math.max(0, Math.min(prev.y + dy, 550))  // 限界を設定
            }));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            gameAreaRef.current?.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen().catch(err => console.log(err));
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleMouseDown = (dx: number, dy: number) => {
        if (intervalRef.current) return;
        move(dx, dy);
        intervalRef.current = setInterval(() => move(dx, dy), 100);
    };

    const handleMouseUp = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const mapSize = { width: 800, height: 600 };

    return (
        <>
            <div className="flex items-center">
                <Button colorScheme='blue' onClick={toggleFullscreen} className="mb-3">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</Button>
                <Text className="text-slate-500 text-xs ml-2.5">モバイル機器でのフルスクリーンはお勧め致しません。</Text>
            </div>
            <div ref={gameAreaRef} className="relative flex justify-center items-center w-full h-full bg-white">
                <div
                    ref={containerRef}
                    className="relative overflow-hidden border rounded-md bg-green-300"
                    style={{ width: `${mapSize.width}px`, height: `${mapSize.height}px` }}
                >
                    {/* 木の配置 */}
                    {[
                        { x: 200, y: 100 },
                        { x: 400, y: 300 },
                        { x: 600, y: 200 }
                    ].map((tree, index) => (
                        <div
                            key={index}
                            style={{ top: `${tree.y}px`, left: `${tree.x}px` }}
                            className="absolute w-[50px] h-[50px] bg-emerald-500 flex items-center justify-center text-white rounded-md font-bold"
                        >
                            木
                        </div>
                    ))}

                    {/* まめきち達のテント */}
                    <div
                        style={{ top: '200px', left: '700px' }}
                        className="absolute w-[50px] h-[50px] bg-blue-500 flex items-center justify-center text-white rounded-md font-bold"
                    >
                        テント
                    </div>

                    {/* キャラクター */}
                    <div
                        style={{
                            top: `${position.y}px`,
                            left: `${position.x}px`
                        }}
                        className="transition-all absolute h-[50px] w-[50px] text-white font-bold flex items-center justify-center bg-red-500 rounded-md"
                    >
                        社畜
                    </div>

                    {/* つぶきち */}
                    <div
                        style={{
                            top: `${tubukichiPosition.y}px`,
                            left: `${tubukichiPosition.x}px`
                        }}
                        className="transition-all absolute h-[50px] w-[50px] text-white font-bold flex items-center justify-center bg-yellow-500 rounded-md text-xs"
                    >
                        つぶきち
                    </div>
                </div>
                {/* ミニマップ */}
                <div className="absolute top-0 left-0 m-3 border bg-white rounded-md" style={{ width: '150px', height: '112.5px' }}>
                    <div className="relative w-full h-full bg-green-200">
                        {/* キャラクターの位置 */}
                        <div
                            style={{
                                top: `${position.y / 5.33}px`,
                                left: `${position.x / 5.33}px`
                            }}
                            className="transition-all absolute h-[9.375px] w-[9.375px] text-white font-bold flex items-center justify-center bg-red-500 rounded-md"
                        >
                        </div>

                        {/* つぶきちの位置 */}
                        <div
                            style={{
                                top: `${tubukichiPosition.y / 5.33}px`,
                                left: `${tubukichiPosition.x / 5.33}px`
                            }}
                            className="transition-all absolute h-[9.375px] w-[9.375px] text-white font-bold flex items-center justify-center bg-yellow-500 rounded-md"
                        >
                        </div>

                        {/* テントの位置 */}
                        <div
                            style={{
                                top: `${200 / 5.33}px`,
                                left: `${700 / 5.33}px`
                            }}
                            className="transition-all absolute h-[9.375px] w-[9.375px] text-white font-bold flex items-center justify-center bg-blue-500 rounded-md"
                        >
                        </div>
                    </div>
                </div>
                {/* スマホ操作用の矢印ボタン */}
                <div className="absolute bg-white w-[75px] h-[75px] bottom-5 left-5 md:hidden rounded-full items-center flex justify-center">
                    <div className="flex flex-col items-center">
                        <Button
                            onMouseDown={() => handleMouseDown(0, -5)}
                            onMouseUp={handleMouseUp}
                            onTouchStart={() => handleMouseDown(0, -5)}
                            onTouchEnd={handleMouseUp}
                            className="w-[25px] h-[25px]"
                            colorScheme='transparent'
                            padding="0"
                            height="0"
                        >
                            <FaArrowUp className="text-black" />
                        </Button>
                        <div className="flex">
                            <Button
                                onMouseDown={() => handleMouseDown(-5, 0)}
                                onMouseUp={handleMouseUp}
                                onTouchStart={() => handleMouseDown(-5, 0)}
                                onTouchEnd={handleMouseUp}
                                className="w-[25px] h-[25px]"
                                colorScheme='transparent'
                                padding="0"
                                width="0"
                            >
                                <FaArrowLeft className="text-black" />
                            </Button>
                            <Button
                                onMouseDown={() => handleMouseDown(5, 0)}
                                onMouseUp={handleMouseUp}
                                onTouchStart={() => handleMouseDown(5, 0)}
                                onTouchEnd={handleMouseUp}
                                className="w-[25px] h-[25px]"
                                colorScheme='transparent'
                                padding="0"
                                width="0"
                            >
                                <FaArrowRight className="text-black" />
                            </Button>
                        </div>
                        <Button
                            onMouseDown={() => handleMouseDown(0, 5)}
                            onMouseUp={handleMouseUp}
                            onTouchStart={() => handleMouseDown(0, 5)}
                            onTouchEnd={handleMouseUp}
                            className="w-[25px] h-[25px]"
                            colorScheme='transparent'
                            padding="0"
                            height="0"
                        >
                            <FaArrowDown className="text-black" />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default View;