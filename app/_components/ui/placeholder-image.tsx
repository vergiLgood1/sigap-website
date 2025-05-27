import React, { useState } from 'react';
import { Skeleton } from './skeleton';

interface PlaceholderImageProps {
    src?: string;
    alt?: string;
    className?: string;
    fallbackClassName?: string;
    icon?: React.ReactNode;
    width?: number | string;
    height?: number | string;
}

export function PlaceholderImage({
    src,
    alt = 'Image',
    className = '',
    fallbackClassName = '',
    icon,
    width,
    height,
}: PlaceholderImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
            {(isLoading || hasError || !src) && (
                <div
                    className={`absolute inset-0 flex items-center justify-center bg-slate-200 ${fallbackClassName}`}
                >
                    {icon ? icon :
                        <div className="text-slate-400 text-xs uppercase font-medium">
                            {alt.charAt(0)}
                        </div>
                    }
                </div>
            )}

            {src && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                />
            )}

            {isLoading && src && (
                <Skeleton className="absolute inset-0" />
            )}
        </div>
    );
}
