import { useRef, useEffect } from 'react';

// Define the Props Interface, marking props with default values as optional
interface LetterGlitchProps {
    glitchColors?: string[]; // Made optional
    glitchSpeed?: number;    // Made optional
    centerVignette?: boolean; // Made optional
    outerVignette?: boolean;  // Made optional
    smooth?: boolean;        // Made optional
    characters?: string;     // Made optional
}

const LetterGlitch = ({
    glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
    glitchSpeed = 50,
    centerVignette = false,
    outerVignette = true,
    smooth = true,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789'
}: LetterGlitchProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const letters = useRef<
        {
            char: string;
            color: string;
            targetColor: string;
            colorProgress: number;
        }[]
    >([]);
    const grid = useRef({ columns: 0, rows: 0 });
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const lastGlitchTime = useRef(Date.now());

    // Use the potentially passed-in characters or the default
    const lettersAndSymbols = Array.from(characters);

    const fontSize = 16;
    const charWidth = 10;
    const charHeight = 20;

    const getRandomChar = () => {
        return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
    };

    const getRandomColor = () => {
        return glitchColors[Math.floor(Math.random() * glitchColors.length)];
    };

    const hexToRgb = (hex: string) => {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            }
            : null;
    };

    const interpolateColor = (
        start: { r: number; g: number; b: number },
        end: { r: number; g: number; b: number },
        factor: number
    ) => {
        const result = {
            r: Math.round(start.r + (end.r - start.r) * factor),
            g: Math.round(start.g + (end.g - start.g) * factor),
            b: Math.round(start.b + (end.b - start.b) * factor)
        };
        return `rgb(${result.r}, ${result.g}, ${result.b})`;
    };

    const calculateGrid = (width: number, height: number) => {
        const columns = Math.ceil(width / charWidth);
        const rows = Math.ceil(height / charHeight);
        return { columns, rows };
    };

    const initializeLetters = (columns: number, rows: number) => {
        grid.current = { columns, rows };
        const totalLetters = columns * rows;
        letters.current = Array.from({ length: totalLetters }, () => ({
            char: getRandomChar(),
            color: getRandomColor(),
            targetColor: getRandomColor(),
            colorProgress: 1
        }));
    };

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        if (context.current) {
            context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const { columns, rows } = calculateGrid(rect.width, rect.height);
        initializeLetters(columns, rows);
        drawLetters();
    };

    const drawLetters = () => {
        if (!context.current || letters.current.length === 0) return;
        const ctx = context.current;
        const { width, height } = canvasRef.current!.getBoundingClientRect();
        ctx.clearRect(0, 0, width, height);
        ctx.font = `${fontSize}px monospace`;
        ctx.textBaseline = 'top';

        letters.current.forEach((letter, index) => {
            const x = (index % grid.current.columns) * charWidth;
            const y = Math.floor(index / grid.current.columns) * charHeight;
            ctx.fillStyle = letter.color;
            ctx.fillText(letter.char, x, y);
        });
    };

    const updateLetters = () => {
        if (!letters.current || letters.current.length === 0) return;

        const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));

        for (let i = 0; i < updateCount; i++) {
            const index = Math.floor(Math.random() * letters.current.length);
            if (!letters.current[index]) continue;

            letters.current[index].char = getRandomChar();
            letters.current[index].targetColor = getRandomColor();

            if (!smooth) {
                letters.current[index].color = letters.current[index].targetColor;
                letters.current[index].colorProgress = 1;
            } else {
                letters.current[index].colorProgress = 0;
            }
        }
    };

    const handleSmoothTransitions = () => {
        let needsRedraw = false;
        letters.current.forEach(letter => {
            if (letter.colorProgress < 1) {
                letter.colorProgress += 0.05;
                if (letter.colorProgress > 1) letter.colorProgress = 1;

                const startRgb = hexToRgb(letter.color);
                const endRgb = hexToRgb(letter.targetColor);
                if (startRgb && endRgb) {
                    // Check if targetColor is one of the glitchColors to reset its color
                    const targetIsGlitchColor = glitchColors.includes(letter.targetColor);
                    
                    // If smooth is active, we interpolate. If the transition is done (progress >= 1),
                    // we ensure the color is exactly the target color (important if the color was interpolated from a previous transition)
                    if (letter.colorProgress < 1) {
                         letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
                    } else if (targetIsGlitchColor) {
                        letter.color = letter.targetColor; // Finalize the color
                    }

                    needsRedraw = true;
                }
            }
        });

        if (needsRedraw) {
            drawLetters();
        }
    };

    const animate = () => {
        const now = Date.now();
        // Control glitch update frequency based on glitchSpeed
        if (now - lastGlitchTime.current >= glitchSpeed) {
            updateLetters();
            // Only draw here if not using smooth transitions, otherwise it's drawn in handleSmoothTransitions
            if (!smooth) {
                 drawLetters();
            }
            lastGlitchTime.current = now;
        }

        // Handle smooth transitions (will call drawLetters if needed)
        if (smooth) {
            handleSmoothTransitions();
        } else if (now - lastGlitchTime.current >= glitchSpeed) {
            // If not smooth, we need to draw when the character changes
            drawLetters();
        }

        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        context.current = canvas.getContext('2d');
        resizeCanvas();
        
        // Start animation loop
        animate();

        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                cancelAnimationFrame(animationRef.current as number);
                resizeCanvas();
                animate();
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationRef.current!);
            window.removeEventListener('resize', handleResize);
        };
        // Dependency array now includes all props that affect animation timing or appearance
    }, [glitchSpeed, smooth, characters, ...glitchColors]);


    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden">
            <canvas ref={canvasRef} className="block w-full h-full" />
            {outerVignette && (
                // Tailwind CSS radial gradient for the outer vignette
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0)_60%,_rgba(0,0,0,1)_100%)]"></div>
            )}
            {centerVignette && (
                // Tailwind CSS radial gradient for the center "glow" or darkening
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]"></div>
            )}
        </div>
    );
};

export default LetterGlitch;