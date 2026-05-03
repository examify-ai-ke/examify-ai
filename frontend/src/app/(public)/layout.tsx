import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CaptchaProvider } from "@/components/providers/captcha-provider";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CaptchaProvider>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </CaptchaProvider>
    );
} 