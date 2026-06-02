export default function FormWatermark() {
    return (
        <img
            src="/image.png"
            alt="MTPS Watermark"
            className="absolute top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none select-none z-0"
        />
    );
}