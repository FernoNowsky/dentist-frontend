import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Maximize2 } from 'lucide-react';

interface OdontogramProps {
    diagnoses: Record<string, string>; // toothId -> color/diagnosis mapping
    onToothClick: (toothId: string, part: string) => void;
}

// Split teeth into 4 rows for mobile
const TOOTH_NUMBERS_MOBILE = [
    [18, 17, 16, 15, 14, 13, 12, 11], // Upper left
    [21, 22, 23, 24, 25, 26, 27, 28], // Upper right
    [48, 47, 46, 45, 44, 43, 42, 41], // Lower left
    [31, 32, 33, 34, 35, 36, 37, 38]  // Lower right
];

// 2 rows for desktop/tablet
const TOOTH_NUMBERS_DESKTOP = [
    [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
];

interface ToothProps {
    id: number;
    onPartClick: (part: string) => void;
    parts: Record<string, string | undefined>; // part -> color
    scale?: number;
}

const Tooth = ({ id, onPartClick, parts, scale = 1 }: ToothProps) => {
    const width = 30 * scale;
    const height = 30 * scale;
    const padding = 2 * scale;

    // Coordinates
    const x1 = padding;
    const y1 = padding;
    const x2 = width - padding;
    const y2 = height - padding;

    const cx1 = width * 0.3;
    const cy1 = height * 0.3;
    const cx2 = width * 0.7;
    const cy2 = height * 0.7;

    // Polygons
    const top = `${x1},${y1} ${x2},${y1} ${cx2},${cy1} ${cx1},${cy1}`;
    const bottom = `${x1},${y2} ${x2},${y2} ${cx2},${cy2} ${cx1},${cy2}`;
    const left = `${x1},${y1} ${x1},${y2} ${cx1},${cy2} ${cx1},${cy1}`;
    const right = `${x2},${y1} ${x2},${y2} ${cx2},${cy2} ${cx2},${cy1}`;
    const center = `${cx1},${cy1} ${cx2},${cy1} ${cx2},${cy2} ${cx1},${cy2}`;

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={width} height={height} className="cursor-pointer">
                <polygon points={top} fill={parts['top'] || 'white'} stroke="black" strokeWidth="1" onClick={() => onPartClick('top')} className="hover:opacity-80" />
                <polygon points={bottom} fill={parts['bottom'] || 'white'} stroke="black" strokeWidth="1" onClick={() => onPartClick('bottom')} className="hover:opacity-80" />
                <polygon points={left} fill={parts['left'] || 'white'} stroke="black" strokeWidth="1" onClick={() => onPartClick('left')} className="hover:opacity-80" />
                <polygon points={right} fill={parts['right'] || 'white'} stroke="black" strokeWidth="1" onClick={() => onPartClick('right')} className="hover:opacity-80" />
                <polygon points={center} fill={parts['center'] || 'white'} stroke="black" strokeWidth="1" onClick={() => onPartClick('center')} className="hover:opacity-80" />
            </svg>
            <span className={cn("font-bold", scale < 1 ? "text-[10px]" : "text-xs")}>{id}</span>
        </div>
    );
};

export const Odontogram = ({ diagnoses, onToothClick }: OdontogramProps) => {
    const [isZoomed, setIsZoomed] = useState(false);

    const getToothParts = (toothId: number) => {
        const parts: Record<string, string | undefined> = {};
        ['top', 'bottom', 'left', 'right', 'center'].forEach(part => {
            const key = `${toothId}-${part}`;
            if (diagnoses[key]) {
                parts[part] = diagnoses[key];
            }
        });
        return parts;
    };

    const OdontogramContent = ({ scale = 1, toothNumbers = TOOTH_NUMBERS_DESKTOP }: { scale?: number, toothNumbers?: number[][] }) => (
        <div className="flex flex-col gap-4 items-center p-4">
            {toothNumbers.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1">
                    {row.map(toothId => (
                        <div key={toothId} className={cn(toothId === 11 || toothId === 41 ? "md:mr-4" : "")}>
                            <Tooth
                                id={toothId}
                                parts={getToothParts(toothId)}
                                onPartClick={(part) => onToothClick(toothId.toString(), part)}
                                scale={scale}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className="relative w-full">
            <div className="hidden 2xl:block overflow-x-auto pb-4">
                <OdontogramContent scale={1.4} />
            </div>

            <div className="hidden lg:block 2xl:hidden overflow-x-auto pb-4">
                <OdontogramContent scale={1.1} />
            </div>

            <div className="hidden md:block lg:hidden overflow-x-auto pb-4">
                <OdontogramContent scale={1.05} />
            </div>

            {/* Mobile: 4 rows with zoom option */}
            <div className="md:hidden">
                <div className="overflow-x-auto pb-4">
                    <OdontogramContent scale={1.0} toothNumbers={TOOTH_NUMBERS_MOBILE} />
                </div>

                <div className="absolute top-2 right-2">
                    <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm">
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] w-full overflow-x-auto">
                            <div className="min-w-fit mt-4">
                                <OdontogramContent scale={1.2} toothNumbers={TOOTH_NUMBERS_MOBILE} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};
