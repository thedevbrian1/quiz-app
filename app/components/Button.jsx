import { Link } from "@remix-run/react";

export default function Button({ text, href }) {
    return (
        <Link to={href} className="px-16 py-3  bg-gradient-to-b from-[#FF512F] to-[#F09819] text-white">
            {text}
        </Link>
    );
}