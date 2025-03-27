import NavBar from "../components/NavBar";
import SignUpPrompt from "../components/SignUpPrompt";

export default function Page() {
    return (
                
                <div className="h-screen w-screen bg-gradient-to-br from-indigo-800 to-cyan-600">
                    <NavBar />
                    <div>
                        <SignUpPrompt/>
                    </div>
                    
                </div>
                
    );
}