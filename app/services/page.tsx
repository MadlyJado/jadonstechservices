import NavBar from "../components/NavBar";
import ServiceRequestForm from "../components/ServiceRequestForm";

export default function Services() {
    return (
        /*<div>
        <h1>The services I offer are as follows:</h1>
        <ul>
            <li>Setup for Computers & Tablets: $20</li>
            <li>Setup for New Devices: $20</li>
            <li>Hard Disk Drive to Solid State Drive Upgrade: Choose which type of SSD you wish to have.</li>
            <li>When considering SSDs, there are two main types: SATA SSDs and M.2 SSDs.
                <p> SATA SSDs are more budget-friendly but are limited by the maximum speed of the SATA standard, capping at 550MB/s. While still significantly faster than HDDs (Hard-Disk Drives, this speed is constrained by the SATA format.
M.2 SSDs offer a solution to limited speed by utilizing the PCIe bus, which can provide much higher speeds. However, M.2 SSDs are only compatible with modern hardware, introduced around 2015 with the release of Windows 10. Computers released before this date might not support M.2. If you have a tight budget or older hardware, a SATA SSD may be more suitable.
For those with newer hardware and a willingness to invest in speed and reliability, M.2 SSDs are highly recommended for their faster booting and loading times.
Once you decide on the SSD type that fits your needs, I can present you with various options, and you can choose the one you prefer. The total cost will include the price of the SSD plus a $30 installation fee.</p>
            </li>
            <li>Physical Damage Repair: price of the parts+maintenance fee of 15/hr worked</li>
            <li>Virus & Spyware Removal: $30 and an optional fee for adding an antivirus of your choice to the machine.
            </li>
            <li>SSD Upgrade(For when you want to expand storage):
                <p>Just like with the Hard Disk Drive to SSD upgrade, I will present with various options to choose from, and the SATA/M.2 service still applies. The cost will be just the price of the ssd plus a $30 installation fee.</p>
            </li>
        </ul>
    </div>*/
      <body className="bg-gradient-to-l from-amber-600 to-yellow-400">
            <NavBar/>
            <ServiceRequestForm/>
      </body>
    );
    
}