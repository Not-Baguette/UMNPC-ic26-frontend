import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import type { Contest } from "../utils/types"

interface LayoutProps {
    currentcontest: Contest | null;
}

const BASE = import.meta.env.BASE_URL;

const mediaPartners = [
    { name: "ACES",                 file: "LOGO_ACES.png" },
    { name: "CommFest",             file: "LOGO_COMMFEST.jpg" },
    { name: "DISCO",                file: "LOGO_DISCO.png" },
    { name: "Duta Anti Narkoba",    file: "LOGO_DutaAntiNarkoba.png" },
    { name: "HIMSI",                file: "LOGO_HIMSI.png" },
    { name: "HMIF",                 file: "LOGO_HMIF.png" },
    { name: "Inforta",              file: "LOGO_INFORTA.png" },
    { name: "J-Cafe",               file: "LOGO_JCAFE.png" },
    { name: "Mister & Miss UMN",    file: "LOGO_MisterMiss.png" },
    { name: "UMN Medical Center",   file: "LOGO_UMN_MEDICAL_CENTER.png" },
];

const Layout = ({ currentcontest }: LayoutProps) => {
    // 3 copies of 10 items = 30 items per track (enough to span >4000px to prevent gaps on ultra-wide monitors)
    const marqueeTrackItems = [...mediaPartners, ...mediaPartners, ...mediaPartners];

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar currentcontest={currentcontest} />

            <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem", backgroundColor: "#f3f4f1" }}>
                <Outlet />
            </main>

            {/* ── Media Partner Footer ── */}
            <footer style={{
                borderTop: "4px solid #211f1f",
                backgroundColor: "#f3f4f1",
                padding: "0",
            }}>
                {/* Label bar */}
                <div style={{
                    borderBottom: "2px solid #211f1f",
                    padding: "10px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}>
                    <div style={{
                        backgroundColor: "#fadb5e",
                        border: "2px solid #211f1f",
                        padding: "4px 14px",
                        fontFamily: "var(--font-main)",
                        fontWeight: 900,
                        fontSize: "10px",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#211f1f",
                        boxShadow: "3px 3px 0 #211f1f",
                    }}>
                        Media Partners
                    </div>
                    <div style={{
                        flex: 1,
                        height: "2px",
                        backgroundColor: "#e5e7eb",
                    }} />
                    <span style={{
                        fontFamily: "var(--font-main)",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#9ca3af",
                    }}>
                        UMN Programming Club — IC26
                    </span>
                </div>

                {/* Scrolling marquee */}
                <div style={{
                    overflow: "hidden",
                    padding: "16px 0",
                    position: "relative",
                }}>
                    {/* Fade-out edges */}
                    <div style={{
                        position: "absolute",
                        left: 0, top: 0, bottom: 0,
                        width: "80px",
                        background: "linear-gradient(to right, #f3f4f1, transparent)",
                        zIndex: 1,
                        pointerEvents: "none",
                    }} />
                    <div style={{
                        position: "absolute",
                        right: 0, top: 0, bottom: 0,
                        width: "80px",
                        background: "linear-gradient(to left, #f3f4f1, transparent)",
                        zIndex: 1,
                        pointerEvents: "none",
                    }} />

                    <div className="footer-marquee">
                        {/* Track 1 */}
                        <div className="footer-marquee-track">
                            {marqueeTrackItems.map((partner, idx) => (
                                <div
                                    key={`t1-${partner.file}-${idx}`}
                                    style={{
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "120px",
                                        height: "64px",
                                        border: "2px solid #211f1f",
                                        borderRadius: "8px",
                                        backgroundColor: "#fff",
                                        padding: "8px",
                                        boxShadow: "3px 3px 0 #211f1f",
                                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px, -2px)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "5px 5px 0 #211f1f";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "3px 3px 0 #211f1f";
                                    }}
                                    title={partner.name}
                                >
                                    <img
                                        src={`${BASE}Logo_Medpar/${partner.file}`}
                                        alt={partner.name}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                            display: "block",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Track 2 (Duplicate for seamless loop) */}
                        <div className="footer-marquee-track" aria-hidden="true">
                            {marqueeTrackItems.map((partner, idx) => (
                                <div
                                    key={`t2-${partner.file}-${idx}`}
                                    style={{
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "120px",
                                        height: "64px",
                                        border: "2px solid #211f1f",
                                        borderRadius: "8px",
                                        backgroundColor: "#fff",
                                        padding: "8px",
                                        boxShadow: "3px 3px 0 #211f1f",
                                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px, -2px)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "5px 5px 0 #211f1f";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "3px 3px 0 #211f1f";
                                    }}
                                    title={partner.name}
                                >
                                    <img
                                        src={`${BASE}Logo_Medpar/${partner.file}`}
                                        alt={partner.name}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                            display: "block",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Layout;