import { Link, useActionData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import badRequest from "~/utils/badRequest";
import { validateEmail, validatePassword, validateUsername } from "~/utils/validation";
//import { getClient } from "~/lib/sanity/getClient";

export async function action({ request }) {
    const formData = await request.formData();
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        typeof email !== "string"
    ) {
        return badRequest({ formError: 'Form not submitted correctly' });
    }

    let isEmailInUse = false;

    // Check if user exists
    const query = `*[_type == 'user' && email == '${email}']{email, username}`;
    const queryUrl = 'https://n2tvwman.api.sanity.io/v1/data/query/production';
    const url = `${queryUrl}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const registerdUser = await response.json();

    console.log('Registered user: ', registerdUser);

    if (registerdUser.result.length !== 0) {
        isEmailInUse = true;
    }

    // console.log('isEmailInUse: ', isEmailInUse);

    const fields = { username, email, password };
    const fieldErrors = {
        username: validateUsername(username),
        email: validateEmail(email, isEmailInUse),
        password: validatePassword(password),

    };

    // Return errors if any
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors, fields });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
        mutations: [
            {
                create: {
                    _type: "user",
                    username,
                    email,
                    password: passwordHash
                }
            }
        ]

    };

    // Add user to Sanity
    const user = await fetch(`https://n2tvwman.api.sanity.io/v2021-03-25/data/mutate/production`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${process.env.SANITY_AUTH_TOKEN}`
        },
        body: JSON.stringify(newUser),
    });

    console.log(await user.json());

    return redirect('/difficulty');
}

export function meta() {
    return {
        title: 'Register',
        description: 'Register account for Game of Thrones quiz app'
    };
}

export default function Register() {
    const actionData = useActionData();

    return (
        <div className="w-screen  grid place-items-center outline">
            <h1 className="text-4xl">Register</h1>
            <form method="post" className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4  max-w-xs">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className={`shadow appearance-none ${actionData?.fieldErrors?.username ? `outline outline-red-500` : `border`} rounded w-full py-2 px-3 text-gray-700 leading-tight`}
                        name="username"
                        id="username"
                        type="text"
                        placeholder="John Doe"
                        defaultValue={actionData?.fields?.username}
                    />
                    {actionData?.fieldErrors?.username ? (
                        <p className="text-red-500">{actionData?.fieldErrors?.username}</p>
                    ) : null}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className={`shadow appearance-none ${actionData?.fieldErrors?.email ? `outline outline-red-500` : `border`} rounded w-full py-2 px-3 text-gray-700 leading-tight`}
                        name="email"
                        id="email"
                        type="email"
                        placeholder="Email"
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
                        Register
                    </button>
                    {/* <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                        Forgot Password?
                    </a> */}
                    <p>Already have an account? <br /> <span className="text-blue-500 hover:underline hover:decoration-blue-500"><Link to="/login">Log in here</Link></span> </p>
                </div>
            </form>
            <p className="text-center text-gray-500 text-xs">
                {new Date().getFullYear()} GOT Quiz. All rights reserved.
            </p>
        </div>
    )
}