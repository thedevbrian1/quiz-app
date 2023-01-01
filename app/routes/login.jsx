import { Link, useActionData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import badRequest from "~/utils/badRequest";
import { createUserSession, login } from "~/utils/session.server";
import { validateEmail, validatePassword } from "~/utils/validation";

export async function action({ request }) {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');


    // if (typeof email !== 'string' || typeof password !== 'string') {
    //     return badRequest({
    //         formError: 'Form not submitted correctly'
    //     });
    // }

    const fields = { email, password };
    const fieldErrors = {
        email: validateEmail(email),
        password: validatePassword(password)
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors, fields });
    }

    //console.log(email, password);

    const user = await login(email, password);
    console.log(user);

    if (!user) {
        return badRequest({ fields, formError: 'Username/Password combination is incorrect' });
    }
    return createUserSession(user._id, '/difficulty');
    // return 'ok';
}

export function meta() {
    return {
        title: 'Log in',
        description: 'Log in to Game of Thrones quiz app'
    }
}
export default function Login() {
    const actionData = useActionData();
    console.log(actionData);

    return (
        <div className="w-screen  grid place-items-center outline">
            <h1 className="text-4xl">Login</h1>
            <form method="post" className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4  max-w-xs">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className={`shadow appearance-none ${actionData?.fieldErrors?.email ? `outline outline-red-500` : `border`} rounded w-full py-2 px-3 text-gray-700 leading-tight`}
                        name="email"
                        id="email"
                        type="email"
                        placeholder="johndoe@gmail.com"
                        defaultValue={actionData?.fields?.email}
                    />
                    {actionData?.fieldErrors?.email ? (
                        <p className="text-red-500">{actionData?.fieldErrors?.email}</p>
                    ) : null}
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className={`shadow appearance-none ${actionData?.fieldErrors?.password ? `outline outline-red-500` : `border`}  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight`}
                        name="password"
                        id="password"
                        type="password"
                        defaultValue={actionData?.fields?.password}
                        placeholder="******************" />
                    {actionData?.fieldErrors?.password ? (
                        <p className="text-red-500">{actionData?.fieldErrors?.password}</p>
                    ) : null}
                </div>
                <div className="">
                    <div>
                        {actionData?.formError ? (
                            <p className="text-red-500">{actionData?.formError}</p>
                        ) : null}
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mb-4">
                        Log In
                    </button>
                    {/* <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                        Forgot Password?
                    </a> */}
                    <p>Don't have an account? <span className="text-blue-500 hover:underline hover:decoration-blue-500"><Link to="/register">Register here</Link></span></p>
                </div>
            </form>
            <p className="text-center text-gray-500 text-xs">
                {new Date().getFullYear()} GOT Quiz. All rights reserved.
            </p>
        </div>
    );
}