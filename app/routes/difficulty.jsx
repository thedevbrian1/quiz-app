import { Form, useTransition, useActionData, Link, useCatch } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import badRequest from "~/utils/badRequest";
import { getUserSession, storage } from "~/utils/session.server";
import { Logo } from "~/components/Icon";
import Spinner from "~/components/Spinner";


function validateDifficulty(choice) {
  if (choice === null) {
    return 'Select a level to continue';
  }
}

export function headers() {
  return {
    "Cache-Control": "public maxage=86400"
  };
}


export async function action({ request }) {
  // validation
  const formData = await request.formData();
  const difficulty = formData.get('difficulty');
  const difficultyFieldError = {
    name: validateDifficulty(difficulty)
  };

  if (Object.values(difficultyFieldError).some(Boolean)) {
    return badRequest({ difficultyFieldError });
  }

  const session = await getUserSession(request);
  session.set("difficulty", difficulty);

  let difficultyRefecence = (difficulty === 'Easy')
    ? process.env.SANITY_DIFFICULTY_EASY
    : (difficulty === 'Intermediate')
      ? process.env.SANITY_DIFFICULTY_INTERMEDIATE
      : (difficulty === 'Legendary')
        ? process.env.SANITY_DIFFICULTY_LEGENDARY
        : null;

  // Fetch slugs according to the selected difficulty level and store them to the session
  const queryUrl = process.env.SANITY_QUERY_URL;

  const questionSlugsQuery = `*[_type == 'question' && references('${difficultyRefecence}')]{slug{current}}`;

  const questionSlugsUrl = `${queryUrl}?query=${encodeURIComponent(questionSlugsQuery)}`;

  const slugsResponse = await fetch(questionSlugsUrl);
  const fetchedSlugs = await slugsResponse.json();

  if (!fetchedSlugs) {
    throw new Response('There was an error fetching data', {
      status: 404
    });
  }

  let firstTen = [];

  for (let index = 0; index < 10; index++) {
    let randomIndex = Math.floor(Math.random() * fetchedSlugs.result.length);
    firstTen.push(fetchedSlugs.result[randomIndex]);
    fetchedSlugs.result.splice(randomIndex, 1);

  }

  const numberOfQuestions = firstTen.length;
  session.set('numberOfQuestions', numberOfQuestions);

  let slugIndex = Math.floor(Math.random() * firstTen.length);
  const firstQuestion = firstTen[slugIndex];

  const userQuestionsArray = [];
  const attemptedSlugsArray = [];

  session.set("slugs", firstTen);
  session.set("userChoices", userQuestionsArray);
  session.set("attemptedSlugsArray", attemptedSlugsArray);

  return redirect(`/questions/${firstQuestion.slug.current}`, {
    headers: {
      "Set-Cookie": await storage.commitSession(session)
    }
  });


}

export default function Difficulty() {
  const transition = useTransition();
  const actionData = useActionData();

  return (
    <main className="w-full h-screen bg-[url('/got-mobile-wallpaper.png')] lg:bg-[url('/got-desktop-wallpaper.png')] bg-cover bg-center bg-no-repeat text-white">
      <div className="px-8 sm:px-0 sm:w-4/5 mx-auto">
        {/* {data ? (
          <div>
            <span>{`Hi ${data.username}`}</span>
            <form method="post" action="/logout">
              <button type="submit" className="w-28 h-10 bg-yellow-500">Logout</button>
            </form>
          </div>
        ) : <Link to="/login">Login</Link>
        } */}

        <div className="w-72 xl:w-96 h-auto mx-auto pt-16">
          <Logo color='white' />
        </div>
        <Form method="post" className="flex flex-col mt-[35vh] md:w-fit md:mx-auto">
          <span className="text-xl">Select difficulty</span>

          <div>
            <input type="radio" name="difficulty" value="Easy" id="easy" defaultChecked />{" "}
            <label htmlFor="easy" className="ml-2 text-lg">Easy</label>
          </div>

          <div>
            <input type="radio" name="difficulty" value="Intermediate" id="intermediate" />{" "}
            <label htmlFor="intermediate" className="ml-2 text-lg">Intermediate</label>
          </div>

          <div>
            <input type="radio" name="difficulty" value="Legendary" id="legendary" />{" "}
            <label htmlFor="legendary" className="ml-2 text-lg">Legendary</label>
          </div>
          {actionData?.difficultyFieldError?.name
            ? (<span className="text-red-500">{actionData.difficultyFieldError.name}</span>)
            : null}
          <button className={`h-12 w-32 mt-4  grid place-items-center bg-gradient-to-b from-[#FF512F] to-[#F09819] text-black ${transition.submission ? 'pl-3' : ''}`}>
            {transition.submission ? <Spinner /> : 'Continue'}
          </button>
        </Form>
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


