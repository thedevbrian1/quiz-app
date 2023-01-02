import { Link, useCatch } from "@remix-run/react";
import { Logo } from "../components/Icon";

export function headers() {
    return {
        "Cache-Control": "maxage=86400 public"
    };
}

export default function Index() {
    return (
        <main className="w-full h-screen bg-[url('/got-mobile-wallpaper.png')] lg:bg-[url('/got-desktop-wallpaper.png')] bg-center bg-cover bg-no-repeat">
            <div className="px-8 sm:px-0 sm:w-4/5 mx-auto pt-8 h-full ">
                <div className="w-72 xl:w-96 h-auto mx-auto pt-16">
                    <Logo color='white' />
                </div>
                <div className="mt-[30vh]">
                    <p className="text-white text-center text-2xl md:text-3xl lg:text-4xl landscape:mt-16">How well do you know Game of Thrones?</p>
                    <div className="flex mt-4 lg:mt-8 justify-center">
                        <Link to="/difficulty" className="px-16 py-3  bg-gradient-to-b from-[#FF512F] to-[#F09819] text-white">
                            Start quiz
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export function CatchBoundary() {
    const caught = useCatch();
    return (
        <div className="w-full h-screen bg-black bg-[url('https://i.pinimg.com/originals/10/c7/ba/10c7badbea3bcd027b202f6134f8020c.jpg')] bg-cover bg-center bg-no-repeat bg-blend-overlay bg-opacity-50 grid place-items-center">
            <div className="text-white">
                <h1 className="font-bold text-4xl">Oops!!</h1>
                <p>Status: {caught.status}</p>
                <pre>
                    <code>{caught.data}</code>
                </pre>
                <div className="flex justify-center mt-4">
                    <Link to="/difficulty" className="px-6 py-3 bg-white text-black">Try again</Link>
                </div>
            </div>
        </div>
    );
}

export function ErrorBoundary({ error }) {
    console.log({ error: error.message });
    return (
        <div className="w-full h-screen bg-black bg-[url('https://media1.popsugar-assets.com/files/thumbor/hD4DY5UeYUO_rmi7BbQw05P03vw/fit-in/2048xorig/filters:format_auto-!!-:strip_icc-!!-/2019/05/19/288/n/1922283/3c59feec5ce2412a2a2935.47224303__6_Courtesy_of_HBO/i/Why-Daenerys-Targaryen-Death-So-Damn-LAME.jpg')] bg-cover bg-no-repeat bg-center bg-blend-overlay bg-opacity-40 text-white grid place-items-center">
            <div>
                <h1 className="text-4xl font-bold text-center">Oops!! Something's not right</h1>
                <div className="flex justify-center mt-4">
                    <Link to="/difficulty" className="px-6 py-3 bg-white text-black">Try again</Link>
                </div>
            </div>
        </div>
    );
}
