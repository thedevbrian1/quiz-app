import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
// import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "~/components/Icon";
import { getUserSession, storage } from "~/utils/session.server";


///////////////////////////////////////////////////////////////////////////////////////

export function meta() {
    return {
        title: 'Results | Game of Thrones quiz'
    };
}

export async function loader({ request }) {
    const session = await getUserSession(request);
    const sessionDifficulty = session.get("difficulty");
    const userChoices = session.get("userChoices");

    let difficulty = (sessionDifficulty === 'Easy')
        ? process.env.SANITY_DIFFICULTY_EASY
        : (sessionDifficulty === 'Intermediate')
            ? process.env.SANITY_DIFFICULTY_INTERMEDIATE
            : (sessionDifficulty === 'Legendary')
                ? process.env.SANITY_DIFFICULTY_LEGENDARY
                : null;

    const questionsQuery = `*[_type == "question" && references('${difficulty}')]{ answer, _id}`;
    const questionsUrl = `${process.env.SANITY_QUERY_URL}?query=${encodeURIComponent(questionsQuery)}`;

    const response = await fetch(questionsUrl);
    const questions = await response.json();
    if (!questions) {
        throw new Response('There was an error fetching data', {
            status: 404
        });
    }

    const correctAnswers = userChoices.map((userChoice) => {
        const matchedQuestions = questions.result.filter((question) => (question._id === userChoice.userQuestion && question.answer === userChoice.userChoice))
        // .filter(q => q.length !== 0);
        return matchedQuestions;
    });

    return correctAnswers;
}

export async function action({ request }) {
    const session = await getUserSession(request);
    const formData = await request.formData();
    const action = formData.get('_action');

    if (action === 'clear') {
        return redirect('/difficulty', {
            headers: {
                "Set-Cookie": await storage.destroySession(session)
            }
        });
    }
    return null;
}

export default function Success() {
    const data = useLoaderData();
    // console.log({ data });
    const correct = data.filter(q => q.length !== 0);
    const percentage = Math.round((correct.length / data.length) * 100);
    // console.log({ correct });
    return (
        <main className="px-8 text-gray-800 sm:px-0 sm:w-4/5 xl:max-w-4xl mx-auto pb-16">
            <div>
                <div className="w-72 mt-16 h-auto mx-auto">
                    <Logo />
                </div>
                <div className="flex flex-col lg:flex-row lg:gap-x-14">
                    <div>
                        <h1 className="text-4xl font-bold mt-16 lg:mt-28">Your score:</h1>
                        <div className="flex gap-x-5 items-center">
                            <div className="w-40 h-40">
                                <ProgressRing percentage={percentage} />
                            </div>
                            <div className="space-y-4">
                                <span className="">You got <span className="font-semibold">{correct.length}</span>  out of <span className="font-semibold">{data.length}</span> questions correct</span>
                                <Link to="/success/results" className="underline block">
                                    View results
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-44 h-44">
                                <img
                                    src="/synchronize.svg"
                                    alt=""
                                    className="w-full h-full"
                                />
                            </div>
                            {/* <Link to="/difficulty" className="bg-black px-6 py-3 text-white">Play again</Link> */}
                            <Form method="post" className="bg-black px-6 py-3 text-white">
                                <button name="_action" value="clear">Play again</button>
                            </Form>
                        </div>
                    </div>
                    <div className="mt-8 lg:mt-28 border border-slate-100">
                        <Outlet />
                    </div>
                </div>
            </div>

        </main>

    );
}

function ProgressRing({ percentage }) {
    const [progress, setProgress] = useState(0);
    const circumference = Math.PI * 45 * 2;
    const dash = (percentage * circumference) / 100;
    //Enable JS for this
    // const dash = (progress * circumference) / 100;

    useEffect(() => {
        setProgress(percentage)
    }, [percentage]);

    return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" >
            <circle
                className="text-gray-300"
                strokeWidth={5}
                stroke="currentColor"
                fill="transparent"
                r={45}
                cx={50}
                cy={50}
            />
            <circle
                className={`${percentage < 30 ? 'text-red-500' : percentage > 30 && percentage < 60 ? 'text-yellow-500' : 'text-green-600'}`}
                strokeWidth={5}
                strokeDasharray={[dash, circumference - dash]}
                transform={`rotate(-90 50 50)`}
                strokeLinecap="round"
                stroke="currentColor"
                fill={`${percentage < 30 ? 'rgb(254 242 242)' : percentage > 30 && percentage < 60 ? 'rgb(255 247 237)' : percentage > 60 ? 'rgb(240 253 244)' : 'transparent'}`}
                r={45}
                cx={50}
                cy={50}
                style={{ transition: "all 0.5s" }}
            />
            <text
                fill="black"
                // fontSize="40px"
                x="50%"
                y="50%"
                dy="4px"
                dx="2px"
                textAnchor="middle"
            >
                {percentage}%
            </text>
        </svg>

        // <div
        //     // x-data="scrollProgress" 
        //     className="inline-flex items-center justify-center overflow-hidden rounded-full">

        //     <svg className="w-20 h-20" viewBox="0 0 100 100" width="100%" height="100%">
        //         <circle
        //             className="text-gray-300"
        //             strokeWidth={5}
        //             stroke="currentColor"
        //             fill="transparent"
        //             r={30}
        //             cx={40}
        //             cy={40}
        //         />
        //         <circle
        //             className="text-blue-600"
        //             strokeWidth={5}
        //             strokeDasharray={[dash, circumference - dash]}
        //             // strokeDashoffset={`${circumference} - ${percentage} / 100 * ${circumference}`} 
        //             // transform={`rotate(-90 ${size /2} ${size / 2})`}
        //             strokeLinecap="round"
        //             stroke="currentColor"
        //             fill="transparent"
        //             r={30}
        //             cx={40}
        //             cy={40}
        //         />
        //     </svg>
        //     <span
        //         className="absolute text-xl text-blue-700"
        //     // x-text="`${percent}%`"
        //     >
        //         {percentage}%
        //     </span>
        // </div>


    )
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


