interface LoadingOverlayProps {
    message?: string;
    isVisible: boolean;
}

export default function LoadingOverlay({ message = "Loading...", isVisible }: LoadingOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1000]">
            <div className="bg-white p-5 rounded-lg text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
                <p className="mt-2 text-sm">{message}</p>
            </div>
        </div>
    );
} 