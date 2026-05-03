import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-xl">Not Found</p>
                <p className="text-gray-600">The page you are looking for does not exist.</p>
                <Link href="/">
                    <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg">
                        Go back to home
                    </button>
                </Link>
            </div>
        </div>
    )
}