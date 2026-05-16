import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-12 items-center justify-center p-0">
                <img src="/logo-airnav.png" alt="AirNav Indonesia" className="h-full w-full object-contain drop-shadow-sm" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-bold text-white text-xl drop-shadow-sm">SAKTI</span>
                <span className="truncate text-[11px] font-medium text-white/90 drop-shadow-sm">Inventaris & Teknisi</span>
            </div>
        </>
    );
}
