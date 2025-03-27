import LoginPrompt from "../components/LoginPrompt";
import NavBar from "../components/NavBar";

export default function Page() {
    return (
        <div className="bg-gradient-to-bl from-indigo-900 to-cyan-600">
            <NavBar />
            <LoginPrompt/>
        </div>
    );
}