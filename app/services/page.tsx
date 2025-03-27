import NavBar from "../components/NavBar";
import ServiceRequestForm from "../components/ServiceRequestForm";

export default function Services() {
    return (
      <div className="bg-gradient-to-l from-amber-600 to-yellow-400">
        <NavBar />
        <ServiceRequestForm/>
      </div>
    );
    
}