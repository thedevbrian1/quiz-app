import { redirect, createCookieSessionStorage } from "@remix-run/node";
import bcrypt from "bcryptjs";
//import { getClient } from "~/lib/sanity/getClient";


// Login logic
//
// Query Sanity for user with their email
// If there's no user, return null
// Use bcrypt.compare to compare the given password to the user's passwordHash
// If the passwords don't match return null
// If passwords match return the user

export async function login(email, password) {
    const query = `*[_type == 'user' && email == '${email}']{email, username, password, _id}`;
    const queryUrl = 'https://n2tvwman.api.sanity.io/v1/data/query/production';
    const url = `${queryUrl}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const registeredUser = await response.json();

    if (registeredUser.result.length === 0) {
        return null;
    }

    const isCorrectPassword = await bcrypt.compare(password, registeredUser.result[0].password);

    if (!isCorrectPassword) {
        return null;
    }
    return registeredUser.result[0];
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

export const storage = createCookieSessionStorage({
    cookie: {
        name: "GOT_session",
        secure: true,
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true
    }
});

export async function createUserSession(userId, redirectTo) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session)
        }
    });
}

export function getUserSession(request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") return null;
    return userId;
}

export async function requireUserId(
    request,
    redirectTo = new URL(request.url).pathname
) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") {
        const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/login?${searchParams}`);
    }
    return userId;
}

export async function getUser(request) {
    const userId = await getUserId(request);
    if (typeof userId !== "string") {
        return null;
    }
    try {
        const query = `*[_type == 'user' && _id == '${userId}']{email, username, password, _id}`;
        const queryUrl = 'https://n2tvwman.api.sanity.io/v1/data/query/production';
        const url = `${queryUrl}?query=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const user = await response.json();
        return user.result[0];
    } catch {
        throw logout(request);
    }
}

export async function logout(request) {
    const session = await storage.getSession(request.headers.get("Cookie"));
    return redirect("/login", {
        headers: {
            "Set-Cookie": await storage.destroySession(session)
        }
    });
}

export async function addItemToStorage(request, itemKey, itemValue) {
    const session = await getUserSession(request);
    //const session = await storage.getSession();
    session.set(itemKey, itemValue);
    //console.log('Session difficulty:', session.get(itemKey));
    return redirect("/questions", {
        headers: {
            "Set-Cookie": await storage.commitSession(session)
        }
    });
}